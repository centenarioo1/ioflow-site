import { NextResponse } from 'next/server';
import { getUserIdFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/authHelper';

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { senhaAtual, novaSenha } = await req.json();

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json({ error: 'Todos os campos de senha são obrigatórios.' }, { status: 400 });
    }

    if (novaSenha.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Se a conta veio do Google e não tem senha real registrada ainda
    if (user.password === 'SUPABASE_AUTH_PROVIDER') {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashPassword(novaSenha) }
      });
      return NextResponse.json({ success: true, message: 'Senha definida com sucesso!' });
    }

    const senhaValida = verifyPassword(senhaAtual, user.password);
    if (!senhaValida) {
      return NextResponse.json({ error: 'Sua senha atual está incorreta.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword(novaSenha) }
    });

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno ao alterar senha.' }, { status: 500 });
  }
}