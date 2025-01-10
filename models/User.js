import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  supabaseUserId: { type: String, required: true, unique: true }, // Link to Supabase user ID
  role: { type: String, enum: ['admin', 'user'], default: 'user' }, // Role for access control
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
