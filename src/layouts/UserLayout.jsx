import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { AuthAPI } from '../lib/api'
import Modal from '../components/Modal'
import ProfileForm from '../components/ProfileForm'

export default function UserLayout() {
  const navigate = useNavigate()
  async function logout() {
    try { await AuthAPI.logout() } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 justify-between sticky top-0">
        <div className="font-bold">Gestión Eventos</div>
        <nav className="hidden sm:flex items-center gap-2">
          <NavLink to="/user/events" className={({isActive})=>`px-3 py-2 rounded ${isActive?'bg-slate-100':'hover:bg-slate-100'}`}>Eventos</NavLink>
          <NavLink to="/user/history" className={({isActive})=>`px-3 py-2 rounded ${isActive?'bg-slate-100':'hover:bg-slate-100'}`}>Historial</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded border"><i className="bi bi-person-circle" /> Perfil</button>
          <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white"><i className="bi bi-box-arrow-right" /> Salir</button>
        </div>
      </header>
      <div className="p-4">
        <Outlet />
      </div>
      <Modal open={open} title="Perfil" onClose={()=>setOpen(false)}>
        <ProfileForm onClose={()=>setOpen(false)} onSaved={()=>setOpen(false)} />
      </Modal>
    </div>
  )
}
