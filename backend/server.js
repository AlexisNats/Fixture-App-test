// Fixture backend — a minimal but real REST API.
//
// Deliberately built with ZERO external npm packages (only Node's built-in
// http/fs/crypto/url modules). That's not a shortcut for its own sake: it
// means anyone can deploy this by just running `node server.js` — no
// `npm install`, no native build tools, no dependency drift. Swap in
// Express/Fastify and a real Postgres database later (see the backend
// architecture doc) once this needs to scale past a demo.
//
// Persistence: a single db.json file on disk. Fine for a prototype;
// NOT safe for concurrent production traffic (see README).

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");
const { SPORTS, CITIES, EVENTS } = require("./seed-data");

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "db.json");
const TOKEN_SECRET = process.env.TOKEN_SECRET || "fixture-dev-secret-change-me";

// ---------------------------------------------------------------------------
// Tiny file-backed "database"
// ---------------------------------------------------------------------------
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { users: [], events: EVENTS };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
// Any route that reads db.json, mutates it, and writes it back (register,
// favorites toggle) needs to do all three as one atomic step — otherwise two
// requests landing close together can both read the same "before" state and
// the second write silently clobbers the first's change. withDB() queues
// these critical sections through a single promise chain so they run one at
// a time. Pure-read routes (GET /events, /sports, etc.) don't need this.
let dbLock = Promise.resolve();
function withDB(fn) {
  const result = dbLock.then(() => fn(loadDB()));
  dbLock = result.then(() => {}, () => {}); // keep chain alive even if fn() rejects
  return result;
}

// ---------------------------------------------------------------------------
// Password hashing (Node's built-in scrypt — no bcrypt dependency needed)
// ---------------------------------------------------------------------------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
}
// A fixed salt+hash used ONLY to burn roughly the same CPU time as a real
// verifyPassword() call when the email isn't found at all. Without this,
// "login with unknown email" returns almost instantly while "login with
// known email, wrong password" takes ~50-100ms (scrypt's cost) — an
// attacker measuring response time could enumerate which emails have
// accounts, even though both cases return the identical error message.
const DUMMY_HASH = hashPassword("dummy-password-for-timing-parity");

// ---------------------------------------------------------------------------
// Minimal signed tokens (HMAC — no jsonwebtoken dependency needed)
// ---------------------------------------------------------------------------
function signToken(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 3600 * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verifyToken(token) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  if (sig !== expected) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp < Date.now()) return null;
  return payload;
}
function getAuthUser(req, db) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return db.users.find((u) => u.id === payload.uid) || null;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  });
  res.end(body);
}
function readBody(req) {
  const MAX_BODY_BYTES = 100 * 1024; // 100KB — generous for this API's small JSON payloads
  return new Promise((resolve, reject) => {
    let data = "";
    let bytes = 0;
    let rejected = false;
    req.on("data", (chunk) => {
      if (rejected) return;
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        rejected = true;
        reject(new Error("Body too large"));
        return; // keep the connection alive so the 413 response can still be sent
      }
      data += chunk;
    });
    req.on("end", () => {
      if (rejected) return;
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}
function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, favorites: u.favorites };
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter — not distributed, resets on restart, but
// stops the most obvious abuse of /register and /login on a single instance.
// A real deployment behind multiple instances would need a shared store
// (Redis) instead — noted in the README.
const rateBuckets = new Map(); // ip -> [timestamps]
function isRateLimited(ip, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  rateBuckets.set(ip, hits);
  return hits.length > max;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean); // ["api","events",":id"]
  const ip = req.socket.remoteAddress || "unknown";

  if (req.method === "OPTIONS") return sendJSON(res, 204, {});

  try {
    // GET /api/health
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJSON(res, 200, { ok: true, time: new Date().toISOString() });
    }

    // GET /api/sports
    if (req.method === "GET" && url.pathname === "/api/sports") {
      return sendJSON(res, 200, SPORTS);
    }

    // GET /api/cities
    if (req.method === "GET" && url.pathname === "/api/cities") {
      return sendJSON(res, 200, CITIES);
    }

    // GET /api/events?city=&sport=a,b&saved=true
    if (req.method === "GET" && url.pathname === "/api/events") {
      const db = loadDB();
      const city = url.searchParams.get("city");
      const sportParam = url.searchParams.get("sport");
      const sports = sportParam ? sportParam.split(",") : null;
      const savedOnly = url.searchParams.get("saved") === "true";

      let list = db.events;
      if (savedOnly) {
        const user = getAuthUser(req, db);
        if (!user) return sendJSON(res, 401, { error: "Login required to view saved events" });
        list = list.filter((e) => user.favorites.includes(e.id));
      } else if (city) {
        list = list.filter((e) => e.city === city);
      }
      if (sports) list = list.filter((e) => sports.includes(e.sport));
      return sendJSON(res, 200, list);
    }

    // GET /api/events/:id
    if (req.method === "GET" && parts[0] === "api" && parts[1] === "events" && parts[2]) {
      const db = loadDB();
      const ev = db.events.find((e) => e.id === parts[2]);
      if (!ev) return sendJSON(res, 404, { error: "Not found" });
      return sendJSON(res, 200, ev);
    }

    // POST /api/register { name, email, password }
    if (req.method === "POST" && url.pathname === "/api/register") {
      if (isRateLimited(ip, 10, 60_000)) return sendJSON(res, 429, { error: "Too many attempts — try again in a minute" });

      let body;
      try { body = await readBody(req); } catch (e) {
        if (e.message === "Body too large") return sendJSON(res, 413, { error: "Request body too large" });
        return sendJSON(res, 400, { error: "Malformed JSON body" });
      }
      const { name, email, password } = body;

      if (!name || !name.trim()) return sendJSON(res, 400, { error: "Name is required" });
      if (name.length > 100) return sendJSON(res, 400, { error: "Name is too long" });
      if (!email || !EMAIL_RE.test(email.trim())) return sendJSON(res, 400, { error: "Enter a valid email address" });
      if (!password || password.length < 6) return sendJSON(res, 400, { error: "Password must be at least 6 characters" });
      if (password.length > 200) return sendJSON(res, 400, { error: "Password is too long" });

      const emailLower = email.trim().toLowerCase();
      const result = await withDB((db) => {
        if (db.users.find((u) => u.email === emailLower)) {
          return { error: 409, message: "An account with that email already exists" };
        }
        const user = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: emailLower,
          passwordHash: hashPassword(password),
          favorites: [],
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        saveDB(db);
        return { user };
      });

      if (result.error) return sendJSON(res, result.error, { error: result.message });
      const token = signToken({ uid: result.user.id });
      return sendJSON(res, 201, { token, user: publicUser(result.user) });
    }

    // POST /api/login { email, password }
    if (req.method === "POST" && url.pathname === "/api/login") {
      if (isRateLimited(ip, 15, 60_000)) return sendJSON(res, 429, { error: "Too many attempts — try again in a minute" });

      let body;
      try { body = await readBody(req); } catch (e) {
        if (e.message === "Body too large") return sendJSON(res, 413, { error: "Request body too large" });
        return sendJSON(res, 400, { error: "Malformed JSON body" });
      }
      const emailLower = (body.email || "").trim().toLowerCase();
      const db = loadDB();
      const user = db.users.find((u) => u.email === emailLower);
      // Always run verifyPassword — against the real hash if the user
      // exists, against DUMMY_HASH if not — so response time doesn't leak
      // whether an email is registered (see DUMMY_HASH comment above).
      const passwordOk = verifyPassword(body.password || "", user ? user.passwordHash : DUMMY_HASH);
      if (!user || !passwordOk) {
        return sendJSON(res, 401, { error: "Invalid email or password" });
      }
      const token = signToken({ uid: user.id });
      return sendJSON(res, 200, { token, user: publicUser(user) });
    }

    // GET /api/me
    if (req.method === "GET" && url.pathname === "/api/me") {
      const db = loadDB();
      const user = getAuthUser(req, db);
      if (!user) return sendJSON(res, 401, { error: "Invalid or missing token" });
      return sendJSON(res, 200, publicUser(user));
    }

    // POST /api/favorites/:id  (toggle)
    if (req.method === "POST" && parts[0] === "api" && parts[1] === "favorites" && parts[2]) {
      const id = parts[2];
      const result = await withDB((db) => {
        const user = getAuthUser(req, db);
        if (!user) return { error: 401, message: "Login required" };
        if (!db.events.find((e) => e.id === id)) return { error: 404, message: "No such event" };
        const idx = user.favorites.indexOf(id);
        if (idx >= 0) user.favorites.splice(idx, 1);
        else user.favorites.push(id);
        saveDB(db);
        return { favorites: user.favorites };
      });
      if (result.error) return sendJSON(res, result.error, { error: result.message });
      return sendJSON(res, 200, { favorites: result.favorites });
    }

    return sendJSON(res, 404, { error: "Not found" });
  } catch (err) {
    console.error(err);
    return sendJSON(res, 500, { error: "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Fixture backend running at http://localhost:${PORT}`);
  if (TOKEN_SECRET === "fixture-dev-secret-change-me") {
    console.warn("⚠️  TOKEN_SECRET is still the default placeholder. Set a real one via the TOKEN_SECRET environment variable before sharing this URL publicly.");
  }
});
