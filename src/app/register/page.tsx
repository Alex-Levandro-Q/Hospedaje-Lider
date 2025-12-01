'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface FormData {
  nombre: string;
  apellidos: string;
  email: string;
  fechaNac: string;
  numeroCarnet: string;
  password: string;
  confirmPassword: string;
  fotoCI1: string | null;
  fotoCI2: string | null;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellidos: '',
    email: '',
    fechaNac: '',
    numeroCarnet: '',
    password: '',
    confirmPassword: '',
    fotoCI1: null,
    fotoCI2: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  const totalSteps = 3;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nombre && formData.apellidos && formData.email && formData.fechaNac);
      case 2:
        return !!(formData.numeroCarnet && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword);
      case 3:
        return true; // Paso opcional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError('');
    } else {
      if (currentStep === 2 && formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
      } else {
        setError('Por favor completa todos los campos requeridos');
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4005/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          fechaNac: formData.fechaNac,
          numeroCarnet: formData.numeroCarnet,
          password: formData.password,
          fotoCI1: formData.fotoCI1,
          fotoCI2: formData.fotoCI2
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!formData.fotoCI1 || !formData.fotoCI2) {
          await Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            html: `
              <p>Tu cuenta ha sido creada correctamente.</p>
              <div style="background: #fef3cd; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin: 16px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>Importante:</strong> Para poder realizar reservas, necesitas subir las fotos de tu carnet de identidad desde tu perfil.
                </p>
              </div>
            `,
            confirmButtonText: 'Ir a Iniciar Sesión',
            confirmButtonColor: '#ea580c'
          });
          router.push('/login');
        } else {
          await Swal.fire({
            icon: 'success',
            title: '¡Registro Completo!',
            text: 'Tu cuenta ha sido creada exitosamente con toda la información',
            confirmButtonText: 'Ir a Iniciar Sesión',
            confirmButtonColor: '#ea580c'
          });
          router.push('/login');
        }
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: data.error || 'Error al registrarse'
        });
        setError(data.error || 'Error al registrarse');
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor'
      });
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPhotos = () => {
    setFormData({ ...formData, fotoCI1: null, fotoCI2: null });
    handleSubmit();
  };

  if (showAlert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
              ¡Registro Exitoso!
            </h2>
            <p className="text-gray-600 font-body mb-4">
              Tu cuenta ha sido creada correctamente.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 font-body">
                <strong>Importante:</strong> Para poder realizar reservas, necesitas subir las fotos de tu carnet de identidad (anverso y reverso) desde tu perfil.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-heading font-semibold"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <Image
                src="/images/logolider.jpg"
                alt="Hospedaje Líder Logo"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-gray-600 font-body">
            Únete a Hospedaje <span className="text-orange-500">Líder</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-semibold ${
                  step <= currentStep 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-20 h-1 mx-2 ${
                    step < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-600 font-body">
              Paso {currentStep} de {totalSteps}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                Información Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-heading mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ingresa tu nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body text-gray-900 placeholder-gray-500"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-heading mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ingresa tus apellidos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body text-gray-900 placeholder-gray-500"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-heading mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body text-gray-900 placeholder-gray-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-heading mb-1">
                  Fecha de Nacimiento *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body text-gray-900 bg-white"
                    value={formData.fechaNac}
                    onChange={(e) => setFormData({ ...formData, fechaNac: e.target.value })}
                    style={{
                      colorScheme: 'light',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                 
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1 font-body">Debes ser mayor de 18 años</p>
              </div>
            </div>
          )}

          {/* Step 2: Account Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                Información de Cuenta
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 font-heading mb-1">
                  Número de Carnet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 12345678 LP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body text-gray-900 placeholder-gray-500"
                  value={formData.numeroCarnet}
                  onChange={(e) => setFormData({ ...formData, numeroCarnet: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-heading mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body text-gray-900 placeholder-gray-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-xs text-gray-600 mt-1 font-body">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-heading mb-1">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirma tu contraseña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body text-gray-900 placeholder-gray-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 3: ID Photos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  Fotos del Carnet de Identidad
                </h2>
                <p className="text-gray-600 font-body text-sm">
                  Este paso es opcional, pero necesario para realizar reservas
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  label="Carnet - Anverso (Frente)"
                  value={formData.fotoCI1}
                  onChange={(value) => setFormData({ ...formData, fotoCI1: value })}
                />
                
                <ImageUpload
                  label="Carnet - Reverso (Atrás)"
                  value={formData.fotoCI2}
                  onChange={(value) => setFormData({ ...formData, fotoCI2: value })}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-body">
                  <strong>Nota:</strong> Puedes omitir este paso y subir las fotos más tarde desde tu perfil. Sin embargo, necesitarás completar esta información para poder realizar reservas.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-heading"
            >
              Anterior
            </button>

            <div className="space-x-4">
              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={handleSkipPhotos}
                  disabled={loading}
                  className="px-6 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 font-heading"
                >
                  Omitir Fotos
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-heading"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-heading"
                >
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-body">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}