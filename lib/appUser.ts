import { prisma } from '@/lib/prisma';

// Tipagem local para evitar dependência de exportação estrita do @prisma/client no Vercel
export type Role = 'ADMIN' | 'USER' | string;

export interface User {
  id: string;
  nome?: string | null;
  email: string;
  password?: string | null;
  role?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: any;
}

const PASSWORD_PLACEHOLDER = 'SUPABASE_AUTH';

export function resolveRole(email: string): Role {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return adminEmail && email.trim().toLowerCase() === adminEmail ? 'ADMIN' : 'USER';
}

export async function upsertAppUser(params: {
  id: string;
  nome: string;
  email: string;
}): Promise<User> {
  const email = params.email.trim().toLowerCase();
  const nome = params.nome.trim() || 'Cliente';
  const role = resolveRole(email);

  try {
    return await (prisma as any).user.upsert({
      where: { id: params.id },
      create: {
        id: params.id,
        nome,
        email,
        password: PASSWORD_PLACEHOLDER,
        role,
      },
      update: {
        nome,
        email,
        ...(role === 'ADMIN' ? { role: 'ADMIN' } : {}),
      },
    });
  } catch (err) {
    const existing = await (prisma as any).user.findUnique({ where: { email } });
    if (existing) {
      return (prisma as any).user.update({
        where: { email },
        data: {
          nome,
          ...(role === 'ADMIN' ? { role: 'ADMIN' } : {}),
        },
      });
    }
    throw err;
  }
}