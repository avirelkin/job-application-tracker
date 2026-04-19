import { useMemo, useState } from 'react';
import { sortApplications } from '../utils/applicationHelpers';

export default function useApplicationView(applications) {
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [statusSort, setStatusSort] = useState([]);
  const [sort, setSort] = useState('desc');
  const [sortBy, setSortBy] = useState('applied_date');

  const listUrl = useMemo(() => {
    return {
      filterStatus,
      search: search.trim(),
      sort,
      sortBy,
    };
  }, [filterStatus, search, sort, sortBy]);

  const sortedApplications = useMemo(() => {
    return sortApplications(applications, statusSort, sortBy, sort);
  }, [applications, statusSort, sortBy, sort]);

  function resetViewState() {
    setFilterStatus('');
    setSearch('');
    setStatusSort([]);
    setSort('desc');
    setSortBy('applied_date');
  }

  return {
    filterStatus,
    setFilterStatus,
    search,
    setSearch,
    statusSort,
    setStatusSort,
    sort,
    setSort,
    sortBy,
    setSortBy,
    sortedApplications,
    listQuery: listUrl,
    resetViewState,
  };
}
