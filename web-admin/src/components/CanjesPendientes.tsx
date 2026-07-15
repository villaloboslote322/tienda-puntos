import { useState, useEffect } from 'react'
import api from '../api'

interface CanjesPendientesProps {
  token: string
}

interface Cliente {
  id: string
  nombre: string
  whatsapp: string
  dni: string
  puntosActuales: number
}

interface Premio {
  id: string
  nombre: string
  descripcion?: string
  puntosRequeridos: number
  activo: boolean
}

interface Canje {
  id: string
  clienteId: string
  premioId: string
  estado: 'pendiente' | 'completado' | 'cancelado'
  createdAt: string
  cliente?: { nombre: string }
  premio?: { nombre: string }
}

export default function CanjesPendientes({ token }: CanjesPendientesProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [premios, setPremios] = useState<Premio[]>([])
  const [canjes, setCanjes] = useState<Canje[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // UI state
  const [searchValue, setSearchValue] = useState('')
  const [showAllClientes, setShowAllClientes] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [canjeando, setCanjeando] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [token])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [clientesRes, premiosRes, canjesRes] = await Promise.all([
        api.get('/api/clientes', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/api/premios', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/api/admin/canjes', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const clientesList = Array.isArray(clientesRes.data) ? clientesRes.data : []
      const premiosList = Array.isArray(premiosRes.data) ? premiosRes.data : []
      const canjesList = Array.isArray(canjesRes.data?.data) ? canjesRes.data.data : []

      setClientes(clientesList)
      setPremios(premiosList)
      setCanjes(canjesList)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const getPremiosDisponibles = (puntosCliente: number): Premio[] => {
    if (!premios || premios.length === 0) return []
    return premios.filter((p) => p.activo && puntosCliente >= p.puntosRequeridos)
  }

  const getClientesElegibles = (): Cliente[] => {
    return clientes.filter((c) => getPremiosDisponibles(c.puntosActuales).length > 0)
  }

  const handleBuscar = (valor: string): Cliente[] => {
    if (!valor) return []
    const term = valor.toLowerCase()
    return getClientesElegibles().filter(
      (c) =>
        c.nombre.toLowerCase().includes(term) ||
        c.dni.includes(term) ||
        c.whatsapp.includes(term)
    )
  }

  const clientesFiltrados = showAllClientes ? clientes : handleBuscar(searchValue)

  const handleCanjear = async (premioId: string) => {
    if (!clienteSeleccionado) return

    setCanjeando(premioId)
    setError('')
    setSuccess('')

    try {
      const response = await api.post(
        '/api/admin/canjes',
        {
          clienteId: clienteSeleccionado.id,
          premioId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess('✓ Canje registrado exitosamente')
      setClienteSeleccionado(null)
      setSearchValue('')
      setShowAllClientes(false)
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar canje')
    } finally {
      setCanjeando(null)
    }
  }

  const handleCompletarCanje = async (canjeId: string) => {
    setCanjeando(canjeId)
    try {
      await api.post(
        `/api/admin/canjes/${canjeId}/completar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('✓ Canje completado')
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al completar canje')
    } finally {
      setCanjeando(null)
    }
  }

  const handleCancelarCanje = async (canjeId: string) => {
    setCanjeando(canjeId)
    try {
      await api.delete(`/api/admin/canjes/${canjeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('✓ Canje cancelado')
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cancelar canje')
    } finally {
      setCanjeando(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  const canjesPendientes = canjes.filter((c) => c.estado === 'pendiente')
  const canjesOtros = canjes.filter((c) => c.estado !== 'pendiente')

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Panel de Creación de Canjes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Nuevo Canje</h2>

        {/* Búsqueda de Cliente */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Paso 1: Selecciona Cliente</h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o WhatsApp..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                setShowAllClientes(false)
              }}
              disabled={showAllClientes}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                setShowAllClientes(!showAllClientes)
                setSearchValue('')
              }}
              className={`px-6 py-2 rounded-lg font-medium ${
                showAllClientes
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ver Todos
            </button>
          </div>

          {clientesFiltrados.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg">
              {clientesFiltrados.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => {
                    setClienteSeleccionado(cliente)
                    setShowAllClientes(false)
                    setSearchValue('')
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0"
                >
                  <div className="font-semibold">{cliente.nombre}</div>
                  <div className="text-sm text-gray-600">{cliente.dni} • {cliente.whatsapp}</div>
                </button>
              ))}
            </div>
          )}

          {clienteSeleccionado && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{clienteSeleccionado.nombre}</p>
                  <p className="text-xs text-gray-600 mt-1">DNI: {clienteSeleccionado.dni}</p>
                  <p className="text-xs text-gray-600">WhatsApp: {clienteSeleccionado.whatsapp}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{clienteSeleccionado.puntosActuales}</div>
                  <div className="text-xs text-gray-600">puntos acumulados</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Opciones de Premios */}
        {clienteSeleccionado && (
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Paso 2: Selecciona Premio para Canjear
            </h3>

            {getPremiosDisponibles(clienteSeleccionado.puntosActuales).length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Este cliente no tiene derechos a premios
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getPremiosDisponibles(clienteSeleccionado.puntosActuales).map((premio) => (
                  <div
                    key={premio.id}
                    className="p-4 border border-yellow-200 rounded-lg bg-yellow-50"
                  >
                    <div className="font-semibold text-gray-900">{premio.nombre}</div>
                    <div className="text-xs text-gray-600 mt-1">{premio.descripcion || '—'}</div>
                    <div className="mt-2 text-xs">
                      <span className="font-semibold text-yellow-700">
                        Requiere: {premio.puntosRequeridos} pts
                      </span>
                      <span className="text-gray-600 ml-2">
                        (Cliente tiene: {clienteSeleccionado.puntosActuales})
                      </span>
                    </div>
                    <button
                      onClick={() => handleCanjear(premio.id)}
                      disabled={canjeando === premio.id}
                      className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium text-sm disabled:bg-gray-400"
                    >
                      {canjeando === premio.id ? 'Canjeando...' : 'Canjear'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Canjes Pendientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            Canjes Pendientes ({canjesPendientes.length})
          </h2>
        </div>

        {canjesPendientes.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No hay canjes pendientes
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Premio
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {canjesPendientes.map((canje) => (
                  <tr key={canje.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {canje.cliente?.nombre || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {canje.premio?.nombre || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(canje.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleCompletarCanje(canje.id)}
                        disabled={canjeando === canje.id}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:bg-gray-400"
                      >
                        {canjeando === canje.id ? 'Procesando...' : 'Completar'}
                      </button>
                      <button
                        onClick={() => handleCancelarCanje(canje.id)}
                        disabled={canjeando === canje.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico de Canjes */}
      {canjesOtros.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">
              Histórico de Canjes ({canjesOtros.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Premio
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {canjesOtros.map((canje) => (
                  <tr key={canje.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {canje.cliente?.nombre || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {canje.premio?.nombre || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(canje.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          canje.estado === 'completado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {canje.estado === 'completado' ? 'Completado' : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
