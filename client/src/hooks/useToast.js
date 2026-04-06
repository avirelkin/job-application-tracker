import { useState } from 'react';

export default function useToast() {
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

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

  return {
    toast,
    toastVisible,
    showToast,
    closeToast,
  };
}
