import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'https://typejung.com';

describe('E2E API Tests', () => {
  describe('Health Checks', () => {
    it('should return 200 for homepage', async () => {
      const response = await fetch(BASE_URL);
      expect(response.status).toBe(200);
    });

    it('should return 200 for leaderboard API', async () => {
      const response = await fetch(`${BASE_URL}/api/leaderboard`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('leaderboard');
      expect(data).toHaveProperty('total');
    });
  });

  describe('Auth API', () => {
    it('should return null for unauthenticated user', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/user`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toBeNull();
    });

    it('should return 400 for login without credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 for signup without credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
    });

    it('should return 401 for invalid login', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        }),
      });
      expect(response.status).toBe(401);
    });

    it('should return 200 for logout', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
      });
      expect(response.status).toBe(200);
    });
  });

  describe('Google OAuth', () => {
    it('should redirect to Google for OAuth', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/google`, {
        redirect: 'manual',
      });
      expect(response.status).toBe(302);

      const location = response.headers.get('location');
      expect(location).toContain('accounts.google.com');
    });
  });

  describe('Premium Status', () => {
    it('should return free tier for unauthenticated user', async () => {
      const response = await fetch(`${BASE_URL}/api/premium-status`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.tier).toBe('free');
      expect(data.isPremium).toBe(false);
    });
  });

  describe('Static Pages', () => {
    it('should return 200 for pricing page', async () => {
      const response = await fetch(`${BASE_URL}/pricing`);
      expect(response.status).toBe(200);
    });

    it('should return 200 for login page', async () => {
      const response = await fetch(`${BASE_URL}/login`);
      expect(response.status).toBe(200);
    });

    it('should return 200 for assessment page', async () => {
      const response = await fetch(`${BASE_URL}/assessment`);
      expect(response.status).toBe(200);
    });
  });
});
