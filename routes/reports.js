const express = require('express');
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

const router = express.Router();

// Get spending summary by category
router.get('/summary/category', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = { user: req.user.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).populate('category', 'name icon color');

    const summary = {};
    expenses.forEach((expense) => {
      const categoryName = expense.category.name;
      if (!summary[categoryName]) {
        summary[categoryName] = {
          name: categoryName,
          icon: expense.category.icon,
          color: expense.category.color,
          total: 0,
          count: 0,
        };
      }
      summary[categoryName].total += expense.amount;
      summary[categoryName].count += 1;
    });

    res.status(200).json({
      success: true,
      data: Object.values(summary).sort((a, b) => b.total - a.total),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get spending timeline (by month/week)
router.get('/summary/timeline', protect, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    let filter = { user: req.user.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: 1 });

    const timeline = {};
    expenses.forEach((expense) => {
      let key;
      const date = new Date(expense.date);

      if (groupBy === 'week') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
      } else {
        // Default to month
        key = date.toISOString().slice(0, 7);
      }

      if (!timeline[key]) {
        timeline[key] = { date: key, total: 0, count: 0 };
      }
      timeline[key].total += expense.amount;
      timeline[key].count += 1;
    });

    res.status(200).json({
      success: true,
      data: Object.values(timeline),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get total spending analytics
router.get('/analytics/totals', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = { user: req.user.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter);

    const totalSpent = expenses.reduce((total, exp) => total + exp.amount, 0);
    const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSpent: totalSpent.toFixed(2),
        averageExpense: averageExpense.toFixed(2),
        totalExpenses: expenses.length,
        highestExpense: expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0,
        lowestExpense: expenses.length > 0 ? Math.min(...expenses.map((e) => e.amount)) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get top spending categories
router.get('/analytics/top-categories', protect, async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;

    let filter = { user: req.user.id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).populate('category', 'name icon color');

    const categorySpending = {};
    expenses.forEach((expense) => {
      const categoryId = expense.category._id.toString();
      if (!categorySpending[categoryId]) {
        categorySpending[categoryId] = {
          categoryId,
          name: expense.category.name,
          icon: expense.category.icon,
          color: expense.category.color,
          total: 0,
          count: 0,
        };
      }
      categorySpending[categoryId].total += expense.amount;
      categorySpending[categoryId].count += 1;
    });

    const topCategories = Object.values(categorySpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: topCategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;