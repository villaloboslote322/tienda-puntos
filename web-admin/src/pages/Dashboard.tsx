import { useState, useEffect } from 'react'
import api from '../api'

interface DashboardProps {
  token: string
}

interface Cliente {
  id: string
  nombre: string
  email?: string
  whatsapp: string
  dni: string
  puntosActuales: number
  fechaRegistro: string
  estado: string
  cumpleaños?: string
}

interface Premio {
  id: string
  nombre: string
  descripcion?: string
  puntosRequeridos: number
  vigencia?: string
  activo: boolean
}

interface Stats {
  totalClientes: number
}

export default function Dashboard({ token }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({ totalClientes: 0 })
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [premios, setPremios] = useState<Premio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', whatsapp: '', dni: '', email: '', cumpleaños: '' })
  const [creating, setCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [token])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [clientesRes, premiosRes] = await Promise.all([
        api.get('/api/clientes', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/api/premios', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const clientesList = Array.isArray(clientesRes.data) ? clientesRes.data : []
      const premiosList = Array.isArray(premiosRes.data) ? premiosRes.data : []
      setClientes(clientesList)
      setPremios(premiosList)
      setStats({ totalClientes: clientesList.length })
    } catch (err) {
      setError('Error loading data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getPremiosDisponibles = (puntosCliente: number) => {
    return premios.filter((p) => p.activo && puntosCliente >= p.puntosRequeridos)
  }

  const tieneDerechoPremio = (puntosCliente: number) => {
    return getPremiosDisponibles(puntosCliente).length > 0
  }

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const payload = {
        nombre: formData.nombre,
        whatsapp: formData.whatsapp,
        dni: formData.dni,
        email: formData.email || undefined,
        cumpleaños: formData.cumpleaños ? new Date(formData.cumpleaños).toISOString() : undefined,
      }
      await api.post('/api/clientes', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({ nombre: '', whatsapp: '', dni: '', email: '', cumpleaños: '' })
      setShowCreateForm(false)
      await fetchData()
    } catch (err: any) {
      alert('Error creating cliente: ' + (err.response?.data?.message || err.message))
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tienda de Puntos</h1>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">Total Clientes</div>
          <div className="text-4xl font-bold text-blue-600">{stats.totalClientes}</div>
        </div>
      </div>

      {/* Create Cliente Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Crear Cliente</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {showCreateForm ? 'Cancelar' : '+ Nuevo Cliente'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateCliente} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="WhatsApp (+54...)"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="DNI"
                value={formData.dni}
                onChange={(e) => setFormData({...formData, dni: e.target.value})}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                placeholder="Cumpleaños (opcional)"
                value={formData.cumpleaños}
                onChange={(e) => setFormData({...formData, cumpleaños: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
            >
              {creating ? 'Creando...' : 'Crear Cliente'}
            </button>
          </form>
        )}
      </div>

      {/* Clientes List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Listado de Clientes</h2>
        {clientes.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No hay clientes registrados</div>
        ) : (
          <div className="space-y-2">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="border border-gray-200 rounded-lg">
                {/* Summary */}
                <button
                  onClick={() => setExpandedId(expandedId === cliente.id ? null : cliente.id)}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900">{cliente.nombre}</div>
                      {tieneDerechoPremio(cliente.puntosActuales) && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                          🎁 Derecho a Premio
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{cliente.whatsapp}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{cliente.puntosActuales} pts</div>
                    <div className="text-xs text-gray-500">{cliente.estado}</div>
                  </div>
                  <div className="ml-4 text-gray-400">
                    {expandedId === cliente.id ? '▼' : '▶'}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedId === cliente.id && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-600">DNI</div>
                      <div className="text-sm text-gray-900">{cliente.dni}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600">Email</div>
                      <div className="text-sm text-gray-900">{cliente.email || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600">WhatsApp</div>
                      <div className="text-sm text-gray-900">{cliente.whatsapp}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600">Estado</div>
                      <div className="text-sm text-gray-900">{cliente.estado}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600">Puntos Actuales</div>
                      <div className="text-lg font-bold text-blue-600">{cliente.puntosActuales}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600">Registrado</div>
                      <div className="text-sm text-gray-900">
                        {new Date(cliente.fechaRegistro).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600">Cumpleaños</div>
                      <div className="text-sm text-gray-900">
                        {cliente.cumpleaños ? new Date(cliente.cumpleaños).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Premios Disponibles */}
                  {getPremiosDisponibles(cliente.puntosActuales).length > 0 && (
                    <div className="px-4 py-4 bg-yellow-50 border-t border-yellow-200">
                      <div className="text-sm font-bold text-yellow-800 mb-3">🎁 Premios Disponibles</div>
                      <div className="space-y-2">
                        {getPremiosDisponibles(cliente.puntosActuales).map((premio) => (
                          <div
                            key={premio.id}
                            className="bg-white p-3 rounded border border-yellow-200"
                          >
                            <div className="font-semibold text-gray-900">{premio.nombre}</div>
                            <div className="text-xs text-gray-600">{premio.descripcion || '—'}</div>
                            <div className="text-xs text-yellow-700 mt-1">
                              Requiere: <strong>{premio.puntosRequeridos} puntos</strong> (Tiene:{' '}
                              <strong>{cliente.puntosActuales}</strong>)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
