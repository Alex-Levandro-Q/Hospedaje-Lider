'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiEye, FiUserCheck, FiUserX, FiX, FiEyeOff } from 'react-icons/fi';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { getAuthCookies } from '@/utils/auth';
import Swal from 'sweetalert2';

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  fechaNac: string;
  numeroCarnet: string;
  rol: 'administrador' | 'gerente' | 'cliente';
  activo: boolean;
  createdAt: string;
}

export default function UsuariosModule() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    fechaNac: '',
    numeroCarnet: '',
    rol: 'gerente' as 'administrador' | 'gerente' | 'cliente',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (Array.isArray(usuarios)) {
      const filtered = usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.numeroCarnet.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsuarios(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, usuarios]);

  const fetchUsuarios = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsuarios(Array.isArray(data) ? data : []);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'create' | 'edit' | 'view', usuario?: Usuario) => {
    setModalType(type);
    setSelectedUsuario(usuario || null);
    if (type === 'create') {
      setFormData({
        nombre: '',
        apellidos: '',
        email: '',
        fechaNac: '',
        numeroCarnet: '',
        rol: 'gerente',
        password: '',
        confirmPassword: ''
      });
    } else if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        fechaNac: usuario.fechaNac.split('T')[0],
        numeroCarnet: usuario.numeroCarnet,
        rol: usuario.rol,
        password: '',
        confirmPassword: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUsuario(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = modalType === 'create' ? '/api/usuarios' : `/api/usuarios/${selectedUsuario?.id}`;
    const method = modalType === 'create' ? 'POST' : 'PUT';
    
    try {
      const { token } = getAuthCookies();
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchUsuarios();
        closeModal();
        Swal.fire({
          icon: 'success',
          title: modalType === 'create' ? 'Usuario creado' : 'Usuario actualizado',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error || 'Error al procesar la solicitud'
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      });
    }
  };

  const toggleUsuarioStatus = async (id: number, activo: boolean) => {
    const result = await Swal.fire({
      title: `¿${activo ? 'Desactivar' : 'Activar'} usuario?`,
      text: `¿Estás seguro de que quieres ${activo ? 'desactivar' : 'activar'} este usuario?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { token } = getAuthCookies();
        const response = await fetch(`/api/usuarios/${id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ activo: !activo })
        });

        if (response.ok) {
          await fetchUsuarios();
          Swal.fire({
            icon: 'success',
            title: activo ? 'Usuario desactivado' : 'Usuario activado',
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado del usuario'
        });
      }
    }
  };

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-bold text-gray-900">
          Gestión de Usuarios
        </h2>
        <button 
          onClick={() => openModal('create')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, email o carnet..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carnet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombre} {usuario.apellidos}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.numeroCarnet}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      usuario.rol === 'administrador' 
                        ? 'bg-purple-100 text-purple-800'
                        : usuario.rol === 'gerente'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      usuario.activo 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(usuario.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal('view', usuario)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('edit', usuario)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleUsuarioStatus(usuario.id, usuario.activo)}
                        className={`p-1 ${
                          usuario.activo 
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {usuario.activo ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-semibold">
                {modalType === 'create' && 'Nuevo Usuario'}
                {modalType === 'edit' && 'Editar Usuario'}
                {modalType === 'view' && 'Ver Usuario'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            {modalType === 'view' ? (
              <div className="space-y-4">
                <div><strong>Nombre:</strong> {selectedUsuario?.nombre} {selectedUsuario?.apellidos}</div>
                <div><strong>Email:</strong> {selectedUsuario?.email}</div>
                <div><strong>Carnet:</strong> {selectedUsuario?.numeroCarnet}</div>
                <div><strong>Rol:</strong> {selectedUsuario?.rol}</div>
                <div><strong>Estado:</strong> {selectedUsuario?.activo ? 'Activo' : 'Inactivo'}</div>
                <div><strong>Fecha Registro:</strong> {selectedUsuario && new Date(selectedUsuario.createdAt).toLocaleDateString()}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      placeholder="Apellidos"
                      value={formData.apellidos}
                      onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      value={formData.fechaNac}
                      onChange={(e) => setFormData({...formData, fechaNac: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Carnet *</label>
                    <input
                      type="text"
                      placeholder="Número de Carnet"
                      value={formData.numeroCarnet}
                      onChange={(e) => setFormData({...formData, numeroCarnet: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                    <select
                      value={formData.rol}
                      onChange={(e) => setFormData({...formData, rol: e.target.value as 'administrador' | 'gerente' | 'cliente'})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      disabled={modalType === 'edit'}
                    >
                      <option value="cliente">Cliente</option>
                      <option value="gerente">Gerente</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {modalType === 'edit' ? 'Nueva Contraseña' : 'Contraseña *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={modalType === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required={modalType === 'create'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                {modalType === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirmar contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
                  >
                    {modalType === 'create' ? 'Crear' : 'Actualizar'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}