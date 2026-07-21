const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    limit: {
      type: Number,
      required: [true, 'Please provide a budget limit'],
      min: [0, 'Budget limit cannot be negative'],
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: [0, 'Alert threshold must be at least 0'],
      max: [100, 'Alert threshold cannot exceed 100'],
    },
    period: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);