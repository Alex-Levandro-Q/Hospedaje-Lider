import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token no encontrado' }, { status: 401 });
    }

    const { fotoCarnetFrente, fotoCarnetReverso } = await request.json();

    const updateResponse = await fetch('http://localhost:4005/api/usuarios/update-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        fotoCarnetFrente: fotoCarnetFrente || null,
        fotoCarnetReverso: fotoCarnetReverso || null
      })
    });

    if (updateResponse.ok) {
      return NextResponse.json({ message: 'Documentos actualizados exitosamente' });
    } else {
      const error = await updateResponse.json();
      return NextResponse.json({ error: error.error || 'Error al actualizar los documentos' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}