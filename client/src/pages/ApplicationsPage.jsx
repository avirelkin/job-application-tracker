// client/src/pages/ApplicationsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/modal';
import ApplicationsTable from '../components/ApplicationsTable';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ApplicationFilters from '../components/ApplicationFilters';
import ApplicationSummary from '../components/ApplicationSummary';
import useApplicationView from '../hooks/useApplicationView';
import { getStatusCounts } from '../utils/applicationHelpers';
import { fetchApplications, deleteApplication } from '../utils/applicationApi';

export default function ApplicationsPage({ API_BASE, showToast }) {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
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
    listQuery,
  } = useApplicationView(applications);

  const listUrl = useMemo(() => {
    const u = new URL('/api/applications', API_BASE);

    if (listQuery.filterStatus) {
      u.searchParams.set('status', listQuery.filterStatus);
    }

    if (listQuery.search) {
      u.searchParams.set('q', listQuery.search);
    }

    u.searchParams.set('sort', listQuery.sort);
    u.searchParams.set('sortBy', listQuery.sortBy);

    return u.toString();
  }, [API_BASE, listQuery]);

  function openDetails(app) {
    setSelectedApp(app);
  }

  function closeDetails() {
    setSelectedApp(null);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  function requestDelete(app) {
    setDeleteTarget({ id: app.id, company: app.company, title: app.title });
  }

  function goToNewApplication() {
    navigate('/applications/new');
  }

  function goToEditApplication(id) {
    navigate(`/applications/${id}/edit`);
  }

  async function loadApplications({ silent = false } = {}) {
    setLoading(true);
    setError('');

    try {
      const data = await fetchApplications(listUrl);
      setApplications(data);
    } catch (err) {
      const msg = err.message || 'Failed to load';
      setError(msg);
      if (!silent) showToast('error', msg);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await deleteApplication(API_BASE, deleteTarget.id);
      setDeleteTarget(null);
      await loadApplications({ silent: true });
      showToast('success', 'Application deleted');
    } catch (err) {
      setError(err.message || 'Delete failed');
      showToast('error', err.message || 'Delete failed');
    }
  }

  const statusCounts = useMemo(
    () => getStatusCounts(applications),
    [applications],
  );

  useEffect(() => {
    loadApplications({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && deleteTarget) cancelDelete();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteTarget]);

  return (
    <>
      <div className="list-header">
        <div>
          <h2 className="list-title">Applications</h2>
          <p className="list-subtitle">
            Track and manage your job applications
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary add-app-btn"
          onClick={goToNewApplication}
        >
          + Add Application
        </button>
      </div>

      <ApplicationFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sort={sort}
        setSort={setSort}
        loadApplications={loadApplications}
        loading={loading}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && applications.length > 0 && (
        <ApplicationSummary
          statusCounts={statusCounts}
          statusSort={statusSort}
          setStatusSort={setStatusSort}
        />
      )}

      <DeleteConfirmModal
        deleteTarget={deleteTarget}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
      />

      {!loading && sortedApplications.length === 0 && (
        <p>No applications found.</p>
      )}

      {!loading && sortedApplications.length > 0 && (
        <ApplicationsTable
          applications={sortedApplications}
          onView={openDetails}
          onEdit={goToEditApplication}
          onDelete={requestDelete}
        />
      )}

      <Modal app={selectedApp} onClose={closeDetails} />
    </>
  );
}
