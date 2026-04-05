export default function DeleteConfirmModal({
  deleteTarget,
  cancelDelete,
  confirmDelete,
}) {
  if (!deleteTarget) return null;

  return (
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
  );
}
