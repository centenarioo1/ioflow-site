import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enviarEmailRedefinicaoSenha } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));
    const emailFormatado = String(email || '').trim().toLowerCase();

    if (!emailFormatado) {
      return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: emailFormatado },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Se este e-mail estiver cadastrado, você receberá o link de redefinição em instantes.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiracao = new Date(Date.now() + 3600000); // 1 hora de validade

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: tokenExpiracao,
      } as any,
    });

    const host = req.headers.get('host') || 'biofloworganicos.com.br';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const resetLink = `${protocol}://${host}/redefinir-senha?token=${token}`;

    await enviarEmailRedefinicaoSenha({
      emailCliente: user.email,
      nomeCliente: user.nome || 'Cultivador',
      resetLink,
    });

    return NextResponse.json({
      success: true,
      message: 'Se este e-mail estiver cadastrado, você receberá o link de redefinição em instantes.',
    });

  } catch (error: any) {
    console.error('❌ Erro na rota forgot-password:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação de redefinição de senha.' }, { status: 500 });
  }
}