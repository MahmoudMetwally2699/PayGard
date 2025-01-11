import nodemailer from 'nodemailer';

// Create transporter with alternative ports and settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587, // Try alternative port
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true, // Use pooled connections
  maxConnections: 3,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  debug: true,
  // Add more robust timeout settings
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

export async function sendStatusUpdateEmail(
  userEmail: string,
  paymentTitle: string,
  status: string,
  amount: number
) {
  console.log('Starting email send process with enhanced timeout...');

  // Add retries for transporter verification
  const maxRetries = 3;
  let currentTry = 0;

  while (currentTry < maxRetries) {
    try {
      await transporter.verify();
      console.log('SMTP connection verified on try:', currentTry + 1);

      const mailOptions = {
        from: 'mahmetwally99@gmail.com',
        to: userEmail,
        subject: `Payment Status Update - ${status.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Payment Status Update</h2>
            <p>Your payment status has been updated:</p>
            <div style="padding: 20px; border-radius: 8px; margin: 20px 0; background-color: #f8fafc;">
              <p><strong>Payment Title:</strong> ${paymentTitle}</p>
              <p><strong>Amount:</strong> $${amount}</p>
              <p><strong>New Status:</strong> <span style="color: ${
                status === 'approved' ? '#22c55e' :
                status === 'rejected' ? '#ef4444' :
                '#eab308'
              };">${status.toUpperCase()}</span></p>
            </div>
            <p>If you have any questions, please contact support.</p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      currentTry++;
      console.error(`Email attempt ${currentTry} failed:`, error);

      if (currentTry === maxRetries) {
        console.error('All email retry attempts failed');
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
