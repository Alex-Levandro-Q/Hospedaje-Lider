'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FiCalendar, FiClock, FiFilter, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import { isAuthenticated, getAuthCookies } from '@/utils/auth';
import { useRouter } from 'next/navigation';

interface Reserva {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  tipoReserva: string;
  cantidad: number;
  montoTotal: number;
  estado: string;
  createdAt: string;
  habitacion: {
    codigo: string;
    nombre: string;
    imagen1?: string;
  };
  qr?: {
    nombre: string;
  };
}

export default function MisReservasPage() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    estado: '',
    tipoReserva: '',
    fechaDesde: '',
    fechaHasta: '',
    busqueda: ''
  });
  const itemsPerPage = 6;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/mis-reservas');
      return;
    }
    fetchReservas();
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [reservas, filters]);

  const applyFilters = () => {
    let filtered = [...reservas];

    if (filters.estado) {
      filtered = filtered.filter(r => r.estado === filters.estado);
    }
    if (filters.tipoReserva) {
      filtered = filtered.filter(r => r.tipoReserva === filters.tipoReserva);
    }
    if (filters.fechaDesde) {
      filtered = filtered.filter(r => new Date(r.fechaInicio) >= new Date(filters.fechaDesde));
    }
    if (filters.fechaHasta) {
      filtered = filtered.filter(r => new Date(r.fechaInicio) <= new Date(filters.fechaHasta));
    }
    if (filters.busqueda) {
      const search = filters.busqueda.toLowerCase();
      filtered = filtered.filter(r => 
        r.habitacion.codigo.toLowerCase().includes(search) ||
        r.habitacion.nombre.toLowerCase().includes(search) ||
        r.id.toString().includes(search)
      );
    }

    setFilteredReservas(filtered);
    setCurrentPage(1);
  };

  const fetchReservas = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/reservas/mis-reservas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReservas(data);
        setFilteredReservas(data);
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      estado: '',
      tipoReserva: '',
      fechaDesde: '',
      fechaHasta: '',
      busqueda: ''
    });
  };

  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReservas = filteredReservas.slice(startIndex, startIndex + itemsPerPage);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'cancelada': return 'Cancelada';
      case 'completada': return 'Completada';
      default: return estado;
    }
  };

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'hora': return 'Por horas';
      case 'noche': return 'Por noche';
      case 'mes': return 'Por mes';
      default: return tipo;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Mis Reservas
            </h1>
            <div className="text-sm text-gray-600">
              {filteredReservas.length} de {reservas.length} reservas
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">Filtros</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Habitación o ID..."
                    value={filters.busqueda}
                    onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={filters.tipoReserva}
                  onChange={(e) => handleFilterChange('tipoReserva', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Todos</option>
                  <option value="hora">Por horas</option>
                  <option value="noche">Por noche</option>
                  <option value="mes">Por mes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
          
          {filteredReservas.length > 0 ? (
            <div className="space-y-6">
              {currentReservas.map(reserva => (
                <div key={reserva.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      {reserva.habitacion.imagen1 ? (
                        <img 
                          src={reserva.habitacion.imagen1} 
                          alt={reserva.habitacion.nombre}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {reserva.habitacion.codigo} - {reserva.habitacion.nombre}
                          </h3>
                          <p className="text-gray-600">
                            Reserva #{reserva.id}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(reserva.estado)}`}>
                          {getEstadoTexto(reserva.estado)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="mr-2" size={16} />
                          <span className="text-sm">
                            {new Date(reserva.fechaInicio).toLocaleDateString()} - {new Date(reserva.fechaFin).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FiClock className="mr-2" size={16} />
                          <span className="text-sm">
                            {getTipoTexto(reserva.tipoReserva)} ({reserva.cantidad} {reserva.tipoReserva === 'hora' ? 'horas' : reserva.tipoReserva === 'noche' ? 'noches' : 'meses'})
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <span className="text-sm font-medium">
                            Total: <span className="text-orange-500 font-bold">{reserva.montoTotal} Bs</span>
                          </span>
                        </div>
                        
                        {reserva.qr && (
                          <div className="flex items-center text-gray-600">
                            <span className="text-sm">
                              Pago: {reserva.qr.nombre}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Creada el {new Date(reserva.createdAt).toLocaleDateString()} a las {new Date(reserva.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes reservas
              </h3>
              <p className="text-gray-600 mb-6">
                Cuando hagas una reserva, aparecerá aquí
              </p>
              <a 
                href="/reservar"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Hacer una reserva
              </a>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFilter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron reservas
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta ajustar los filtros para ver más resultados
              </p>
              <button
                onClick={clearFilters}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredReservas.length)} de {filteredReservas.length} reservas
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FiChevronLeft size={16} />
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === page
                          ? 'bg-orange-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}