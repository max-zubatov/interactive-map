import { useState, useEffect, useMemo } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import MapView from './components/MapView.jsx'
import { SERVICE_ROLES, LOCATIONS, STATUSES } from './constants.js'
import './App.css'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export default function App() {
  const [clinicians, setClinicians] = useState([])
  const [services, setServices] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ serviceRole: '', location: '', status: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/clinicians').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([c, s]) => {
      setClinicians(c.map(x => ({ ...x, entityType: 'clinician' })))
      setServices(s.map(x => ({ ...x, entityType: 'service' })))
    }).catch(() => {})
  }, [])

  const filteredEntities = useMemo(() => {
    const q = search.toLowerCase()
    return [...clinicians, ...services].filter(e => {
      if (q && !e.name.toLowerCase().includes(q) && !e.address.toLowerCase().includes(q)) return false
      if (filters.serviceRole && e.serviceRole !== filters.serviceRole) return false
      if (filters.location && e.location !== filters.location) return false
      if (filters.status && e.entityType === 'service' && e.status !== filters.status) return false
      return true
    })
  }, [clinicians, services, search, filters])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const hasFilters = search || filters.serviceRole || filters.location || filters.status

  if (!API_KEY) {
    return (
      <div className="no-key">
        <div className="no-key-box">
          <h2>Google Maps API Key Required</h2>
          <p>Create a <code>.env</code> file in the project root:</p>
          <pre>VITE_GOOGLE_MAPS_API_KEY=your_key_here</pre>
          <p>Then restart the dev server.</p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="app-layout">
        <header className="app-header">
          <div className="header-filters">
            <select value={filters.serviceRole} onChange={e => setFilter('serviceRole', e.target.value)}>
              <option value="">All Roles</option>
              {SERVICE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filters.location} onChange={e => setFilter('location', e.target.value)}>
              <option value="">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {hasFilters && (
              <button
                className="clear-btn"
                onClick={() => { setSearch(''); setFilters({ serviceRole: '', location: '', status: '' }) }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="header-search">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search clinicians and services…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear">
                ×
              </button>
            )}
          </div>
        </header>

        <main className="map-container">
          <MapView
            entities={filteredEntities}
            selectedEntity={selectedEntity}
            activeClinician={selectedEntity?.entityType === 'clinician' ? selectedEntity : null}
            onMarkerClick={setSelectedEntity}
            onInfoClose={() => setSelectedEntity(null)}
          />
        </main>
      </div>
    </APIProvider>
  )
}
