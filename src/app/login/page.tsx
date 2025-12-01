'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { setAuthCookies } from '@/utils/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    numeroCarnet: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setShowSuccess(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4005/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthCookies(data.token, data.usuario);
        
        await Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Hola ${data.usuario.nombre}, has iniciado sesión correctamente`,
          timer: 2000,
          showConfirmButton: false
        });
        
        if (data.usuario.rol === 'gerente' || data.usuario.rol === 'administrador') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Error al iniciar sesión'
        });
        setError(data.error || 'Error al iniciar sesión');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
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
          <h2 className="text-3xl font-heading font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-body">
            Accede a tu cuenta de Hospedaje <span className="text-orange-500">Líder</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg p-8">
            {showSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                ¡Registro exitoso! Ahora puedes iniciar sesión con tu cuenta.
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="numeroCarnet" className="block text-sm font-medium text-gray-700 font-heading">
                  Email o Número de Carnet
                </label>
                <input
                  id="numeroCarnet"
                  name="numeroCarnet"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body"
                  placeholder="Ingresa tu email o carnet"
                  value={formData.numeroCarnet}
                  onChange={(e) => setFormData({ ...formData, numeroCarnet: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-heading">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-body"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-heading"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-body">
                ¿No tienes cuenta?{' '}
                <a href="/register" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}