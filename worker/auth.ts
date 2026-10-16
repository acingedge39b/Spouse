export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}

export function generateToken(prefix: string = 'tok_admin'): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}_${Date.now().toString(36)}`;
}

export class RateLimiter {
  constructor(private db: D1Database) {}

  async check(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000,
    blockDurationMs: number = 15 * 60 * 1000
  ): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
    const now = Date.now();
    const row = await this.db.prepare(
      `SELECT * FROM rate_limits WHERE key = ?`
    ).bind(key).first<any>();

    if (!row) {
      await this.db.prepare(
        `INSERT INTO rate_limits (key, count, first_attempt_at, last_attempt_at, blocked_until) VALUES (?, 1, ?, ?, 0)`
      ).bind(key, now, now).run();
      return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
    }

    // Check if actively blocked
    if (row.blocked_until && row.blocked_until > now) {
      const retryAfterSeconds = Math.ceil((row.blocked_until - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    // Check if current window has expired
    if (now - row.first_attempt_at > windowMs) {
      await this.db.prepare(
        `UPDATE rate_limits SET count = 1, first_attempt_at = ?, last_attempt_at = ?, blocked_until = 0 WHERE key = ?`
      ).bind(now, now, key).run();
      return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
    }

    // Increment count inside window
    const newCount = row.count + 1;
    if (newCount > maxAttempts) {
      const blockedUntil = now + blockDurationMs;
      await this.db.prepare(
        `UPDATE rate_limits SET count = ?, last_attempt_at = ?, blocked_until = ? WHERE key = ?`
      ).bind(newCount, now, blockedUntil, key).run();
      const retryAfterSeconds = Math.ceil(blockDurationMs / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    await this.db.prepare(
      `UPDATE rate_limits SET count = ?, last_attempt_at = ? WHERE key = ?`
    ).bind(newCount, now, key).run();

    return { allowed: true, remaining: Math.max(0, maxAttempts - newCount), retryAfterSeconds: 0 };
  }

  async reset(key: string): Promise<void> {
    await this.db.prepare(
      `DELETE FROM rate_limits WHERE key = ?`
    ).bind(key).run();
  }

  async getAll(): Promise<any[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM rate_limits ORDER BY last_attempt_at DESC LIMIT 50`
    ).all<any>();
    return results || [];
  }

  async clearAll(): Promise<void> {
    await this.db.prepare(`DELETE FROM rate_limits`).run();
  }
}
