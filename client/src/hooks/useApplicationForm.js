import { useState } from 'react';
import { INITIAL_FORM } from '../constants/applicationConstants';
import { toDateInputValue } from '../utils/applicationHelpers';

export default function useApplicationForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function startEdit(app) {
    setEditingId(app.id);
    setForm({
      company: app.company || '',
      title: app.title || '',
      url: app.url || '',
      status: app.status || 'Applied',
      applied_date: toDateInputValue(app.applied_date),
      notes: app.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(INITIAL_FORM);
  }

  function resetFormState() {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setSaving(false);
  }

  return {
    form,
    setForm,
    saving,
    setSaving,
    editingId,
    updateField,
    startEdit,
    cancelEdit,
    resetFormState,
  };
}
