const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { habitacionId, fecha } = req.query;
    
    if (!habitacionId || !fecha) {
      return res.status(400).json({ error: 'habitacionId y fecha son requeridos' });
    }

    // Obtener habitación para verificar horas mínimas
    const habitacion = await prisma.habitacion.findUnique({
      where: { id: parseInt(habitacionId) }
    });

    if (!habitacion) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }

    const minHoras = habitacion.horasMinimas || 3;

    // Obtener reservas existentes para esa fecha
    const fechaInicio = new Date(fecha + 'T00:00:00.000-04:00');
    const fechaFin = new Date(fecha + 'T23:59:59.999-04:00');

    const reservasExistentes = await prisma.reserva.findMany({
      where: {
        habitacionId: parseInt(habitacionId),
        estado: { in: ['pendiente', 'confirmada'] },
        fechaInicio: { lte: fechaFin },
        fechaFin: { gte: fechaInicio }
      },
      select: {
        tipoReserva: true,
        horaInicio: true,
        horaFin: true
      }
    });

    // Si hay reservas que no son por horas, el día está completamente ocupado
    const reservasCompletas = reservasExistentes.filter(r => r.tipoReserva !== 'hora');
    if (reservasCompletas.length > 0) {
      return res.json({ horariosDisponibles: [] });
    }

    // Obtener horarios ocupados por reservas por horas
    const horariosOcupados = reservasExistentes
      .filter(r => r.tipoReserva === 'hora' && r.horaInicio && r.horaFin)
      .map(r => ({
        inicio: r.horaInicio,
        fin: r.horaFin
      }))
      .sort((a, b) => a.inicio.localeCompare(b.inicio));

    // Generar horarios disponibles
    const horariosDisponibles = [];
    
    // Obtener fecha y hora local del sistema
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const isToday = fecha === todayStr;
    
    let horaActual = '06:00';
    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      // Redondear a los próximos 15 minutos
      const nextQuarter = Math.ceil(currentMinute / 15) * 15;
      if (nextQuarter >= 60) {
        horaActual = `${(currentHour + 1).toString().padStart(2, '0')}:00`;
      } else {
        horaActual = `${currentHour.toString().padStart(2, '0')}:${nextQuarter.toString().padStart(2, '0')}`;
      }
    }
    
    const horaLimite = '23:59'; // Fin del día

    while (horaActual <= horaLimite) {
      // Calcular hora de fin mínima
      const [hours, minutes] = horaActual.split(':').map(Number);
      const inicioDate = new Date();
      inicioDate.setHours(hours, minutes, 0, 0);
      const finDate = new Date(inicioDate.getTime() + (minHoras * 60 * 60 * 1000));
      const horaFinMinima = `${finDate.getHours().toString().padStart(2, '0')}:${finDate.getMinutes().toString().padStart(2, '0')}`;

      // Verificar si este horario está disponible
      const conflicto = horariosOcupados.find(ocupado => 
        (horaActual < ocupado.fin && horaFinMinima > ocupado.inicio)
      );

      if (!conflicto && horaFinMinima <= '23:59') {
        // Encontrar la hora máxima disponible hasta el próximo conflicto
        let horaMaxima = '23:59';
        const proximoConflicto = horariosOcupados.find(ocupado => ocupado.inicio > horaActual);
        if (proximoConflicto) {
          horaMaxima = proximoConflicto.inicio;
        }

        horariosDisponibles.push({
          inicio: horaActual,
          finMinimo: horaFinMinima,
          finMaximo: horaMaxima
        });
      }

      // Avanzar 15 minutos
      const nextMinutes = minutes + 15;
      if (nextMinutes >= 60) {
        const nextHour = hours + 1;
        if (nextHour >= 24) break;
        horaActual = `${nextHour.toString().padStart(2, '0')}:00`;
      } else {
        horaActual = `${hours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
      }
    }

    res.json({ horariosDisponibles, minHoras });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerHorariosDisponibles
};