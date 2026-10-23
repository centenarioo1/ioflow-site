import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, mensagem } = body;

    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Aqui você pode integrar um provedor de e-mail (ex: Resend) ou salvar no banco
    console.log('📩 Nova mensagem de contato recebida:', { nome, email, mensagem });

    return NextResponse.json({
      success: true,
      message: 'Mensagem recebida com sucesso! Entraremos em contato em breve.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}