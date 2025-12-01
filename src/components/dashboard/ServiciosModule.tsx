'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiEye, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { getAuthCookies } from '@/utils/auth';
import Swal from 'sweetalert2';

interface Servicio {
  id: number;
  nombre: string;
  activo: boolean;
  createdAt: string;
  _count?: {
    habitaciones: number;
  };
}

export default function ServiciosModule() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [filteredServicios, setFilteredServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchServicios();
  }, []);

  useEffect(() => {
    if (Array.isArray(servicios)) {
      const filtered = servicios.filter(servicio =>
        servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServicios(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, servicios]);

  const fetchServicios = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/servicios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setServicios(Array.isArray(data) ? data : []);
      }
    } catch {
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'create' | 'edit' | 'view', servicio?: Servicio) => {
    setModalType(type);
    setSelectedServicio(servicio || null);
    if (type === 'create') {
      setFormData({ nombre: '' });
    } else if (servicio) {
      setFormData({ nombre: servicio.nombre });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedServicio(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre del servicio es requerido'
      });
      return;
    }
    
    const url = modalType === 'create' ? '/api/servicios' : `/api/servicios/${selectedServicio?.id}`;
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
        await fetchServicios();
        closeModal();
        Swal.fire({
          icon: 'success',
          title: modalType === 'create' ? 'Servicio creado' : 'Servicio actualizado',
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

  const toggleServicioStatus = async (id: number, activo: boolean) => {
    const result = await Swal.fire({
      title: `¿${activo ? 'Desactivar' : 'Activar'} servicio?`,
      text: `¿Estás seguro de que quieres ${activo ? 'desactivar' : 'activar'} este servicio?`,
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
        const response = await fetch(`/api/servicios/${id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ activo: !activo })
        });

        if (response.ok) {
          await fetchServicios();
          Swal.fire({
            icon: 'success',
            title: activo ? 'Servicio desactivado' : 'Servicio activado',
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado del servicio'
        });
      }
    }
  };

  const totalPages = Math.ceil(filteredServicios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServicios = filteredServicios.slice(startIndex, startIndex + itemsPerPage);

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
          Gestión de Servicios
        </h2>
        <button 
          onClick={() => openModal('create')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus size={20} />
          Nuevo Servicio
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar servicios..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Habitaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentServicios.map((servicio) => (
                <tr key={servicio.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {servicio.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {servicio._count?.habitaciones || 0} habitaciones
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      servicio.activo 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {servicio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(servicio.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal('view', servicio)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('edit', servicio)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleServicioStatus(servicio.id, servicio.activo)}
                        className={`p-1 ${
                          servicio.activo 
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {servicio.activo ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredServicios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron servicios</p>
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
                {modalType === 'create' && 'Nuevo Servicio'}
                {modalType === 'edit' && 'Editar Servicio'}
                {modalType === 'view' && 'Ver Servicio'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            {modalType === 'view' ? (
              <div className="space-y-4">
                <div><strong>Nombre:</strong> {selectedServicio?.nombre}</div>
                <div><strong>Estado:</strong> {selectedServicio?.activo ? 'Activo' : 'Inactivo'}</div>
                <div><strong>Habitaciones:</strong> {selectedServicio?._count?.habitaciones || 0}</div>
                <div><strong>Fecha Creación:</strong> {selectedServicio && new Date(selectedServicio.createdAt).toLocaleDateString()}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio *</label>
                  <input
                    type="text"
                    placeholder="Ej: WiFi, Aire Acondicionado, TV Cable..."
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
                  >
                    {modalType === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'}
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