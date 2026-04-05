export default function ApplicationForm({
  form,
  updateField,
  saveApplication,
  saving,
  editingId,
  cancelEdit,
}) {
  return (
    <form onSubmit={saveApplication} style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 18 }}>
        {editingId ? `Edit Application #${editingId}` : 'Add Application'}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
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
  );
}
