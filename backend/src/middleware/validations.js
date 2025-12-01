const validarUsuario = (req, res, next) => {
  const { nombre, apellidos, fechaNac, numeroCarnet, password } = req.body;
  
  if (!nombre || !apellidos || !fechaNac || !numeroCarnet || !password) {
    return res.status(400).json({ 
      error: 'Campos requeridos: nombre, apellidos, fechaNac, numeroCarnet, password' 
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 6 caracteres' 
    });
  }
  
  const rolesValidos = ['administrador', 'cliente', 'gerente'];
  if (req.body.rol && !rolesValidos.includes(req.body.rol)) {
    return res.status(400).json({ 
      error: 'Rol debe ser: administrador, cliente o gerente' 
    });
  }
  
  next();
};

module.exports = { validarUsuario };