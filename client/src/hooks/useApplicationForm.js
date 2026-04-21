import { useState } from 'react';
import { INITIAL_FORM } from '../constants/applicationConstants';

export default function useApplicationForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function resetFormState() {
    setForm(INITIAL_FORM);
    setSaving(false);
  }

  return {
    form,
    setForm,
    saving,
    setSaving,
    updateField,
    resetFormState,
  };
}
