const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const obtenerEstadisticas = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAno = new Date(hoy.getFullYear(), 0, 1);
    const hoyStr = hoy.toISOString().split('T')[0];

    // Obtener usuarios
    const totalUsuarios = await prisma.usuario.count();
    const totalClientes = await prisma.usuario.count({
      where: { rol: 'cliente' }
    });

    // Obtener habitaciones
    const totalHabitaciones = await prisma.habitacion.count();
    const habitacionesMantenimiento = await prisma.habitacion.count({
      where: {
        OR: [
          { limpieza: true },
          { activa: false }
        ]
      }
    });

    // Obtener reservas activas hoy
    const reservasActivas = await prisma.reserva.count({
      where: {
        estado: { in: ['confirmada', 'checkin'] },
        fechaInicio: { lte: new Date(hoyStr + 'T23:59:59') },
        fechaFin: { gte: new Date(hoyStr + 'T00:00:00') }
      }
    });

    const habitacionesOcupadas = reservasActivas;
    const habitacionesDisponibles = Math.max(0, totalHabitaciones - habitacionesOcupadas);

    // Estados de reservas
    const totalReservas = await prisma.reserva.count();
    const reservasPendientes = await prisma.reserva.count({
      where: { estado: 'pendiente' }
    });
    const reservasConfirmadas = await prisma.reserva.count({
      where: { estado: 'confirmada' }
    });
    const reservasCompletadas = await prisma.reserva.count({
      where: { estado: 'completada' }
    });

    // Reservas de hoy
    const reservasHoy = await prisma.reserva.count({
      where: {
        fechaInicio: {
          gte: new Date(hoyStr + 'T00:00:00'),
          lte: new Date(hoyStr + 'T23:59:59')
        }
      }
    });

    // Check-ins y check-outs de hoy
    const checkInsHoy = await prisma.reserva.count({
      where: {
        fechaInicio: {
          gte: new Date(hoyStr + 'T00:00:00'),
          lte: new Date(hoyStr + 'T23:59:59')
        },
        estado: 'confirmada'
      }
    });

    const checkOutsHoy = await prisma.reserva.count({
      where: {
        fechaFin: {
          gte: new Date(hoyStr + 'T00:00:00'),
          lte: new Date(hoyStr + 'T23:59:59')
        }
      }
    });

    // Ganancias basadas en checkins (cuando se hace check-in se considera pagado)
    const checkinsRealizados = await prisma.checkInOut.findMany({
      where: {
        tipo: 'checkin'
      },
      select: {
        fechaHora: true,
        reserva: {
          select: {
            montoTotal: true
          }
        }
      }
    });

    // Calcular ganancias del mes (todos los checkins)
    const gananciasDelMes = checkinsRealizados.reduce((sum, c) => {
      return sum + parseFloat(c.reserva.montoTotal || 0);
    }, 0);

    // Calcular ganancias del día (checkins de hoy)
    const gananciasDelDia = checkinsRealizados
      .filter(c => {
        const fechaCheckin = new Date(c.fechaHora).toISOString().split('T')[0];
        return fechaCheckin === hoyStr;
      })
      .reduce((sum, c) => sum + parseFloat(c.reserva.montoTotal || 0), 0);

    // Calcular ganancias del año
    const gananciasDelAno = checkinsRealizados
      .filter(c => new Date(c.fechaHora).getFullYear() === hoy.getFullYear())
      .reduce((sum, c) => sum + parseFloat(c.reserva.montoTotal || 0), 0);

    // Ganancias últimos 12 meses
    const gananciasUltimos12Meses = Array(12).fill(0);
    checkinsRealizados.forEach(c => {
      const fecha = new Date(c.fechaHora);
      if (fecha.getFullYear() === hoy.getFullYear()) {
        const mesIndex = fecha.getMonth();
        gananciasUltimos12Meses[mesIndex] += parseFloat(c.reserva.montoTotal || 0);
      }
    });

    // Ocupación promedio
    const ocupacionPromedio = totalHabitaciones > 0 ? (habitacionesOcupadas / totalHabitaciones) * 100 : 0;

    const estadisticas = {
      totalUsuarios,
      totalClientes,
      totalReservas,
      reservasPendientes,
      reservasConfirmadas,
      reservasCompletadas,
      habitacionesDisponibles,
      habitacionesOcupadas,
      habitacionesMantenimiento,
      gananciasDelMes,
      gananciasDelDia,
      gananciasDelAno,
      reservasHoy,
      checkInsHoy,
      checkOutsHoy,
      ocupacionPromedio,
      gananciasUltimos12Meses
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerEstadisticas
};