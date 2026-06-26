import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Map,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { LA_CENTER, STATUS_COLORS, CLINICIAN_COLOR } from '../constants.js'
import './MapView.css'

const MAP_STYLES = [
  { featureType: 'all', stylers: [{ saturation: -100 }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
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

function isActive(entity, activeClinician) {
  if (!activeClinician) return true
  if (entity.entityType === 'clinician') return entity.id === activeClinician.id
  return entity.clinicianId === activeClinician.id
}

// Custom HTML marker that works with raster maps (no mapId required)
function HtmlMarker({ position, zIndex, onClick, children }) {
  const map = useMap()
  const containerRef = useRef(null)
  const overlayRef = useRef(null)
  const onClickRef = useRef(onClick)
  const [mounted, setMounted] = useState(false)

  onClickRef.current = onClick

  if (!containerRef.current) {
    const el = document.createElement('div')
    el.style.position = 'absolute'
    el.style.cursor = 'pointer'
    containerRef.current = el
  }

  useEffect(() => {
    if (!map) return
    const container = containerRef.current
    const { lat, lng } = position

    class Overlay extends window.google.maps.OverlayView {
      draw() {
        const proj = this.getProjection()
        if (!proj) return
        const pt = proj.fromLatLngToDivPixel(new window.google.maps.LatLng(lat, lng))
        if (!pt) return
        container.style.left = `${pt.x}px`
        container.style.top = `${pt.y}px`
        container.style.transform = 'translate(-50%, -50%)'
      }
      onAdd() {
        this.getPanes().overlayMouseTarget.appendChild(container)
        setMounted(true)
      }
      onRemove() {
        if (container.parentNode) container.parentNode.removeChild(container)
        setMounted(false)
      }
    }

    const overlay = new Overlay()
    overlay.setMap(map)
    overlayRef.current = overlay

    const handleClick = () => onClickRef.current?.()
    container.addEventListener('click', handleClick)

    return () => {
      overlay.setMap(null)
      overlayRef.current = null
      container.removeEventListener('click', handleClick)
    }
  }, [map])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.zIndex = String(zIndex ?? 1)
    }
  }, [zIndex])

  return mounted ? createPortal(children, containerRef.current) : null
}

function ClinicianPin({ isSelected, dimmed }) {
  const size = isSelected ? 40 : 34
  return (
    <div
      className="marker-base"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: CLINICIAN_COLOR.bg,
        boxShadow: isSelected
          ? `0 0 0 4px rgba(37,99,235,0.25), 0 3px 10px rgba(0,0,0,0.35)`
          : '0 2px 6px rgba(0,0,0,0.3)',
        opacity: dimmed ? 0.25 : 1,
        filter: dimmed ? 'grayscale(1)' : 'none',
        transition: 'opacity 0.2s ease, filter 0.2s ease',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2v2"/>
        <path d="M5 2v2"/>
        <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/>
        <path d="M8 15a6 6 0 0 0 12 0v-3"/>
        <circle cx="20" cy="10" r="2"/>
      </svg>
    </div>
  )
}

function ServicePin({ status, isSelected, dimmed }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS['Active']
  const size = isSelected ? 40 : 34
  return (
    <div
      className="marker-base"
      style={{
        width: size,
        height: size,
        borderRadius: '8px',
        background: color.bg,
        boxShadow: isSelected
          ? `0 0 0 4px ${color.bg}44, 0 3px 10px rgba(0,0,0,0.35)`
          : '0 2px 6px rgba(0,0,0,0.3)',
        opacity: dimmed ? 0.25 : 1,
        filter: dimmed ? 'grayscale(1)' : 'none',
        transition: 'opacity 0.2s ease, filter 0.2s ease',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}

export default function MapView({ entities, selectedEntity, activeClinician, onMarkerClick, onInfoClose }) {
  return (
    <Map
      style={{ width: '100%', height: '100%' }}
      defaultCenter={LA_CENTER}
      defaultZoom={11}
      gestureHandling="greedy"
      disableDefaultUI={true}
      zoomControl={true}
      clickableIcons={false}
      styles={MAP_STYLES}
    >
      <MapController selectedEntity={selectedEntity} />

      {entities.map(entity => {
        const isSelected =
          selectedEntity?.id === entity.id &&
          selectedEntity?.entityType === entity.entityType
        const dimmed = !isActive(entity, activeClinician)

        return (
          <HtmlMarker
            key={`${entity.entityType}-${entity.id}`}
            position={{ lat: entity.lat, lng: entity.lng }}
            onClick={() => onMarkerClick(entity)}
            zIndex={isSelected ? 100 : dimmed ? 0 : 1}
          >
            {entity.entityType === 'clinician'
              ? <ClinicianPin isSelected={isSelected} dimmed={dimmed} />
              : <ServicePin status={entity.status} isSelected={isSelected} dimmed={dimmed} />
            }
          </HtmlMarker>
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
        {isService && (
          <div className="info-row">
            <span className="info-label">Clinician</span>
            <span>{entity.clinicianName ?? '—'}</span>
          </div>
        )}
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
