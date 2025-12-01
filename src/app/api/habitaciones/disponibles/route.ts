import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const cantidadPersonas = searchParams.get('cantidadPersonas');
    const tipoReserva = searchParams.get('tipoReserva');
    const horaInicio = searchParams.get('horaInicio');
    const horaFin = searchParams.get('horaFin');
    const servicios = searchParams.get('servicios');

    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    if (cantidadPersonas) params.append('cantidadPersonas', cantidadPersonas);
    if (tipoReserva) params.append('tipoReserva', tipoReserva);
    if (horaInicio) params.append('horaInicio', horaInicio);
    if (horaFin) params.append('horaFin', horaFin);
    if (servicios) params.append('servicios', servicios);

    const response = await fetch(`http://localhost:4005/api/habitaciones/disponibles?${params}`);
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Error al obtener habitaciones' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}