'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiEye, FiUserCheck, FiUserX, FiX, FiCamera, FiUpload } from 'react-icons/fi';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { getAuthCookies } from '@/utils/auth';
import Swal from 'sweetalert2';

interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  email?: string;
  fechaNac: string;
  numeroCarnet: string;
  fotoCI1?: string;
  fotoCI2?: string;
  activo: boolean;
  createdAt: string;
}

export default function ClientesModule() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view' | 'documents'>('create');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    fechaNac: '',
    numeroCarnet: '',
    fotoCI1: '',
    fotoCI2: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (Array.isArray(clientes)) {
      const filtered = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        cliente.numeroCarnet.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, clientes]);

  const fetchClientes = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/clientes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClientes(Array.isArray(data) ? data : []);
      }
    } catch {
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'create' | 'edit' | 'view' | 'documents', cliente?: Cliente) => {
    setModalType(type);
    setSelectedCliente(cliente || null);
    if (type === 'create') {
      setFormData({
        nombre: '',
        apellidos: '',
        email: '',
        fechaNac: '',
        numeroCarnet: '',
        fotoCI1: '',
        fotoCI2: ''
      });
    } else if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        email: cliente.email || '',
        fechaNac: cliente.fechaNac.split('T')[0],
        numeroCarnet: cliente.numeroCarnet,
        fotoCI1: cliente.fotoCI1 || '',
        fotoCI2: cliente.fotoCI2 || ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCliente(null);
  };

  const handleImageUpload = (field: 'fotoCI1' | 'fotoCI2', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, [field]: compressedBase64 }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const birthDate = new Date(formData.fechaNac);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El cliente debe ser mayor de 18 años'
      });
      return;
    }
    
    const url = modalType === 'create' ? '/api/clientes' : `/api/clientes/${selectedCliente?.id}`;
    const method = modalType === 'create' ? 'POST' : 'PUT';
    
    const submitData = {
      ...formData,
      rol: 'cliente'
    };
    
    try {
      const { token } = getAuthCookies();
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        await fetchClientes();
        closeModal();
        Swal.fire({
          icon: 'success',
          title: modalType === 'create' ? 'Cliente registrado' : 'Cliente actualizado',
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

  const toggleClienteStatus = async (id: number, activo: boolean) => {
    const result = await Swal.fire({
      title: `¿${activo ? 'Desactivar' : 'Activar'} cliente?`,
      text: `¿Estás seguro de que quieres ${activo ? 'desactivar' : 'activar'} este cliente?`,
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
        const response = await fetch(`/api/clientes/${id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ activo: !activo })
        });

        if (response.ok) {
          await fetchClientes();
          Swal.fire({
            icon: 'success',
            title: activo ? 'Cliente desactivado' : 'Cliente activado',
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado del cliente'
        });
      }
    }
  };

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClientes = filteredClientes.slice(startIndex, startIndex + itemsPerPage);

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
          Gestión de Clientes
        </h2>
        <button 
          onClick={() => openModal('create')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus size={20} />
          Nuevo Cliente
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
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carnet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
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
              {currentClientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {cliente.nombre} {cliente.apellidos}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.email || 'No registrado'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.numeroCarnet}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cliente.fotoCI1 && cliente.fotoCI2
                        ? 'bg-green-100 text-green-800'
                        : cliente.fotoCI1 || cliente.fotoCI2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.fotoCI1 && cliente.fotoCI2 ? 'Completo' : 
                       cliente.fotoCI1 || cliente.fotoCI2 ? 'Parcial' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cliente.activo 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cliente.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal('view', cliente)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('edit', cliente)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('documents', cliente)}
                        className="text-purple-600 hover:text-purple-900 p-1"
                      >
                        <FiCamera size={16} />
                      </button>
                      <button 
                        onClick={() => toggleClienteStatus(cliente.id, cliente.activo)}
                        className={`p-1 ${
                          cliente.activo 
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {cliente.activo ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClientes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron clientes</p>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-semibold">
                {modalType === 'create' && 'Nuevo Cliente'}
                {modalType === 'edit' && 'Editar Cliente'}
                {modalType === 'view' && 'Ver Cliente'}
                {modalType === 'documents' && 'Documentos del Cliente'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            {modalType === 'view' ? (
              <div className="space-y-4">
                <div><strong>Nombre:</strong> {selectedCliente?.nombre} {selectedCliente?.apellidos}</div>
                <div><strong>Email:</strong> {selectedCliente?.email || 'No registrado'}</div>
                <div><strong>Carnet:</strong> {selectedCliente?.numeroCarnet}</div>
                <div><strong>Fecha Nacimiento:</strong> {selectedCliente && new Date(selectedCliente.fechaNac).toLocaleDateString()}</div>
                <div><strong>Estado:</strong> {selectedCliente?.activo ? 'Activo' : 'Inactivo'}</div>
                <div><strong>Fecha Registro:</strong> {selectedCliente && new Date(selectedCliente.createdAt).toLocaleDateString()}</div>
              </div>
            ) : modalType === 'documents' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carnet - Anverso (Frente)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {formData.fotoCI1 ? (
                        <div className="space-y-2">
                          <img src={formData.fotoCI1} alt="CI Anverso" className="max-w-full h-32 object-contain mx-auto" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, fotoCI1: '' }))}
                            className="text-red-600 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleImageUpload('fotoCI1', e.target.files[0])}
                              className="hidden"
                              id="fotoCI1"
                            />
                            <label
                              htmlFor="fotoCI1"
                              className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600"
                            >
                              Subir Imagen
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carnet - Reverso (Atrás)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {formData.fotoCI2 ? (
                        <div className="space-y-2">
                          <img src={formData.fotoCI2} alt="CI Reverso" className="max-w-full h-32 object-contain mx-auto" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, fotoCI2: '' }))}
                            className="text-red-600 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleImageUpload('fotoCI2', e.target.files[0])}
                              className="hidden"
                              id="fotoCI2"
                            />
                            <label
                              htmlFor="fotoCI2"
                              className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600"
                            >
                              Subir Imagen
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
                  >
                    Guardar Documentos
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opcional)</label>
                  <input
                    type="email"
                    placeholder="Email (opcional)"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      value={formData.fechaNac}
                      onChange={(e) => setFormData({...formData, fechaNac: e.target.value})}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">Debe ser mayor de 18 años</p>
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
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
                  >
                    {modalType === 'create' ? 'Registrar Cliente' : 'Actualizar Cliente'}
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