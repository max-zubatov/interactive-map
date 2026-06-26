import { useEffect, useRef } from 'react'
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { LA_CENTER, STATUS_COLORS, CLINICIAN_COLOR } from '../constants.js'
import './MapView.css'

// Map ID — DEMO_MAP_ID enables AdvancedMarker (vector rendering).
// AdvancedMarker and the legacy `styles` array cannot be used together;
// greyscale is applied via CSS targeting the tile canvas layer instead.
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

function MapController({ selectedEntity }) {
  const map = useMap()
  const prevId = useRef(null)

  useEffect(() => {
    if (!map || !selectedEntity) return
    const key = `${selectedEntity.entityType}-${selectedEntity.id}`
    if (prevId.current === key) return
    prevId.current = key
    map.panTo({ lat: selectedEntity.lat, lng: selectedEntity.lng })
  }, [map, selectedEntity])

  return null
}

// Circle marker for clinicians
function ClinicianPin({ isSelected }) {
  const size = isSelected ? 40 : 34
  return (
    <div
      className="marker-base clinician-marker"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: CLINICIAN_COLOR.bg,
        boxShadow: isSelected
          ? `0 0 0 4px rgba(37,99,235,0.25), 0 3px 10px rgba(0,0,0,0.35)`
          : '0 2px 6px rgba(0,0,0,0.3)',
      }}
    >
      {/* Stethoscope: ear tips → arched tubes → stem → chest piece */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="8"  cy="3.5" r="1.5" fill="white"/>
        <circle cx="16" cy="3.5" r="1.5" fill="white"/>
        <path d="M8 5Q8 10 12 10Q16 10 16 5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <line x1="12" y1="10" x2="12" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="19.5" r="2.5" fill="white"/>
      </svg>
    </div>
  )
}

// Rounded-square marker for services
function ServicePin({ status, isSelected }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS['Active']
  const size = isSelected ? 40 : 34
  return (
    <div
      className="marker-base service-marker"
      style={{
        width: size,
        height: size,
        borderRadius: '8px',
        background: color.bg,
        boxShadow: isSelected
          ? `0 0 0 4px ${color.bg}44, 0 3px 10px rgba(0,0,0,0.35)`
          : '0 2px 6px rgba(0,0,0,0.3)',
      }}
    >
      {/* Patient in hospital bed: head → body under sheet → mattress → legs */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <circle cx="18.5" cy="6" r="2.5"/>
        <path d="M3 11 Q3 9 5 9 H18 Q20 9 20 11 V13 H3 Z"/>
        <rect x="2" y="14" width="20" height="3" rx="1.5"/>
        <line x1="5"  y1="17" x2="5"  y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="19" y1="17" x2="19" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

export default function MapView({ entities, selectedEntity, onMarkerClick, onInfoClose }) {
  return (
    <Map
      style={{ width: '100%', height: '100%' }}
      defaultCenter={LA_CENTER}
      defaultZoom={11}
      mapId={MAP_ID}
      gestureHandling="greedy"
      disableDefaultUI={true}
      zoomControl={true}
      clickableIcons={false}
    >
      <MapController selectedEntity={selectedEntity} />

      {entities.map(entity => {
        const isSelected =
          selectedEntity?.id === entity.id &&
          selectedEntity?.entityType === entity.entityType

        return (
          <AdvancedMarker
            key={`${entity.entityType}-${entity.id}`}
            position={{ lat: entity.lat, lng: entity.lng }}
            onClick={() => onMarkerClick(entity)}
            zIndex={isSelected ? 100 : 1}
          >
            {entity.entityType === 'clinician'
              ? <ClinicianPin isSelected={isSelected} />
              : <ServicePin status={entity.status} isSelected={isSelected} />
            }
          </AdvancedMarker>
        )
      })}

      {selectedEntity && (
        <InfoWindow
          position={{ lat: selectedEntity.lat, lng: selectedEntity.lng }}
          onCloseClick={onInfoClose}
          pixelOffset={[0, -44]}
        >
          <InfoContent entity={selectedEntity} />
        </InfoWindow>
      )}

      <MapLegend />
    </Map>
  )
}

function InfoContent({ entity }) {
  const isService = entity.entityType === 'service'
  const statusColor = isService ? STATUS_COLORS[entity.status] : null

  return (
    <div className="info-window">
      <div className="info-type">
        <span className={`info-badge ${entity.entityType}`}>
          {isService ? 'Service' : 'Clinician'}
        </span>
        {isService && (
          <span className="info-badge" style={{ background: statusColor.label, color: statusColor.bg }}>
            <span className="info-status-dot" style={{ background: statusColor.dot }} />
            {entity.status}
          </span>
        )}
      </div>
      <h3 className="info-name">{entity.name}</h3>
      <div className="info-rows">
        <div className="info-row">
          <span className="info-label">Address</span>
          <span>{entity.address}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Role</span>
          <span>{entity.serviceRole}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Location</span>
          <span>{entity.location}</span>
        </div>
      </div>
    </div>
  )
}

function MapLegend() {
  return (
    <div className="map-legend">
      <div className="legend-row">
        <span className="legend-circle" style={{ background: '#2563eb' }} />
        Clinician
      </div>
      <div className="legend-divider" />
      <div className="legend-row">
        <span className="legend-square" style={{ background: '#16a34a' }} />
        Active
      </div>
      <div className="legend-row">
        <span className="legend-square" style={{ background: '#d97706' }} />
        Pending
      </div>
      <div className="legend-row">
        <span className="legend-square" style={{ background: '#6b7280' }} />
        Inactive
      </div>
    </div>
  )
}
