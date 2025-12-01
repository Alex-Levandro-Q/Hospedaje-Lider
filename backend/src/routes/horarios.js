const express = require('express');
const { obtenerHorariosDisponibles } = require('../controllers/horariosController');

const router = express.Router();

router.get('/disponibles', obtenerHorariosDisponibles);

module.exports = router;