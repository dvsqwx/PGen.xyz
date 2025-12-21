import "dotenv/config";
import express from "express";
import cors from "cors";
import { db, initDb } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5050;
const API_KEY = process.env.API_KEY || "";

initDb();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.path === "/health") return next();

  const key = req.header("x-api-key");
  if (!API_KEY) return res.status(500).json({ error: "API_KEY is not set on server" });
  if (key !== API_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/settings", (req, res) => {
  db.get("SELECT * FROM settings WHERE id = 1", (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({
      length: row.length,
      lower: Boolean(row.use_lower),
      upper: Boolean(row.use_upper),
      digits: Boolean(row.use_digits),
      symbols: Boolean(row.use_symbols)
    });
  });
});

app.put("/api/settings", (req, res) => {
  const { length, lower, upper, digits, symbols } = req.body || {};

  const safeLen = Number.isFinite(length) ? Math.max(4, Math.min(64, length)) : 12;

  db.run(
    `UPDATE settings SET
      length = ?,
      use_lower = ?,
      use_upper = ?,
      use_digits = ?,
      use_symbols = ?
     WHERE id = 1`,
    [
      safeLen,
      lower ? 1 : 0,
      upper ? 1 : 0,
      digits ? 1 : 0,
      symbols ? 1 : 0
    ],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ ok: true });
    }
  );
});

app.get("/api/history", (req, res) => {
  db.all(
    "SELECT id, password, created_at FROM history ORDER BY id DESC LIMIT 10",
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    }
  );
});

app.post("/api/history", (req, res) => {
  const { password } = req.body || {};
  const pw = String(password || "").trim();
  if (!pw) return res.status(400).json({ error: "Password is required" });

  const now = new Date().toISOString();
  db.run(
    "INSERT INTO history (password, created_at) VALUES (?, ?)",
    [pw, now],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });

      db.run(`
        DELETE FROM history
        WHERE id NOT IN (
          SELECT id FROM history ORDER BY id DESC LIMIT 10
        )
      `);

      res.json({ ok: true, id: this.lastID });
    }
  );
});

app.delete("/api/history", (req, res) => {
  db.run("DELETE FROM history", (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
