import request from 'supertest';
import app from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './setup';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ezzat Sobhi',
          email: 'ezzat@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('ezzat@example.com');
      expect(res.body.data.user.role).toBe('user');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject registration attempts that include a role field (prevent privilege escalation)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker',
          email: 'hacker@example.com',
          password: 'Password123!',
          role: 'admin'
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(JSON.stringify(res.body.data.errors)).toContain('Role cannot be specified');
    });

    it('should reject registration with already registered email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ezzat Sobhi',
          email: 'ezzat@example.com',
          password: 'Password123!'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'ezzat@example.com',
          password: 'Password456!'
        });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
    });

    it('should fail with 400 when validation fails (short password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User',
          email: 'valid@example.com',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.data.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!'
        });
    });

    it('should login with valid credentials and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return profile for authenticated user', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Me User',
          email: 'me@example.com',
          password: 'Password123!'
        });

      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.email).toBe('me@example.com');
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });
});
