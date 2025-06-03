import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/userSchema.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth Integration Tests', () => {
  test('Health check returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'user-auth' });
  });

  test('Register new user with valid data', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Son',
        email: 'son@example.com',
        password: 'Password123!',
        user_type: ['Consumer'],
        phone_number: '1234567890'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'son@example.com');
    expect(res.body).toHaveProperty('message', 'User registered');
  });

  test('Register fails with missing fields', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'no_password@example.com' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('Register fails with duplicate email', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Son',
        email: 'duplicate@example.com',
        password: 'Password123!'
      });

    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Son2',
        email: 'duplicate@example.com',
        password: 'Password456!'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('Login with correct credentials', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Son',
        email: 'login@example.com',
        password: 'Password123!'
      });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Login fails with incorrect password', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Son',
        email: 'wrongpass@example.com',
        password: 'CorrectPass123'
      });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'wrongpass@example.com', password: 'WrongPass123' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('Login fails with unregistered email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'notfound@example.com', password: 'Password123' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('CORS allows requests from localhost frontend', async () => {
    const res = await request(app)
      .options('/auth/register')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  test('JWT token not issued for invalid login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'invalid@example.com', password: 'invalidpass' });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  test('Register new Seller user with valid data', async () => {
  const sellerData = {
    name: 'Seller Jane',
    email: 'seller@example.com',
    password: 'strongpassword',
    phone_number: '1234567890',
    profile_image: 'seller.png',
    role: 'Seller'
  };

  const response = await request(app)
    .post('/auth/register')
    .send(sellerData);

  expect(response.statusCode).toBe(201);
  expect(response.body.user.user_type).toContain('Seller');
});

});
