import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    // Disable type casting to prevent ObjectId conversion
    get: v => v.toString(),
    set: v => v.toString()
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  // Add this to ensure virtuals are included when converting to JSON
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Delete any existing model to prevent OverwriteModelError
mongoose.models = {};

export default mongoose.model('Payment', PaymentSchema);
