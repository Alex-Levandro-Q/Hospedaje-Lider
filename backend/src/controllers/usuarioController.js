const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const obtenerUsuarios = async (req, res) => {
  try {
    console.log('Getting usuarios...');
    const { activo, rol } = req.query;
    console.log('Query params:', { activo, rol });
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (rol) where.rol = rol;
    
    console.log('Where clause:', where);
    
    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        email: true,
        fechaNac: true,
        numeroCarnet: true,
        rol: true,
        fotoCI1: true,
        fotoCI2: true,
        activo: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Found usuarios:', usuarios.length);
    res.json(usuarios);
  } catch (error) {
    console.error('Error in obtenerUsuarios:', error);
    res.status(500).json({ error: error.message });
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        email: true,
        fechaNac: true,
        numeroCarnet: true,
        rol: true,
        fotoCI1: true,
        fotoCI2: true,
        activo: true,
        createdAt: true,
        reservas: {
          include: {
            habitacion: true
          }
        }
      }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, email, fechaNac, numeroCarnet, rol, password, fotoCI1, fotoCI2 } = req.body;
    
    const emailRequerido = rol !== 'cliente';
    
    if (!nombre || !apellidos || !fechaNac || !numeroCarnet || !password || (emailRequerido && !email)) {
      const camposRequeridos = emailRequerido 
        ? 'nombre, apellidos, email, fechaNac, numeroCarnet, password'
        : 'nombre, apellidos, fechaNac, numeroCarnet, password';
      return res.status(400).json({ 
        error: `Campos requeridos: ${camposRequeridos}` 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    const rolesValidos = ['administrador', 'gerente', 'cliente'];
    if (rol && !rolesValidos.includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol debe ser: administrador, gerente o cliente' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellidos,
        email,
        fechaNac: new Date(fechaNac),
        numeroCarnet,
        rol: rol || 'cliente',
        password: hashedPassword,
        fotoCI1,
        fotoCI2
      },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        email: true,
        fechaNac: true,
        numeroCarnet: true,
        rol: true,
        fotoCI1: true,
        fotoCI2: true,
        activo: true,
        createdAt: true
      }
    });
    
    res.status(201).json(usuario);
  } catch (error) {
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      if (error.meta?.target?.includes('numeroCarnet')) {
        return res.status(400).json({ error: 'El número de carnet ya está registrado' });
      }
      return res.status(400).json({ error: 'Email o carnet ya registrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

const editarUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, email, fechaNac, numeroCarnet, rol, password, fotoCI1, fotoCI2 } = req.body;
    
    const updateData = {
      nombre,
      apellidos,
      email,
      fechaNac: fechaNac ? new Date(fechaNac) : undefined,
      numeroCarnet,
      rol,
      fotoCI1,
      fotoCI2
    };
    
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const usuario = await prisma.usuario.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        email: true,
        fechaNac: true,
        numeroCarnet: true,
        rol: true,
        fotoCI1: true,
        fotoCI2: true,
        activo: true,
        updatedAt: true
      }
    });
    
    res.json(usuario);
  } catch (error) {
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      if (error.meta?.target?.includes('numeroCarnet')) {
        return res.status(400).json({ error: 'El número de carnet ya está registrado' });
      }
      return res.status(400).json({ error: 'Email o carnet ya registrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { activo } = req.body;
    
    const usuario = await prisma.usuario.update({
      where: { id: parseInt(req.params.id) },
      data: { activo: Boolean(activo) },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        activo: true
      }
    });
    
    res.json({ 
      message: `Usuario ${activo ? 'activado' : 'desactivado'}`, 
      usuario 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cambiarPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.usuario.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva contraseña son requeridas' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, usuario.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarDocumentos = async (req, res) => {
  try {
    const { fotoCarnetFrente, fotoCarnetReverso } = req.body;
    const userId = req.usuario.id;
    
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        fotoCI1: fotoCarnetFrente || null,
        fotoCI2: fotoCarnetReverso || null
      }
    });
    
    res.json({ message: 'Documentos actualizados exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuario,
  crearUsuario,
  editarUsuario,
  cambiarEstadoUsuario,
  cambiarPassword,
  actualizarDocumentos
};