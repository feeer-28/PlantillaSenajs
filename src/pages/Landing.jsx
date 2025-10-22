import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-3xl sm:text-5xl font-bold">Plataforma de Gestión de Eventos</h1>
        <p className="text-slate-300">Compra boletas, descubre artistas y gestiona eventos de forma sencilla.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-blue-600 hover:bg-blue-500 transition text-white">
            <i className="bi bi-box-arrow-in-right text-xl" /> Iniciar sesión
          </Link>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-emerald-600 hover:bg-emerald-500 transition text-white">
            <i className="bi bi-person-plus text-xl" /> Registrarse
          </Link>
        </div>
      </div>
    </div>
  )
}
