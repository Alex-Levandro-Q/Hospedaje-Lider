import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('token')?.value;
    
    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const habitacionId = searchParams.get('habitacionId');
    const fecha = searchParams.get('fecha');

    if (!habitacionId || !fecha) {
      return NextResponse.json({ error: 'habitacionId y fecha son requeridos' }, { status: 400 });
    }

    const response = await fetch(`http://localhost:4005/api/horarios/disponibles?habitacionId=${habitacionId}&fecha=${fecha}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error || 'Error al obtener horarios' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en API horarios disponibles:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}