// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { cookies } from 'next/headers';

// 🚨 OBRIGATÓRIO no Next.js App Router:
// Força esta rota a ser tratada como 100% dinâmica no servidor,
// impedindo que a Vercel tente pré-renderizá-la no "npm run build".
export const dynamic = 'force-dynamic';

const SECRET = process.env.AUTH_SECRET || 'bioflow-dev-secret-change-in-prod-123456';
const SESSION_COOKIE = 'bioflow_session';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard';
  
  // Captura possíveis parâmetros de erro enviados na query pelo Supabase
  const errorType = requestUrl.searchParams.get('error');
  const errorDesc = requestUrl.searchParams.get('error_description');

  console.log('🔵 [OAuth Callback] Iniciando processamento...');
  console.log('   - URL completa chamada:', request.url);
  console.log('   - Code presente:', code ? 'SIM (Ocultado por segurança)' : 'NÃO');
  console.log('   - Erro na query:', errorType ? `${errorType}: ${errorDesc}` : 'Nenhum');

  // Se o Supabase retornou um erro diretamente na URL
  if (errorType) {
    console.error(`❌ [OAuth Callback] Supabase retornou erro na URL: ${errorType} - ${errorDesc}`);
    return NextResponse.redirect(`${requestUrl.origin}/login?erro=oauth-failed&reason=${encodeURIComponent(errorDesc || errorType)}`);
  }

  // Se não há código de autenticação, o fluxo não pode continuar
  if (!code) {
    console.warn('⚠️ [OAuth Callback] Código de autorização "code" não foi encontrado na URL.');
    return NextResponse.redirect(`${requestUrl.origin}/login?erro=oauth-failed&reason=missing-code`);
  }

  try {
    const supabase = createAuthClient();
    console.log('🔵 [OAuth Callback] Trocando o "code" por sessão no Supabase...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ [OAuth Callback] Erro ao trocar code por sessão no Supabase:', error.message);
      return NextResponse.redirect(`${requestUrl.origin}/login?erro=oauth-failed&reason=${encodeURIComponent(error.message)}`);
    }

    if (!data.session?.user) {
      console.error('❌ [OAuth Callback] Troca concluída, mas nenhuma sessão foi retornada.');
      return NextResponse.redirect(`${requestUrl.origin}/login?erro=oauth-failed&reason=no-session`);
    }

    const sbUser = data.session.user;
    const email = sbUser.email?.trim().toLowerCase();
    const nome = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'Cultivador';

    console.log(`✅ [OAuth Callback] Autenticado no Supabase com sucesso! Email: ${email}`);

    if (!email) {
      console.error('❌ [OAuth Callback] O provedor do Google não retornou um e-mail válido.');
      return NextResponse.redirect(`${requestUrl.origin}/login?erro=oauth-failed&reason=missing-email`);
    }

    // Busca perfil público ou cria um novo perfil a partir do login social
    let dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      console.log(`🔵 [OAuth Callback] Criando perfil público para o novo usuário: ${email}`);
      const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const role = adminEmail && email === adminEmail ? 'ADMIN' : 'USER';

      dbUser = await prisma.user.create({
        data: {
          id: sbUser.id,
          nome,
          email,
          password: 'SUPABASE_AUTH_PROVIDER',
          role,
        },
      });
    } else {
      console.log(`🔵 [OAuth Callback] Usuário já possui perfil público. Sincronizando ID...`);
      if (dbUser.id !== sbUser.id) {
        dbUser = await prisma.user.update({
          where: { email },
          data: { id: sbUser.id }
        });
      }
    }

    // Gera token assinado idêntico ao auth.ts
    const payload = Buffer.from(dbUser.id).toString('base64url');
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    const tokenSessao = `${payload}.${sig}`;

    // Define cookie seguro
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, tokenSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    });

    console.log('🚀 [OAuth Callback] Sessão Next.js criada! Redirecionando para:', redirect);
    return NextResponse.redirect(`${requestUrl.origin}${redirect}`);

  } catch (err: any) {
    console.error('❌ [OAuth Callback] Erro crítico não tratado no processo:', err);
    return NextResponse.redirect(`${requestUrl.origin}/login?erro=oauth-failed&reason=internal-error`);
  }
}