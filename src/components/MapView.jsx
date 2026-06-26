import { useEffect, useRef } from 'react'
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { LA_CENTER, STATUS_COLORS, CLINICIAN_COLOR } from '../constants.js'
import './MapView.css'

// Greyscale map style — works without a Cloud Console Map ID
const MONOCHROME_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#e8e8e8' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#c8c8c8' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d8d8d8' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d8d8d8' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#d4d4d4' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#e8e8e8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c4c4c4' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
]

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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
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
      styles={MONOCHROME_STYLES}
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
