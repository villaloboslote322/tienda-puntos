import { useState, useEffect } from 'react'
import api from '../api'

interface AdministracionProps {
  token: string
  usuarioActual: {
    usuarioId: string
    email: string
  }
}

interface Usuario {
  id: string
  email: string
  nombre: string
  rol: string
  activo: boolean
  createdAt: string
}

export default function Administracion({ token, usuarioActual }: AdministracionProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Cambiar perfil
  const [mostraCambioPerfil, setMostraCambioPerfil] = useState(false)
  const [perfilForm, setPerfilForm] = useState({
    nombre: '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: '',
  })
  const [perfilLoading, setPerfilLoading] = useState(false)

  // Crear admin
  const [mostraCrearAdmin, setMostraCrearAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({
    email: '',
    nombre: '',
    password: '',
    passwordConfirm: '',
  })
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    fetchUsuarios()
  }, [token])

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/api/usuarios/listar', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsuarios(response.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleCambioPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (perfilForm.passwordNueva && perfilForm.passwordNueva !== perfilForm.passwordConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setPerfilLoading(true)
    try {
      const payload: any = {}
      if (perfilForm.nombre) payload.nombre = perfilForm.nombre
      if (perfilForm.passwordNueva) {
        payload.passwordActual = perfilForm.passwordActual
        payload.passwordNueva = perfilForm.passwordNueva
      }

      await api.put('/api/usuarios/perfil', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSuccess('Perfil actualizado exitosamente')
      setPerfilForm({ nombre: '', passwordActual: '', passwordNueva: '', passwordConfirm: '' })
      setMostraCambioPerfil(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar perfil')
    } finally {
      setPerfilLoading(false)
    }
  }

  const handleCrearAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!adminForm.email || !adminForm.nombre || !adminForm.password) {
      setError('Todos los campos son requeridos')
      return
    }

    if (adminForm.password !== adminForm.passwordConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setAdminLoading(true)
    try {
      await api.post(
        '/api/usuarios/crear-admin',
        {
          email: adminForm.email,
          nombre: adminForm.nombre,
          password: adminForm.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setSuccess('Administrador creado exitosamente')
      setAdminForm({ email: '', nombre: '', password: '', passwordConfirm: '' })
      setMostraCrearAdmin(false)
      await fetchUsuarios()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear administrador')
    } finally {
      setAdminLoading(false)
    }
  }

  const handleDesactivarUsuario = async (usuarioId: string) => {
    if (!confirm('¿Desactivar este usuario?')) return

    try {
      await api.put(
        `/api/usuarios/${usuarioId}/desactivar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSuccess('Usuario desactivado')
      await fetchUsuarios()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desactivar usuario')
    }
  }

  const handleActivarUsuario = async (usuarioId: string) => {
    try {
      await api.put(
        `/api/usuarios/${usuarioId}/activar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSuccess('Usuario activado')
      await fetchUsuarios()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al activar usuario')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando administración...</div>
  }

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

      {/* Mi Perfil */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Mi Perfil</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Email: {usuarioActual.email}</p>
          <button
            onClick={() => setMostraCambioPerfil(!mostraCambioPerfil)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            {mostraCambioPerfil ? 'Cancelar' : 'Cambiar Contraseña/Nombre'}
          </button>

          {mostraCambioPerfil && (
            <form onSubmit={handleCambioPerfil} className="mt-6 space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={perfilForm.nombre}
                  onChange={(e) => setPerfilForm({ ...perfilForm, nombre: e.target.value })}
                  placeholder="Nuevo nombre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={perfilForm.passwordActual}
                  onChange={(e) => setPerfilForm({ ...perfilForm, passwordActual: e.target.value })}
                  placeholder="Tu contraseña actual"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña (opcional)
                </label>
                <input
                  type="password"
                  value={perfilForm.passwordNueva}
                  onChange={(e) => setPerfilForm({ ...perfilForm, passwordNueva: e.target.value })}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={perfilForm.passwordConfirm}
                  onChange={(e) => setPerfilForm({ ...perfilForm, passwordConfirm: e.target.value })}
                  placeholder="Confirmar nueva contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={perfilLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg disabled:bg-gray-400"
              >
                {perfilLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Crear Nuevo Admin */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Crear Nuevo Administrador</h2>
        </div>
        <div className="p-6">
          {!mostraCrearAdmin ? (
            <button
              onClick={() => setMostraCrearAdmin(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              + Crear Admin
            </button>
          ) : (
            <form onSubmit={handleCrearAdmin} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del nuevo admin
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={adminForm.nombre}
                  onChange={(e) => setAdminForm({ ...adminForm, nombre: e.target.value })}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Mín. 6 caracteres"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={adminForm.passwordConfirm}
                  onChange={(e) => setAdminForm({ ...adminForm, passwordConfirm: e.target.value })}
                  placeholder="Confirmar contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg disabled:bg-gray-400"
                >
                  {adminLoading ? 'Creando...' : 'Crear Administrador'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostraCrearAdmin(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Listado de Usuarios */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Usuarios del Sistema</h2>
        </div>

        {usuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Sin usuarios registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Miembro desde
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {usuario.nombre}
                      {usuario.id === usuarioActual.usuarioId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          TÚ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usuario.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          usuario.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(usuario.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {usuario.id !== usuarioActual.usuarioId && (
                        <>
                          {usuario.activo ? (
                            <button
                              onClick={() => handleDesactivarUsuario(usuario.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivarUsuario(usuario.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Activar
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
