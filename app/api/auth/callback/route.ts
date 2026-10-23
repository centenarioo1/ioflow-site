// app/api/auth/callback/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.AUTH_SECRET || 'bioflow-dev-secret-change-in-prod-123456';
const SESSION_COOKIE = 'bioflow_session';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard';
  
  const errorType = requestUrl.searchParams.get('error');
  const errorDesc = requestUrl.searchParams.get('error_description');

  if (errorType) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?erro=oauth-failed&reason=${encodeURIComponent(errorDesc || errorType)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?erro=oauth-failed&reason=missing-code`
    );
  }

  try {
    const supabase = createAuthClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session?.user) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?erro=oauth-failed&reason=no-session`
      );
    }

    const sbUser = data.session.user;
    const email = sbUser.email?.trim().toLowerCase();
    const nome = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'Cultivador';

    if (!email) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?erro=oauth-failed&reason=missing-email`
      );
    }

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: sbUser.id }, { email }],
      },
    });

    if (!dbUser) {
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
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { nome },
      });
    }

    const payload = Buffer.from(dbUser.id).toString('base64url');
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    const tokenSessao = `${payload}.${sig}`;

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, tokenSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.redirect(`${requestUrl.origin}${redirect}`);

  } catch (err: any) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?erro=oauth-failed&reason=internal-error`
    );
  }
}