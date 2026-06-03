export function saveToken(token: string, user: object) {
  localStorage.setItem('paydrift_token', token);
  localStorage.setItem('paydrift_user', JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem('paydrift_token');
}

export function getUser() {
  try {
    const raw = localStorage.getItem('paydrift_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem('paydrift_token');
  localStorage.removeItem('paydrift_user');
}

export function isAuthenticated() {
  return !!getToken();
}
