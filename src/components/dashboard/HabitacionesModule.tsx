'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiEye, FiX, FiUpload, FiHome, FiSearch, FiTrash2 } from 'react-icons/fi';
import { MdCleaningServices, MdToggleOff, MdToggleOn } from 'react-icons/md';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { getAuthCookies } from '@/utils/auth';
import Swal from 'sweetalert2';

interface Servicio {
  id: number;
  nombre: string;
}

interface Habitacion {
  id: number;
  codigo: string;
  nombre: string;
  tipoReserva: string;
  precioHora?: number;
  precioNoche?: number;
  precioMes?: number;
  horasMinimas?: number;
  cantidadPersonas: number;
  imagen1?: string;
  imagen2?: string;
  imagen3?: string;
  estado: string;
  activa: boolean;
  limpieza: boolean;
  descripcion?: string;
  createdAt: string;
  servicios: Array<{
    servicio: Servicio;
  }>;
}

export default function HabitacionesModule() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [filteredHabitaciones, setFilteredHabitaciones] = useState<Habitacion[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    precioHora: '',
    precioNoche: '',
    precioMes: '',
    horasMinimas: '3',
    cantidadPersonas: '1',
    imagen1: '',
    imagen2: '',
    imagen3: '',
    descripcion: '',
    servicios: [] as number[]
  });
  const [servicioSearch, setServicioSearch] = useState('');
  const [selectedServicios, setSelectedServicios] = useState<Servicio[]>([]);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHabitaciones();
    fetchServicios();
  }, []);

  useEffect(() => {
    if (Array.isArray(habitaciones)) {
      const filtered = habitaciones.filter(habitacion =>
        habitacion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        habitacion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHabitaciones(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, habitaciones]);

  const fetchHabitaciones = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/habitaciones', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHabitaciones(Array.isArray(data) ? data : []);
      } else {
        setHabitaciones([]);
      }
    } catch (error) {
      console.error('Error fetching habitaciones:', error);
      setHabitaciones([]);
    } finally {
      setLoading(false);
    }
  };

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
        setServicios(Array.isArray(data) ? data.filter((s: any) => s.activo) : []);
      }
    } catch (error) {
      console.error('Error fetching servicios:', error);
      setServicios([]);
    }
  };

  const openModal = (type: 'create' | 'edit' | 'view', habitacion?: Habitacion) => {
    setModalType(type);
    setSelectedHabitacion(habitacion || null);
    if (type === 'create') {
      setFormData({
        codigo: '',
        nombre: '',
        precioHora: '',
        precioNoche: '',
        precioMes: '',
        horasMinimas: '3',
        cantidadPersonas: '1',
        imagen1: '',
        imagen2: '',
        imagen3: '',
        descripcion: '',
        servicios: []
      });
      setSelectedServicios([]);
    } else if (habitacion) {
      setFormData({
        codigo: habitacion.codigo,
        nombre: habitacion.nombre,
        precioHora: habitacion.precioHora?.toString() || '',
        precioNoche: habitacion.precioNoche?.toString() || '',
        precioMes: habitacion.precioMes?.toString() || '',
        horasMinimas: habitacion.horasMinimas?.toString() || '3',
        cantidadPersonas: habitacion.cantidadPersonas?.toString() || '1',
        imagen1: habitacion.imagen1 || '',
        imagen2: habitacion.imagen2 || '',
        imagen3: habitacion.imagen3 || '',
        descripcion: habitacion.descripcion || '',
        servicios: habitacion.servicios.map(s => s.servicio.id)
      });
      setSelectedServicios(habitacion.servicios.map(s => s.servicio));
    }
    setServicioSearch('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHabitacion(null);
    setServicioSearch('');
    setSelectedServicios([]);
  };

  const openImageViewer = (imageSrc: string) => {
    setCurrentImage(imageSrc);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentImage('');
  };

  const addServicio = (servicio: Servicio) => {
    if (!selectedServicios.find(s => s.id === servicio.id)) {
      const newSelected = [...selectedServicios, servicio];
      setSelectedServicios(newSelected);
      setFormData(prev => ({ ...prev, servicios: newSelected.map(s => s.id) }));
    }
    setServicioSearch('');
  };

  const removeServicio = (servicioId: number) => {
    const newSelected = selectedServicios.filter(s => s.id !== servicioId);
    setSelectedServicios(newSelected);
    setFormData(prev => ({ ...prev, servicios: newSelected.map(s => s.id) }));
  };

  const filteredServicios = servicios.filter(servicio => 
    servicio.nombre.toLowerCase().includes(servicioSearch.toLowerCase()) &&
    !selectedServicios.find(s => s.id === servicio.id)
  );

  const handleImageUpload = (field: 'imagen1' | 'imagen2' | 'imagen3', file: File) => {
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
    
    if (!formData.precioHora && !formData.precioNoche && !formData.precioMes) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe especificar al menos un precio (hora, noche o mes)'
      });
      return;
    }
    
    const url = modalType === 'create' ? '/api/habitaciones' : `/api/habitaciones/${selectedHabitacion?.id}`;
    const method = modalType === 'create' ? 'POST' : 'PUT';
    
    const submitData = {
      ...formData,
      precioHora: formData.precioHora ? parseFloat(formData.precioHora) : null,
      precioNoche: formData.precioNoche ? parseFloat(formData.precioNoche) : null,
      precioMes: formData.precioMes ? parseFloat(formData.precioMes) : null,
      horasMinimas: formData.precioHora ? parseInt(formData.horasMinimas) : null,
      cantidadPersonas: parseInt(formData.cantidadPersonas)
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
        await fetchHabitaciones();
        closeModal();
        Swal.fire({
          icon: 'success',
          title: modalType === 'create' ? 'Habitación creada' : 'Habitación actualizada',
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

  const toggleHabitacionStatus = async (id: number, field: 'activa' | 'limpieza', currentValue: boolean) => {
    const messages = {
      activa: {
        title: currentValue ? 'Desactivar habitación' : 'Activar habitación',
        text: `¿Estás seguro de que quieres ${currentValue ? 'desactivar' : 'activar'} esta habitación?`,
        success: currentValue ? 'Habitación desactivada' : 'Habitación activada'
      },
      limpieza: {
        title: currentValue ? 'Marcar como limpia' : 'Marcar para limpieza',
        text: `¿Estás seguro de que quieres ${currentValue ? 'marcar como limpia' : 'marcar para limpieza'} esta habitación?`,
        success: currentValue ? 'Habitación marcada como limpia' : 'Habitación marcada para limpieza'
      }
    };

    const result = await Swal.fire({
      title: messages[field].title,
      text: messages[field].text,
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
        const response = await fetch(`/api/habitaciones/${id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ [field]: !currentValue })
        });

        if (response.ok) {
          await fetchHabitaciones();
          Swal.fire({
            icon: 'success',
            title: messages[field].success,
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado'
        });
      }
    }
  };

  const totalPages = Math.ceil(filteredHabitaciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHabitaciones = filteredHabitaciones.slice(startIndex, startIndex + itemsPerPage);

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
          Gestión de Habitaciones
        </h2>
        <button 
          onClick={() => openModal('create')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus size={20} />
          Nueva Habitación
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por código o nombre..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Habitación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precios (Bs)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentHabitaciones.map((habitacion) => (
                <tr key={habitacion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {habitacion.codigo} - {habitacion.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        {habitacion.horasMinimas && `Min: ${habitacion.horasMinimas}h`}
                        {habitacion.cantidadPersonas && ` • ${habitacion.cantidadPersonas} personas`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {habitacion.imagen1 ? (
                      <img 
                        src={habitacion.imagen1} 
                        alt={habitacion.codigo}
                        className="h-12 w-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageViewer(habitacion.imagen1!)}
                      />
                    ) : (
                      <div className="h-12 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">Sin imagen</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {habitacion.precioHora && <div>Hora: {habitacion.precioHora} Bs</div>}
                      {habitacion.precioNoche && <div>Noche: {habitacion.precioNoche} Bs</div>}
                      {habitacion.precioMes && <div>Mes: {habitacion.precioMes} Bs</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {habitacion.servicios.length} servicios
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        habitacion.activa 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {habitacion.activa ? 'Activa' : 'Inactiva'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        habitacion.limpieza 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {habitacion.limpieza ? 'Limpieza' : 'Limpia'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal('view', habitacion)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('edit', habitacion)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleHabitacionStatus(habitacion.id, 'activa', habitacion.activa)}
                        className={`p-1 ${habitacion.activa ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={habitacion.activa ? 'Desactivar habitación' : 'Activar habitación'}
                      >
                        {habitacion.activa ? <MdToggleOff size={18} /> : <MdToggleOn size={18} />}
                      </button>
                      <button 
                        onClick={() => toggleHabitacionStatus(habitacion.id, 'limpieza', habitacion.limpieza)}
                        className={`p-1 ${habitacion.limpieza ? 'text-blue-600 hover:text-blue-900' : 'text-orange-600 hover:text-orange-900'}`}
                        title={habitacion.limpieza ? 'Marcar como limpia' : 'Marcar para limpieza'}
                      >
                        <MdCleaningServices size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHabitaciones.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron habitaciones</p>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-semibold">
                {modalType === 'create' && 'Nueva Habitación'}
                {modalType === 'edit' && 'Editar Habitación'}
                {modalType === 'view' && 'Ver Habitación'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            {modalType === 'view' ? (
              <div className="space-y-4">
                <div><strong>Código:</strong> {selectedHabitacion?.codigo}</div>
                <div><strong>Nombre:</strong> {selectedHabitacion?.nombre}</div>
                <div><strong>Precios:</strong>
                  {selectedHabitacion?.precioHora && <div>- Hora: {selectedHabitacion.precioHora} Bs</div>}
                  {selectedHabitacion?.precioNoche && <div>- Noche: {selectedHabitacion.precioNoche} Bs</div>}
                  {selectedHabitacion?.precioMes && <div>- Mes: {selectedHabitacion.precioMes} Bs</div>}
                </div>
                <div><strong>Capacidad:</strong> {selectedHabitacion?.cantidadPersonas} persona{selectedHabitacion?.cantidadPersonas !== 1 ? 's' : ''}</div>
                <div><strong>Servicios:</strong> {selectedHabitacion?.servicios.map(s => s.servicio.nombre).join(', ')}</div>
                <div><strong>Estado:</strong> {selectedHabitacion?.activa ? 'Activa' : 'Inactiva'}</div>
                <div><strong>Limpieza:</strong> {selectedHabitacion?.limpieza ? 'Necesita limpieza' : 'Limpia'}</div>
                {selectedHabitacion?.descripcion && (
                  <div><strong>Descripción:</strong> {selectedHabitacion.descripcion}</div>
                )}
                <div>
                  <strong>Imágenes:</strong>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {[selectedHabitacion?.imagen1, selectedHabitacion?.imagen2, selectedHabitacion?.imagen3]
                      .filter(Boolean)
                      .map((imagen, index) => (
                        <img 
                          key={index}
                          src={imagen} 
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImageViewer(imagen!)}
                        />
                      ))
                    }
                  </div>
                  {![selectedHabitacion?.imagen1, selectedHabitacion?.imagen2, selectedHabitacion?.imagen3].some(Boolean) && (
                    <p className="text-gray-500 text-sm mt-2">No hay imágenes disponibles</p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                    <input
                      type="text"
                      placeholder="Ej: H001"
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      placeholder="Nombre de la habitación"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Personas *</label>
                    <select
                      value={formData.cantidadPersonas}
                      onChange={(e) => setFormData({...formData, cantidadPersonas: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      {[1,2,3,4,5,6,8,10].map(n => (
                        <option key={n} value={n}>{n} persona{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precios Disponibles (Bs) *</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!formData.precioHora}
                          onChange={(e) => setFormData({...formData, precioHora: e.target.checked ? '50' : ''})}
                        />
                        <span>Por Hora</span>
                      </label>
                      {formData.precioHora && (
                        <input
                          type="number"
                          placeholder="Precio por hora"
                          value={formData.precioHora}
                          onChange={(e) => setFormData({...formData, precioHora: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!formData.precioNoche}
                          onChange={(e) => setFormData({...formData, precioNoche: e.target.checked ? '200' : ''})}
                        />
                        <span>Por Noche</span>
                      </label>
                      {formData.precioNoche && (
                        <input
                          type="number"
                          placeholder="Precio por noche"
                          value={formData.precioNoche}
                          onChange={(e) => setFormData({...formData, precioNoche: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!formData.precioMes}
                          onChange={(e) => setFormData({...formData, precioMes: e.target.checked ? '3000' : ''})}
                        />
                        <span>Por Mes</span>
                      </label>
                      {formData.precioMes && (
                        <input
                          type="number"
                          placeholder="Precio por mes"
                          value={formData.precioMes}
                          onChange={(e) => setFormData({...formData, precioMes: e.target.value})}
                          className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {formData.precioHora && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horas Mínimas</label>
                    <select
                      value={formData.horasMinimas}
                      onChange={(e) => setFormData({...formData, horasMinimas: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    >
                      {[1,2,3,4,5,6,8,12,24].map(h => (
                        <option key={h} value={h}>{h} hora{h > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Servicios</label>
                  
                  {/* Selected Services List */}
                  {selectedServicios.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-2">Servicios seleccionados:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedServicios.map(servicio => (
                          <div key={servicio.id} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            {servicio.nombre}
                            <button
                              type="button"
                              onClick={() => removeServicio(servicio.id)}
                              className="text-orange-600 hover:text-orange-800"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Service Search */}
                  <div className="relative">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar servicios para agregar..."
                        value={servicioSearch}
                        onChange={(e) => setServicioSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    {/* Dropdown Results */}
                    {servicioSearch && filteredServicios.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {filteredServicios.map(servicio => (
                          <button
                            key={servicio.id}
                            type="button"
                            onClick={() => addServicio(servicio)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                          >
                            {servicio.nombre}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {servicioSearch && filteredServicios.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3">
                        <p className="text-sm text-gray-500">No se encontraron servicios</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['imagen1', 'imagen2', 'imagen3'].map((field, index) => (
                      <div key={field}>
                        <label className="block text-xs text-gray-600 mb-1">Imagen {index + 1}</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {formData[field as keyof typeof formData] ? (
                            <div className="space-y-2">
                              <img 
                                src={formData[field as keyof typeof formData] as string} 
                                alt={`Imagen ${index + 1}`} 
                                className="max-w-full h-20 object-contain mx-auto" 
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, [field]: '' }))}
                                className="text-red-600 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          ) : (
                            <div>
                              <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(field as any, e.target.files[0])}
                                className="hidden"
                                id={field}
                              />
                              <label
                                htmlFor={field}
                                className="cursor-pointer bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                              >
                                Subir
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    placeholder="Descripción de la habitación..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
                  >
                    {modalType === 'create' ? 'Crear Habitación' : 'Actualizar Habitación'}
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

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={closeImageViewer}>
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button 
              onClick={closeImageViewer}
              className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
            >
              <FiX size={32} />
            </button>
            <img 
              src={currentImage} 
              alt="Vista completa"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}