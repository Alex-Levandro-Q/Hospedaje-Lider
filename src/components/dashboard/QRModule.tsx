'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiEye, FiX, FiUpload } from 'react-icons/fi';
import { MdToggleOff, MdToggleOn } from 'react-icons/md';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import Swal from 'sweetalert2';

interface QR {
  id: number;
  nombre: string;
  imagen: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  createdAt: string;
}

export default function QRModule() {
  const [qrs, setQRs] = useState<QR[]>([]);
  const [filteredQRs, setFilteredQRs] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedQR, setSelectedQR] = useState<QR | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    imagen: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQRs();
  }, []);

  useEffect(() => {
    if (Array.isArray(qrs)) {
      const filtered = qrs.filter(qr =>
        qr.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQRs(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, qrs]);

  const fetchQRs = async () => {
    try {
      const response = await fetch('/api/qrs');
      if (response.ok) {
        const data = await response.json();
        setQRs(Array.isArray(data) ? data : []);
      }
    } catch {
      setQRs([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'create' | 'edit' | 'view', qr?: QR) => {
    setModalType(type);
    setSelectedQR(qr || null);
    if (type === 'create') {
      setFormData({
        nombre: '',
        imagen: '',
        fechaInicio: '',
        fechaFin: ''
      });
    } else if (qr) {
      setFormData({
        nombre: qr.nombre,
        imagen: qr.imagen,
        fechaInicio: qr.fechaInicio.split('T')[0],
        fechaFin: qr.fechaFin.split('T')[0]
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQR(null);
  };

  const handleImageUpload = (file: File) => {
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
        setFormData(prev => ({ ...prev, imagen: compressedBase64 }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.imagen || !formData.fechaInicio || !formData.fechaFin) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son requeridos'
      });
      return;
    }
    
    const url = modalType === 'create' ? '/api/qrs' : `/api/qrs/${selectedQR?.id}`;
    const method = modalType === 'create' ? 'POST' : 'PUT';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchQRs();
        closeModal();
        Swal.fire({
          icon: 'success',
          title: modalType === 'create' ? 'QR creado' : 'QR actualizado',
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

  const toggleQRStatus = async (id: number, currentValue: boolean) => {
    const result = await Swal.fire({
      title: currentValue ? 'Desactivar QR' : 'Activar QR',
      text: `¿Estás seguro de que quieres ${currentValue ? 'desactivar' : 'activar'} este QR?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/qrs/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activo: !currentValue })
        });

        if (response.ok) {
          await fetchQRs();
          Swal.fire({
            icon: 'success',
            title: `QR ${currentValue ? 'desactivado' : 'activado'}`,
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

  const openImageViewer = (imageSrc: string) => {
    setCurrentImage(imageSrc);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentImage('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const totalPages = Math.ceil(filteredQRs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentQRs = filteredQRs.slice(startIndex, startIndex + itemsPerPage);

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
          Gestión de QRs
        </h2>
        <button 
          onClick={() => openModal('create')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus size={20} />
          Nuevo QR
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vigencia
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
              {currentQRs.map((qr) => (
                <tr key={qr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {qr.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        Creado: {formatDate(qr.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {qr.imagen ? (
                      <img 
                        src={qr.imagen} 
                        alt={qr.nombre}
                        className="h-12 w-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageViewer(qr.imagen)}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">Sin imagen</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Desde: {formatDate(qr.fechaInicio)}</div>
                      <div>Hasta: {formatDate(qr.fechaFin)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      qr.activo 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {qr.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal('view', qr)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('edit', qr)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleQRStatus(qr.id, qr.activo)}
                        className={`p-1 ${qr.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={qr.activo ? 'Desactivar QR' : 'Activar QR'}
                      >
                        {qr.activo ? <MdToggleOff size={18} /> : <MdToggleOn size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQRs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron QRs</p>
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
                {modalType === 'create' && 'Nuevo QR'}
                {modalType === 'edit' && 'Editar QR'}
                {modalType === 'view' && 'Ver QR'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            {modalType === 'view' ? (
              <div className="space-y-4">
                <div><strong>Nombre:</strong> {selectedQR?.nombre}</div>
                <div><strong>Fecha Inicio:</strong> {selectedQR && formatDate(selectedQR.fechaInicio)}</div>
                <div><strong>Fecha Fin:</strong> {selectedQR && formatDate(selectedQR.fechaFin)}</div>
                <div><strong>Estado:</strong> {selectedQR?.activo ? 'Activo' : 'Inactivo'}</div>
                {selectedQR?.imagen && (
                  <div>
                    <strong>Imagen:</strong>
                    <div className="mt-2">
                      <img 
                        src={selectedQR.imagen} 
                        alt={selectedQR.nombre}
                        className="max-w-full h-64 object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageViewer(selectedQR.imagen)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Nombre del QR"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {formData.imagen ? (
                      <div className="space-y-2">
                        <img 
                          src={formData.imagen} 
                          alt="QR" 
                          className="max-w-full h-32 object-contain mx-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImageViewer(formData.imagen)}
                        />
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imagen: '' }))}
                            className="text-red-600 text-sm hover:text-red-800"
                          >
                            Eliminar imagen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">Subir imagen del QR</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                          className="hidden"
                          id="imagen"
                        />
                        <label
                          htmlFor="imagen"
                          className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 inline-block"
                        >
                          Seleccionar Archivo
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
                  >
                    {modalType === 'create' ? 'Crear QR' : 'Actualizar QR'}
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