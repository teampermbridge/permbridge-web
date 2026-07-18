import { createHmac } from 'crypto';

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Simple JWT encoder (in production, use a proper library)
export function createToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 7 * 24 * 60 * 60; // 7 days

  const header = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT',
  })).toString('base64url');

  const payload = Buffer.from(JSON.stringify({
    userId,
    email,
    iat: now,
    exp: now + expiresIn,
  })).toString('base64url');

  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [header, payload, signature] = parts;

  // Verify signature
  const expectedSignature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  // Decode payload
  const decoded = JSON.parse(
    Buffer.from(payload, 'base64url').toString('utf8')
  ) as TokenPayload;

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp < now) {
    throw new Error('Token expired');
  }

  return decoded;
}
