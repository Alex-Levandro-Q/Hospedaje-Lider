const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const responderConsulta = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Obtener datos actuales para el contexto
    const habitaciones = await prisma.habitacion.findMany({
      where: { activa: true },
      include: { servicios: { include: { servicio: true } } }
    });
    
    const servicios = await prisma.servicio.findMany({
      where: { activo: true }
    });

    // Preparar contexto para Cohere
    const contextInfo = {
      habitaciones: habitaciones.map(h => ({
        nombre: h.nombre,
        codigo: h.codigo,
        precioHora: h.precioHora,
        precioNoche: h.precioNoche,
        precioMes: h.precioMes,
        capacidad: h.cantidadPersonas,
        servicios: h.servicios.map(s => s.servicio.nombre)
      })),
      servicios: servicios.map(s => s.nombre),
      horarios: {
        checkin: '14:00',
        checkout: '12:00',
        recepcion: '24 horas'
      },
      ubicacion: 'Zona Villa Fátima, La Paz - Bolivia',
      pagos: ['QR', 'Efectivo', 'Transferencia bancaria']
    };

    let respuesta = '';
    const mensajeLower = message.toLowerCase();

    // Consultas sobre disponibilidad
    if (mensajeLower.includes('disponible') || mensajeLower.includes('habitacion') || mensajeLower.includes('cuarto') || mensajeLower.includes('que habitaciones')) {
      // Detectar si pregunta por una fecha específica
      let fechaConsulta = new Date();
      let textoFecha = 'hoy';
      
      if (mensajeLower.includes('mañana') || mensajeLower.includes('manana')) {
        fechaConsulta = new Date(Date.now() + 24 * 60 * 60 * 1000);
        textoFecha = 'mañana';
      } else if (mensajeLower.includes('pasado mañana')) {
        fechaConsulta = new Date(Date.now() + 48 * 60 * 60 * 1000);
        textoFecha = 'pasado mañana';
      } else if (mensajeLower.includes('fin de semana') || mensajeLower.includes('weekend')) {
        // Calcular próximo fin de semana (sábado)
        const hoy = new Date();
        const diasHastaSabado = (6 - hoy.getDay()) % 7;
        fechaConsulta = new Date(Date.now() + (diasHastaSabado || 7) * 24 * 60 * 60 * 1000);
        textoFecha = 'el fin de semana';
      }
      
      const fechaStr = fechaConsulta.toISOString().split('T')[0];
      const fechaFin = new Date(fechaConsulta.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const todasHabitaciones = await prisma.habitacion.findMany({
        where: { activa: true },
        include: {
          reservas: {
            where: {
              estado: { in: ['confirmada', 'checkin'] },
              fechaInicio: { lte: new Date(fechaFin + 'T23:59:59') },
              fechaFin: { gte: new Date(fechaStr + 'T00:00:00') }
            },
            orderBy: { fechaFin: 'asc' }
          }
        }
      });

      const disponibles = todasHabitaciones.filter(h => h.reservas.length === 0);
      const ocupadas = todasHabitaciones.filter(h => h.reservas.length > 0);
      
      respuesta = `Estado de habitaciones para ${textoFecha}:\n\n`;
      
      if (disponibles.length > 0) {
        respuesta += `✅ DISPONIBLES (${disponibles.length}):\n`;
        disponibles.forEach(h => {
          respuesta += `• ${h.nombre} - ${h.cantidadPersonas} personas\n`;
        });
        respuesta += '\n';
      }
      
      if (ocupadas.length > 0) {
        respuesta += `🔴 OCUPADAS (${ocupadas.length}):\n`;
        ocupadas.forEach(h => {
          const reserva = h.reservas[0];
          const fechaFin = new Date(reserva.fechaFin);
          const horaFin = fechaFin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          const fechaFinStr = fechaFin.toLocaleDateString('es-ES');
          respuesta += `• ${h.nombre} - Se desocupa: ${fechaFinStr} a las ${horaFin}\n`;
        });
        respuesta += '\n';
      }
      
      if (disponibles.length > 0) {
        respuesta += '¿Te gustaría conocer los precios de las habitaciones disponibles?';
      } else {
        respuesta += 'Todas están ocupadas. ¿Te interesa saber cuándo se desocupan o consultar otras fechas?';
      }
    }
    
    // Consultas sobre precios
    else if (mensajeLower.includes('precio') || mensajeLower.includes('costo') || mensajeLower.includes('tarifa') || 
             mensajeLower === 'si' || mensajeLower === 'sí' || mensajeLower.includes('conocer los precios')) {
      const habitaciones = await prisma.habitacion.findMany({
        where: { activa: true },
        select: { nombre: true, precioHora: true, precioNoche: true, precioMes: true }
      });

      respuesta = 'Nuestros precios son:\n\n';
      habitaciones.slice(0, 3).forEach(h => {
        respuesta += `${h.nombre}:\n`;
        if (h.precioHora) respuesta += `- Por hora: ${h.precioHora} Bs\n`;
        if (h.precioNoche) respuesta += `- Por noche: ${h.precioNoche} Bs\n`;
        if (h.precioMes) respuesta += `- Por mes: ${h.precioMes} Bs\n`;
        respuesta += '\n';
      });
      respuesta += '¿Te interesa alguna habitación en particular?';
    }
    
    // Consultas sobre servicios
    else if (mensajeLower.includes('servicio') || mensajeLower.includes('incluye') || mensajeLower.includes('amenidad')) {
      const servicios = await prisma.servicio.findMany({
        where: { activo: true },
        select: { nombre: true }
      });

      respuesta = 'Nuestros servicios incluyen:\n\n';
      servicios.forEach(s => {
        respuesta += `• ${s.nombre}\n`;
      });
      respuesta += '\n¿Necesitas más información sobre algún servicio específico?';
    }
    
    // Consultas sobre reservas
    else if (mensajeLower.includes('reserva') || mensajeLower.includes('reservar') || mensajeLower.includes('booking')) {
      respuesta = 'Para hacer una reserva puedes:\n\n';
      respuesta += '1. Usar nuestro sistema web en la sección "Reservar"\n';
      respuesta += '2. Seleccionar fechas y tipo de habitación\n';
      respuesta += '3. Completar tus datos personales\n';
      respuesta += '4. Realizar el pago con QR o efectivo\n\n';
      respuesta += '¿Te gustaría que te ayude a encontrar una habitación disponible?';
    }
    
    // Consultas sobre horarios
    else if (mensajeLower.includes('horario') || mensajeLower.includes('check') || mensajeLower.includes('entrada') || mensajeLower.includes('salida')) {
      respuesta = 'Nuestros horarios son:\n\n';
      respuesta += '🕐 Check-in: A partir de las 14:00\n';
      respuesta += '🕐 Check-out: Hasta las 12:00\n';
      respuesta += '🕐 Recepción: 24 horas\n\n';
      respuesta += 'Para reservas por horas, el mínimo son 3 horas.';
    }
    
    // Consultas sobre ubicación
    else if (mensajeLower.includes('ubicacion') || mensajeLower.includes('direccion') || mensajeLower.includes('donde') || mensajeLower.includes('llegar')) {
      respuesta = 'Nos encontramos en:\n\n';
      respuesta += '📍 Zona Villa Fátima, La Paz - Bolivia\n';
      respuesta += '🚌 Cerca del transporte público\n';
      respuesta += '🚗 Fácil acceso en vehículo\n';
      respuesta += '🏪 Cerca de comercios y servicios\n\n';
      respuesta += '¿Necesitas indicaciones específicas para llegar?';
    }
    
    // Preguntas frecuentes
    else if (mensajeLower.includes('wifi') || mensajeLower.includes('internet')) {
      respuesta = 'Sí, ofrecemos WiFi gratuito en todas nuestras habitaciones y áreas comunes. La conexión es de alta velocidad y está disponible las 24 horas.';
    }
    
    else if (mensajeLower.includes('pago') || mensajeLower.includes('efectivo') || mensajeLower.includes('qr')) {
      respuesta = 'Aceptamos los siguientes métodos de pago:\n\n';
      respuesta += '💳 Pago con QR (recomendado)\n';
      respuesta += '💵 Efectivo\n';
      respuesta += '📱 Transferencias bancarias\n\n';
      respuesta += 'El pago se realiza al momento del check-in.';
    }
    
    else if (mensajeLower.includes('cancelar') || mensajeLower.includes('cancelacion')) {
      respuesta = 'Para cancelaciones:\n\n';
      respuesta += '• Puedes cancelar hasta 24 horas antes sin costo\n';
      respuesta += '• Cancelaciones el mismo día tienen penalización\n';
      respuesta += '• Contacta con recepción para procesar tu cancelación\n\n';
      respuesta += '¿Necesitas cancelar una reserva existente?';
    }
    
    // Saludo
    else if (mensajeLower.includes('hola') || mensajeLower.includes('buenos') || mensajeLower.includes('buenas')) {
      respuesta = '¡Hola! Bienvenido a Hospedaje Líder. Estoy aquí para ayudarte con:\n\n';
      respuesta += '• Consultar disponibilidad\n';
      respuesta += '• Información de precios\n';
      respuesta += '• Servicios incluidos\n';
      respuesta += '• Proceso de reserva\n';
      respuesta += '• Horarios y ubicación\n\n';
      respuesta += '¿En qué puedo ayudarte hoy?';
    }
    
    // Respuestas de confirmación
    else if (mensajeLower === 'si' || mensajeLower === 'sí' || mensajeLower === 'yes' || mensajeLower === 'ok') {
      respuesta = 'Nuestros precios son:\n\n';
      habitaciones.slice(0, 3).forEach(h => {
        respuesta += `${h.nombre}:\n`;
        if (h.precioHora) respuesta += `- Por hora: ${h.precioHora} Bs\n`;
        if (h.precioNoche) respuesta += `- Por noche: ${h.precioNoche} Bs\n`;
        if (h.precioMes) respuesta += `- Por mes: ${h.precioMes} Bs\n`;
        respuesta += '\n';
      });
      respuesta += '¿Te interesa alguna habitación en particular para hacer una reserva?';
    }
    
    // Respuesta por defecto
    else {
      // Intentar respuesta específica basada en palabras clave
      if (mensajeLower.includes('4 personas') || mensajeLower.includes('cuatro personas') || 
          (mensajeLower.includes('personas') && (mensajeLower.includes('4') || mensajeLower.includes('cuatro')))) {
        
        // Detectar fecha específica para la consulta
        let fechaConsulta = new Date();
        let textoFecha = 'hoy';
        
        if (mensajeLower.includes('mañana') || mensajeLower.includes('manana')) {
          fechaConsulta = new Date(Date.now() + 24 * 60 * 60 * 1000);
          textoFecha = 'mañana';
        } else if (mensajeLower.includes('fin de semana') || mensajeLower.includes('weekend')) {
          const hoy = new Date();
          const diasHastaSabado = (6 - hoy.getDay()) % 7;
          fechaConsulta = new Date(Date.now() + (diasHastaSabado || 7) * 24 * 60 * 60 * 1000);
          textoFecha = 'el fin de semana';
        }
        
        const habitacionesGrandes = habitaciones.filter(h => h.cantidadPersonas >= 4);
        
        if (habitacionesGrandes.length > 0) {
          // Verificar disponibilidad para la fecha específica
          const fechaStr = fechaConsulta.toISOString().split('T')[0];
          const fechaFin = new Date(fechaConsulta.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          const habitacionesConDisponibilidad = await Promise.all(
            habitacionesGrandes.map(async (h) => {
              const reservas = await prisma.reserva.findMany({
                where: {
                  habitacionId: h.id,
                  estado: { in: ['confirmada', 'checkin'] },
                  fechaInicio: { lte: new Date(fechaFin + 'T23:59:59') },
                  fechaFin: { gte: new Date(fechaStr + 'T00:00:00') }
                }
              });
              return { ...h, disponible: reservas.length === 0 };
            })
          );
          
          const disponibles = habitacionesConDisponibilidad.filter(h => h.disponible);
          
          respuesta = `Para 4 personas ${textoFecha}, `;
          if (disponibles.length > 0) {
            respuesta += `tenemos ${disponibles.length} habitaciones disponibles:\n\n`;
            disponibles.forEach(h => {
              respuesta += `🏠 ${h.nombre} - Capacidad: ${h.cantidadPersonas} personas\n`;
              if (h.precioNoche) respuesta += `💰 Noche: ${h.precioNoche} Bs\n`;
              if (h.precioMes) respuesta += `💰 Mes: ${h.precioMes} Bs\n`;
              respuesta += `\n`;
            });
            respuesta += `¿Te gustaría hacer una reserva?`;
          } else {
            respuesta += `no tenemos habitaciones disponibles. Te recomiendo:\n\n`;
            respuesta += `• Consultar para otras fechas\n`;
            respuesta += `• Contactar recepción al momento para cancelaciones de último minuto\n`;
            respuesta += `• Considerar habitaciones para menos personas si es flexible`;
          }
        } else {
          respuesta = `Para 4 personas, te recomiendo contactar directamente con recepción para verificar opciones disponibles. 📞`;
        }
      } else {
        respuesta = 'Entiendo que tienes una consulta. Te puedo ayudar con:\n\n';
        respuesta += '🏠 Disponibilidad de habitaciones\n';
        respuesta += '💰 Precios y tarifas\n';
        respuesta += '🛎️ Servicios incluidos\n';
        respuesta += '📅 Hacer reservas\n';
        respuesta += '🕐 Horarios de check-in/out\n';
        respuesta += '📍 Ubicación del hospedaje\n\n';
        respuesta += '¿Sobre qué tema te gustaría saber más?';
      }
    }

    res.json({ response: respuesta });
  } catch (error) {
    console.error('Error en chatbot:', error);
    res.status(500).json({ 
      response: 'Lo siento, hay un problema técnico. Por favor contacta directamente con recepción.' 
    });
  }
};

module.exports = {
  responderConsulta
};