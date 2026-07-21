const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

const router = express.Router();

// Get all budgets with spending info
router.get('/', protect, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id })
      .populate('category', 'name icon color')
      .sort({ createdAt: -1 });

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.startDate);
        const endDate = new Date();

        const expenses = await Expense.find({
          category: budget.category._id,
          user: req.user.id,
          date: { $gte: startDate, $lte: endDate },
        });

        const spent = expenses.reduce((total, exp) => total + exp.amount, 0);
        const percentage = (spent / budget.limit) * 100;

        return {
          ...budget.toObject(),
          spent,
          percentage: Math.min(percentage, 100),
          isAlert: percentage >= budget.alertThreshold,
        };
      })
    );

    res.status(200).json({ success: true, data: budgetsWithSpending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single budget with spending
router.get('/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('category', 'name icon color');

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resource' });
    }

    const startDate = new Date(budget.startDate);
    const endDate = new Date();

    const expenses = await Expense.find({
      category: budget.category._id,
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    });

    const spent = expenses.reduce((total, exp) => total + exp.amount, 0);
    const percentage = (spent / budget.limit) * 100;

    res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        percentage: Math.min(percentage, 100),
        isAlert: percentage >= budget.alertThreshold,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create budget
router.post(
  '/',
  protect,
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('limit').isNumeric().withMessage('Budget limit must be a number'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { category, limit, alertThreshold, period, startDate } = req.body;

      const budget = new Budget({
        category,
        limit,
        alertThreshold,
        period,
        startDate,
        user: req.user.id,
      });

      await budget.save();
      await budget.populate('category', 'name icon color');

      res.status(201).json({ success: true, data: budget });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Update budget
router.put(
  '/:id',
  protect,
  [
    body('limit').optional().isNumeric().withMessage('Budget limit must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let budget = await Budget.findById(req.params.id);

      if (!budget) {
        return res.status(404).json({ success: false, message: 'Budget not found' });
      }

      if (budget.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this resource' });
      }

      budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate('category', 'name icon color');

      res.status(200).json({ success: true, data: budget });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Delete budget
router.delete('/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;