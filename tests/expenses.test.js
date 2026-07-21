const request = require('supertest');
const express = require('express');
const expensesRoutes = require('../routes/expenses');
const { protect } = require('../middleware/auth');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());

// Mock middleware that sets req.user
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

app.use('/api/expenses', expensesRoutes);

describe('Expenses Routes', () => {
  describe('GET /api/expenses', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/expenses');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/expenses', () => {
    it('should return 400 if title is missing', async () => {
      const token = jwt.sign({ id: 'test-user-id' }, process.env.JWT_SECRET);
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50,
          category: 'test-category-id',
          date: '2024-07-21',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if amount is not numeric', async () => {
      const token = jwt.sign({ id: 'test-user-id' }, process.env.JWT_SECRET);
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Expense',
          amount: 'not-a-number',
          category: 'test-category-id',
          date: '2024-07-21',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
