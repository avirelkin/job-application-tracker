import { APPLICATION_STATUSES } from '../constants/applicationConstants';

export default function ApplicationForm({
  form,
  updateField,
  onSubmit,
  saving,
  heading,
  submitLabel,
  onCancel,
  showCancel = false,
}) {
  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 18 }}>
      {heading && <h2 style={{ fontSize: 18 }}>{heading}</h2>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          paddingRight: '20px',
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
            {APPLICATION_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
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

        <label style={{ gridColumn: '1 / -1' }}>
          Notes <br />
          <textarea
            name="notes"
            value={form.notes}
            onChange={updateField}
            rows={4}
            placeholder="Add any notes about this application..."
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : submitLabel}
        </button>

        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
