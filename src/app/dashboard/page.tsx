'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { getAuthCookies, clearAuthCookies, Usuario } from '@/utils/auth';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import UsuariosModule from '@/components/dashboard/UsuariosModule';
import ClientesModule from '@/components/dashboard/ClientesModule';
import ReservasModule from '@/components/dashboard/ReservasModule';
import CheckInModule from '@/components/dashboard/CheckInModule';
import ServiciosModule from '@/components/dashboard/ServiciosModule';
import HabitacionesModule from '@/components/dashboard/HabitacionesModule';
import QRModule from '@/components/dashboard/QRModule';

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const router = useRouter();

  useEffect(() => {
    const { token, usuario: user } = getAuthCookies();

    if (!token || !user) {
      router.push('/login');
      return;
    }

    if (user.rol !== 'gerente' && user.rol !== 'administrador') {
      router.push('/');
      return;
    }

    setUsuario(user);
  }, [router]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      clearAuthCookies();
      await Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      router.push('/');
    }
  };

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'usuarios', name: 'Usuarios', icon: '👤' },
    { id: 'clientes', name: 'Clientes', icon: '👥' },
    { id: 'reservas', name: 'Reservas', icon: '📅' },
    { id: 'checkin', name: 'Check-in/out', icon: '🔑' },
    { id: 'habitaciones', name: 'Habitaciones', icon: '🏠' },
    { id: 'servicios', name: 'Servicios', icon: '⚙️' },
    { id: 'qrs', name: 'QRs', icon: '📱' }
  ];

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logolider.jpg"
                  alt="Hospedaje Líder Logo"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-gray-900">
                  Dashboard <span className="text-orange-500">Gerencial</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 font-heading">
                  {usuario.nombre} {usuario.apellidos}
                </p>
                <p className="text-xs text-gray-500 font-body capitalize">{usuario.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-heading text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="mt-8">
            <div className="px-4 mb-6">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors font-heading"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Ir al Inicio</span>
              </Link>
            </div>
            <div className="px-4 mb-6">
              <h2 className="text-lg font-heading font-semibold text-gray-800">Módulos</h2>
            </div>
            <ul className="space-y-2 px-4">
              {modules.map((module) => (
                <li key={module.id}>
                  <button
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-heading ${
                      activeModule === module.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <span className="text-xl">{module.icon}</span>
                    <span className="font-medium">{module.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-gray-900 capitalize">
                {modules.find(m => m.id === activeModule)?.name}
              </h2>
              <p className="text-gray-600 font-body mt-2">
                Gestiona {modules.find(m => m.id === activeModule)?.name.toLowerCase()} del hospedaje
              </p>
            </div>

            {/* Content Area */}
            <div className={activeModule === 'dashboard' ? '' : 'bg-white rounded-lg shadow-lg p-6'}>
              {activeModule === 'dashboard' && <DashboardStats />}
              
              {activeModule === 'usuarios' && <UsuariosModule />}
              
              {activeModule === 'clientes' && <ClientesModule />}

              {activeModule === 'reservas' && <ReservasModule />}

              {activeModule === 'checkin' && <CheckInModule />}

              {activeModule === 'habitaciones' && <HabitacionesModule />}

              {activeModule === 'servicios' && <ServiciosModule />}

              {activeModule === 'qrs' && <QRModule />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}