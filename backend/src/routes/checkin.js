const express = require('express');
const { 
  registrarCheckIn, 
  registrarCheckOut, 
  obtenerCheckIns,
  obtenerEstadoReserva
} = require('../controllers/checkinController');
const { verificarToken, verificarRol } = require('../middleware/auth');

const router = express.Router();

// Registrar check-in (solo gerente/administrador)
router.post('/checkin', verificarToken, verificarRol(['gerente', 'administrador']), registrarCheckIn);

// Registrar check-out (solo gerente/administrador)
router.post('/checkout', verificarToken, verificarRol(['gerente', 'administrador']), registrarCheckOut);

// Obtener historial de check-ins/check-outs
router.get('/', verificarToken, verificarRol(['gerente', 'administrador']), obtenerCheckIns);

// Obtener estado actual de una reserva
router.get('/reserva/:id', verificarToken, verificarRol(['gerente', 'administrador']), obtenerEstadoReserva);

module.exports = router;