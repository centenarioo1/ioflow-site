import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

// Define o tipo Role localmente para evitar erro de exportação do @prisma/client
export type Role = 'ADMIN' | 'USER' | string;

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
    return await prisma.user.upsert({
      where: { id: params.id },
      create: {
        id: params.id,
        nome,
        email,
        password: PASSWORD_PLACEHOLDER,
        // @ts-ignore: Ignorando checagem estrita de tipo enum do Prisma no role
        role,
      },
      update: {
        nome,
        email,
        // @ts-ignore: Ignorando checagem estrita de tipo enum do Prisma no role
        ...(role === 'ADMIN' ? { role: 'ADMIN' } : {}),
      },
    });
  } catch (err) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return prisma.user.update({
        where: { email },
        data: {
          nome,
          // @ts-ignore: Ignorando checagem estrita de tipo enum do Prisma no role
          ...(role === 'ADMIN' ? { role: 'ADMIN' } : {}),
        },
      });
    }
    throw err;
  }
}