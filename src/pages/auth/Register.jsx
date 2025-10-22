import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthAPI } from '../../lib/api'

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'cliente' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function generateIdUsuario() {
    // Genera un entero pseudo-único dentro del rango de INT firmado de MySQL (<= 2147483647)
    const MIN = 100000
    const MAX = 2000000000 // debajo del límite de 2147483647
    return Math.floor(MIN + Math.random() * (MAX - MIN))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { idusuario: generateIdUsuario(), nombre: form.nombre, email: form.email, password: form.password, rol: form.rol }
      const { user, token } = await AuthAPI.register(payload)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      if (user.rol === 'administrador') navigate('/admin')
      else navigate('/user')
    } catch (err) {
      setError(err.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 text-center">Crear cuenta</h2>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600">Nombre</label>
            <input value={form.nombre} onChange={(e)=>setField('nombre', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Tu nombre" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Correo</label>
            <input type="email" value={form.email} onChange={(e)=>setField('email', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Contraseña</label>
            <input type="password" value={form.password} onChange={(e)=>setField('password', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Rol</label>
            <select value={form.rol} onChange={(e)=>setField('rol', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="cliente">Cliente</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white">
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <div className="text-center text-sm">
          <a href="/login" className="text-emerald-600 hover:underline">Ya tengo cuenta</a>
        </div>
      </div>
    </div>
  )
}
