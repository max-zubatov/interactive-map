const db = require('./db.js');

// Clear existing data
db.prepare('DELETE FROM clinicians').run();
db.prepare('DELETE FROM services').run();
try {
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('clinicians', 'services')").run();
} catch (_) {
  // sqlite_sequence doesn't exist yet on a fresh DB — that's fine
}

// ── Clinicians ────────────────────────────────────────────────────────────────

const insertClinician = db.prepare(
  'INSERT INTO clinicians (name, address, serviceRole, location, lat, lng) VALUES (?, ?, ?, ?, ?, ?)'
);

const clinicians = [
  ['Dr. Sarah Mitchell', '6255 W Sunset Blvd, Hollywood, CA 90028', 'Mental Health Counselor', 'Hollywood', 34.0978, -118.3219],
  ['Dr. James Park', '350 S Grand Ave, Los Angeles, CA 90071', 'Psychiatrist', 'Downtown LA', 34.0527, -118.2588],
  ['Dr. Emily Rodriguez', '1444 2nd St, Santa Monica, CA 90401', 'Psychologist', 'Santa Monica', 34.0241, -118.4907],
  ['Dr. Michael Torres', '800 E Colorado Blvd, Pasadena, CA 91101', 'Social Worker', 'Pasadena', 34.1480, -118.1276],
  ['Dr. Jennifer Lee', '9301 Wilshire Blvd, Beverly Hills, CA 90210', 'Marriage & Family Therapist', 'Beverly Hills', 34.0694, -118.3958],
  ['Dr. David Kim', '11645 Wilshire Blvd, Los Angeles, CA 90025', 'Substance Abuse Counselor', 'Westwood / Brentwood', 34.0599, -118.4581],
  ['Dr. Aisha Washington', '4545 N Figueroa St, Los Angeles, CA 90065', 'Occupational Therapist', 'East Los Angeles', 34.0820, -118.2006],
  ['Dr. Robert Chen', '15250 Ventura Blvd, Sherman Oaks, CA 91403', 'Physical Therapist', 'San Fernando Valley', 34.1530, -118.4681],
];

const insertCliniciansMany = db.transaction(() => {
  clinicians.forEach(c => insertClinician.run(...c));
});
insertCliniciansMany();

// ── Services ──────────────────────────────────────────────────────────────────

const insertService = db.prepare(
  'INSERT INTO services (name, address, serviceRole, location, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const services = [
  ['Sunrise Mental Health Center', '5901 Hollywood Blvd, Hollywood, CA 90028', 'Mental Health Counselor', 'Hollywood', 'Active', 34.1018, -118.3109],
  ['Pacific Family Services', '1630 Olympic Blvd, Santa Monica, CA 90404', 'Marriage & Family Therapist', 'Santa Monica', 'Active', 34.0217, -118.4726],
  ['Downtown Community Wellness', '511 S Hope St, Los Angeles, CA 90071', 'Social Worker', 'Downtown LA', 'Active', 34.0528, -118.2523],
  ['Valley Recovery Center', '15303 Ventura Blvd, Sherman Oaks, CA 91403', 'Substance Abuse Counselor', 'San Fernando Valley', 'Active', 34.1539, -118.4673],
  ['Eastside Health Collective', '4121 E Cesar E Chavez Ave, Los Angeles, CA 90063', 'Psychologist', 'East Los Angeles', 'Inactive', 34.0341, -118.1798],
  ['Pasadena Healing Arts', '33 E Walnut St, Pasadena, CA 91103', 'Mental Health Counselor', 'Pasadena', 'Active', 34.1477, -118.1510],
  ['Beverly Hills Therapy Associates', '9595 Wilshire Blvd, Beverly Hills, CA 90210', 'Psychiatrist', 'Beverly Hills', 'Pending Review', 34.0685, -118.4068],
  ['Culver City Counseling Center', '9800 Culver Blvd, Culver City, CA 90232', 'Marriage & Family Therapist', 'Culver City', 'Active', 34.0210, -118.3964],
  ['Westwood Behavioral Health', '10880 Wilshire Blvd, Los Angeles, CA 90024', 'Psychiatrist', 'Westwood / Brentwood', 'Active', 34.0603, -118.4470],
  ['Long Beach Recovery Services', '2840 Long Beach Blvd, Long Beach, CA 90806', 'Substance Abuse Counselor', 'Long Beach', 'Pending Review', 33.8034, -118.1871],
];

const insertServicesMany = db.transaction(() => {
  services.forEach(s => insertService.run(...s));
});
insertServicesMany();

console.log(`Seeded ${clinicians.length} clinicians and ${services.length} services.`);
