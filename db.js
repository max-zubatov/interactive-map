const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS clinicians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    serviceRole TEXT NOT NULL,
    location TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    activeClients INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    serviceRole TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unassigned',
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    clinicianId INTEGER REFERENCES clinicians(id),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrations: add columns to existing DBs that predate them
const serviceCols = db.prepare('PRAGMA table_info(services)').all();
if (!serviceCols.some(c => c.name === 'clinicianId')) {
  db.exec('ALTER TABLE services ADD COLUMN clinicianId INTEGER REFERENCES clinicians(id)');
}
const clinicianCols = db.prepare('PRAGMA table_info(clinicians)').all();
if (!clinicianCols.some(c => c.name === 'activeClients')) {
  db.exec('ALTER TABLE clinicians ADD COLUMN activeClients INTEGER');
}

module.exports = db;
