export default function UserHeader({ user, logout }) {
  return (
    <div className="user-header">
      <span className="user-email">Logged in as {user.email}</span>

      <button type="button" className="btn btn-secondary" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
