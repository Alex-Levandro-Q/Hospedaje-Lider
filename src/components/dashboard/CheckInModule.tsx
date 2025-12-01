'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiLogIn, FiLogOut, FiClock, FiUser, FiHome, FiFilter, FiDownload, FiCalendar } from 'react-icons/fi';
import { getAuthCookies } from '@/utils/auth';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Reserva {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  horaCheckout?: string;
  estado: string;
  tipoReserva: string;
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
  checkIn?: string;
  checkOut?: string;
}

export default function CheckInModule() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('confirmada');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    fetchReservas();
  }, []);

  useEffect(() => {
    filterReservas();
  }, [reservas, searchTerm, filterEstado, fechaInicio, fechaFin]);

  const fetchReservas = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/reservas/admin', {
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

  const filterReservas = () => {
    let filtered = reservas;

    if (filterEstado) {
      filtered = filtered.filter(r => r.estado === filterEstado);
    }

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.usuario.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.usuario.numeroCarnet.includes(searchTerm) ||
        r.habitacion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.habitacion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (fechaInicio) {
      filtered = filtered.filter(r => new Date(r.fechaInicio) >= new Date(fechaInicio));
    }

    if (fechaFin) {
      filtered = filtered.filter(r => new Date(r.fechaFin) <= new Date(fechaFin));
    }

    setFilteredReservas(filtered);
  };

  const isReservaExpired = (reserva: Reserva) => {
    const now = new Date();
    const fechaFin = new Date(reserva.fechaFin);
    if (reserva.horaFin || reserva.horaCheckout) {
      const [hours, minutes] = (reserva.horaFin || reserva.horaCheckout || '').split(':');
      fechaFin.setHours(parseInt(hours), parseInt(minutes));
    }
    return now > fechaFin;
  };

  const handleCheckIn = async (reservaId: number) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (reserva && isReservaExpired(reserva)) {
      Swal.fire('Reserva Expirada', 'No se puede realizar check-in en una reserva que ya ha pasado su fecha de finalización.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Confirmar Check-in',
      text: '¿Confirmar el ingreso del huésped?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, registrar ingreso',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { token } = getAuthCookies();
        const response = await fetch(`/api/reservas/${reservaId}/checkin`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          Swal.fire('¡Check-in registrado!', 'El ingreso ha sido registrado correctamente', 'success');
          fetchReservas();
        } else {
          const errorData = await response.json();
          Swal.fire('Error', errorData.error || 'Error al registrar check-in', 'error');
        }
      } catch {
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    }
  };

  const handleCheckOut = async (reservaId: number) => {
    const result = await Swal.fire({
      title: 'Confirmar Check-out',
      text: '¿Confirmar la salida del huésped?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, registrar salida',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { token } = getAuthCookies();
        const response = await fetch(`/api/reservas/${reservaId}/checkout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          Swal.fire('¡Check-out registrado!', 'La salida ha sido registrada correctamente', 'success');
          fetchReservas();
        } else {
          const errorData = await response.json();
          Swal.fire('Error', errorData.error || 'Error al registrar check-out', 'error');
        }
      } catch {
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    }
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('es-BO');
    return timeStr ? `${dateFormatted} ${timeStr}` : dateFormatted;
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      'confirmada': 'bg-green-100 text-green-800',
      'completada': 'bg-blue-100 text-blue-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Check-in/Check-out', 14, 22);
    
    // Filtros aplicados
    doc.setFontSize(10);
    let yPos = 35;
    doc.text('Filtros aplicados:', 14, yPos);
    yPos += 5;
    if (filterEstado) {
      doc.text(`Estado: ${filterEstado}`, 14, yPos);
      yPos += 5;
    }
    if (fechaInicio) {
      doc.text(`Fecha inicio: ${fechaInicio}`, 14, yPos);
      yPos += 5;
    }
    if (fechaFin) {
      doc.text(`Fecha fin: ${fechaFin}`, 14, yPos);
      yPos += 5;
    }
    if (searchTerm) {
      doc.text(`Búsqueda: ${searchTerm}`, 14, yPos);
      yPos += 5;
    }
    
    // Tabla
    const tableData = filteredReservas.map(reserva => [
      `${reserva.usuario.nombre} ${reserva.usuario.apellidos}`,
      reserva.usuario.numeroCarnet,
      reserva.habitacion.codigo,
      formatDateTime(reserva.fechaInicio, reserva.horaInicio),
      formatDateTime(reserva.fechaFin, reserva.horaFin || reserva.horaCheckout),
      reserva.estado,
      reserva.checkIn ? new Date(reserva.checkIn).toLocaleString('es-BO') : 'Pendiente',
      reserva.checkOut ? new Date(reserva.checkOut).toLocaleString('es-BO') : 'Pendiente'
    ]);
    
    autoTable(doc, {
      head: [['Huésped', 'CI', 'Habitación', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Check-in', 'Check-out']],
      body: tableData,
      startY: yPos + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] }
    });
    
    doc.save(`checkin-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
          <FiClock className="text-orange-500 text-2xl" />
          <h2 className="text-2xl font-heading font-bold text-gray-900">Check-in / Check-out</h2>
        </div>
        <button
          onClick={exportToPDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors font-heading"
        >
          <FiDownload className="mr-2 h-4 w-4" />
          Exportar PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-heading">
              Buscar reserva
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, carnet o habitación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-body"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-heading">
              Estado
            </label>
            <div className="relative">
              <FiFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-body"
              >
                <option value="">Todos los estados</option>
                <option value="confirmada">Confirmadas</option>
                <option value="completada">Completadas</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-heading">
              Fecha Inicio
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-body"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-heading">
              Fecha Fin
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-body"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {filteredReservas.length === 0 ? (
          <div className="text-center py-12">
            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 font-heading">No hay reservas</h3>
            <p className="mt-1 text-sm text-gray-500 font-body">No se encontraron reservas con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">
                    Huésped
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">
                    Habitación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">
                    Check-in/out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-heading">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 font-heading">
                            {reserva.usuario.nombre} {reserva.usuario.apellidos}
                          </div>
                          <div className="text-sm text-gray-500 font-body">
                            CI: {reserva.usuario.numeroCarnet}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiHome className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 font-heading">
                            {reserva.habitacion.codigo}
                          </div>
                          <div className="text-sm text-gray-500 font-body">
                            {reserva.habitacion.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-body">
                      <div>
                        <div>Inicio: {formatDateTime(reserva.fechaInicio, reserva.horaInicio)}</div>
                        <div>Fin: {formatDateTime(reserva.fechaFin, reserva.horaFin || reserva.horaCheckout)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(reserva.estado)} font-body`}>
                        {reserva.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-body">
                      <div>
                        {reserva.checkIn && (
                          <div className="text-green-600">
                            ✓ In: {new Date(reserva.checkIn).toLocaleString('es-BO')}
                          </div>
                        )}
                        {reserva.checkOut && (
                          <div className="text-orange-600">
                            ✓ Out: {new Date(reserva.checkOut).toLocaleString('es-BO')}
                          </div>
                        )}
                        {!reserva.checkIn && !reserva.checkOut && (
                          <span className="text-gray-400">Pendiente</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!reserva.checkIn && reserva.estado === 'confirmada' && (
                          <button
                            onClick={() => handleCheckIn(reserva.id)}
                            disabled={isReservaExpired(reserva)}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white transition-colors font-heading ${
                              isReservaExpired(reserva) 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                            }`}
                            title={isReservaExpired(reserva) ? 'Reserva expirada' : 'Registrar ingreso'}
                          >
                            <FiLogIn className="mr-1 h-4 w-4" />
                            Check-in
                          </button>
                        )}
                        {reserva.checkIn && !reserva.checkOut && (
                          <button
                            onClick={() => handleCheckOut(reserva.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors font-heading"
                            title="Registrar salida"
                          >
                            <FiLogOut className="mr-1 h-4 w-4" />
                            Check-out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}