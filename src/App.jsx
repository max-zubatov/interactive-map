import { useState, useEffect, useMemo } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import MapView from './components/MapView.jsx'
import Sidebar from './components/Sidebar.jsx'
import './App.css'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export default function App() {
  const [clinicians, setClinicians] = useState([])
  const [services, setServices] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'clinicians' | 'services'
  const [filters, setFilters] = useState({ serviceRole: '', location: '', status: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/clinicians').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([c, s]) => {
      setClinicians(c.map(x => ({ ...x, entityType: 'clinician' })))
      setServices(s.map(x => ({ ...x, entityType: 'service' })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredEntities = useMemo(() => {
    let all = []
    if (activeTab !== 'services') all = [...all, ...clinicians]
    if (activeTab !== 'clinicians') all = [...all, ...services]

    return all.filter(e => {
      if (filters.serviceRole && e.serviceRole !== filters.serviceRole) return false
      if (filters.location && e.location !== filters.location) return false
      if (filters.status && e.entityType === 'service' && e.status !== filters.status) return false
      return true
    })
  }, [clinicians, services, activeTab, filters])

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
          <div className="header-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
            </svg>
            <span>CareMap LA</span>
          </div>
          <nav className="header-tabs">
            {['all', 'clinicians', 'services'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setSelectedEntity(null) }}
              >
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </header>
        <div className="app-body">
          <Sidebar
            entities={filteredEntities}
            selectedEntity={selectedEntity}
            filters={filters}
            activeTab={activeTab}
            loading={loading}
            onSelect={setSelectedEntity}
            onFilterChange={(key, val) => setFilters(f => ({ ...f, [key]: val }))}
          />
          <main className="map-container">
            <MapView
              entities={filteredEntities}
              selectedEntity={selectedEntity}
              onMarkerClick={setSelectedEntity}
              onInfoClose={() => setSelectedEntity(null)}
            />
          </main>
        </div>
      </div>
    </APIProvider>
  )
}
