const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

router.get('/estadisticas', verificarToken, verificarAdmin, dashboardController.obtenerEstadisticas);

module.exports = router;