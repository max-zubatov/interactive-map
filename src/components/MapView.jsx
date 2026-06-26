import { useEffect, useRef } from 'react'
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { LA_CENTER, STATUS_COLORS, CLINICIAN_COLOR } from '../constants.js'
import './MapView.css'

function MapController({ selectedEntity }) {
  const map = useMap()
  const prevSelected = useRef(null)

  useEffect(() => {
    if (!map || !selectedEntity) return
    if (prevSelected.current?.id === selectedEntity.id &&
        prevSelected.current?.entityType === selectedEntity.entityType) return
    prevSelected.current = selectedEntity
    map.panTo({ lat: selectedEntity.lat, lng: selectedEntity.lng })
  }, [map, selectedEntity])

  return null
}

function getMarkerColor(entity) {
  if (entity.entityType === 'clinician') return CLINICIAN_COLOR
  return STATUS_COLORS[entity.status] || STATUS_COLORS['Active']
}

export default function MapView({ entities, selectedEntity, onMarkerClick, onInfoClose }) {
  return (
    <Map
      style={{ width: '100%', height: '100%' }}
      defaultCenter={LA_CENTER}
      defaultZoom={11}
      mapId="DEMO_MAP_ID"
      gestureHandling="greedy"
      disableDefaultUI={false}
      clickableIcons={false}
    >
      <MapController selectedEntity={selectedEntity} />

      {entities.map(entity => {
        const color = getMarkerColor(entity)
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
            <Pin
              background={color.bg}
              glyphColor="white"
              borderColor={color.border}
              scale={isSelected ? 1.3 : 1}
            />
          </AdvancedMarker>
        )
      })}

      {selectedEntity && (
        <InfoWindow
          position={{ lat: selectedEntity.lat, lng: selectedEntity.lng }}
          onCloseClick={onInfoClose}
          pixelOffset={[0, -40]}
        >
          <InfoContent entity={selectedEntity} />
        </InfoWindow>
      )}
    </Map>
  )
}

function InfoContent({ entity }) {
  const isService = entity.entityType === 'service'
  const colors = isService
    ? STATUS_COLORS[entity.status]
    : { bg: CLINICIAN_COLOR.bg, label: '#dbeafe', dot: '#60a5fa' }

  return (
    <div className="info-window">
      <div className="info-type">
        <span
          className="info-badge"
          style={{ background: colors.label, color: colors.bg }}
        >
          {isService ? 'Service' : 'Clinician'}
        </span>
        {isService && (
          <span
            className="info-badge"
            style={{ background: colors.label, color: colors.bg }}
          >
            {entity.status}
          </span>
        )}
      </div>
      <h3 className="info-name">{entity.name}</h3>
      <p className="info-detail">
        <span className="info-icon">📍</span>
        {entity.address}
      </p>
      <p className="info-detail">
        <span className="info-icon">🏷️</span>
        {entity.serviceRole}
      </p>
      <p className="info-detail">
        <span className="info-icon">🗺️</span>
        {entity.location}
      </p>
    </div>
  )
}
