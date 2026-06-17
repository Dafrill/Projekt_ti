const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const text = await res.text()
  if (!res.ok) throw new Error(text || 'Błąd zapytania')
  try { return JSON.parse(text) } catch { return text }
}

export async function login(email, password) {
  const token = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem('token', token)
  const payload = JSON.parse(atob(token.split('.')[1]))
  return { token, email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'], role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], userId: payload['UserId'] }
}

export async function register(email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getAds(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.location) query.set('location', params.location)
  const qs = query.toString()
  return request(`/advertisements${qs ? '?' + qs : ''}`)
}

export async function getAd(id) {
  return request(`/advertisements/${id}`)
}

export async function createAd(data) {
  return request('/advertisements', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAd(id, data) {
  return request(`/advertisements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteAd(id) {
  return request(`/advertisements/${id}`, { method: 'DELETE' })
}

export async function getUnapprovedAds() {
  return request('/advertisements/unapproved')
}

export async function approveAd(id) {
  return request(`/advertisements/${id}/approve`, { method: 'PUT' })
}

export async function getFavorites() {
  return request('/favorites')
}

export async function addFavorite(advertisementId) {
  return request(`/favorites/${advertisementId}`, { method: 'POST' })
}

export async function removeFavorite(advertisementId) {
  return request(`/favorites/${advertisementId}`, { method: 'DELETE' })
}

export async function getMessages() {
  return request('/messages')
}

export async function sendMessage(data) {
  return request('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function uploadImage(file) {
  const form = new FormData()
  form.append('file', file)
  const token = getToken()
  const res = await fetch(`${BASE}/images/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(text)
  return JSON.parse(text)
}

export function logout() {
  localStorage.removeItem('token')
}
