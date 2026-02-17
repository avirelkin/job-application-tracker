// client/src/components/Modal.jsx
import { useEffect } from 'react';

function toDateOnly(value) {
  if (!value) return '-';
  return String(value).slice(0, 10);
}

export default function Modal({ app, onClose }) {
  // Hooks must always run
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!app) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
    };
  }, [app]);

  if (!app) return null;

  return (
    <div
      className="details-backdrop"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="details-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="details-header">
          <div className="details-title">
            {app.company || '(No company)'} — {app.title || '(No title)'}
          </div>

          <button className="btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="details-body">
          <div className="details-grid">
            <div className="details-field">
              <div className="details-label">Status</div>
              <div className="details-value">
                {app.status ? (
                  <span className={`badge badge-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div className="details-field">
              <div className="details-label">Applied date</div>
              <div className="details-value">
                {toDateOnly(app.applied_date)}
              </div>
            </div>

            <div className="details-field">
              <div className="details-label">Created</div>
              <div className="details-value">
                {app.created_at ? String(app.created_at).slice(0, 10) : '-'}
              </div>
            </div>

            <div className="details-field details-span">
              <div className="details-label">URL</div>
              <div className="details-value">
                {app.url ? (
                  <a href={app.url} target="_blank" rel="noreferrer">
                    {app.url}
                  </a>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div className="details-field details-span">
              <div className="details-label">Notes</div>
              <div className="details-value details-notes">
                {app.notes?.trim() ? app.notes : '(No notes)'}
              </div>
            </div>
          </div>
        </div>

        <div className="details-footer">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
