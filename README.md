# CareMap LA

An interactive map for visualizing clinicians and services in the Los Angeles area. Built with React, Google Maps, Express, and SQLite.

## Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18 + Vite |
| Maps     | Google Maps JavaScript API (`@vis.gl/react-google-maps`) |
| Backend  | Express (Node.js) |
| Database | SQLite via `better-sqlite3` |

## Prerequisites

- Node.js 18+
- A [Google Maps API key](https://console.cloud.google.com/) with the **Maps JavaScript API** enabled (and billing active on the project)

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/max-zubatov/interactive-map.git
cd interactive-map
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set VITE_GOOGLE_MAPS_API_KEY=your_key_here

# 3. Seed the database with LA test data
npm run seed

# 4. Start dev server (runs Express on :3001 and Vite on :5173 concurrently)
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JavaScript API key |

Copy `.env.example` to `.env` and fill in the value. The `.env` file is gitignored — never commit it.

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Express + Vite dev servers concurrently |
| `npm run build` | Build frontend to `dist/` |
| `npm run preview` | Serve the production build (`NODE_ENV=production`) |
| `npm run seed` | Clear and re-seed the SQLite database with test data |
| `npm start` | Start Express only (production API server) |

## Project structure

```
├── db.js          # SQLite schema + runtime migrations
├── server.js      # Express API (/api/clinicians, /api/services)
├── seed.js        # Test data for LA area (8 clinicians, 10 services)
├── vite.config.js # Vite + /api proxy to Express :3001
└── src/
    ├── App.jsx         # Root component: data fetching, filters, state
    ├── constants.js    # SERVICE_ROLES, LOCATIONS, STATUSES, colors
    └── components/
        ├── MapView.jsx # Google Map, custom HTML markers, info windows
        └── MapView.css # Marker and info window styles
```

## Data model

### Clinicians

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | Auto-increment PK |
| `name` | text | |
| `address` | text | |
| `serviceRole` | text | See role list below |
| `location` | text | Neighborhood name |
| `lat` / `lng` | real | Map coordinates |
| `activeClients` | integer | Optional count |

### Services

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | Auto-increment PK |
| `name` | text | |
| `address` | text | |
| `serviceRole` | text | See role list below |
| `location` | text | Neighborhood name |
| `status` | text | `Unassigned` · `Pending` · `Assigned` · `Terminated` |
| `lat` / `lng` | real | Map coordinates |
| `clinicianId` | integer FK | References `clinicians.id` — optional |

### Service roles

Mental Health Counselor · Psychiatrist · Psychologist · Social Worker · Marriage & Family Therapist · Substance Abuse Counselor · Occupational Therapist · Physical Therapist

### Locations (neighborhoods)

Beverly Hills · Culver City · Downtown LA · East Los Angeles · Hollywood · Long Beach · Pasadena · San Fernando Valley · Santa Monica · Westwood / Brentwood

## API

Both endpoints are read-only in the UI — records are added directly to the database or via the API.

```
GET  /api/clinicians          → all clinicians ordered by name
POST /api/clinicians          → create clinician (body: name, address, serviceRole, location, lat, lng, activeClients?)

GET  /api/services            → all services with clinicianName (LEFT JOIN), ordered by name
POST /api/services            → create service (body: name, address, serviceRole, location, status, lat, lng, clinicianId?)
```

## Map behavior

- **Click a clinician marker** → that clinician and all their linked services stay colored; everything else dims.
- **Click a service marker** → that service and its linked clinician stay colored; everything else dims.
- **Click the info window close button** → clears selection, all markers return to full color.
- Filters (role, location, status) and the search bar (name/address) hide non-matching markers from the map entirely.

## Re-seeding

Running `npm run seed` drops all rows and re-inserts the test data. The schema is preserved; only the data changes. Safe to run repeatedly.

## Production build

```bash
npm run build       # outputs to dist/
npm run preview     # serves dist/ via Express on :3001
```

In production mode, Express serves the built frontend from `dist/` and handles the SPA fallback route.
