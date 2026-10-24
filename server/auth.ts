import type { Request } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createHash } from 'node:crypto';
import { authConfigured, config } from './config';
import { AppError } from './errors';
const issuer = authConfigured ? `https://${config.authDomain}/` : '';
const keys = issuer ? createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`)) : null;
export async function ownerFor(req: Request): Promise<string> {
  if (!authConfigured) {
    if (config.production)
      throw new AppError(401, 'AUTH_REQUIRED', 'Sign-in is required for this action.');
    return 'local';
  }
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token || !keys)
    throw new AppError(401, 'AUTH_REQUIRED', 'Sign in to use connected services.');
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer,
      audience: config.authAudience,
      algorithms: ['RS256'],
    });
    if (!payload.sub) throw new Error();
    return createHash('sha256').update(payload.sub).digest('hex');
  } catch {
    throw new AppError(401, 'AUTH_REQUIRED', 'Your sign-in expired. Please sign in again.');
  }
}
