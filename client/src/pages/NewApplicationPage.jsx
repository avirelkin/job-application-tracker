// client/src/pages/NewApplicationPage.jsx
import { useNavigate } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import useApplicationForm from '../hooks/useApplicationForm';
import { createApplication } from '../utils/applicationApi';

export default function NewApplicationPage({ API_BASE, showToast }) {
  const navigate = useNavigate();

  const { form, saving, setSaving, updateField, resetFormState } =
    useApplicationForm();

  async function saveApplication(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await createApplication(API_BASE, form);
      resetFormState();
      showToast('success', 'Application added');
      navigate('/applications');
    } catch (err) {
      showToast('error', err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content">
      <div className="card">
        <div className="form-header">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/applications')}
          >
            ← Back
          </button>

          <h2>Add Application</h2>
        </div>

        <ApplicationForm
          form={form}
          updateField={updateField}
          onSubmit={saveApplication}
          saving={saving}
          heading={null}
          submitLabel="Add"
          onCancel={() => navigate('/applications')}
          showCancel={true}
        />
      </div>
    </div>
  );
}
