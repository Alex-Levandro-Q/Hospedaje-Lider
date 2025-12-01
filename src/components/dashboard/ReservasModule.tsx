'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiCheck, FiX, FiFilter, FiCalendar } from 'react-icons/fi';
import { getAuthCookies } from '@/utils/auth';
import { AdminReservationModal } from '@/components/admin/AdminReservationModal';
import { ReservationDetailsModal } from '@/components/admin/ReservationDetailsModal';
import Swal from 'sweetalert2';

interface Reserva {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  tipoReserva: string;
  cantidad: number;
  montoTotal: number;
  estado: string;
  comprobante?: string;
  createdAt: string;
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    numeroCarnet: string;
  };
  habitacion: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

export default function ReservasModule() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    fetchReservas();
  }, [filtroEstado]);

  const fetchReservas = async () => {
    try {
      const { token } = getAuthCookies();
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      
      const response = await fetch(`/api/reservas/admin?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReservas(data);
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (reservaId: number, nuevoEstado: string) => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`/api/reservas/${reservaId}/estado`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          timer: 1500,
          showConfirmButton: false
        });
        fetchReservas();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar estado'
      });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-BO');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <FiCalendar className="text-orange-500 text-2xl" />
          <h2 className="text-2xl font-heading font-bold text-gray-900">Gestión de Reservas</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-heading transition-colors"
        >
          <FiPlus size={20} />
          Nueva Reserva
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <FiFilter className="text-gray-500" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-body"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
            <option value="completada">Completada</option>
          </select>
        </div>
      </div>

      {/* Tabla de reservas */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {reservas.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 font-heading">No hay reservas</h3>
            <p className="mt-1 text-sm text-gray-500 font-body">Comienza creando una nueva reserva.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">Habitación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 font-heading">
                        {reserva.usuario.nombre} {reserva.usuario.apellidos}
                      </div>
                      <div className="text-sm text-gray-500 font-body">CI: {reserva.usuario.numeroCarnet}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-heading">{reserva.habitacion.codigo}</div>
                    <div className="text-sm text-gray-500 font-body">{reserva.habitacion.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-body">
                      {formatFecha(reserva.fechaInicio)} - {formatFecha(reserva.fechaFin)}
                    </div>
                    {reserva.horaInicio && (
                      <div className="text-sm text-gray-500 font-body">
                        {reserva.horaInicio} - {reserva.horaFin}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize font-body">{reserva.tipoReserva}</span>
                    <div className="text-sm text-gray-500 font-body">{reserva.cantidad} {reserva.tipoReserva}(s)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-body">
                    {reserva.montoTotal} Bs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(reserva.estado)} font-body`}>
                      {reserva.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedReserva(reserva);
                          setShowDetailsModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Ver detalles"
                      >
                        <FiEye size={16} />
                      </button>
                      {reserva.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleEstadoChange(reserva.id, 'confirmada')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Confirmar"
                          >
                            <FiCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleEstadoChange(reserva.id, 'cancelada')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Cancelar"
                          >
                            <FiX size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <AdminReservationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchReservas();
          }}
        />
      )}

      {showDetailsModal && selectedReserva && (
        <ReservationDetailsModal
          reserva={selectedReserva}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReserva(null);
          }}
          onStatusChange={(nuevoEstado) => {
            handleEstadoChange(selectedReserva.id, nuevoEstado);
            setShowDetailsModal(false);
            setSelectedReserva(null);
          }}
        />
      )}
    </div>
  );
}