export async function fetchCurrentUser(apiBase) {
  const res = await fetch(`${apiBase}/api/auth/me`, {
    credentials: 'include',
  });

  const data = await res.json().catch(() => null);
  return data?.user ?? null;
}

export async function loginOrRegister(apiBase, authMode, email, password) {
  const endpoint =
    authMode === 'register'
      ? `${apiBase}/api/auth/register`
      : `${apiBase}/api/auth/login`;

  const res = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `${authMode} failed: ${res.status}`);
  }

  return data;
}

export async function logoutUser(apiBase) {
  await fetch(`${apiBase}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
