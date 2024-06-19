const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('image.db');
db.run(`
  CREATE TABLE images (
    id INTEGER PRIMARY KEY,
    filename TEXT,
    mimetype TEXT,
    size INTEGER,
    created_at TEXT
  )
`);