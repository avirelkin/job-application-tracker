// client/src/App.jsx
import { useEffect, useMemo, useState } from 'react';
import './App.css';

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // filtering + sorting state
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
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
  const isFiltered = Boolean(filterStatus) || Boolean(search.trim());
  // const sourceForCounts = isFiltered ? applications : allApplications;

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

  function cancelDelete() {
    setDeleteTarget(null);
  }
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
  }, [listUrl, authLoading, user, isFiltered]);

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

  function requestDelete(app) {
    setDeleteTarget({ id: app.id, company: app.company, title: app.title });
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
  /*
  function clearFilters() {
    setFilterStatus('');
    setSearch('');
  } 
*/
  return (
    <div
      style={{
        padding: 20,
        fontFamily: 'Arial',
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      <h1>Job Application Tracking System</h1>

      {toast && (
        <div className={`toast ${toast.type} ${toastVisible ? 'show' : ''}`}>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" type="button" onClick={closeToast}>
            ×
          </button>
        </div>
      )}

      {authLoading ? (
        <p>Checking session…</p>
      ) : !user ? (
        /* ================= AUTH SCREEN ================= */
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
                authMode === 'register' ? 'new-password' : 'current-password'
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
      ) : (
        /* ================= MAIN APP ================= */
        <>
          {/* Logged-in header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Logged in as <strong>{user.email}</strong>
            </div>
            <button className="btn" type="button" onClick={logout}>
              Logout
            </button>
          </div>
          {/* Add/Edit Form */}
          <form onSubmit={saveApplication} style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 18 }}>
              {editingId ? `Edit Application #${editingId}` : 'Add Application'}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <label>
                Company* <br />
                <input
                  name="company"
                  value={form.company}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Title* <br />
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                URL <br />
                <input
                  name="url"
                  value={form.url}
                  onChange={updateField}
                  placeholder="https://…"
                />
              </label>

              <label>
                Status* <br />
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                  required
                >
                  <option>Saved</option>
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </label>

              <label>
                Applied Date <br />
                <input
                  name="applied_date"
                  type="date"
                  value={form.applied_date}
                  onChange={updateField}
                />
              </label>

              <label>
                Notes <br />
                <input name="notes" value={form.notes} onChange={updateField} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
              </button>

              {editingId && (
                <button type="button" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
              )}
            </div>
          </form>

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
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

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
          {!loading && applications.length === 0 && (
            <p>No applications found.</p>
          )}
          {!loading && applications.length > 0 && (
            <div className="summary">
              {[
                { key: 'Saved', icon: '💾', cls: 'badge-saved' },
                { key: 'Applied', icon: '📨', cls: 'badge-applied' },
                { key: 'Interview', icon: '📅', cls: 'badge-interview' },
                { key: 'Offer', icon: '🎉', cls: 'badge-offer' },
                { key: 'Rejected', icon: '⛔', cls: 'badge-rejected' },
              ].map(({ key, icon, cls }) => (
                <button
                  key={key}
                  type="button"
                  className={`summary-pill badge ${cls} ${
                    filterStatus === key ? 'active-pill' : ''
                  }`}
                  onClick={() =>
                    setFilterStatus((cur) => (cur === key ? '' : key))
                  }
                  title="Click to filter"
                >
                  <span>{icon}</span>
                  <span>{key}</span>
                  <strong>{statusCounts[key]}</strong>
                </button>
              ))}

              <div className="summary-pill">
                Total: <strong>{statusCounts.Total}</strong>
              </div>
            </div>
          )}

          {deleteTarget && (
            <div
              className="modal-overlay"
              onClick={cancelDelete}
              role="dialog"
              aria-modal="true"
            >
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Delete application?</h3>

                <p className="modal-text">
                  <strong>{deleteTarget.company}</strong> — {deleteTarget.title}
                </p>

                <div className="modal-actions">
                  <button className="btn" type="button" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && applications.length > 0 && (
            <div className="table-container">
              <table className="apps-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.company}</td>
                      <td>{app.title}</td>
                      <td>
                        <span
                          className={`badge badge-${app.status.toLowerCase()}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td>{app.applied_date?.slice(0, 10)}</td>
                      <td className="apps-actions">
                        <button
                          className="btn"
                          type="button"
                          onClick={() => startEdit(app)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => requestDelete(app)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
