'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getAuthCookies } from '@/utils/auth';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Stats {
  totalUsuarios: number;
  totalClientes: number;
  totalReservas: number;
  reservasPendientes: number;
  reservasConfirmadas: number;
  reservasCompletadas: number;
  habitacionesDisponibles: number;
  habitacionesOcupadas: number;
  habitacionesMantenimiento: number;
  gananciasDelMes: number;
  gananciasDelDia: number;
  gananciasDelAno: number;
  reservasHoy: number;
  checkInsHoy: number;
  checkOutsHoy: number;
  ocupacionPromedio: number;
  gananciasUltimos12Meses: number[];
}

interface DateRange {
  fechaInicio: string;
  fechaFin: string;
}

export const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsuarios: 0,
    totalClientes: 0,
    totalReservas: 0,
    reservasPendientes: 0,
    reservasConfirmadas: 0,
    reservasCompletadas: 0,
    habitacionesDisponibles: 0,
    habitacionesOcupadas: 0,
    habitacionesMantenimiento: 0,
    gananciasDelMes: 0,
    gananciasDelDia: 0,
    gananciasDelAno: 0,
    reservasHoy: 0,
    checkInsHoy: 0,
    checkOutsHoy: 0,
    ocupacionPromedio: 0,
    gananciasUltimos12Meses: Array(12).fill(0)
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const handleDateRangeChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const refreshStats = () => {
    setLoading(true);
    fetchStats();
  };

  const fetchStats = async () => {
    try {
      setError(null);
      const { token } = getAuthCookies();
      
      if (!token) {
        setError('No se encontró token de autenticación');
        return;
      }
      
      const response = await fetch('/api/dashboard/estadisticas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Error al obtener estadísticas');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ganancias (Bs)',
        data: (stats.gananciasUltimos12Meses || Array(12).fill(0)).map(val => Math.max(0, val || 0)),
        backgroundColor: 'rgba(234, 88, 12, 0.8)',
        borderColor: 'rgba(234, 88, 12, 1)',
        borderWidth: 1,
      },
    ],
  };

  const ocupacionData = {
    labels: ['Disponibles', 'Ocupadas', 'Mantenimiento'],
    datasets: [
      {
        data: [
          Math.max(0, stats.habitacionesDisponibles || 0),
          Math.max(0, stats.habitacionesOcupadas || 0),
          Math.max(0, stats.habitacionesMantenimiento || 0)
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };

  const reservasData = {
    labels: ['Pendientes', 'Confirmadas', 'Completadas'],
    datasets: [
      {
        data: [
          Math.max(0, stats.reservasPendientes || 0),
          Math.max(0, stats.reservasConfirmadas || 0),
          Math.max(0, stats.reservasCompletadas || 0)
        ],
        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Ganancias por Mes',
      },
    },
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded-lg h-32 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-200 rounded-lg h-64"></div>
          <div className="bg-gray-200 rounded-lg h-64"></div>
        </div>
        <div className="bg-gray-200 rounded-lg h-96"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el dashboard</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refreshStats}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiCalendar className="text-orange-500" />
            Filtro de Disponibilidad
          </h3>
          <button
            onClick={refreshStats}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FiRefreshCw size={16} />
            Actualizar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.fechaInicio}
              onChange={(e) => handleDateRangeChange('fechaInicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.fechaFin}
              onChange={(e) => handleDateRangeChange('fechaFin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 font-heading">{stats.totalUsuarios}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Clientes</p>
              <p className="text-2xl font-bold text-gray-900 font-heading">{stats.totalClientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Reservas</p>
              <p className="text-2xl font-bold text-gray-900 font-heading">{stats.totalReservas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Habitaciones Disponibles</p>
              <p className="text-2xl font-bold text-green-600 font-heading">{stats.habitacionesDisponibles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Habitaciones Ocupadas</p>
              <p className="text-2xl font-bold text-red-600 font-heading">{stats.habitacionesOcupadas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Ganancias del Mes</p>
              <p className="text-2xl font-bold text-yellow-600 font-heading">Bs {stats.gananciasDelMes.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Ganancias Hoy</p>
              <p className="text-2xl font-bold text-green-600 font-heading">Bs {stats.gananciasDelDia.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Reservas Hoy</p>
              <p className="text-2xl font-bold text-blue-600 font-heading">{stats.reservasHoy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Check-ins Hoy</p>
              <p className="text-2xl font-bold text-purple-600 font-heading">{stats.checkInsHoy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Check-outs Hoy</p>
              <p className="text-2xl font-bold text-indigo-600 font-heading">{stats.checkOutsHoy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Ocupación</p>
              <p className="text-2xl font-bold text-pink-600 font-heading">{stats.ocupacionPromedio.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 font-body">Ganancias del Año</p>
              <p className="text-2xl font-bold text-orange-600 font-heading">Bs {stats.gananciasDelAno.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocupación de Habitaciones</h3>
          <div className="h-64 flex items-center justify-center">
            {(stats.habitacionesDisponibles + stats.habitacionesOcupadas + stats.habitacionesMantenimiento) > 0 ? (
              <Doughnut 
                key={`ocupacion-${stats.habitacionesDisponibles}-${stats.habitacionesOcupadas}`}
                data={ocupacionData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-gray-500 text-center">
                <p>No hay datos de habitaciones disponibles</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Reservas</h3>
          <div className="h-64 flex items-center justify-center">
            {(stats.reservasPendientes + stats.reservasConfirmadas + stats.reservasCompletadas) > 0 ? (
              <Doughnut 
                key={`reservas-${stats.reservasPendientes}-${stats.reservasConfirmadas}`}
                data={reservasData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const
                    }
                  }
                }} 
              />
            ) : (
              <div className="text-gray-500 text-center">
                <p>No hay datos de reservas disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="h-96">
          {stats.gananciasUltimos12Meses && stats.gananciasUltimos12Meses.some(val => val > 0) ? (
            <Bar 
              key={`ganancias-${stats.gananciasDelMes}`}
              data={chartData} 
              options={{
                ...chartOptions,
                responsive: true,
                maintainAspectRatio: false
              }} 
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No hay datos de ganancias disponibles</p>
                <p className="text-sm">Los datos aparecerán cuando haya reservas completadas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};