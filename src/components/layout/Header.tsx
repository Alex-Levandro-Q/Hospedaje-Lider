'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { MobileView } from '@/components/responsive/MobileView';
import { WebView } from '@/components/responsive/WebView';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { getAuthCookies, clearAuthCookies, Usuario } from '@/utils/auth';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { usuario: user } = getAuthCookies();
    setUsuario(user);
  }, []);

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
      setUsuario(null);
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

  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Habitaciones', href: '/habitaciones' },
    { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
    { label: 'Contactanos', href: '/contacto' }
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Web Header */}
        <WebView>
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-20 h-20">
                <Image
                  src="/images/logolider.jpg"
                  alt="Hospedaje Líder Logo"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="text-2xl font-heading font-bold text-gray-900">
                Hospedaje <span className="text-orange-500">Líder</span>
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-orange-500 font-heading font-medium text-lg transition-all duration-300 hover:scale-105 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {usuario ? (
                <>
                  {(usuario.rol === 'gerente' || usuario.rol === 'administrador') && (
                    <Link
                      href="/dashboard"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-heading font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
                    >
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {usuario.nombre.charAt(0)}{usuario.apellidos.charAt(0)}
                        </span>
                      </div>
                      <span className="font-heading font-medium">{usuario.nombre}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          href="/mis-reservas"
                          className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-body transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Mis Reservas
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileModal(true);
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-body transition-colors"
                        >
                          Mi Perfil
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-body transition-colors"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-orange-500 font-heading font-medium text-lg transition-all duration-300 hover:scale-105"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-heading font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </WebView>

        {/* Mobile Header */}
        <MobileView>
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logolider.jpg"
                  alt="Hospedaje Líder Logo"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="text-lg font-heading font-bold text-gray-900">
                Hospedaje <span className="text-orange-500">Líder</span>
              </span>
            </Link>

            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-orange-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-orange-500 font-heading font-medium px-2 py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  {usuario ? (
                    <>
                      {(usuario.rol === 'gerente' || usuario.rol === 'administrador') && (
                        <Link
                          href="/dashboard"
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-heading font-medium text-center transition-all duration-300 shadow-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        href="/mis-reservas"
                        className="text-gray-700 hover:text-orange-500 font-heading font-medium px-2 py-2 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mis Reservas
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setIsMenuOpen(false);
                        }}
                        className="text-gray-700 hover:text-orange-500 font-heading font-medium px-2 py-2 transition-colors text-left w-full"
                      >
                        Mi Perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-700 font-heading font-medium px-2 py-2 transition-colors text-left"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-gray-700 hover:text-orange-500 font-heading font-medium px-2 py-2 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        href="/register"
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-full font-heading font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-center shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </MobileView>
      </div>
      
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </header>
  );
};