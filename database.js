const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('database.db');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    lastName TEXT
  )
`);

module.exports = {
  db
}