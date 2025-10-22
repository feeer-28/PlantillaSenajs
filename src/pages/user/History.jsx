import { useEffect, useState } from 'react'
import { UserAPI } from '../../lib/api'

export default function UserHistory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setError('')
      setLoading(true)
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        if (!user) return
        const data = await UserAPI.comprasUsuario(user.idusuario)
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Error al cargar historial')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Historial de compras</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Método</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.map(e => (
              <tr key={e.idcomprar || e.id} className="border-t">
                <td className="px-4 py-2">{e.idcomprar || e.id}</td>
                <td className="px-4 py-2">${e.valor_total}</td>
                <td className="px-4 py-2">{e.metodo_pago?.nombre || e.metodo_pago_idmetodo_pago}</td>
              </tr>
            ))}
            {loading && (
              <tr><td className="px-4 py-4" colSpan={4}>Cargando...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
