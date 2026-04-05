// client/src/App.jsx
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Modal from './components/modal';
import ApplicationsTable from './components/ApplicationsTable';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import UserHeader from './components/UserHeader';
import ApplicationForm from './components/ApplicationForm';

const API_BASE = import.meta.env.PROD
  ? window.location.origin
  : 'http://localhost:3000';

const initialForm = {
  company: '',
  title: '',
  url: '',
  status: 'Applied',
  applied_date: '',
  notes: '',
};

function toDateInputValue(applied_date) {
  if (!applied_date) return '';
  return String(applied_date).slice(0, 10);
}

export default function App() {
  const [applications, setApplications] = useState([]);
  //const [allApplications, setAllApplications] = useState([]); // ✅ add this
  const [selectedApp, setSelectedApp] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // filtering + sorting state
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [statusSort, setStatusSort] = useState([]); // NEW: pills compound sorter (client)
  const [sort, setSort] = useState('desc'); // asc | desc
  const [sortBy, setSortBy] = useState('applied_date');
  const [deleteTarget, setDeleteTarget] = useState(null);
  // null or { id, company, title }

  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message: string }
  const [toastVisible, setToastVisible] = useState(false);

  const [user, setUser] = useState(null); // {id,email} or null
  const [authLoading, setAuthLoading] = useState(true);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  //const isFiltered = Boolean(filterStatus) || Boolean(search.trim());
  // const sourceForCounts = isFiltered ? applications : allApplications;

  function openDetails(app) {
    setSelectedApp(app);
  }

  function closeDetails() {
    setSelectedApp(null);
  }

  function showToast(type, message) {
    setToast({ type, message });
    setToastVisible(true);

    // auto-hide after 2.8s
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  }

  function closeToast() {
    setToastVisible(false);
  }

  function updateField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function startEdit(app) {
    setEditingId(app.id);
    setForm({
      company: app.company || '',
      title: app.title || '',
      url: app.url || '',
      status: app.status || 'Applied',
      applied_date: toDateInputValue(app.applied_date),
      notes: app.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
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
      const res = await fetch(listUrl, { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
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

      const endpoint = isEditing
        ? `${API_BASE}/api/applications/${editingId}`
        : `${API_BASE}/api/applications`;

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `${method} failed: ${res.status}`);
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
      const res = await fetch(
        `${API_BASE}/api/applications/${deleteTarget.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }

      setDeleteTarget(null);
      await loadApplications({ silent: true });

      // if you added toasts earlier:
      showToast('success', 'Application deleted');
    } catch (err) {
      setError(err.message || 'Delete failed');
      showToast('error', err.message || 'Delete failed');
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setApplications([]);
      setEditingId(null);
      setForm(initialForm);
      showToast('info', 'Logged out');
    }
  }

  async function submitAuth(e) {
    e.preventDefault();
    setError('');

    try {
      const endpoint =
        authMode === 'register'
          ? `${API_BASE}/api/auth/register`
          : `${API_BASE}/api/auth/login`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `${authMode} failed: ${res.status}`);
      }

      setUser(data.user);
      setFilterStatus('');
      setSearch('');
      setSort('desc');
      setSortBy('applied_date');

      setAuthPassword('');
      showToast(
        'success',
        authMode === 'register' ? 'Account created' : 'Logged in',
      );

      // load this user's data
      await loadApplications({ silent: true });
    } catch (err) {
      const msg = err.message || 'Auth failed';
      setError(msg);
      showToast('error', msg);
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

  const statusCounts = useMemo(() => {
    const counts = {
      Saved: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Total: 0,
    };

    for (const app of applications) {
      counts.Total += 1;
      if (counts[app.status] !== undefined) counts[app.status] += 1;
    }

    return counts;
  }, [applications]);

  const sortedApplications = useMemo(() => {
    const arr = [...applications];

    const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

    return arr.sort((a, b) => {
      // 1) compound status priority (pills)
      for (const s of statusSort) {
        const aKey = a.status === s ? 0 : 1; // matching status floats up
        const bKey = b.status === s ? 0 : 1;
        if (aKey !== bKey) return aKey - bKey;
      }

      // 2) tie-breaker: existing sortBy/sort
      const av = a?.[sortBy] ?? '';
      const bv = b?.[sortBy] ?? '';
      const base = cmp(av, bv);

      return sort === 'asc' ? base : -base;
    });
  }, [applications, statusSort, sortBy, sort]);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
        });
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  /*
  function clearFilters() {
    setFilterStatus('');
    setSearch('');
  } 
*/
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
          /* ================= AUTH SCREEN ================= */
          <div className="auth-layout">
            <div className="auth-hero">
              <h2>
                Track every application. <br />
                Stay in control.
              </h2>
              <p>
                Notes, statuses, and timelines—so you always know whats next.
              </p>

              <ul className="auth-bullets">
                <li>
                  <span className="badge badge-applied auth-badge">
                    Applied
                  </span>
                  <span className="auth-bullet-text">
                    Smart filtering + status tracking
                  </span>
                </li>
                <li>
                  <span className="badge badge-interview auth-badge">
                    Interview
                  </span>
                  <span className="auth-bullet-text">
                    Full details modal for notes
                  </span>
                </li>
                <li>
                  <span className="badge badge-offer auth-badge">Offer</span>
                  <span className="auth-bullet-text">
                    Created + applied dates
                  </span>
                </li>
              </ul>
            </div>

            <div className="auth-card">
              <h2 style={{ marginTop: 0 }}>
                {authMode === 'register' ? 'Create account' : 'Log in'}
              </h2>

              <form onSubmit={submitAuth} style={{ display: 'grid', gap: 10 }}>
                <input
                  placeholder="Email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  autoComplete="email"
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  autoComplete={
                    authMode === 'register'
                      ? 'new-password'
                      : 'current-password'
                  }
                />

                <button className="btn" type="submit">
                  {authMode === 'register' ? 'Register' : 'Login'}
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() =>
                    setAuthMode((m) => (m === 'login' ? 'register' : 'login'))
                  }
                >
                  Switch to {authMode === 'login' ? 'Register' : 'Login'}
                </button>
              </form>
            </div>
          </div>
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
              >
                <option value="">All Statuses</option>
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>

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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="applied_date">Sort by Applied Date</option>
                <option value="created_at">Sort by Created Date</option>
              </select>

              <button
                type="button"
                onClick={() => setSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
              >
                {sort === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}
              </button>

              <button
                type="button"
                onClick={() => loadApplications()}
                disabled={loading}
              >
                Refresh
              </button>

              {loading && <span>Loading…</span>}
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && applications.length > 0 && (
              <div className="summary">
                {[
                  { key: 'Saved', icon: '💾', cls: 'badge-saved' },
                  { key: 'Applied', icon: '📨', cls: 'badge-applied' },
                  { key: 'Interview', icon: '📅', cls: 'badge-interview' },
                  { key: 'Offer', icon: '🎉', cls: 'badge-offer' },
                  { key: 'Rejected', icon: '⛔', cls: 'badge-rejected' },
                ].map(({ key, icon, cls }) => {
                  const idx = statusSort.indexOf(key);
                  const active = idx !== -1;

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`summary-pill badge ${cls} ${
                        active ? 'active-pill' : ''
                      }`}
                      onClick={() =>
                        setStatusSort((cur) =>
                          cur.includes(key)
                            ? cur.filter((s) => s !== key)
                            : [...cur, key],
                        )
                      }
                      title={
                        active
                          ? `Sort priority #${idx + 1} (click to remove)`
                          : 'Click to add sort priority'
                      }
                    >
                      <span>{icon}</span>
                      <span>{key}</span>
                      <strong>{statusCounts[key]}</strong>
                      {active && <em className="pill-order">{idx + 1}</em>}
                    </button>
                  );
                })}

                <div className="summary-pill">
                  Total: <strong>{statusCounts.Total}</strong>
                </div>
              </div>
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
