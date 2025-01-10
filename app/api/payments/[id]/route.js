import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { ObjectId } from 'mongodb'; // Import ObjectId for conversion

export async function POST(request) {
    await dbConnect();
    try {
      const { title, amount, userId } = await request.json();
      console.log('Request Body:', { title, amount, userId });

      if (!title || !amount || !userId) {
        return Response.json({ message: 'Missing required fields' }, { status: 400 });
      }

      // No need to convert userId to ObjectId
      const payment = new Payment({ title, amount, userId });
      await payment.save();
      console.log('Payment created:', payment);

      return Response.json(payment, { status: 201 });
    } catch (error) {
      console.error('Error creating payment:', error);
      return Response.json({ message: 'Failed to create payment', error: error.message }, { status: 500 });
    }
  }


// Get all payments (for admin) or payments for a specific user
export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let payments;
    if (userId) {
      payments = await Payment.find({ userId }); // Get payments for a specific user
    } else {
      payments = await Payment.find({}); // Get all payments (for admin)
    }

    return Response.json(payments);
  } catch (error) {
    return Response.json({ message: 'Failed to fetch payments', error: error.message }, { status: 500 });
  }
}

// Update payment status (for admin)
export async function PUT(request, { params }) {
    await dbConnect();
    try {
      const { id } = params; // Extract the payment ID from the URL
      const { status } = await request.json(); // Extract the status from the request body
      console.log('Updating payment:', { id, status }); // Debug log

      // Query the database using the string _id
      const payment = await Payment.findOneAndUpdate(
        { _id: id }, // Find by string _id
        { status }, // Update the status
        { new: true } // Return the updated document
      );

      if (!payment) {
        console.log('Payment not found:', id); // Debug log
        return Response.json({ message: 'Payment not found' }, { status: 404 });
      }

      console.log('Payment updated successfully:', payment); // Debug log
      return Response.json(payment);
    } catch (error) {
      console.error('Error updating payment:', error); // Debug log
      return Response.json({ message: 'Failed to update payment', error: error.message }, { status: 500 });
    }
  }
