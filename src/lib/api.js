const BASE_URL = 'http://localhost:3333'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Basic ${token}` } : {}
}

export async function apiFetch(path, { method = 'GET', headers = {}, body, auth = false } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers }
  if (auth) Object.assign(h, authHeader())
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let data
    try { data = await res.json() } catch { data = { message: res.statusText } }
    const error = new Error(data.message || 'Error de servidor')
    error.status = res.status
    error.data = data
    throw error
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export function encodeBasic(email, password) {
  return btoa(`${email}:${password}`)
}

export const AuthAPI = {
  async login(email, password) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
    const token = data.token || encodeBasic(email, password)
    return { user: data.user, token }
  },
  async register(payload) {
    async function genId() {
      const MIN = 100000
      const MAX = 2000000000
      return Math.floor(MIN + Math.random() * (MAX - MIN))
    }
    let attempts = 0
    let lastErr
    while (attempts < 3) {
      try {
        const body = { ...payload }
        if (!body.idusuario) body.idusuario = await genId()
        const data = await apiFetch('/auth/register', { method: 'POST', body })
        return { user: data.user, token: data.token }
      } catch (err) {
        lastErr = err
        const msg = (err?.data?.message || '').toLowerCase()
        const duplicate = msg.includes('duplicate') || msg.includes('exists') || msg.includes('único') || err.status === 409
        if (duplicate) {
          attempts++
          continue
        }
        throw err
      }
    }
    throw lastErr || new Error('No se pudo registrar')
  },
  async logout() {
    return apiFetch('/auth/logout', { method: 'POST', auth: true })
  },
  async update(id, body) {
    return apiFetch(`/auth/${id}`, { method: 'PUT', body, auth: true })
  },
}

export const CatalogAPI = {
  departamentos() { return apiFetch('/departamentos') },
  municipios(params = '') { return apiFetch(`/municipios${params}`) },
  generos() { return apiFetch('/generos-musicales') },
  metodosPago() { return apiFetch('/metodos-pago') },
}

export const AdminAPI = {
  eventos(query = '') { return apiFetch(`/eventos${query}`, { auth: true }) },
  crearEvento(body) { return apiFetch('/eventos', { method: 'POST', body, auth: true }) },
  actualizarEvento(id, body) { return apiFetch(`/eventos/${id}`, { method: 'PUT', body, auth: true }) },
  desactivarEvento(id) { return apiFetch(`/eventos/${id}/desactivar`, { method: 'PATCH', body: {}, auth: true }) },

  artistas() { return apiFetch('/artistas', { auth: true }) },
  crearArtista(body) { return apiFetch('/artistas', { method: 'POST', body, auth: true }) },
  actualizarArtista(id, body) { return apiFetch(`/artistas/${id}`, { method: 'PUT', body, auth: true }) },
  desactivarArtista(id) { return apiFetch(`/artistas/${id}/desactivar`, { method: 'PATCH', body: {}, auth: true }) },
  asignarArtistaEvento(body) { return apiFetch('/artistas/asignar-evento', { method: 'POST', body, auth: true }) },
}

export const UserAPI = {
  eventos(params = '') { return apiFetch(`/eventos${params}`) },
  evento(id) { return apiFetch(`/eventos/${id}`) },
  asientosEvento(id) { return apiFetch(`/asientos?evento_id=${id}`) },
  layoutAsientos(id) { return apiFetch(`/eventos/${id}/asientos/layout`, { auth: true }) },
  comprasUsuario(usuario_id) { return apiFetch(`/compras?usuario_id=${usuario_id}`, { auth: true }) },
  crearCompra(body) { return apiFetch('/compras', { method: 'POST', body, auth: true }) },
  crearBoleta(body) { return apiFetch('/boletas', { method: 'POST', body, auth: true }) },
}
