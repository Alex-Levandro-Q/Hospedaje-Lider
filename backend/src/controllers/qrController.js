const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const obtenerQRs = async (req, res) => {
  try {
    const { activo } = req.query;
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    
    const qrs = await prisma.qR.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(qrs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerQR = async (req, res) => {
  try {
    const qr = await prisma.qR.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!qr) {
      return res.status(404).json({ error: 'QR no encontrado' });
    }
    
    res.json(qr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearQR = async (req, res) => {
  try {
    const { nombre, imagen, fechaInicio, fechaFin } = req.body;
    
    if (!nombre || !imagen || !fechaInicio || !fechaFin) {
      return res.status(400).json({ 
        error: 'Campos requeridos: nombre, imagen, fechaInicio, fechaFin' 
      });
    }
    
    const qr = await prisma.qR.create({
      data: {
        nombre,
        imagen,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin)
      }
    });
    
    res.status(201).json(qr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editarQR = async (req, res) => {
  try {
    const { nombre, imagen, fechaInicio, fechaFin } = req.body;
    
    const updateData = {
      nombre,
      imagen,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined
    };
    
    const qr = await prisma.qR.update({
      where: { id: parseInt(req.params.id) },
      data: updateData
    });
    
    res.json(qr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cambiarEstadoQR = async (req, res) => {
  try {
    const { activo } = req.body;
    
    const qr = await prisma.qR.update({
      where: { id: parseInt(req.params.id) },
      data: { activo: Boolean(activo) }
    });
    
    res.json({ 
      message: `QR ${activo ? 'activado' : 'desactivado'}`, 
      qr 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerQRs,
  obtenerQR,
  crearQR,
  editarQR,
  cambiarEstadoQR
};