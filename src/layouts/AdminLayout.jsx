import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { AuthAPI } from '../lib/api'
import Modal from '../components/Modal'
import ProfileForm from '../components/ProfileForm'

export default function AdminLayout() {
  const navigate = useNavigate()
  async function logout() {
    try { await AuthAPI.logout() } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="bg-slate-900 text-white p-4 flex md:flex-col items-center md:items-stretch gap-2">
        <div className="text-lg font-bold flex items-center gap-2"><i className="bi bi-lightning-charge" /> Admin</div>
        <nav className="flex md:flex-col gap-2 w-full">
          <NavLink to="/admin/events" className={({isActive})=>`px-3 py-2 rounded ${isActive?'bg-slate-700':'hover:bg-slate-800'}`}>
            <i className="bi bi-calendar-event" /> Eventos
          </NavLink>
          <NavLink to="/admin/artists" className={({isActive})=>`px-3 py-2 rounded ${isActive?'bg-slate-700':'hover:bg-slate-800'}`}>
            <i className="bi bi-music-note-beamed" /> Artistas
          </NavLink>
        </nav>
        <button onClick={logout} className="mt-auto md:mt-auto inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 hover:bg-red-500"> 
          <i className="bi bi-box-arrow-right" /> Cerrar sesión
        </button>
      </aside>
      <main className="bg-slate-50 min-h-screen">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0">
          <div className="font-semibold">Panel Administrador</div>
          <button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded border">
            <i className="bi bi-person-circle text-xl" /> Perfil
          </button>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
      <Modal open={open} title="Perfil" onClose={()=>setOpen(false)}>
        <ProfileForm onClose={()=>setOpen(false)} onSaved={()=>setOpen(false)} />
      </Modal>
    </div>
  )
}
