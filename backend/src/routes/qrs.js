const express = require('express');
const { 
  obtenerQRs, 
  obtenerQR, 
  crearQR, 
  editarQR, 
  cambiarEstadoQR 
} = require('../controllers/qrController');
const { verificarToken, verificarRol } = require('../middleware/auth');

const router = express.Router();

// Obtener QRs (requiere autenticación)
router.get('/', verificarToken, obtenerQRs);

// Obtener QR por ID
router.get('/:id', verificarToken, obtenerQR);

// Crear QR (solo gerente/administrador)
router.post('/', verificarToken, verificarRol(['gerente', 'administrador']), crearQR);

// Editar QR (solo gerente/administrador)
router.put('/:id', verificarToken, verificarRol(['gerente', 'administrador']), editarQR);

// Cambiar estado de QR (solo gerente/administrador)
router.patch('/:id/estado', verificarToken, verificarRol(['gerente', 'administrador']), cambiarEstadoQR);

module.exports = router;