import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
    await dbConnect();
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const userId = formData.get('userId');

      console.log('File:', file); // Log the file
      console.log('User ID:', userId); // Log the user ID

      if (!file || !userId) {
        console.error('File or User ID is missing');
        return Response.json({ message: 'File and User ID are required' }, { status: 400 });
      }

      // Step 1: Upload the file to Supabase Storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents') // Ensure this bucket exists in Supabase Storage
        .upload(`user-${userId}/${file.name}`, file);

      if (fileError) {
        console.error('Supabase Storage Error:', fileError);
        return Response.json({ message: 'Failed to upload file', error: fileError.message }, { status: 400 });
      }

      console.log('File uploaded to Supabase:', fileData); // Log the file data

      // Step 2: Save the document details in MongoDB
      const document = new Document({
        userId,
        fileUrl: fileData.path, // Save the file path returned by Supabase
        status: 'pending', // Default status
      });
      await document.save();

      console.log('Document saved in MongoDB:', document); // Log the saved document

      return Response.json({ message: 'Document uploaded successfully!', document }, { status: 201 });
    } catch (error) {
      console.error('Error in document upload API:', error);
      return Response.json({ message: 'Failed to upload document', error: error.message }, { status: 500 });
    }
  }

// Get all documents (for admin) or documents for a specific user
export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = {};
    if (userId) query.userId = userId; // Filter by user ID
    if (status) query.status = status; // Filter by status
    if (startDate && endDate) {
      query.uploadedAt = { $gte: new Date(startDate), $lte: new Date(endDate) }; // Filter by date range
    }

    const documents = await Document.find(query);
    return Response.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json({ message: 'Failed to fetch documents', error: error.message }, { status: 500 });
  }
}

// Update document status (for admin)
