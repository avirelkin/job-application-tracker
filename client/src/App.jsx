import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Toast from './components/Toast';
import UserHeader from './components/UserHeader';
import AuthScreen from './components/AuthScreen';
import useToast from './hooks/useToast';
import useAuth from './hooks/useAuth';
import ApplicationsPage from './pages/ApplicationsPage';
import NewApplicationPage from './pages/NewApplicationPage';
import EditApplicationPage from './pages/EditApplicationPage';

const API_BASE = import.meta.env.PROD
  ? window.location.origin
  : 'http://localhost:3000';

export default function App() {
  const { toast, toastVisible, showToast, closeToast } = useToast();

  const {
    user,
    authLoading,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authMode,
    setAuthMode,
    submitAuth,
    logout,
  } = useAuth(API_BASE, showToast, () => {});

  return (
    <div className="page">
      <div className="container">
        <Toast
          toast={toast}
          toastVisible={toastVisible}
          closeToast={closeToast}
        />

        {authLoading ? (
          <>
            <h1 className="app-title">Application Tracker</h1>
            <p>Checking session…</p>
          </>
        ) : !user ? (
          <>
            <h1 className="app-title">Application Tracker</h1>

            <AuthScreen
              authMode={authMode}
              setAuthMode={setAuthMode}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              submitAuth={submitAuth}
            />
          </>
        ) : (
          <>
            <div className="app-header">
              <h1 className="app-title">Application Tracker</h1>
              <UserHeader user={user} logout={logout} />
            </div>

            <Routes>
              <Route
                path="/"
                element={<Navigate to="/applications" replace />}
              />
              <Route
                path="/applications"
                element={
                  <ApplicationsPage API_BASE={API_BASE} showToast={showToast} />
                }
              />
              <Route
                path="/applications/new"
                element={
                  <NewApplicationPage
                    API_BASE={API_BASE}
                    showToast={showToast}
                  />
                }
              />
              <Route
                path="/applications/:id/edit"
                element={
                  <EditApplicationPage
                    API_BASE={API_BASE}
                    showToast={showToast}
                  />
                }
              />
            </Routes>
          </>
        )}
      </div>
    </div>
  );
}
