const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const obtenerHabitaciones = async (req, res) => {
  try {
    const { activa, estado, tipoReserva } = req.query;
    
    const where = {};
    if (activa !== undefined) where.activa = activa === 'true';
    if (estado) where.estado = estado;
    if (tipoReserva) where.tipoReserva = tipoReserva;
    
    const habitaciones = await prisma.habitacion.findMany({
      where,
      include: {
        servicios: {
          include: {
            servicio: true
          }
        },
        _count: {
          select: { reservas: true }
        }
      },
      orderBy: { codigo: 'asc' }
    });
    
    res.json(habitaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerHabitacion = async (req, res) => {
  try {
    const habitacion = await prisma.habitacion.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        servicios: {
          include: {
            servicio: true
          }
        },
        reservas: {
          where: {
            estado: { in: ['pendiente', 'confirmada'] }
          },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
                numeroCarnet: true
              }
            }
          }
        }
      }
    });
    
    if (!habitacion) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    
    res.json(habitacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearHabitacion = async (req, res) => {
  try {
    const {
      codigo, nombre, tipoReserva, precioBase, precioHora, precioNoche, precioMes,
      horasMinimas, cantidadPersonas, imagen1, imagen2, imagen3, descripcion, servicios
    } = req.body;
    
    if (!codigo || !nombre) {
      return res.status(400).json({ 
        error: 'Campos requeridos: codigo, nombre' 
      });
    }
    
    // Validar que al menos un tipo de reserva esté disponible
    if (!precioHora && !precioNoche && !precioMes) {
      return res.status(400).json({ 
        error: 'Debe especificar al menos un precio (hora, noche o mes)' 
      });
    }
    
    const habitacion = await prisma.habitacion.create({
      data: {
        codigo, nombre, 
        tipoReserva: precioHora && precioNoche && precioMes ? 'multiple' : 
                    precioHora ? 'hora' : precioNoche ? 'noche' : 'mes',
        precioBase: precioHora || precioNoche || precioMes,
        precioHora, precioNoche, precioMes,
        horasMinimas: precioHora ? (horasMinimas || 3) : null,
        cantidadPersonas: cantidadPersonas || 1,
        imagen1, imagen2, imagen3, descripcion,
        servicios: {
          create: servicios?.map(servicioId => ({
            servicioId: parseInt(servicioId)
          })) || []
        }
      },
      include: {
        servicios: {
          include: {
            servicio: true
          }
        }
      }
    });
    
    res.status(201).json(habitacion);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El código de habitación ya existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

const editarHabitacion = async (req, res) => {
  try {
    const {
      codigo, nombre, tipoReserva, precioBase, precioHora, precioNoche, precioMes,
      horasMinimas, cantidadPersonas, imagen1, imagen2, imagen3, descripcion, servicios
    } = req.body;
    
    const habitacion = await prisma.habitacion.update({
      where: { id: parseInt(req.params.id) },
      data: {
        codigo, nombre, tipoReserva, precioBase, precioHora, precioNoche, precioMes,
        horasMinimas, cantidadPersonas, imagen1, imagen2, imagen3, descripcion
      }
    });
    
    // Actualizar servicios si se proporcionan
    if (servicios !== undefined) {
      await prisma.habitacionServicio.deleteMany({
        where: { habitacionId: parseInt(req.params.id) }
      });
      
      if (servicios.length > 0) {
        await prisma.habitacionServicio.createMany({
          data: servicios.map(servicioId => ({
            habitacionId: parseInt(req.params.id),
            servicioId: parseInt(servicioId)
          }))
        });
      }
    }
    
    const habitacionActualizada = await prisma.habitacion.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        servicios: {
          include: {
            servicio: true
          }
        }
      }
    });
    
    res.json(habitacionActualizada);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El código de habitación ya existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

const cambiarEstadoHabitacion = async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!['disponible', 'ocupada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado debe ser: disponible u ocupada' });
    }
    
    const habitacion = await prisma.habitacion.update({
      where: { id: parseInt(req.params.id) },
      data: { estado }
    });
    
    res.json({ message: 'Estado actualizado', habitacion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cambiarEstadoLimpieza = async (req, res) => {
  try {
    const { limpieza } = req.body;
    
    const habitacion = await prisma.habitacion.update({
      where: { id: parseInt(req.params.id) },
      data: { limpieza: Boolean(limpieza) }
    });
    
    res.json({ message: 'Estado de limpieza actualizado', habitacion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cambiarActivaHabitacion = async (req, res) => {
  try {
    const { activa } = req.body;
    
    const habitacion = await prisma.habitacion.update({
      where: { id: parseInt(req.params.id) },
      data: { activa: Boolean(activa) }
    });
    
    res.json({ 
      message: `Habitación ${activa ? 'activada' : 'desactivada'}`, 
      habitacion 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerHabitacionesDisponibles = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, cantidadPersonas, tipoReserva, servicios, horaInicio, horaFin, habitacionId } = req.query;
    
    console.log('Parámetros recibidos:', { fechaInicio, fechaFin, cantidadPersonas, tipoReserva, servicios, horaInicio, horaFin, habitacionId });
    
    // Consulta básica de habitaciones activas
    const where = {
      activa: true
    };
    
    // Si se especifica una habitación específica, filtrar solo por esa
    if (habitacionId && !isNaN(parseInt(habitacionId))) {
      where.id = parseInt(habitacionId);
    }
    
    // Filtrar por capacidad
    if (cantidadPersonas && !isNaN(parseInt(cantidadPersonas))) {
      where.cantidadPersonas = { gte: parseInt(cantidadPersonas) };
    }
    
    // Filtrar por tipo de reserva - mostrar habitaciones que TENGAN ese tipo de precio
    if (tipoReserva) {
      if (tipoReserva === 'hora') {
        where.precioHora = { not: null };
      } else if (tipoReserva === 'noche') {
        where.precioNoche = { not: null };
      } else if (tipoReserva === 'mes') {
        where.precioMes = { not: null };
      }
    }
    
    console.log('Filtros aplicados:', where);
    
    // Obtener habitaciones
    let habitaciones = await prisma.habitacion.findMany({
      where,
      include: {
        servicios: {
          include: {
            servicio: true
          }
        }
      },
      orderBy: { codigo: 'asc' }
    });
    
    console.log(`Habitaciones encontradas: ${habitaciones.length}`);
    console.log('Habitaciones:', habitaciones.map(h => ({ id: h.id, codigo: h.codigo, nombre: h.nombre, precioHora: h.precioHora, precioNoche: h.precioNoche })));
    
    // Filtrar por servicios si se especifican
    if (servicios && servicios.trim() && servicios !== '') {
      const serviciosArray = servicios.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (serviciosArray.length > 0) {
        habitaciones = habitaciones.filter(h => 
          serviciosArray.every(servicioId => 
            h.servicios.some(hs => hs.servicio.id === servicioId)
          )
        );
      }
    }
    
    // Filtrar habitaciones que NO tengan reservas activas en el rango de fechas
    if (fechaInicio && fechaFin) {
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);
      
      const habitacionesConReservas = await prisma.reserva.findMany({
        where: {
          estado: { in: ['confirmada', 'checkin'] },
          OR: [
            {
              fechaInicio: { lte: fechaFinDate },
              fechaFin: { gte: fechaInicioDate }
            }
          ]
        },
        select: {
          habitacionId: true
        }
      });
      
      const habitacionesOcupadas = habitacionesConReservas.map(r => r.habitacionId);
      habitaciones = habitaciones.filter(h => !habitacionesOcupadas.includes(h.id));
    }
    
    res.json(habitaciones);
  } catch (error) {
    console.error('Error en obtenerHabitacionesDisponibles:', error);
    res.status(500).json({ error: 'Error al obtener habitaciones: ' + error.message });
  }
};

const obtenerHorariosSugeridos = async (req, res) => {
  try {
    const habitacionId = parseInt(req.params.id);
    const { fecha } = req.query;
    
    if (!fecha) {
      return res.status(400).json({ error: 'Fecha requerida' });
    }
    
    // Obtener reservas existentes para la fecha
    const fechaInicio = new Date(fecha + 'T00:00:00');
    const fechaFin = new Date(fecha + 'T23:59:59');
    
    const reservasExistentes = await prisma.reserva.findMany({
      where: {
        habitacionId,
        estado: { in: ['pendiente', 'confirmada'] },
        fechaInicio: {
          lte: fechaFin
        },
        fechaFin: {
          gte: fechaInicio
        },
        tipoReserva: 'hora'
      },
      select: {
        horaInicio: true,
        horaFin: true
      },
      orderBy: {
        horaInicio: 'asc'
      }
    });
    
    // Generar horarios sugeridos
    const horariosOcupados = reservasExistentes.map(r => ({
      inicio: r.horaInicio,
      fin: r.horaFin
    }));
    
    // Buscar primer slot disponible de 3 horas
    let horarioSugerido = null;
    for (let hora = 8; hora <= 20; hora++) {
      const inicioSugerido = `${hora.toString().padStart(2, '0')}:00`;
      const finSugerido = `${(hora + 3).toString().padStart(2, '0')}:00`;
      
      const conflicto = horariosOcupados.some(ocupado => 
        (inicioSugerido < ocupado.fin && finSugerido > ocupado.inicio)
      );
      
      if (!conflicto) {
        horarioSugerido = {
          inicio: inicioSugerido,
          fin: finSugerido
        };
        break;
      }
    }
    
    res.json({ horarioSugerido });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerHabitaciones,
  obtenerHabitacion,
  crearHabitacion,
  editarHabitacion,
  cambiarEstadoHabitacion,
  cambiarEstadoLimpieza,
  cambiarActivaHabitacion,
  obtenerHabitacionesDisponibles,
  obtenerHorariosSugeridos
};