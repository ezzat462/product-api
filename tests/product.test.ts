import request from 'supertest';
import app from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './setup';

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

const setupUsers = async () => {
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'Password123!',
      role: 'user'
    });
  userToken = userRes.body.data.token;

  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin'
    });
  adminToken = adminRes.body.data.token;
};

describe('Product Endpoints', () => {
  beforeEach(async () => {
    await setupUsers();
  });

  describe('POST /api/products', () => {
    it('should create a new product when user is authenticated', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Mechanical Keyboard',
          price: 89.99,
          description: 'RGB mechanical gaming keyboard',
          category: 'Electronics',
          stock: 15
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Mechanical Keyboard');
      expect(res.body.data.price).toBe(89.99);
      expect(res.body.data._id).toBeDefined();
    });

    it('should fail with 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Keyboard',
          price: 50
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    it('should fail with 400 when validation rules fail (missing price)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'No Price Product'
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.data.errors).toBeDefined();
    });
  });

  describe('GET /api/products (Pagination, Filtering, Sorting)', () => {
    beforeEach(async () => {
      // Seed 3 products
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Alpha Item', price: 10, category: 'Stationery' });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Beta Gadget', price: 100, category: 'Electronics' });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Gamma Monitor', price: 300, category: 'Electronics' });
    });

    it('should retrieve all products with pagination metadata', async () => {
      const res = await request(app).get('/api/products?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(3);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.totalPages).toBe(2);
      expect(res.body.meta.hasNextPage).toBe(true);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=Electronics');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every((p: any) => p.category === 'Electronics')).toBe(true);
    });

    it('should filter products by price range', async () => {
      const res = await request(app).get('/api/products?minPrice=50&maxPrice=150');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Beta Gadget');
    });

    it('should search products by name', async () => {
      const res = await request(app).get('/api/products?search=Monitor');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Gamma Monitor');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should retrieve a single product by valid ID', async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Single Item', price: 25 });

      const id = createRes.body.data._id;

      const res = await request(app).get(`/api/products/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Single Item');
    });

    it('should return 400 for an invalid Mongo ObjectId (bug fix verification)', async () => {
      const res = await request(app).get('/api/products/invalid-id-123');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('should return 404 for a valid Mongo ObjectId that does not exist', async () => {
      const nonExistentId = '6741b2f4a5c9d23e8e123456';
      const res = await request(app).get(`/api/products/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Product not found');
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('should update product fields when authenticated', async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Original Name', price: 40 });

      const id = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/products/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name', price: 45 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.price).toBe(45);
    });
  });

  describe('DELETE /api/products/:id (RBAC Authorization)', () => {
    let productId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'To Be Deleted', price: 99 });
      productId = createRes.body.data._id;
    });

    it('should forbid regular users from deleting a product with 403 Forbidden', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should allow admin users to delete a product successfully (200)', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.message).toContain('deleted');

      // Verify it no longer exists
      const getRes = await request(app).get(`/api/products/${productId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
