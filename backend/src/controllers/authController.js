const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { numeroCarnet, password } = req.body;
    
    if (!numeroCarnet || !password) {
      return res.status(400).json({ error: 'Email/carnet y contraseña son requeridos' });
    }
    
    // Buscar por email o por numeroCarnet
    let usuario = null;
    
    // Si contiene @ es email, sino es carnet
    if (numeroCarnet.includes('@')) {
      usuario = await prisma.usuario.findUnique({
        where: { email: numeroCarnet }
      });
    } else {
      usuario = await prisma.usuario.findUnique({
        where: { numeroCarnet }
      });
    }
    
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        numeroCarnet: usuario.numeroCarnet,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { nombre, apellidos, email, fechaNac, numeroCarnet, password, fotoCI1, fotoCI2 } = req.body;
    
    if (!nombre || !apellidos || !email || !fechaNac || !numeroCarnet || !password) {
      return res.status(400).json({ 
        error: 'Campos requeridos: nombre, apellidos, email, fechaNac, numeroCarnet, password' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
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
        rol: 'gerente',
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

module.exports = { login, register };