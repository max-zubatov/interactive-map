const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// ── Clinicians ────────────────────────────────────────────────────────────────

app.get('/api/clinicians', (req, res) => {
  try {
    const clinicians = db.prepare('SELECT * FROM clinicians ORDER BY name').all();
    res.json(clinicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clinicians', (req, res) => {
  try {
    const { name, address, serviceRole, location, lat, lng } = req.body;
    if (!name || !address || !serviceRole || !location || lat == null || lng == null) {
      return res.status(400).json({ error: 'Missing required fields: name, address, serviceRole, location, lat, lng' });
    }
    const stmt = db.prepare(
      'INSERT INTO clinicians (name, address, serviceRole, location, lat, lng) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, address, serviceRole, location, lat, lng);
    const record = db.prepare('SELECT * FROM clinicians WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Services ──────────────────────────────────────────────────────────────────

const SERVICE_WITH_CLINICIAN = `
  SELECT s.*, c.name AS clinicianName
  FROM services s
  LEFT JOIN clinicians c ON s.clinicianId = c.id
`;

app.get('/api/services', (req, res) => {
  try {
    const services = db.prepare(`${SERVICE_WITH_CLINICIAN} ORDER BY s.name`).all();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', (req, res) => {
  try {
    const { name, address, serviceRole, location, status, lat, lng, clinicianId } = req.body;
    if (!name || !address || !serviceRole || !location || !status || lat == null || lng == null) {
      return res.status(400).json({ error: 'Missing required fields: name, address, serviceRole, location, status, lat, lng' });
    }
    const stmt = db.prepare(
      'INSERT INTO services (name, address, serviceRole, location, status, lat, lng, clinicianId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, address, serviceRole, location, status, lat, lng, clinicianId ?? null);
    const record = db.prepare(`${SERVICE_WITH_CLINICIAN} WHERE s.id = ?`).get(result.lastInsertRowid);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SPA fallback ──────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
