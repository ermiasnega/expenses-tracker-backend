const request = require('supertest');
const express = require('express');
const categoriesRoutes = require('../routes/categories');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());

// Mock middleware
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid
    }
  }
  next();
});

app.use('/api/categories', categoriesRoutes);

describe('Categories Routes', () => {
  describe('GET /api/categories', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/categories', () => {
    it('should return 400 if name is missing', async () => {
      const token = jwt.sign({ id: 'test-user-id' }, process.env.JWT_SECRET);
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          icon: '🍔',
          color: '#FF5733',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
