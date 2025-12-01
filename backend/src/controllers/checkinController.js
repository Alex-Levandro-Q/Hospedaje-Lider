const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const registrarCheckIn = async (req, res) => {
  try {
    const { reservaId, observaciones } = req.body;
    const registradoPor = req.usuario.id;

    if (!reservaId) {
      return res.status(400).json({ error: 'ID de reserva requerido' });
    }

    // Verificar que la reserva existe y está confirmada
    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(reservaId) },
      include: { 
        usuario: true,
        habitacion: true,
        checkins: true
      }
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (reserva.estado !== 'confirmada') {
      return res.status(400).json({ error: 'La reserva debe estar confirmada para hacer check-in' });
    }

    // Verificar que no hay un check-in previo sin check-out
    const checkinActivo = reserva.checkins.find(c => c.tipo === 'checkin' && 
      !reserva.checkins.some(co => co.tipo === 'checkout' && co.createdAt > c.createdAt));

    if (checkinActivo) {
      return res.status(400).json({ error: 'Ya existe un check-in activo para esta reserva' });
    }

    // Registrar check-in
    const checkin = await prisma.checkInOut.create({
      data: {
        tipo: 'checkin',
        observaciones,
        reservaId: parseInt(reservaId),
        usuarioId: reserva.usuarioId,
        registradoPor
      },
      include: {
        reserva: {
          include: {
            habitacion: true,
            usuario: true
          }
        }
      }
    });

    // Marcar habitación como ocupada
    await prisma.habitacion.update({
      where: { id: reserva.habitacionId },
      data: { estado: 'ocupada' }
    });

    res.status(201).json({ 
      message: 'Check-in registrado exitosamente',
      checkin 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registrarCheckOut = async (req, res) => {
  try {
    const { reservaId, observaciones } = req.body;
    const registradoPor = req.usuario.id;

    if (!reservaId) {
      return res.status(400).json({ error: 'ID de reserva requerido' });
    }

    // Verificar que la reserva existe
    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(reservaId) },
      include: { 
        usuario: true,
        habitacion: true,
        checkins: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Verificar que hay un check-in activo
    const ultimoCheckin = reserva.checkins.find(c => c.tipo === 'checkin');
    const ultimoCheckout = reserva.checkins.find(c => c.tipo === 'checkout');

    if (!ultimoCheckin || (ultimoCheckout && ultimoCheckout.createdAt > ultimoCheckin.createdAt)) {
      return res.status(400).json({ error: 'No hay un check-in activo para esta reserva' });
    }

    // Registrar check-out
    const checkout = await prisma.checkInOut.create({
      data: {
        tipo: 'checkout',
        observaciones,
        reservaId: parseInt(reservaId),
        usuarioId: reserva.usuarioId,
        registradoPor
      },
      include: {
        reserva: {
          include: {
            habitacion: true,
            usuario: true
          }
        }
      }
    });

    // Liberar habitación y completar reserva
    await prisma.habitacion.update({
      where: { id: reserva.habitacionId },
      data: { estado: 'disponible' }
    });

    await prisma.reserva.update({
      where: { id: parseInt(reservaId) },
      data: { estado: 'completada' }
    });

    res.status(201).json({ 
      message: 'Check-out registrado exitosamente. Habitación liberada.',
      checkout 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerCheckIns = async (req, res) => {
  try {
    const { reservaId, tipo, fechaDesde, fechaHasta } = req.query;
    
    const where = {};
    if (reservaId) where.reservaId = parseInt(reservaId);
    if (tipo) where.tipo = tipo;
    if (fechaDesde || fechaHasta) {
      where.fechaHora = {};
      if (fechaDesde) where.fechaHora.gte = new Date(fechaDesde);
      if (fechaHasta) where.fechaHora.lte = new Date(fechaHasta);
    }

    const checkins = await prisma.checkInOut.findMany({
      where,
      include: {
        reserva: {
          include: {
            habitacion: {
              select: {
                codigo: true,
                nombre: true
              }
            },
            usuario: {
              select: {
                nombre: true,
                apellidos: true,
                numeroCarnet: true
              }
            }
          }
        },
        registrador: {
          select: {
            nombre: true,
            apellidos: true
          }
        }
      },
      orderBy: { fechaHora: 'desc' }
    });

    res.json(checkins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerEstadoReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(id) },
      include: {
        checkins: {
          orderBy: { createdAt: 'desc' },
          include: {
            registrador: {
              select: {
                nombre: true,
                apellidos: true
              }
            }
          }
        },
        habitacion: {
          select: {
            codigo: true,
            nombre: true,
            estado: true
          }
        },
        usuario: {
          select: {
            nombre: true,
            apellidos: true,
            numeroCarnet: true
          }
        }
      }
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Determinar estado actual
    const ultimoCheckin = reserva.checkins.find(c => c.tipo === 'checkin');
    const ultimoCheckout = reserva.checkins.find(c => c.tipo === 'checkout');
    
    let estadoActual = 'sin_checkin';
    if (ultimoCheckin && (!ultimoCheckout || ultimoCheckout.createdAt < ultimoCheckin.createdAt)) {
      estadoActual = 'checkin_activo';
    } else if (ultimoCheckout) {
      estadoActual = 'checkout_completado';
    }

    // Calcular hora límite de checkout para día/mes
    let horaLimiteCheckout = null;
    if (['noche', 'mes'].includes(reserva.tipoReserva)) {
      horaLimiteCheckout = '12:00';
    }

    res.json({
      ...reserva,
      estadoActual,
      horaLimiteCheckout
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registrarCheckIn,
  registrarCheckOut,
  obtenerCheckIns,
  obtenerEstadoReserva
};