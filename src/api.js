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

export function getUserId() {
  const token = getToken()
  if (!token) return null
  try { return JSON.parse(atob(token.split('.')[1]))['UserId'] } catch { return null }
}

export async function login(email, password) {
  const token = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem('token', token)
  const payload = JSON.parse(atob(token.split('.')[1]))
  localStorage.setItem('userId', payload['UserId'])
  return { token, email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'], role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], userId: payload['UserId'], nickname: payload['Nickname'], avatarUrl: payload['AvatarUrl'] || null }
}

export async function register(email, password, nickname) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nickname }),
  })
}

export async function getAds(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.location) query.set('location', params.location)
  if (params.myOnly) query.set('myOnly', 'true')
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

export async function getReactions(advertisementId) {
  return request(`/reactions/${advertisementId}`)
}

export async function toggleReaction(advertisementId, emoji) {
  return request('/reactions', {
    method: 'POST',
    body: JSON.stringify({ advertisementId, emoji }),
  })
}

export async function getComments(advertisementId) {
  return request(`/comments/${advertisementId}`)
}

export async function addComment(data) {
  return request('/comments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProfile(data) {
  const token = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  localStorage.setItem('token', token)
  return token
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
}
