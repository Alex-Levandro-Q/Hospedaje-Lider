const express = require('express');
const {
  obtenerServicios,
  obtenerServicio,
  crearServicio,
  editarServicio,
  cambiarEstadoServicio
} = require('../controllers/servicioController');
const { verificarToken, verificarRol } = require('../middleware/auth');

const router = express.Router();

// Obtener servicios
router.get('/', obtenerServicios);

// Obtener servicio por ID
router.get('/:id', obtenerServicio);

// Crear servicio (solo gerente/administrador)
router.post('/', verificarToken, verificarRol(['gerente', 'administrador']), crearServicio);

// Editar servicio
router.put('/:id', verificarToken, verificarRol(['gerente', 'administrador']), editarServicio);

// Cambiar estado de servicio
router.patch('/:id/estado', verificarToken, verificarRol(['gerente', 'administrador']), cambiarEstadoServicio);
router.patch('/:id', verificarToken, verificarRol(['gerente', 'administrador']), cambiarEstadoServicio);

module.exports = router;