import FilterBar from './FilterBar.jsx'
import EntityCard from './EntityCard.jsx'
import './Sidebar.css'

export default function Sidebar({
  entities,
  selectedEntity,
  filters,
  activeTab,
  loading,
  onSelect,
  onFilterChange,
}) {
  const showStatusFilter = activeTab !== 'clinicians'

  return (
    <aside className="sidebar">
      <FilterBar
        filters={filters}
        showStatus={showStatusFilter}
        onChange={onFilterChange}
      />

      <div className="sidebar-count">
        {loading ? 'Loading…' : `${entities.length} result${entities.length !== 1 ? 's' : ''}`}
      </div>

      <div className="entity-list">
        {loading && (
          <div className="list-empty">
            <div className="spinner" />
          </div>
        )}

        {!loading && entities.length === 0 && (
          <div className="list-empty">
            <p>No results match your filters.</p>
          </div>
        )}

        {!loading && entities.map(entity => (
          <EntityCard
            key={`${entity.entityType}-${entity.id}`}
            entity={entity}
            isSelected={
              selectedEntity?.id === entity.id &&
              selectedEntity?.entityType === entity.entityType
            }
            onClick={() => onSelect(entity)}
          />
        ))}
      </div>

      <div className="sidebar-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#2563eb' }} />
          Clinician
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#16a34a' }} />
          Active
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#d97706' }} />
          Pending
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#6b7280' }} />
          Inactive
        </span>
      </div>
    </aside>
  )
}
