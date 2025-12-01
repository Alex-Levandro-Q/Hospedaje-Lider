const express = require('express');
const { 
  obtenerUsuarios, 
  obtenerUsuario, 
  crearUsuario, 
  editarUsuario, 
  cambiarEstadoUsuario,
  cambiarPassword,
  actualizarDocumentos
} = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middleware/auth');

const router = express.Router();

// Obtener usuarios (requiere autenticación)
router.get('/', obtenerUsuarios);

// Obtener usuario por ID
router.get('/:id', verificarToken, obtenerUsuario);

// Crear usuario (solo gerente/administrador)
router.post('/', verificarToken, verificarRol(['gerente', 'administrador']), crearUsuario);

// Editar usuario
router.put('/:id', verificarToken, verificarRol(['gerente', 'administrador']), editarUsuario);

// Cambiar estado de usuario
router.patch('/:id/estado', verificarToken, verificarRol(['gerente', 'administrador']), cambiarEstadoUsuario);
router.patch('/:id', verificarToken, verificarRol(['gerente', 'administrador']), cambiarEstadoUsuario);

// Cambiar contraseña (usuario propio)
router.post('/change-password', verificarToken, cambiarPassword);

// Actualizar documentos (usuario propio)
router.post('/update-documents', verificarToken, actualizarDocumentos);

module.exports = router;