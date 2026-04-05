export default function UserHeader({ user, logout }) {
  return (
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
  );
}
