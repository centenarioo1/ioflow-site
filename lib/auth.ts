import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Role, User } from '@prisma/client';

const SECRET = process.env.AUTH_SECRET || 'bioflow-dev-secret-change-in-prod-123456';
export const SESSION_COOKIE = 'bioflow_session';

export type AuthUser = {
  id: string;
  name: string;
  nome: string;
  email: string;
  role: Role;
};

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function createToken(userId: string): string {
  const payload = Buffer.from(userId).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const esperado = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado))) return null;
  } catch {
    return null;
  }
  return Buffer.from(payload, 'base64url').toString('utf-8');
}

export async function getUserIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.nome,
    nome: user.nome,
    email: user.email,
    role: user.role,
  };
}

export function toPublicUser(user: Pick<User, 'id' | 'nome' | 'email' | 'role'>) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
  };
}

export async function getUsuarioLogado(): Promise<AuthUser | null> {
  const userId = await getUserIdFromCookies();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return toAuthUser(user);
}

export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getUsuarioLogado();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createToken(userId), sessionCookieOptions());
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}
