const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"UHHomes" <noreply@uhhomes.com>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email send failed:", error.message);
    // Don't throw - allow app to continue even if email fails in dev
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    return false;
  }
};

const sendOtpEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Your UHHomes Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #22c55e;">UHHomes</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
};

const sendWelcomeEmail = async (email, fullName) => {
  return sendEmail({
    to: email,
    subject: "Welcome to UHHomes!",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
        <div style="background: #1A1A1A; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C5A572; margin: 0; font-size: 28px;">UH HOMES</h1>
        </div>
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #eee; border-top: none;">
          <h2 style="color: #1A1A1A; margin-top: 0;">Welcome, ${fullName}!</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your account has been successfully created. We're thrilled to have you on board!
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            With your UHHomes portal, you can:
          </p>
          <ul style="color: #333; font-size: 15px; line-height: 2;">
            <li>Track your construction progress in real-time</li>
            <li>View project updates and milestones</li>
            <li>Browse and save your favorite floor plans</li>
            <li>Stay updated with alerts and notifications</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background: linear-gradient(135deg, #C5A572, #D4AF37); color: #1A1A1A; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
        <div style="background: #1A1A1A; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} UHHomes. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendOtpEmail, sendWelcomeEmail };
