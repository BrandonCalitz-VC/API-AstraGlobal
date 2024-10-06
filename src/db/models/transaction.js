const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Mongoose schema
const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be a positive number'],
  },
  currency: {
    type: String,
    required: true,
  },
  account_to: {
    type: String,
    required: true,
    minlength: 1,
  },
  provider: {
    type: String,
    required: true,
  },
  value_1: {
    type: String,
    default: null,
  },
  value_2: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },

});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = { Transaction : Transaction}
