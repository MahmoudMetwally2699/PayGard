import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // ID of the user who uploaded the document
  fileUrl: { type: String, required: true }, // URL of the uploaded file (stored in Supabase Storage)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Document status
  uploadedAt: { type: Date, default: Date.now }, // Timestamp of upload
});

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
