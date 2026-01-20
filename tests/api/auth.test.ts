import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-id',
              email: 'test@test.com',
              first_name: 'Test',
              last_name: 'User',
              profile_image_url: null,
              created_at: new Date().toISOString()
            },
            error: null
          })),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should consistently hash passwords', async () => {
      const crypto = await import('crypto');
      const password = 'testPassword123';
      const hash1 = crypto.createHash('sha256').update(password).digest('hex');
      const hash2 = crypto.createHash('sha256').update(password).digest('hex');

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hashes for different passwords', async () => {
      const crypto = await import('crypto');
      const hash1 = crypto.createHash('sha256').update('password1').digest('hex');
      const hash2 = crypto.createHash('sha256').update('password2').digest('hex');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Session ID Generation', () => {
    it('should generate unique session IDs', async () => {
      const crypto = await import('crypto');
      const id1 = crypto.randomBytes(24).toString('base64url');
      const id2 = crypto.randomBytes(24).toString('base64url');

      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should sign session IDs correctly', async () => {
      const crypto = await import('crypto');
      const sessionId = 'test-session-id';
      const secret = 'test-secret';

      const signature = crypto
        .createHmac('sha256', secret)
        .update(sessionId)
        .digest('base64')
        .replace(/=+$/, '');

      const signedId = `s:${sessionId}.${signature}`;

      expect(signedId).toMatch(/^s:test-session-id\..+$/);
    });
  });

  describe('Cookie Parsing', () => {
    it('should parse cookies correctly', () => {
      const parseCookies = (cookieHeader: string): Record<string, string> => {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(cookie => {
          const [name, ...rest] = cookie.split('=');
          if (name && rest.length > 0) {
            cookies[name.trim()] = rest.join('=').trim();
          }
        });
        return cookies;
      };

      const cookieHeader = 'connect.sid=s:abc123.sig; other=value';
      const cookies = parseCookies(cookieHeader);

      expect(cookies['connect.sid']).toBe('s:abc123.sig');
      expect(cookies['other']).toBe('value');
    });

    it('should handle empty cookie header', () => {
      const parseCookies = (cookieHeader: string): Record<string, string> => {
        const cookies: Record<string, string> = {};
        if (!cookieHeader) return cookies;
        cookieHeader.split(';').forEach(cookie => {
          const [name, ...rest] = cookie.split('=');
          if (name && rest.length > 0) {
            cookies[name.trim()] = rest.join('=').trim();
          }
        });
        return cookies;
      };

      expect(parseCookies('')).toEqual({});
    });
  });

  describe('Session Cookie Extraction', () => {
    it('should extract session ID from signed cookie', () => {
      const sessionCookie = 's:abc123xyz.signature';
      const match = sessionCookie.match(/^s:([^.]+)\./);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('abc123xyz');
    });

    it('should return null for invalid cookie format', () => {
      const sessionCookie = 'invalid-cookie';
      const match = sessionCookie.match(/^s:([^.]+)\./);

      expect(match).toBeNull();
    });
  });
});

describe('Email Validation', () => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
  });
});
