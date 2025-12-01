'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiCamera, FiEye, FiX, FiUpload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { getAuthCookies, Usuario } from '@/utils/auth';

export default function MiPerfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'documents'>('info');
  const [loading, setLoading] = useState(true);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [documentData, setDocumentData] = useState({
    fotoCarnetFrente: '',
    fotoCarnetReverso: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { usuario: user, token } = getAuthCookies();
      if (!user) return;

      const response = await fetch(`/api/usuarios/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
        setDocumentData({
          fotoCarnetFrente: data.fotoCarnetFrente || '',
          fotoCarnetReverso: data.fotoCarnetReverso || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/usuarios/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Tu contraseña ha sido cambiada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error || 'Error al cambiar la contraseña'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      });
    }
  };

  const handleImageUpload = (field: 'fotoCarnetFrente' | 'fotoCarnetReverso', file: File) => {
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
        setDocumentData(prev => ({ ...prev, [field]: compressedBase64 }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentSave = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/usuarios/update-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(documentData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Documentos actualizados',
          text: 'Tus fotos de carnet han sido guardadas exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUserProfile();
      } else {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error || 'Error al guardar los documentos'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso denegado</h2>
          <p className="text-gray-600">Debes iniciar sesión para ver tu perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-500">
                  {usuario.nombre.charAt(0)}{usuario.apellidos.charAt(0)}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{usuario.nombre} {usuario.apellidos}</h1>
                <p className="text-orange-100">{usuario.email}</p>
                <p className="text-orange-100">Carnet: {usuario.numeroCarnet}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiUser className="inline mr-2" />
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiLock className="inline mr-2" />
                Cambiar Contraseña
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiCamera className="inline mr-2" />
                Documentos
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{usuario.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{usuario.apellidos}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{usuario.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Carnet</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{usuario.numeroCarnet}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md capitalize">{usuario.rol}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <p className={`mt-1 text-sm px-3 py-2 rounded-md ${
                      usuario.activo ? 'text-green-800 bg-green-50' : 'text-red-800 bg-red-50'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña Actual *
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      minLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      minLength={6}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Cambiar Contraseña
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Fotos del Carnet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frente del Carnet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frente del Carnet
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {documentData.fotoCarnetFrente ? (
                        <div className="space-y-2">
                          <img 
                            src={documentData.fotoCarnetFrente} 
                            alt="Frente del carnet" 
                            className="w-full h-40 object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageViewer(documentData.fotoCarnetFrente)}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openImageViewer(documentData.fotoCarnetFrente)}
                              className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
                            >
                              <FiEye size={14} /> Ver
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocumentData(prev => ({ ...prev, fotoCarnetFrente: '' }))}
                              className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center justify-center gap-1"
                            >
                              <FiX size={14} /> Eliminar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">Subir foto del frente</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload('fotoCarnetFrente', e.target.files[0])}
                            className="hidden"
                            id="fotoCarnetFrente"
                          />
                          <label
                            htmlFor="fotoCarnetFrente"
                            className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 inline-block"
                          >
                            Seleccionar Archivo
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reverso del Carnet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reverso del Carnet
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {documentData.fotoCarnetReverso ? (
                        <div className="space-y-2">
                          <img 
                            src={documentData.fotoCarnetReverso} 
                            alt="Reverso del carnet" 
                            className="w-full h-40 object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageViewer(documentData.fotoCarnetReverso)}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openImageViewer(documentData.fotoCarnetReverso)}
                              className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
                            >
                              <FiEye size={14} /> Ver
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocumentData(prev => ({ ...prev, fotoCarnetReverso: '' }))}
                              className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center justify-center gap-1"
                            >
                              <FiX size={14} /> Eliminar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">Subir foto del reverso</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload('fotoCarnetReverso', e.target.files[0])}
                            className="hidden"
                            id="fotoCarnetReverso"
                          />
                          <label
                            htmlFor="fotoCarnetReverso"
                            className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 inline-block"
                          >
                            Seleccionar Archivo
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(documentData.fotoCarnetFrente || documentData.fotoCarnetReverso) && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleDocumentSave}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Guardar Documentos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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