const request = require('supertest');
const express = require('express');
const router = express.Router();
const { db } = require('../../server');

describe('User routes', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.end();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const res = await request(router).post('/api/users/register').send({
        email: 'test@example.com',
        password: 'password',
        fname: 'John',
        lname: 'Doe',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.token).toBeDefined();
    });

    it('should return an error if registration fails', async () => {
      const res = await request(router).post('/api/users/register').send({
        email: 'test@example.com',
        password: 'password',
        fname: 'John',
        lname: 'Doe',
      });
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toContain('User registration failed');
    });
  });
  /*
  describe('POST /login', () => {
    it('should log in a user', async () => {
      const res = await request(router).post('/api/users/login').send({
        email: 'test@example.com',
        password: 'password',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
    });

    it('should return an error if login fails', async () => {
      const res = await request(router).post('/api/users/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toContain('Invalid email or password');
    });
  });

  describe('GET /:user_id', () => {
    it('should get a user by user_id', async () => {
      const res = await request(router).get('/api/users/1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toBeDefined();
      expect(res.body.fname).toBeDefined();
      expect(res.body.lname).toBeDefined();
    });

    it('should return an error if user not found', async () => {
      const res = await request(router).get('/api/users/999');
      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toContain('User not found');
    });
  });

  describe('GET /me', () => {
    it('should get the logged in user', async () => {
      const agent = request.agent(router);
      await agent.post('/api/users/login').send({
        email: 'test@example.com',
        password: 'password',
      });
      const res = await agent.get('/api/users/me');
      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toBeDefined();
      expect(res.body.fname).toBeDefined();
      expect(res.body.lname).toBeDefined();
    });

    it('should return an error if user not found', async () => {
      const agent = request.agent(router);
      await agent.post('/api/users/login').send({
        email: 'test@example.com',
        password: 'password',
      });
      const res = await agent.get('/api/users/999');
      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toContain('User not found');
    });
  });

  describe('PUT /:user_id', () => {
    it('should update a user', async () => {
      const agent = request.agent(router);
      await agent.post('/api/users/login').send({
        email: 'test@example.com',
        password: 'password',
      });
      const res = await agent
        .put('/api/users/1')
        .send({ email: 'newemail@example.com', fname: 'Jane', lname: 'Doe' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('User updated successfully');
    });

    it('should return an error if update fails', async () => {
      const agent = request.agent(router);
      await agent.post('/api/users/login').send({
        email: 'test@example.com',
        password: 'password',
      });
      const res = await agent
        .put('/api/users/999')
        .send({ email: 'newemail@example.com', fname: 'Jane', lname: 'Doe' });
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toContain('Internal Server Error');
    });
  });
  */
});
