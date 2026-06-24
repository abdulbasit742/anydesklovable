import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export type ApiKeyEnvironment = 'live' | 'test';

export interface GeneratedApiKey {
  rawKey: string;
  prefix: string;
  hash: string;
}

export interface ApiKeyMetadata {
  id: string;
  teamId: string;
  prefix: string;
  hash: string;
  scopes: string[];
  status: 'active' | 'revoked' | 'expired';
  expiresAt?: string | null;
}

export interface ApiKeyVerificationResult {
  ok: boolean;
  code?: 'missing_api_key' | 'invalid_api_key' | 'revoked_api_key' | 'expired_api_key' | 'missing_scope';
  apiKey?: Omit<ApiKeyMetadata, 'hash'>;
}

function assertServerOnly() {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY: api-key-auth.server cannot be imported by browser/client code.');
  }
}

export function hashApiKey(rawKey: string, pepper = process.env.API_KEY_HASH_PEPPER ?? ''): string {
  assertServerOnly();
  return createHash('sha256').update(`${pepper}:${rawKey}`, 'utf8').digest('hex');
}

export function generateApiKey(environment: ApiKeyEnvironment = 'live'): GeneratedApiKey {
  assertServerOnly();
  const token = randomBytes(32).toString('base64url');
  const prefix = environment === 'test' ? 'rd_test' : 'rd_live';
  const rawKey = `${prefix}_${token}`;
  return {
    rawKey,
    prefix: rawKey.slice(0, 16),
    hash: hashApiKey(rawKey),
  };
}

export function extractBearerApiKey(headers: Headers): string | null {
  const authorization = headers.get('authorization') ?? headers.get('Authorization');
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

export function safeCompareHash(left: string, right: string): boolean {
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isApiKeyExpired(expiresAt?: string | null, now = new Date()): boolean {
  if (!expiresAt) return false;
  const date = new Date(expiresAt);
  return Number.isNaN(date.getTime()) || date.getTime() <= now.getTime();
}

export function hasRequiredScope(scopes: string[], requiredScope: string): boolean {
  return scopes.includes(requiredScope) || scopes.includes('admin:write') || scopes.includes('*');
}

export function verifyApiKeyMetadata(params: {
  rawKey: string | null;
  metadata: ApiKeyMetadata | null;
  requiredScope?: string;
  now?: Date;
}): ApiKeyVerificationResult {
  assertServerOnly();
  const { rawKey, metadata, requiredScope, now = new Date() } = params;
  if (!rawKey) return { ok: false, code: 'missing_api_key' };
  if (!metadata) return { ok: false, code: 'invalid_api_key' };
  if (!safeCompareHash(hashApiKey(rawKey), metadata.hash)) return { ok: false, code: 'invalid_api_key' };
  if (metadata.status === 'revoked') return { ok: false, code: 'revoked_api_key' };
  if (metadata.status === 'expired' || isApiKeyExpired(metadata.expiresAt, now)) return { ok: false, code: 'expired_api_key' };
  if (requiredScope && !hasRequiredScope(metadata.scopes, requiredScope)) return { ok: false, code: 'missing_scope' };

  const { hash: _hash, ...safeMetadata } = metadata;
  return { ok: true, apiKey: safeMetadata };
}

export function sanitizeApiKeyForDashboard(metadata: ApiKeyMetadata): Omit<ApiKeyMetadata, 'hash'> {
  const { hash: _hash, ...safeMetadata } = metadata;
  return safeMetadata;
}
