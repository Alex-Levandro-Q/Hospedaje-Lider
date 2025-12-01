'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiUpload, FiCheck, FiCalendar, FiFileText, FiEye } from 'react-icons/fi';
import { TimeSelector } from './TimeSelector';
import { getAuthCookies } from '@/utils/auth';
import Swal from 'sweetalert2';

interface Habitacion {
  id: number;
  codigo: string;
  nombre: string;
  precioHora?: number;
  precioNoche?: number;
  precioMes?: number;
  cantidadPersonas: number;
  horasMinimas?: number;
  servicios: Array<{
    servicio: { id: number; nombre: string; }
  }>;
  horarioSugerido?: {
    inicio: string;
    fin: string;
  };
}

interface QR {
  id: number;
  nombre: string;
  imagen: string;
}

interface ReservationModalProps {
  habitacion: Habitacion;
  fechaInicio: string;
  fechaFin: string;
  cantidadPersonas: number;
  tipoReserva: string;
  serviciosSeleccionados: number[];
  horaInicioFiltro?: string;
  horaFinFiltro?: string;
  onClose: () => void;
}

export function ReservationModal({
  habitacion,
  fechaInicio,
  fechaFin,
  cantidadPersonas,
  tipoReserva,
  serviciosSeleccionados,
  horaInicioFiltro,
  horaFinFiltro,
  onClose
}: ReservationModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Detalles/Horarios, 2: Pago
  const [qr, setQr] = useState<QR | null>(null);
  const [comprobante, setComprobante] = useState('');
  const [comprobanteFileName, setComprobanteFileName] = useState('');
  const [comprobanteType, setComprobanteType] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para horarios
  const [horaInicio, setHoraInicio] = useState(() => {
    if (tipoReserva === 'hora') {
      // Usar hora del filtro si está disponible
      if (horaInicioFiltro) {
        return horaInicioFiltro;
      }
      // Usar horario sugerido si está disponible
      if (habitacion.horarioSugerido) {
        return habitacion.horarioSugerido.inicio;
      }
      // Obtener hora local del sistema
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const nextQuarter = Math.ceil(currentMinute / 15) * 15;
      if (nextQuarter >= 60) {
        return `${(currentHour + 1).toString().padStart(2, '0')}:00`;
      }
      return `${currentHour.toString().padStart(2, '0')}:${nextQuarter.toString().padStart(2, '0')}`;
    }
    return '08:00';
  });
  const [horaFin, setHoraFin] = useState(() => {
    if (tipoReserva === 'hora') {
      // Usar hora del filtro si está disponible
      if (horaFinFiltro) {
        return horaFinFiltro;
      }
      // Usar horario sugerido si está disponible
      if (habitacion.horarioSugerido) {
        return habitacion.horarioSugerido.fin;
      }
      // Obtener hora local del sistema + horas mínimas
      const now = new Date();
      const finTime = new Date(now.getTime() + ((habitacion.horasMinimas || 3) * 60 * 60 * 1000));
      return `${finTime.getHours().toString().padStart(2, '0')}:${finTime.getMinutes().toString().padStart(2, '0')}`;
    }
    return '11:00';
  });
  const [fechaInicioLocal, setFechaInicioLocal] = useState(fechaInicio);
  const [fechaFinLocal, setFechaFinLocal] = useState(fechaFin);


  useEffect(() => {
    fetchQR();
  }, []);

  // Auto-calcular hora de salida mínima cuando cambia la hora de inicio
  const calcularHoraFin = (nuevaHoraInicio: string) => {
    if (tipoReserva === 'hora' && nuevaHoraInicio) {
      const [hours, minutes] = nuevaHoraInicio.split(':').map(Number);
      const inicioDate = new Date();
      inicioDate.setHours(hours, minutes, 0, 0);
      
      const minHoras = habitacion.horasMinimas || 3;
      const finDate = new Date(inicioDate.getTime() + (minHoras * 60 * 60 * 1000));
      
      const horaFinCalculada = `${finDate.getHours().toString().padStart(2, '0')}:${finDate.getMinutes().toString().padStart(2, '0')}`;
      setHoraFin(horaFinCalculada);
    }
  };

  const fetchQR = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch('/api/qrs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const activeQRs = data.filter((qr: any) => qr.activo);
        if (activeQRs.length > 0) {
          setQr(activeQRs[0]); // Usar el primer QR activo
        }
      }
    } catch (error) {
      console.error('Error al cargar QR:', error);
    }
  };

  const calculateTotal = () => {
    let precio, cantidad;
    
    if (tipoReserva === 'hora') {
      precio = habitacion.precioHora || 0;
      if (horaInicio && horaFin) {
        const inicio = new Date(`2000-01-01T${horaInicio}`);
        const fin = new Date(`2000-01-01T${horaFin}`);
        cantidad = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60));
        cantidad = Math.max(cantidad, habitacion.horasMinimas || 3);
      } else {
        cantidad = habitacion.horasMinimas || 3;
      }
    } else {
      const inicio = new Date(fechaInicioLocal);
      const fin = new Date(fechaFinLocal);
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (tipoReserva === 'noche') {
        precio = habitacion.precioNoche || 0;
        cantidad = diffDays;
      } else { // mes
        precio = habitacion.precioMes || 0;
        cantidad = Math.ceil(diffDays / 30);
      }
    }
    
    return precio * cantidad;
  };



  const handleVerifyAvailability = async () => {
    if (tipoReserva === 'hora' && (!horaInicio || !horaFin)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona el rango de horas'
      });
      return;
    }

    if (!fechaInicioLocal || !fechaFinLocal) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona las fechas'
      });
      return;
    }

    // Validar fechas no sean del pasado
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    if (fechaInicioLocal < todayStr || fechaFinLocal < todayStr) {
      Swal.fire({
        icon: 'error',
        title: 'Fechas inválidas',
        text: 'No puedes seleccionar fechas anteriores a hoy'
      });
      return;
    }

    // Validar duración mínima para reservas por horas
    if (tipoReserva === 'hora' && horaInicio && horaFin) {
      const inicio = new Date(`2000-01-01T${horaInicio}`);
      const fin = new Date(`2000-01-01T${horaFin}`);
      const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
      const minHoras = habitacion.horasMinimas || 3;
      
      if (horas < minHoras) {
        Swal.fire({
          icon: 'error',
          title: 'Duración insuficiente',
          text: `La duración mínima es de ${minHoras} horas`
        });
        return;
      }
    }

    setStep(2);
  };

  const handleConfirmReservation = async () => {
    if (!comprobante) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Sube el comprobante de pago'
      });
      return;
    }

    setLoading(true);
    try {
      const reservaData: any = {
        habitacionId: habitacion.id,
        fechaInicio: fechaInicioLocal,
        fechaFin: fechaFinLocal,
        tipoReserva,
        cantidadPersonas,
        comprobante,
        servicios: serviciosSeleccionados
      };

      if (tipoReserva === 'hora') {
        reservaData.horaInicio = horaInicio;
        reservaData.horaFin = horaFin;
      }

      if (qr) {
        reservaData.qrId = qr.id;
      }

      const { token } = getAuthCookies();
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservaData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Reserva creada!',
          text: 'Redirigiendo a Mis Reservas...',
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          onClose();
          router.push('/mis-reservas');
        }, 2000);
      } else {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error || 'Error al crear la reserva'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    setComprobanteFileName(file.name);
    setComprobanteType(file.type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.type === 'application/pdf') {
        setComprobante(e.target?.result as string);
      } else {
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
          setComprobante(compressedBase64);
        };
        img.src = e.target?.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadQR = () => {
    if (qr) {
      const link = document.createElement('a');
      link.href = qr.imagen;
      link.download = `QR-${qr.nombre}.jpg`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-heading font-semibold">
            {step === 1 && 'Detalles de la Reserva'}
            {step === 2 && 'Confirmar Pago'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Habitación seleccionada</h4>
              <div className="text-sm">
                <div><strong>{habitacion.codigo} - {habitacion.nombre}</strong></div>
                <div>Capacidad: {habitacion.cantidadPersonas} persona{habitacion.cantidadPersonas !== 1 ? 's' : ''}</div>
                <div>Huéspedes: {cantidadPersonas} persona{cantidadPersonas !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-1" />
                  Fecha de entrada
                </label>
                <input
                  type="date"
                  value={fechaInicioLocal}
                  min={(() => {
                    const today = new Date();
                    today.setHours(today.getHours() - 4);
                    return today.toISOString().split('T')[0];
                  })()}
                  onChange={(e) => setFechaInicioLocal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-1" />
                  Fecha de salida
                </label>
                <input
                  type="date"
                  value={fechaFinLocal}
                  min={fechaInicioLocal || (() => {
                    const today = new Date();
                    today.setHours(today.getHours() - 4);
                    return today.toISOString().split('T')[0];
                  })()}
                  onChange={(e) => setFechaFinLocal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {tipoReserva === 'hora' && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-4 text-orange-800">Selecciona el horario</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TimeSelector
                    label="Hora de entrada"
                    value={horaInicio}
                    onChange={(nuevaHora) => {
                      setHoraInicio(nuevaHora);
                      calcularHoraFin(nuevaHora);
                    }}
                  />
                  
                  <TimeSelector
                    label="Hora de salida"
                    value={horaFin}
                    onChange={setHoraFin}
                  />
                </div>
                
                {horaInicio && horaFin && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Duración:</span>
                        <span className="font-semibold text-orange-600">
                          {(() => {
                            const inicio = new Date(`2000-01-01T${horaInicio}`);
                            const fin = new Date(`2000-01-01T${horaFin}`);
                            const horas = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60));
                            const minHoras = habitacion.horasMinimas || 3;
                            return `${horas} hora${horas !== 1 ? 's' : ''} ${horas < minHoras ? `(Mínimo ${minHoras}h)` : ''}`;
                          })()} 
                        </span>
                      </div>
                    </div>
                    

                    
                    {(() => {
                      const inicio = new Date(`2000-01-01T${horaInicio}`);
                      const fin = new Date(`2000-01-01T${horaFin}`);
                      const horas = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60));
                      const minHoras = habitacion.horasMinimas || 3;
                      return horas < minHoras ? (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-sm text-yellow-700">
                            <strong>Nota:</strong> La duración mínima es de {minHoras} horas
                          </div>
                        </div>
                      ) : null;
                    })()
                    }
                  </div>
                )}
              </div>
            )}

            {tipoReserva === 'hora' && habitacion.horasMinimas && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Mínimo {habitacion.horasMinimas} horas de reserva
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumen</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Tipo:</strong> {tipoReserva === 'hora' ? 'Por horas' : tipoReserva === 'noche' ? 'Por noche' : 'Por mes'}</div>
                <div><strong>Total estimado:</strong> <span className="text-xl font-bold text-orange-500">{calculateTotal()} Bs</span></div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerifyAvailability}
                disabled={loading || (tipoReserva === 'hora' && (() => {
                  if (!horaInicio || !horaFin) return true;
                  const inicio = new Date(`2000-01-01T${horaInicio}`);
                  const fin = new Date(`2000-01-01T${horaFin}`);
                  const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                  const minHoras = habitacion.horasMinimas || 3;
                  return horas < minHoras;
                })())}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
              >
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Detalles de la reserva</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Habitación:</strong> {habitacion.codigo} - {habitacion.nombre}</div>
                <div><strong>Fechas:</strong> {fechaInicioLocal} al {fechaFinLocal}</div>
                {tipoReserva === 'hora' && (
                  <div><strong>Horario:</strong> {horaInicio} - {horaFin}</div>
                )}
                <div><strong>Huéspedes:</strong> {cantidadPersonas} persona{cantidadPersonas !== 1 ? 's' : ''}</div>
                <div><strong>Tipo:</strong> {tipoReserva === 'hora' ? 'Por horas' : tipoReserva === 'noche' ? 'Por noche' : 'Por mes'}</div>
                <div><strong>Total:</strong> <span className="text-xl font-bold text-orange-500">{calculateTotal()} Bs</span></div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-800">Pago mediante QR</h4>
              <p className="text-sm text-blue-700">Realiza el pago escaneando el código QR y sube tu comprobante</p>
            </div>

            {qr && (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img src={qr.imagen} alt={qr.nombre} className="w-48 h-48 object-contain" />
                </div>
                <div className="mt-4">
                  <button
                    onClick={downloadQR}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Descargar QR
                  </button>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3">Sube tu comprobante de pago</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {comprobante ? (
                  <div className="space-y-3">
                    {comprobanteType === 'application/pdf' ? (
                      <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <FiFileText className="text-red-500" size={32} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{comprobanteFileName}</p>
                          <p className="text-xs text-gray-500">Archivo PDF</p>
                        </div>
                        <button
                          onClick={() => window.open(comprobante, '_blank')}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center space-x-1"
                        >
                          <FiEye size={14} />
                          <span>Ver</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <img src={comprobante} alt="Comprobante" className="max-w-full h-32 object-contain mx-auto" />
                        <button
                          onClick={() => window.open(comprobante, '_blank')}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center space-x-1 mx-auto"
                        >
                          <FiEye size={14} />
                          <span>Ver</span>
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setComprobante('');
                        setComprobanteFileName('');
                        setComprobanteType('');
                      }}
                      className="text-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <div>
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="comprobante"
                    />
                    <label
                      htmlFor="comprobante"
                      className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Subir Comprobante
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmReservation}
                disabled={!comprobante || loading}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
              >
                {loading ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}