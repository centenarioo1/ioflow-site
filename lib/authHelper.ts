// lib/authHelper.ts
import { pbkdf2Sync, randomBytes } from 'crypto';

/**
 * Gera uma hash segura para a senha usando PBKDF2 (Nativo do Node.js - Zero dependências)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica se a senha digitada bate com a hash salva no banco de dados
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  try {
    const [salt, originalHash] = storedValue.split(':');
    if (!salt || !originalHash) return false;
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  } catch {
    return false;
  }
}