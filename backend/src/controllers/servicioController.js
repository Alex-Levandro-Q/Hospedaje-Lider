const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const obtenerServicios = async (req, res) => {
  try {
    console.log('Getting servicios...');
    const { activo } = req.query;
    console.log('Query params:', { activo });
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    
    console.log('Where clause:', where);
    
    const servicios = await prisma.servicio.findMany({
      where,
      include: {
        _count: {
          select: { habitaciones: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
    
    console.log('Found servicios:', servicios.length);
    res.json(servicios);
  } catch (error) {
    console.error('Error in obtenerServicios:', error);
    res.status(500).json({ error: error.message });
  }
};

const obtenerServicio = async (req, res) => {
  try {
    const servicio = await prisma.servicio.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        habitaciones: {
          include: {
            habitacion: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                estado: true,
                activa: true
              }
            }
          }
        }
      }
    });
    
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearServicio = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del servicio es requerido' });
    }
    
    const servicio = await prisma.servicio.create({
      data: { 
        nombre: nombre.trim()
      }
    });
    
    res.status(201).json(servicio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editarServicio = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del servicio es requerido' });
    }
    
    const servicio = await prisma.servicio.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        nombre: nombre.trim()
      }
    });
    
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cambiarEstadoServicio = async (req, res) => {
  try {
    const { activo } = req.body;
    
    const servicio = await prisma.servicio.update({
      where: { id: parseInt(req.params.id) },
      data: { activo: Boolean(activo) }
    });
    
    res.json({ 
      message: `Servicio ${activo ? 'activado' : 'desactivado'}`, 
      servicio 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerServicios,
  obtenerServicio,
  crearServicio,
  editarServicio,
  cambiarEstadoServicio
};