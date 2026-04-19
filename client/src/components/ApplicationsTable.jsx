// client/src/components/ApplicationsTable.jsx

export default function ApplicationsTable({
  applications,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="table-container">
      <table className="apps-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Title</th>
            <th>Status</th>
            <th>Applied</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.company}</td>
              <td>{app.title}</td>

              <td>
                <span className={`badge badge-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </td>

              <td>{app.applied_date?.slice(0, 10)}</td>
              <td>{app.created_at?.slice(0, 10)}</td>

              <td className="apps-actions">
                <button
                  className="btn"
                  type="button"
                  onClick={() => onView(app)}
                >
                  View
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => onEdit(app.id)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => onDelete(app)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
