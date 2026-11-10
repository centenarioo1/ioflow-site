import { NextResponse } from 'next/server';
import { getUsuarioLogado } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUsuarioLogado();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}