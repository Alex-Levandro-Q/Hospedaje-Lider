const express = require('express');
const router = express.Router();
const habitacionController = require('../controllers/habitacionController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/disponibles', habitacionController.obtenerHabitacionesDisponibles);

// Rutas protegidas
router.get('/', verificarToken, habitacionController.obtenerHabitaciones);
router.get('/:id', verificarToken, habitacionController.obtenerHabitacion);
router.post('/', verificarToken, verificarAdmin, habitacionController.crearHabitacion);
router.put('/:id', verificarToken, verificarAdmin, habitacionController.editarHabitacion);
router.patch('/:id/estado', verificarToken, verificarAdmin, habitacionController.cambiarEstadoHabitacion);
router.patch('/:id/limpieza', verificarToken, verificarAdmin, habitacionController.cambiarEstadoLimpieza);
router.patch('/:id/activa', verificarToken, verificarAdmin, habitacionController.cambiarActivaHabitacion);
router.get('/:id/horarios-sugeridos', verificarToken, habitacionController.obtenerHorariosSugeridos);

module.exports = router;