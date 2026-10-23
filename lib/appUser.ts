import { prisma } from '@/lib/prisma';
import type { Role, User } from '@prisma/client';

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
        role,
      },
      update: {
        nome,
        email,
        ...(role === 'ADMIN' ? { role: 'ADMIN' as const } : {}),
      },
    });
  } catch (err) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return prisma.user.update({
        where: { email },
        data: {
          nome,
          ...(role === 'ADMIN' ? { role: 'ADMIN' as const } : {}),
        },
      });
    }
    throw err;
  }
}
