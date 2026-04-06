import { useEffect, useState } from 'react';
import {
  fetchCurrentUser,
  loginOrRegister,
  logoutUser,
} from '../utils/authApi';

export default function useAuth(API_BASE, showToast, onLoggedOut) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await fetchCurrentUser(API_BASE);
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [API_BASE]);

  async function submitAuth(e, afterLogin) {
    e.preventDefault();

    const data = await loginOrRegister(
      API_BASE,
      authMode,
      authEmail,
      authPassword,
    );

    setUser(data.user);
    setAuthPassword('');

    showToast(
      'success',
      authMode === 'register' ? 'Account created' : 'Logged in',
    );

    if (afterLogin) {
      await afterLogin();
    }
  }

  async function logout() {
    try {
      await logoutUser(API_BASE);
    } finally {
      setUser(null);
      setAuthEmail('');
      setAuthPassword('');
      setAuthMode('login');

      if (onLoggedOut) {
        onLoggedOut();
      }

      showToast('info', 'Logged out');
    }
  }

  return {
    user,
    setUser,
    authLoading,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authMode,
    setAuthMode,
    submitAuth,
    logout,
  };
}
