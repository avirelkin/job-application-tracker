// client/src/pages/EditApplicationPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import useApplicationForm from '../hooks/useApplicationForm';
import {
  fetchApplicationById,
  updateApplication,
} from '../utils/applicationApi';
import { toApplicationFormValues } from '../utils/applicationHelpers';

export default function EditApplicationPage({ API_BASE, showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { form, setForm, saving, setSaving, updateField } =
    useApplicationForm();

  useEffect(() => {
    async function loadApplication() {
      setLoading(true);
      setNotFound(false);

      try {
        const app = await fetchApplicationById(API_BASE, id);
        setForm(toApplicationFormValues(app));
      } catch (err) {
        if (err.message === 'Not found') {
          setNotFound(true);
        } else {
          showToast('error', err.message || 'Failed to load application');
        }
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [API_BASE, id, setForm, showToast]);

  async function saveApplication(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateApplication(API_BASE, id, form);
      showToast('success', 'Application updated');
      navigate('/applications');
    } catch (err) {
      showToast('error', err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading application…</p>;
  }

  if (notFound) {
    return (
      <div>
        <p>Application not found.</p>
        <button type="button" onClick={() => navigate('/applications')}>
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="card">
        <div className="form-header">
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="btn btn-secondary"
          >
            ← Back
          </button>
          <h2>Edit Application #{id}</h2>
        </div>

        <ApplicationForm
          form={form}
          updateField={updateField}
          onSubmit={saveApplication}
          saving={saving}
          heading={null}
          submitLabel="Update"
          onCancel={() => navigate('/applications')}
          showCancel={true}
        />
      </div>
    </div>
  );
}
