import sqlite3 from "sqlite3";

const DB_FILE = "pgen.db";
sqlite3.verbose();

export const db = new sqlite3.Database(DB_FILE);

export function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        length INTEGER NOT NULL DEFAULT 12,
        use_lower INTEGER NOT NULL DEFAULT 1,
        use_upper INTEGER NOT NULL DEFAULT 1,
        use_digits INTEGER NOT NULL DEFAULT 1,
        use_symbols INTEGER NOT NULL DEFAULT 0
      )
    `);

    db.run(`
      INSERT INTO settings (id)
      SELECT 1
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1)
    `);
  });
}
