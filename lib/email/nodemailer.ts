import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

// Lazy initialize transporter
function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Only verify in production when actually needed
  if (process.env.NODE_ENV === 'production') {
    transporter.verify().catch(err => {
      console.error('Email service verification failed:', err);
    });
  }

  return transporter;
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  try {
    const mailOptions = {
      from: from || process.env.EMAIL_FROM || 'noreply@gharmart.com',
      to,
      subject,
      html: html || text,
      text: text,
    };

    const emailTransporter = getTransporter();
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  welcomeEmail: (userName: string, email: string) => ({
    subject: 'Welcome to GharMart!',
    html: `
      <h1>Welcome to GharMart, ${userName}!</h1>
      <p>We&apos;re excited to have you on board.</p>
      <p>Your account is now active and you can start shopping for groceries and daily essentials.</p>
      <p>Happy shopping!</p>
      <p>GharMart Team</p>
    `,
  }),

  otpEmail: (otp: string, expiryMinutes: number = 10) => ({
    subject: 'Your OTP Verification Code',
    html: `
      <h2>OTP Verification</h2>
      <p>Your OTP verification code is:</p>
      <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${otp}</h1>
      <p>This code will expire in ${expiryMinutes} minutes.</p>
      <p>If you didn&apos;t request this code, please ignore this email.</p>
      <p>GharMart Team</p>
    `,
  }),

  passwordResetEmail: (resetLink: string, expiryHours: number = 24) => ({
    subject: 'Password Reset Request - GharMart',
    html: `
      <h2>Password Reset</h2>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>Or copy this link: ${resetLink}</p>
      <p>This link will expire in ${expiryHours} hours.</p>
      <p>If you didn&apos;t request this, please ignore this email.</p>
      <p>GharMart Team</p>
    `,
  }),

  orderConfirmation: (orderNumber: string, orderTotal: number, items: any[]) => ({
    subject: `Order Confirmation - GharMart Order #${orderNumber}`,
    html: `
      <h2>Order Confirmed!</h2>
      <p>Thank you for your order.</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <h3>Items:</h3>
      <ul>
        ${items.map(item => `<li>${item.name} x ${item.quantity} - ₹${item.total}</li>`).join('')}
      </ul>
      <p><strong>Total:</strong> ₹${orderTotal}</p>
      <p>You can track your order in your GharMart account.</p>
      <p>GharMart Team</p>
    `,
  }),

  orderStatusUpdate: (orderNumber: string, status: string, message: string) => ({
    subject: `Order Update - GharMart Order #${orderNumber}`,
    html: `
      <h2>Order Status Update</h2>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p>${message}</p>
      <p>Track your order in your GharMart account.</p>
      <p>GharMart Team</p>
    `,
  }),

  deliveryNotification: (estimatedTime: string, phoneNumber: string) => ({
    subject: 'Your Order is on the Way!',
    html: `
      <h2>Out for Delivery</h2>
      <p>Your order is on its way!</p>
      <p><strong>Estimated Delivery Time:</strong> ${estimatedTime}</p>
      <p><strong>Delivery Partner Contact:</strong> ${phoneNumber}</p>
      <p>Track your order in real-time in the GharMart app.</p>
      <p>GharMart Team</p>
    `,
  }),
};

export default getTransporter;
