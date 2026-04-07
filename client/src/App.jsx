// client/src/App.jsx
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Modal from './components/modal';
import ApplicationsTable from './components/ApplicationsTable';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import UserHeader from './components/UserHeader';
import ApplicationForm from './components/ApplicationForm';
import ApplicationFilters from './components/ApplicationFilters';
import ApplicationSummary from './components/ApplicationSummary';
import AuthScreen from './components/AuthScreen';
import useToast from './hooks/useToast';
import useAuth from './hooks/useAuth';
import useApplicationForm from './hooks/useApplicationForm';

import { getStatusCounts, sortApplications } from './utils/applicationHelpers';

import {
  fetchApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from './utils/applicationApi';

import { INITIAL_FORM } from './constants/applicationConstants';

const API_BASE = import.meta.env.PROD
  ? window.location.origin
  : 'http://localhost:3000';

export default function App() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filtering + sorting state
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [statusSort, setStatusSort] = useState([]); // NEW: pills compound sorter (client)
  const [sort, setSort] = useState('desc'); // asc | desc
  const [sortBy, setSortBy] = useState('applied_date');
  const [deleteTarget, setDeleteTarget] = useState(null);
  // null or { id, company, title }

  const { toast, toastVisible, showToast, closeToast } = useToast();
  const {
    user,
    authLoading,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authMode,
    setAuthMode,
    submitAuth,
    logout,
  } = useAuth(API_BASE, showToast, () => {
    setApplications([]);
    resetFormState();
  });

  const {
    form,
    saving,
    setSaving,
    editingId,
    updateField,
    startEdit,
    cancelEdit,
    resetFormState,
  } = useApplicationForm();

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

  async function saveApplication(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const isEditing = editingId !== null;

      if (isEditing) {
        await updateApplication(API_BASE, editingId, form);
      } else {
        await createApplication(API_BASE, form);
      }

      cancelEdit();
      await loadApplications({ silent: true });

      showToast(
        'success',
        isEditing ? 'Application updated' : 'Application added',
      );
    } catch (err) {
      setError(err.message || 'Save failed');
      showToast('error', err.message || 'Save failed');
    } finally {
      setSaving(false);
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

  const listUrl = useMemo(() => {
    const u = new URL('/api/applications', API_BASE);

    if (filterStatus) u.searchParams.set('status', filterStatus);
    if (search.trim()) u.searchParams.set('q', search.trim());
    u.searchParams.set('sort', sort);
    u.searchParams.set('sortBy', sortBy);

    return u.toString();
  }, [filterStatus, search, sort, sortBy]);

  const statusCounts = useMemo(
    () => getStatusCounts(applications),
    [applications],
  );

  const sortedApplications = useMemo(
    () => sortApplications(applications, statusSort, sortBy, sort),
    [applications, statusSort, sortBy, sort],
  );

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && deleteTarget) cancelDelete();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteTarget]);

  useEffect(() => {
    if (!authLoading && user) {
      loadApplications({ silent: true });
    } else {
      setApplications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl, authLoading, user /*isFiltered*/]);

  return (
    <div className="page">
      <div className="container">
        <h1 className="app-title">Application Tracker</h1>

        <Toast
          toast={toast}
          toastVisible={toastVisible}
          closeToast={closeToast}
        />

        {authLoading ? (
          <p>Checking session…</p>
        ) : !user ? (
          <AuthScreen
            authMode={authMode}
            setAuthMode={setAuthMode}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            submitAuth={(e) =>
              submitAuth(e, async () => {
                setFilterStatus('');
                setSearch('');
                setSort('desc');
                setSortBy('applied_date');
                await loadApplications({ silent: true });
              })
            }
          />
        ) : (
          /* ================= MAIN APP ================= */
          <>
            {/* Logged-in header */}
            <UserHeader user={user} logout={logout} />
            {/* Add/Edit Form */}
            <ApplicationForm
              form={form}
              updateField={updateField}
              saveApplication={saveApplication}
              saving={saving}
              editingId={editingId}
              cancelEdit={cancelEdit}
            />

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
                onEdit={startEdit}
                onDelete={requestDelete}
              />
            )}

            <Modal app={selectedApp} onClose={closeDetails} />
          </>
        )}
      </div>
    </div>
  );
}
