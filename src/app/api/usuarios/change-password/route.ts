import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token no encontrado' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    const response = await fetch('http://localhost:4005/api/usuarios/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (response.ok) {
      return NextResponse.json({ message: 'Contraseña actualizada exitosamente' });
    } else {
      const error = await response.json();
      return NextResponse.json({ error: error.error || 'Error al actualizar la contraseña' }, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}