import { createHash, randomBytes } from 'crypto';

// Simple password hashing (in production, use bcrypt)
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(':');
  const newHash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return newHash === storedHash;
}
