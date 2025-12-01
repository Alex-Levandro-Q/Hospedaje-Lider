const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const obtenerReservas = async (req, res) => {
  try {
    const { estado, usuarioId, habitacionId, tipoReserva } = req.query;
    
    const where = {};
    if (estado) where.estado = estado;
    if (usuarioId) where.usuarioId = parseInt(usuarioId);
    if (habitacionId) where.habitacionId = parseInt(habitacionId);
    if (tipoReserva) where.tipoReserva = tipoReserva;
    
    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            numeroCarnet: true
          }
        },
        habitacion: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipoReserva: true,
            precioBase: true,
            precioHora: true,
            precioNoche: true,
            precioMes: true
          }
        },
        checkins: {
          orderBy: { fechaHora: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transformar datos para incluir checkIn y checkOut como campos directos
    const reservasTransformadas = reservas.map(reserva => {
      const checkIn = reserva.checkins.find(c => c.tipo === 'checkin');
      const checkOut = reserva.checkins.find(c => c.tipo === 'checkout');
      
      return {
        ...reserva,
        checkIn: checkIn?.fechaHora || null,
        checkOut: checkOut?.fechaHora || null
      };
    });
    
    res.json(reservasTransformadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerReserva = async (req, res) => {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            numeroCarnet: true,
            fotoCI1: true,
            fotoCI2: true
          }
        },
        habitacion: {
          include: {
            servicios: {
              include: {
                servicio: true
              }
            }
          }
        },
        checkins: {
          orderBy: { fechaHora: 'asc' }
        }
      }
    });
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    // Transformar datos para incluir checkIn y checkOut como campos directos
    const checkIn = reserva.checkins.find(c => c.tipo === 'checkin');
    const checkOut = reserva.checkins.find(c => c.tipo === 'checkout');
    
    const reservaTransformada = {
      ...reserva,
      checkIn: checkIn?.fechaHora || null,
      checkOut: checkOut?.fechaHora || null
    };
    
    res.json(reservaTransformada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearReserva = async (req, res) => {
  try {
    const { 
      fechaInicio, fechaFin, horaInicio, horaFin, habitacionId, tipoReserva, cantidadPersonas,
      comprobante, qrId, servicios 
    } = req.body;
    
    const usuarioId = req.usuario.id;
    
    if (!fechaInicio || !fechaFin || !habitacionId || !tipoReserva) {
      return res.status(400).json({ 
        error: 'Campos requeridos: fechaInicio, fechaFin, habitacionId, tipoReserva' 
      });
    }
    
    // Verificar que la habitación existe y está disponible
    const habitacion = await prisma.habitacion.findUnique({
      where: { id: parseInt(habitacionId) }
    });
    
    if (!habitacion || !habitacion.activa) {
      return res.status(400).json({ error: 'Habitación no disponible' });
    }
    
    // Calcular cantidad y precio total (usar fechas locales sin zona horaria)
    const fechaInicioDate = new Date(fechaInicio + 'T00:00:00');
    const fechaFinDate = new Date(fechaFin + 'T23:59:59');
    const diffTime = Math.abs(fechaFinDate.getTime() - fechaInicioDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let cantidad, precioUnitario;
    switch (tipoReserva) {
      case 'hora':
        if (horaInicio && horaFin) {
          const [startH, startM] = horaInicio.split(':').map(Number);
          const [endH, endM] = horaFin.split(':').map(Number);
          const startTime = startH * 60 + startM;
          const endTime = endH * 60 + endM;
          cantidad = Math.ceil((endTime - startTime) / 60);
          cantidad = Math.max(cantidad, habitacion.horasMinimas || 3);
        } else {
          cantidad = habitacion.horasMinimas || 3;
        }
        precioUnitario = habitacion.precioHora;
        break;
      case 'noche':
        cantidad = diffDays;
        precioUnitario = habitacion.precioNoche;
        break;
      case 'mes':
        cantidad = Math.ceil(diffDays / 30);
        precioUnitario = habitacion.precioMes;
        break;
      default:
        return res.status(400).json({ error: 'Tipo de reserva inválido' });
    }
    
    if (!precioUnitario) {
      return res.status(400).json({ error: 'Precio no disponible para este tipo de reserva' });
    }
    
    const montoTotal = precioUnitario * cantidad;
    
    // Calcular hora límite de checkout para día/mes
    let horaCheckout = null;
    if (['noche', 'mes'].includes(tipoReserva)) {
      horaCheckout = '12:00';
    }

    const reserva = await prisma.reserva.create({
      data: {
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        horaInicio,
        horaFin,
        horaCheckout,
        tipoReserva,
        cantidad,
        montoTotal,
        tipoPago: 'qr',
        comprobante,
        qrId: qrId ? parseInt(qrId) : null,
        usuarioId,
        habitacionId: parseInt(habitacionId)
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            numeroCarnet: true
          }
        },
        habitacion: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        qr: true
      }
    });
    
    // Agregar servicios si se proporcionan
    if (servicios && servicios.length > 0) {
      await prisma.reservaServicio.createMany({
        data: servicios.map(servicioId => ({
          reservaId: reserva.id,
          servicioId: parseInt(servicioId)
        }))
      });
    }
    
    res.status(201).json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cambiarEstadoReserva = async (req, res) => {
  try {
    const { estado } = req.body;
    
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada', 'liberada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado debe ser: pendiente, confirmada, cancelada, completada o liberada' 
      });
    }
    
    const reserva = await prisma.reserva.update({
      where: { id: parseInt(req.params.id) },
      data: { estado },
      include: {
        habitacion: true,
        usuario: {
          select: {
            nombre: true,
            apellidos: true,
            numeroCarnet: true
          }
        }
      }
    });
    
    // Si se confirma la reserva, marcar habitación como ocupada
    if (estado === 'confirmada') {
      await prisma.habitacion.update({
        where: { id: reserva.habitacionId },
        data: { estado: 'ocupada' }
      });
    }
    
    // Si se cancela, completa o libera, marcar habitación como disponible
    if (['cancelada', 'completada', 'liberada'].includes(estado)) {
      await prisma.habitacion.update({
        where: { id: reserva.habitacionId },
        data: { estado: 'disponible' }
      });
    }
    
    res.json({ message: 'Estado de reserva actualizado', reserva });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerReservasUsuario = async (req, res, userId = null) => {
  try {
    const targetUserId = userId || parseInt(req.params.id);
    
    const reservas = await prisma.reserva.findMany({
      where: { usuarioId: targetUserId },
      include: {
        habitacion: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            imagen1: true
          }
        },
        servicios: {
          include: {
            servicio: {
              select: {
                nombre: true
              }
            }
          }
        },
        qr: {
          select: {
            id: true,
            nombre: true,
            imagen: true
          }
        },
        checkins: {
          orderBy: { fechaHora: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transformar datos para incluir checkIn y checkOut como campos directos
    const reservasTransformadas = reservas.map(reserva => {
      const checkIn = reserva.checkins.find(c => c.tipo === 'checkin');
      const checkOut = reserva.checkins.find(c => c.tipo === 'checkout');
      
      return {
        ...reserva,
        checkIn: checkIn?.fechaHora || null,
        checkOut: checkOut?.fechaHora || null
      };
    });
    
    res.json(reservasTransformadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerReservasAdmin = async (req, res) => {
  try {
    const { estado, habitacionId } = req.query;
    
    const where = {};
    if (estado) where.estado = estado;
    if (habitacionId) where.habitacionId = parseInt(habitacionId);
    
    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            numeroCarnet: true,
            fotoCI1: true,
            fotoCI2: true
          }
        },
        habitacion: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            imagen1: true
          }
        },
        servicios: {
          include: {
            servicio: {
              select: {
                nombre: true
              }
            }
          }
        },
        qr: {
          select: {
            id: true,
            nombre: true,
            imagen: true
          }
        },
        checkins: {
          orderBy: { fechaHora: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transformar datos para incluir checkIn y checkOut como campos directos
    const reservasTransformadas = reservas.map(reserva => {
      const checkIn = reserva.checkins.find(c => c.tipo === 'checkin');
      const checkOut = reserva.checkins.find(c => c.tipo === 'checkout');
      
      return {
        ...reserva,
        checkIn: checkIn?.fechaHora || null,
        checkOut: checkOut?.fechaHora || null
      };
    });
    
    res.json(reservasTransformadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearReservaAdmin = async (req, res) => {
  try {
    const { 
      usuarioId, fechaInicio, fechaFin, horaInicio, horaFin, habitacionId, 
      tipoReserva, cantidadPersonas, comprobante 
    } = req.body;
    
    if (!usuarioId || !fechaInicio || !fechaFin || !habitacionId || !tipoReserva) {
      return res.status(400).json({ 
        error: 'Campos requeridos: usuarioId, fechaInicio, fechaFin, habitacionId, tipoReserva' 
      });
    }
    
    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuarioId) }
    });
    
    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar que la habitación existe y está disponible
    const habitacion = await prisma.habitacion.findUnique({
      where: { id: parseInt(habitacionId) }
    });
    
    if (!habitacion || !habitacion.activa) {
      return res.status(400).json({ error: 'Habitación no disponible' });
    }


    
    // Calcular cantidad y precio total
    const fechaInicioDate = new Date(fechaInicio + 'T00:00:00');
    const fechaFinDate = new Date(fechaFin + 'T23:59:59');
    const diffTime = Math.abs(fechaFinDate.getTime() - fechaInicioDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let cantidad, precioUnitario;
    switch (tipoReserva) {
      case 'hora':
        if (horaInicio && horaFin) {
          const [startH, startM] = horaInicio.split(':').map(Number);
          const [endH, endM] = horaFin.split(':').map(Number);
          const startTime = startH * 60 + startM;
          const endTime = endH * 60 + endM;
          cantidad = Math.ceil((endTime - startTime) / 60);
          cantidad = Math.max(cantidad, habitacion.horasMinimas || 3);
        } else {
          cantidad = habitacion.horasMinimas || 3;
        }
        precioUnitario = habitacion.precioHora;
        break;
      case 'noche':
        cantidad = diffDays;
        precioUnitario = habitacion.precioNoche;
        break;
      case 'mes':
        cantidad = Math.ceil(diffDays / 30);
        precioUnitario = habitacion.precioMes;
        break;
      default:
        return res.status(400).json({ error: 'Tipo de reserva inválido' });
    }
    
    if (!precioUnitario) {
      return res.status(400).json({ error: 'Precio no disponible para este tipo de reserva' });
    }
    
    const montoTotal = precioUnitario * cantidad;
    
    // Calcular hora límite de checkout para día/mes
    let horaCheckout = null;
    if (['noche', 'mes'].includes(tipoReserva)) {
      horaCheckout = '12:00';
    }

    const reserva = await prisma.reserva.create({
      data: {
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        horaInicio,
        horaFin,
        horaCheckout,
        tipoReserva,
        cantidad,
        montoTotal,
        tipoPago: 'admin',
        comprobante: comprobante || 'admin-created',
        estado: 'confirmada', // Las reservas de admin se confirman automáticamente
        usuarioId: parseInt(usuarioId),
        habitacionId: parseInt(habitacionId)
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            numeroCarnet: true
          }
        },
        habitacion: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    });
    
    res.status(201).json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registrarCheckIn = async (req, res) => {
  try {
    const reservaId = parseInt(req.params.id);
    const registradoPor = req.usuario.id;
    
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { 
        habitacion: true,
        checkins: { where: { tipo: 'checkin' } }
      }
    });
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    if (reserva.estado !== 'confirmada') {
      return res.status(400).json({ error: 'Solo se puede hacer check-in a reservas confirmadas' });
    }
    
    if (reserva.checkins.length > 0) {
      return res.status(400).json({ error: 'Ya se registró el check-in para esta reserva' });
    }
    
    // Crear registro de check-in
    await prisma.checkInOut.create({
      data: {
        tipo: 'checkin',
        reservaId,
        usuarioId: reserva.usuarioId,
        registradoPor
      }
    });
    
    // Marcar habitación como ocupada
    await prisma.habitacion.update({
      where: { id: reserva.habitacionId },
      data: { estado: 'ocupada' }
    });
    
    const reservaActualizada = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellidos: true,
            numeroCarnet: true
          }
        },
        habitacion: true,
        checkins: true
      }
    });
    
    res.json({ message: 'Check-in registrado correctamente', reserva: reservaActualizada });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registrarCheckOut = async (req, res) => {
  try {
    const reservaId = parseInt(req.params.id);
    const registradoPor = req.usuario.id;
    
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { 
        habitacion: true,
        checkins: true
      }
    });
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    const checkIn = reserva.checkins.find(c => c.tipo === 'checkin');
    const checkOut = reserva.checkins.find(c => c.tipo === 'checkout');
    
    if (!checkIn) {
      return res.status(400).json({ error: 'Debe registrar check-in antes del check-out' });
    }
    
    if (checkOut) {
      return res.status(400).json({ error: 'Ya se registró el check-out para esta reserva' });
    }
    
    // Crear registro de check-out
    await prisma.checkInOut.create({
      data: {
        tipo: 'checkout',
        reservaId,
        usuarioId: reserva.usuarioId,
        registradoPor
      }
    });
    
    // Actualizar estado de reserva a completada
    await prisma.reserva.update({
      where: { id: reservaId },
      data: { estado: 'completada' }
    });
    
    // Marcar habitación como disponible
    await prisma.habitacion.update({
      where: { id: reserva.habitacionId },
      data: { estado: 'disponible' }
    });
    
    const reservaActualizada = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellidos: true,
            numeroCarnet: true
          }
        },
        habitacion: true,
        checkins: true
      }
    });
    
    res.json({ message: 'Check-out registrado correctamente', reserva: reservaActualizada });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerReservas,
  obtenerReserva,
  crearReserva,
  cambiarEstadoReserva,
  obtenerReservasUsuario,
  obtenerReservasAdmin,
  crearReservaAdmin,
  registrarCheckIn,
  registrarCheckOut
};