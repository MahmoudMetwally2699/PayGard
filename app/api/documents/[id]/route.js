import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';
import mongoose from 'mongoose';

export async function PUT(request, { params }) {
    await dbConnect();
    try {
        const id = params.id; // Extract ID from route params
        const { status } = await request.json();
        console.log('Updating document with ID:', id);
        console.log('New status:', status);

        // Convert ID to ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return Response.json({ message: 'Invalid document ID' }, { status: 400 });
        }

        const objectId = new mongoose.Types.ObjectId(id);

        const document = await Document.findByIdAndUpdate(objectId, { status }, { new: true });
        if (!document) {
            console.error('Document not found for ID:', id);
            return Response.json({ message: 'Document not found' }, { status: 404 });
        }

        console.log('Document updated successfully:', document);
        return Response.json(document);
    } catch (error) {
        console.error('Error updating document status:', error);
        return Response.json({ message: 'Failed to update document status', error: error.message }, { status: 500 });
    }
}
