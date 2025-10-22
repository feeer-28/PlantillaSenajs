import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { CatalogAPI, UserAPI } from '../../lib/api'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [layout, setLayout] = useState([])
  const [asientosDef, setAsientosDef] = useState([])
  const [metodos, setMetodos] = useState([])
  const [sel, setSel] = useState([]) // [{localidad, index}]
  const [metodo, setMetodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setError('')
      setLoading(true)
      try {
        const [ev, lay, asientos, mps] = await Promise.all([
          UserAPI.evento(id),
          UserAPI.layoutAsientos(id),
          UserAPI.asientosEvento(id),
          CatalogAPI.metodosPago(),
        ])
        setEvento(ev)
        setLayout(Array.isArray(lay) ? lay : [])
        setAsientosDef(Array.isArray(asientos) ? asientos : [])
        setMetodos(Array.isArray(mps) ? mps : [])
      } catch (err) {
        setError(err.message || 'Error al cargar evento')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const precioPorLocalidad = useMemo(() => {
    const map = {}
    layout.forEach(l => { map[l.localidad] = l.valor_asiento })
    return map
  }, [layout])

  const asientoIdPorLocalidad = useMemo(() => {
    const map = {}
    asientosDef.forEach(a => { map[a.nombre_localidad] = a.idlocalidad_evento })
    return map
  }, [asientosDef])

  const total = useMemo(() => sel.reduce((acc, s) => acc + (precioPorLocalidad[s.localidad] || 0), 0), [sel, precioPorLocalidad])

  function toggle(localidad, index) {
    const key = `${localidad}:${index}`
    setSel(prev => prev.some(x => `${x.localidad}:${x.index}` === key)
      ? prev.filter(x => `${x.localidad}:${x.index}` !== key)
      : [...prev, { localidad, index }])
  }

  async function pagar() {
    if (!metodo || sel.length===0) return
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user) return
    try {
      const compra = await UserAPI.crearCompra({
        idcomprar: undefined,
        valor_total: String(total),
        metodo_pago_idmetodo_pago: Number(metodo),
        usuario_idusuario: user.idusuario,
      })
      const compraId = compra.idcomprar || compra.id || compra?.compra?.idcomprar
      for (const s of sel) {
        const asientoId = asientoIdPorLocalidad[s.localidad]
        const valor = precioPorLocalidad[s.localidad] || 0
        await UserAPI.crearBoleta({
          idboleta: undefined,
          valor_total: valor,
          compra_idcomprar: compraId,
          asiento_idlocalidad_evento: asientoId,
        })
      }
      navigate('/user/history')
    } catch (err) {
      setError(err.message || 'No se pudo procesar el pago')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="text-2xl font-bold">{evento?.nombre_evento || 'Evento'}</div>
        <div className="text-slate-600">{evento?.descripcion}</div>
        <div className="text-slate-600">{evento?.fecha_inicio}{evento?.fecha_fin ? ` - ${evento.fecha_fin}` : ''}</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <div className="font-semibold">Selecciona asientos</div>
        {loading && <div className="text-slate-600">Cargando...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && (
          <div className="space-y-4">
            {layout.map((l, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{l.localidad}</div>
                  <div className="text-sm text-slate-600">${l.valor_asiento}</div>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-3">
                  {l.puestos?.map((p, i) => (
                    <button
                      key={i}
                      disabled={p.estado !== 'disponible'}
                      onClick={()=>toggle(l.localidad, p.index)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] disabled:opacity-40 ${sel.some(x=>x.localidad===l.localidad && x.index===p.index)?'bg-emerald-600 text-white':'bg-white'}`}
                      title={`${l.localidad} - ${p.index}`}
                    >
                      {p.index}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <select value={metodo} onChange={e=>setMetodo(e.target.value)} className="rounded-lg border px-3 py-2">
            <option value="">Método de pago</option>
            {metodos.map(m => (
              <option key={m.idmetodo_pago} value={m.idmetodo_pago}>{m.nombre}</option>
            ))}
          </select>
          <div className="text-slate-700 font-semibold">Total: ${total}</div>
          <button onClick={pagar} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-emerald-600 text-white">
            <i className="bi bi-credit-card" /> Pagar
          </button>
        </div>
      </div>
    </div>
  )
}
