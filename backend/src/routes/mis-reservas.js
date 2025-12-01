const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/mis-reservas - Obtener reservas del usuario autenticado
router.get('/', verificarToken, async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      where: {
        usuarioId: req.usuario.id
      },
      include: {
        habitacion: {
          select: {
            codigo: true,
            nombre: true,
            imagen1: true
          }
        },
        qr: {
          select: {
            nombre: true
          }
        },
        reservaServicios: {
          include: {
            servicio: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    });

    // Formatear las reservas para el frontend
    const reservasFormateadas = reservas.map(reserva => ({
      id: reserva.id,
      fechaInicio: reserva.fechaInicio,
      fechaFin: reserva.fechaFin,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin,
      tipoReserva: reserva.tipoReserva,
      cantidadPersonas: reserva.cantidadPersonas,
      montoTotal: reserva.montoTotal,
      estado: reserva.estado,
      comprobante: reserva.comprobante,
      fechaCreacion: reserva.fechaCreacion,
      habitacion: reserva.habitacion,
      qr: reserva.qr,
      servicios: reserva.reservaServicios.map(rs => rs.servicio.nombre)
    }));

    res.json(reservasFormateadas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;