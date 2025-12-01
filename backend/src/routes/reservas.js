const express = require('express');
const { 
  obtenerReservas, 
  obtenerReserva, 
  crearReserva, 
  cambiarEstadoReserva,
  obtenerReservasUsuario,
  obtenerReservasAdmin,
  crearReservaAdmin,
  registrarCheckIn,
  registrarCheckOut
} = require('../controllers/reservaController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas (requieren autenticación)
router.get('/', verificarToken, obtenerReservas);
router.get('/admin', verificarToken, obtenerReservasAdmin);
router.post('/admin', verificarToken, crearReservaAdmin);
router.get('/mis-reservas', verificarToken, (req, res) => obtenerReservasUsuario(req, res, req.usuario.id));
router.post('/:id/checkin', verificarToken, registrarCheckIn);
router.post('/:id/checkout', verificarToken, registrarCheckOut);
router.get('/usuario/:id', verificarToken, obtenerReservasUsuario);
router.patch('/:id/estado', verificarToken, cambiarEstadoReserva);
router.get('/:id', verificarToken, obtenerReserva);
router.post('/', verificarToken, crearReserva);

module.exports = router;