import { APPLICATION_STATUSES } from '../constants/applicationConstants';

export default function ApplicationFilters({
  filterStatus,
  setFilterStatus,
  search,
  setSearch,
  sortBy,
  setSortBy,
  sort,
  setSort,
  loadApplications,
  loading,
}) {
  return (
    <div
      style={{
        marginBottom: 15,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
      }}
    >
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="filter-select"
      >
        <option value="">All Statuses</option>
        {APPLICATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <div className="filters-row">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by company or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 240,
              padding: '8px 12px',
              margin: '0 6px',
            }}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="applied_date">Sort by Applied Date</option>
          <option value="created_at">Sort by Created Date</option>
        </select>

        <button
          type="button"
          className={`sort-toggle ${sort === 'desc' ? 'active' : ''}`}
          onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
        >
          {sort === 'desc' ? '↓ Newest' : '↑ Oldest'}
        </button>

        <button
          type="button"
          onClick={() => loadApplications()}
          disabled={loading}
          className="btn btn-secondary refresh-btn"
        >
          ↻ Refresh
        </button>
      </div>

      {loading && <span>Loading…</span>}
    </div>
  );
}
