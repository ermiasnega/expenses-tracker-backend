const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

const router = express.Router();

// Get all expenses with filtering
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let filter = { user: req.user.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter)
      .populate('category', 'name icon color')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single expense
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('category', 'name icon color');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resource' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create expense
router.post(
  '/',
  protect,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { title, amount, category, date, description } = req.body;

      // Verify category exists and belongs to user
      const categoryExists = await Category.findOne({ _id: category, user: req.user.id });
      if (!categoryExists) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      const expense = new Expense({
        title,
        amount,
        category,
        date,
        description,
        user: req.user.id,
      });

      await expense.save();
      await expense.populate('category', 'name icon color');

      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Update expense
router.put(
  '/:id',
  protect,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let expense = await Expense.findById(req.params.id);

      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }

      if (expense.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this resource' });
      }

      expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate('category', 'name icon color');

      res.status(200).json({ success: true, data: expense });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Delete expense
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;