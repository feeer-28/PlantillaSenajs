import { useState } from 'react'
import { AuthAPI } from '../lib/api'

export default function ProfileForm({ onClose, onSaved }) {
  const stored = JSON.parse(localStorage.getItem('user') || 'null')
  const [form, setForm] = useState({ nombre: stored?.nombre || '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    if (!stored) return
    setError('')
    setLoading(true)
    try {
      const payload = { nombre: form.nombre }
      if (form.password) payload.password = form.password
      const updated = await AuthAPI.update(stored.idusuario, payload)
      const user = { ...stored, ...updated }
      localStorage.setItem('user', JSON.stringify(user))
      onSaved?.(user)
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm text-slate-600">Nombre</label>
        <input value={form.nombre} onChange={e=>setField('nombre', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Nueva contraseña (opcional)</label>
        <input type="password" value={form.password} onChange={e=>setField('password', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
