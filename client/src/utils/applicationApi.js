export async function fetchApplications(listUrl) {
  const res = await fetch(listUrl, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return res.json();
}

export async function fetchApplicationById(API_BASE, id) {
  const res = await fetch(`${API_BASE}/api/applications/${id}`, {
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to load application');
  }

  return data;
}

export async function createApplication(apiBase, form) {
  const res = await fetch(`${apiBase}/api/applications`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `POST failed: ${res.status}`);
  }

  return data;
}

export async function updateApplication(apiBase, id, form) {
  const res = await fetch(`${apiBase}/api/applications/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `PUT failed: ${res.status}`);
  }

  return data;
}

export async function deleteApplication(apiBase, id) {
  const res = await fetch(`${apiBase}/api/applications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Delete failed: ${res.status}`);
  }
}
