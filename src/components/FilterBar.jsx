import { SERVICE_ROLES, LOCATIONS, STATUSES } from '../constants.js'
import './FilterBar.css'

export default function FilterBar({ filters, showStatus, onChange }) {
  const hasFilters = filters.serviceRole || filters.location || filters.status

  return (
    <div className="filter-bar">
      <div className="filter-row">
        <label className="filter-label">Role</label>
        <select
          className="filter-select"
          value={filters.serviceRole}
          onChange={e => onChange('serviceRole', e.target.value)}
        >
          <option value="">All roles</option>
          {SERVICE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="filter-row">
        <label className="filter-label">Location</label>
        <select
          className="filter-select"
          value={filters.location}
          onChange={e => onChange('location', e.target.value)}
        >
          <option value="">All locations</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {showStatus && (
        <div className="filter-row">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={e => onChange('status', e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {hasFilters && (
        <button
          className="clear-filters"
          onClick={() => {
            onChange('serviceRole', '')
            onChange('location', '')
            onChange('status', '')
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
