export default function Toast({ toast, toastVisible, closeToast }) {
  if (!toast) return null;

  return (
    <div className={`toast ${toast.type} ${toastVisible ? 'show' : ''}`}>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" type="button" onClick={closeToast}>
        ×
      </button>
    </div>
  );
}
