import { STATUS_COLORS, CLINICIAN_COLOR } from '../constants.js'
import './EntityCard.css'

export default function EntityCard({ entity, isSelected, onClick }) {
  const isService = entity.entityType === 'service'
  const color = isService
    ? STATUS_COLORS[entity.status] || STATUS_COLORS['Active']
    : { bg: CLINICIAN_COLOR.bg, label: '#dbeafe', dot: '#60a5fa' }

  return (
    <button
      className={`entity-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <span
          className="card-type-badge"
          style={{ background: color.label, color: color.bg }}
        >
          {isService ? 'Service' : 'Clinician'}
        </span>
        {isService && (
          <span
            className="card-status-badge"
            style={{ background: color.label, color: color.bg }}
          >
            <span
              className="status-dot"
              style={{ background: color.dot }}
            />
            {entity.status}
          </span>
        )}
      </div>

      <div className="card-name">{entity.name}</div>

      <div className="card-meta">
        <span className="card-role">{entity.serviceRole}</span>
        <span className="card-separator">·</span>
        <span className="card-location">{entity.location}</span>
      </div>

      <div className="card-address">{entity.address}</div>
    </button>
  )
}
