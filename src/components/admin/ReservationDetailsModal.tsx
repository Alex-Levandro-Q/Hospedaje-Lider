'use client';

import { FiX, FiUser, FiHome, FiCalendar, FiClock, FiDollarSign, FiFileText } from 'react-icons/fi';

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

interface ReservationDetailsModalProps {
  reserva: Reserva;
  onClose: () => void;
  onStatusChange: (nuevoEstado: string) => void;
}

export function ReservationDetailsModal({ reserva, onClose, onStatusChange }: ReservationDetailsModalProps) {
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFechaHora = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmada': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
      case 'completada': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Detalles de Reserva #{reserva.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Estado:</span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getEstadoColor(reserva.estado)}`}>
              {reserva.estado.toUpperCase()}
            </span>
          </div>

          {/* Información del cliente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <FiUser className="mr-2" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nombre:</span>
                <p className="text-gray-900">{reserva.usuario.nombre} {reserva.usuario.apellidos}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">CI:</span>
                <p className="text-gray-900">{reserva.usuario.numeroCarnet}</p>
              </div>
            </div>
          </div>

          {/* Información de la habitación */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <FiHome className="mr-2" />
              Información de la Habitación
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Código:</span>
                <p className="text-gray-900">{reserva.habitacion.codigo}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nombre:</span>
                <p className="text-gray-900">{reserva.habitacion.nombre}</p>
              </div>
            </div>
          </div>

          {/* Detalles de la reserva */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <FiCalendar className="mr-2" />
              Detalles de la Reserva
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Tipo:</span>
                <p className="text-gray-900 capitalize">{reserva.tipoReserva}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cantidad:</span>
                <p className="text-gray-900">{reserva.cantidad} {reserva.tipoReserva}(s)</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fecha inicio:</span>
                <p className="text-gray-900">{formatFecha(reserva.fechaInicio)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fecha fin:</span>
                <p className="text-gray-900">{formatFecha(reserva.fechaFin)}</p>
              </div>
              {reserva.horaInicio && (
                <>
                  <div>
                    <span className="font-medium text-gray-700">Hora inicio:</span>
                    <p className="text-gray-900">{reserva.horaInicio}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hora fin:</span>
                    <p className="text-gray-900">{reserva.horaFin}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información de pago */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <FiDollarSign className="mr-2" />
              Información de Pago
            </h3>
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Monto Total:</span>
                <span className="text-xl font-bold text-green-600">{reserva.montoTotal} Bs</span>
              </div>
            </div>
          </div>

          {/* Comprobante */}
          {reserva.comprobante && reserva.comprobante !== 'admin-created' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                <FiFileText className="mr-2" />
                Comprobante de Pago
              </h3>
              <div className="text-center">
                <img 
                  src={reserva.comprobante} 
                  alt="Comprobante" 
                  className="max-w-full h-auto max-h-64 mx-auto rounded border"
                />
                <a 
                  href={reserva.comprobante} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Ver en tamaño completo
                </a>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <FiClock className="mr-2" />
              Información Adicional
            </h3>
            <div className="text-sm">
              <div>
                <span className="font-medium text-gray-700">Fecha de creación:</span>
                <p className="text-gray-900">{formatFechaHora(reserva.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          {reserva.estado === 'pendiente' && (
            <div className="flex justify-center gap-4 pt-4 border-t">
              <button
                onClick={() => onStatusChange('confirmada')}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
              >
                Aprobar Reserva
              </button>
              <button
                onClick={() => onStatusChange('cancelada')}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
              >
                Rechazar Reserva
              </button>
            </div>
          )}

          {reserva.estado === 'confirmada' && (
            <div className="flex justify-center gap-4 pt-4 border-t">
              <button
                onClick={() => onStatusChange('completada')}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Marcar como Completada
              </button>
            </div>
          )}
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}