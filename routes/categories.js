const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Category = require('../models/Category');

const router = express.Router();

// Get all categories
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single category
router.get('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (category.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resource' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create category
router.post(
  '/',
  protect,
  [body('name').notEmpty().withMessage('Category name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, icon, color } = req.body;

      const category = new Category({
        name,
        icon,
        color,
        user: req.user.id,
      });

      await category.save();

      res.status(201).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Update category
router.put(
  '/:id',
  protect,
  [body('name').optional().notEmpty().withMessage('Category name cannot be empty')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      if (category.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this resource' });
      }

      category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Delete category
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (category.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;