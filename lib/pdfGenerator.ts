import jsPDF from 'jspdf';

interface Payment {
  _id: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface User {
  email: string;
}

export async function generateInvoicePDF(payment: Payment, user: User) {
  // Create new PDF document
  const doc = new jsPDF();

  // Helper function for adding text
  const addText = (text: string, y: number, options = {}) => {
    doc.text(text, 20, y, options);
  };

  // Add header
  doc.setFontSize(20);
  doc.text('PayGuard Invoice', 105, 20, { align: 'center' });

  // Add line
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  // Add invoice details
  doc.setFontSize(12);
  let y = 40;

  // Invoice info section
  addText(`Invoice Number: INV-${payment._id}`, y);
  addText(`Date: ${new Date().toLocaleDateString()}`, y += 10);
  addText(`Customer: ${user.email}`, y += 10);

  // Payment details section
  y += 20;
  addText('Payment Details:', y);
  addText(`Title: ${payment.title}`, y += 10);
  addText(`Amount: $${payment.amount.toFixed(2)}`, y += 10);
  addText(`Status: ${payment.status.toUpperCase()}`, y += 10);
  addText(`Payment Date: ${new Date(payment.createdAt).toLocaleDateString()}`, y += 10);

  // Add footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, 250, { align: 'center' });
  doc.text('PayGuard Payment System', 105, 260, { align: 'center' });

  // Return the PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
}
