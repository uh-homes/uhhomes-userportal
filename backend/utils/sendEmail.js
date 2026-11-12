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

const stripHtml = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sendEmail = async ({ to, from, subject, html, text, replyTo }) => {
  try {
    await transporter.sendMail({
      // Sender must match the authenticated account or providers flag it as spoofed
      from: from || process.env.SMTP_FROM || `"UHHomes" <${process.env.SMTP_USER}>`,
      replyTo: replyTo || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || stripHtml(html),
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
    subject: `${otp} is your UHHomes verification code`,
    text: `Hi,

You requested a verification code for your UHHomes account.

Your code: ${otp}

This code expires in 10 minutes. Do not share it with anyone.

If you didn't request this, you can safely ignore this email.

— UHHomes Team
${process.env.FRONTEND_URL || "http://localhost:5173"}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0;">
        <div style="background: #1A1A1A; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C5A572; margin: 0; font-size: 24px;">UH HOMES</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #eee; border-top: none;">
          <p style="color: #333; font-size: 15px; margin-top: 0;">Hi,</p>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            You requested a verification code for your UHHomes account.
            Enter the code below to continue:
          </p>
          <div style="background: #FAF6ED; border: 1px solid #E8D5A3; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1A1A1A;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            This code expires in 10 minutes. Do not share it with anyone —
            UHHomes will never ask for this code.
          </p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #1A1A1A; padding: 16px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} UHHomes. All rights reserved.
          </p>
        </div>
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

const sendInquiryNotificationToAdmin = async (adminEmail, { userName, userEmail, homeAddress, projectName, subject, message, submittedAt }) => {
  return sendEmail({
    to: adminEmail,
    subject: `New Inquiry from ${userName} — ${subject}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
        <div style="background: #1A1A1A; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C5A572; margin: 0; font-size: 28px;">UH HOMES</h1>
          <p style="color: #999; font-size: 13px; margin: 8px 0 0;">New Inquiry Received</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-top: none;">
          <h2 style="color: #1A1A1A; margin-top: 0; font-size: 20px;">You have a new inquiry</h2>

          <div style="background: #f9f9f9; border-left: 4px solid #C5A572; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px; width: 120px;">Name</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">${userName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Email</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-size: 14px;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Home Address</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">${homeAddress || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Floor Plan</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-size: 14px;">${projectName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 13px;">Submitted</td>
                <td style="padding: 6px 0; color: #1A1A1A; font-size: 14px;">${submittedAt}</td>
              </tr>
            </table>
          </div>

          <div style="margin: 20px 0;">
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Subject</p>
            <p style="color: #1A1A1A; font-size: 16px; font-weight: 600; margin: 0;">${subject}</p>
          </div>

          <div style="margin: 20px 0;">
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Message</p>
            <div style="background: #f4f4f4; padding: 16px; border-radius: 8px; color: #333; font-size: 14px; line-height: 1.6;">
              ${message}
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0 10px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/inquiries"
               style="background: linear-gradient(135deg, #C5A572, #D4AF37); color: #1A1A1A; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              View & Respond in Portal
            </a>
          </div>
        </div>
        <div style="background: #1A1A1A; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #888; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} UHHomes. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

const sendInquiryResponseToUser = async (userEmail, { userName, subject, originalMessage, responseMessage, respondedAt }) => {
  return sendEmail({
    to: userEmail,
    subject: `Re: ${subject} — UH Homes Response`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
        <div style="background: #1A1A1A; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C5A572; margin: 0; font-size: 28px;">UH HOMES</h1>
          <p style="color: #999; font-size: 13px; margin: 8px 0 0;">Inquiry Response</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-top: none;">
          <h2 style="color: #1A1A1A; margin-top: 0; font-size: 20px;">Hi ${userName},</h2>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            The UH Homes team has responded to your inquiry. Here are the details:
          </p>

          <div style="margin: 20px 0;">
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Your Inquiry</p>
            <p style="color: #1A1A1A; font-size: 15px; font-weight: 600; margin: 0 0 6px;">${subject}</p>
            <div style="background: #f9f9f9; padding: 14px; border-radius: 8px; color: #666; font-size: 13px; line-height: 1.5; border-left: 3px solid #ddd;">
              ${originalMessage}
            </div>
          </div>

          <div style="margin: 24px 0;">
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Response from UH Homes</p>
            <div style="background: #f0f7f0; padding: 16px; border-radius: 8px; color: #1A1A1A; font-size: 14px; line-height: 1.6; border-left: 4px solid #C5A572;">
              ${responseMessage}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 8px;">Responded on ${respondedAt}</p>
          </div>

          <div style="text-align: center; margin: 30px 0 10px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/inquiries"
               style="background: linear-gradient(135deg, #C5A572, #D4AF37); color: #1A1A1A; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              View in Portal
            </a>
          </div>

          <p style="color: #666; font-size: 13px; margin-top: 20px;">
            If you have further questions, feel free to send another inquiry through your portal.
          </p>
        </div>
        <div style="background: #1A1A1A; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #888; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} UHHomes. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendOtpEmail, sendWelcomeEmail, sendInquiryNotificationToAdmin, sendInquiryResponseToUser };
