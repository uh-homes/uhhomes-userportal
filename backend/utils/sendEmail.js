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

const sendEmail = async ({ to, from, subject, html, text, replyTo, headers, unsubscribeUrl }) => {
  try {
    // Bulk/notification mail should offer one-click unsubscribe (Gmail/Yahoo sender rules)
    const mailHeaders = { ...headers };
    if (unsubscribeUrl) {
      mailHeaders["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
      mailHeaders["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }

    await transporter.sendMail({
      // Sender must match the authenticated account or providers flag it as spoofed
      from: from || process.env.SMTP_FROM || `"UHHomes" <${process.env.SMTP_USER}>`,
      replyTo: replyTo || process.env.SMTP_REPLY_TO || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || stripHtml(html),
      headers: Object.keys(mailHeaders).length ? mailHeaders : undefined,
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

// --- Project Update Notification Emails ---

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const projectEmailWrapper = (subtitle, bodyHtml) => `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
    <div style="background: #1A1A1A; padding: 24px 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #C5A572; margin: 0; font-size: 26px;">UH HOMES</h1>
      <p style="color: #999; font-size: 13px; margin: 8px 0 0;">${subtitle}</p>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-top: none;">
      ${bodyHtml}
    </div>
    <div style="background: #1A1A1A; padding: 16px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #888; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} UHHomes. All rights reserved.</p>
    </div>
  </div>
`;

const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETE: "Complete",
  COMPLETED: "Completed",
  DELAYED: "Delayed",
  PLANNING: "Planning",
};

const sendMilestoneUpdateEmail = async (userEmail, { userName, projectName, milestoneName, oldStatus, newStatus, progress, description }) => {
  const statusChanged = oldStatus && newStatus && oldStatus !== newStatus;
  const statusLabel = STATUS_LABELS[newStatus] || newStatus;
  const oldStatusLabel = STATUS_LABELS[oldStatus] || oldStatus;

  let headline = `Milestone Updated: ${milestoneName}`;
  if (statusChanged) headline = `Milestone ${statusLabel}: ${milestoneName}`;

  const rows = [];
  rows.push(`<tr><td style="padding:6px 0;color:#888;font-size:13px;width:120px;">Project</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${projectName}</td></tr>`);
  rows.push(`<tr><td style="padding:6px 0;color:#888;font-size:13px;">Milestone</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${milestoneName}</td></tr>`);
  if (statusChanged) {
    rows.push(`<tr><td style="padding:6px 0;color:#888;font-size:13px;">Status</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;">${oldStatusLabel} → <strong>${statusLabel}</strong></td></tr>`);
  } else if (newStatus) {
    rows.push(`<tr><td style="padding:6px 0;color:#888;font-size:13px;">Status</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${statusLabel}</td></tr>`);
  }
  if (progress !== undefined && progress !== null) {
    rows.push(`<tr><td style="padding:6px 0;color:#888;font-size:13px;">Progress</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${progress}%</td></tr>`);
  }
  if (description) {
    rows.push(`<tr><td style="padding:6px 0;color:#888;font-size:13px;">Notes</td><td style="padding:6px 0;color:#333;font-size:14px;">${description}</td></tr>`);
  }

  return sendEmail({
    to: userEmail,
    subject: `UH Homes: ${headline}`,
    unsubscribeUrl: `${FRONTEND_URL}/settings`,
    html: projectEmailWrapper("Construction Update", `
      <h2 style="color:#1A1A1A;margin-top:0;font-size:20px;">Hi ${userName},</h2>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        There's an update on your construction project:
      </p>
      <div style="background:#f9f9f9;border-left:4px solid #C5A572;padding:16px;border-radius:4px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">${rows.join("")}</table>
      </div>
      <div style="text-align:center;margin:30px 0 10px;">
        <a href="${FRONTEND_URL}/construction-tracker"
           style="background:linear-gradient(135deg,#C5A572,#D4AF37);color:#1A1A1A;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">
          View Construction Tracker
        </a>
      </div>
    `),
  });
};

const sendProjectStatusEmail = async (userEmail, { userName, projectName, oldStatus, newStatus }) => {
  const statusLabel = STATUS_LABELS[newStatus] || newStatus;
  const oldStatusLabel = STATUS_LABELS[oldStatus] || oldStatus;

  return sendEmail({
    to: userEmail,
    subject: `UH Homes: Project Status Updated — ${projectName}`,
    unsubscribeUrl: `${FRONTEND_URL}/settings`,
    html: projectEmailWrapper("Project Update", `
      <h2 style="color:#1A1A1A;margin-top:0;font-size:20px;">Hi ${userName},</h2>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        Your project status has been updated:
      </p>
      <div style="background:#f9f9f9;border-left:4px solid #C5A572;padding:16px;border-radius:4px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#888;font-size:13px;width:120px;">Project</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${projectName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:13px;">Status</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;">${oldStatusLabel} → <strong>${statusLabel}</strong></td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:30px 0 10px;">
        <a href="${FRONTEND_URL}/dashboard"
           style="background:linear-gradient(135deg,#C5A572,#D4AF37);color:#1A1A1A;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">
          View Dashboard
        </a>
      </div>
    `),
  });
};

const sendSiteUpdateEmail = async (userEmail, { userName, projectName, updateTitle, updateDescription }) => {
  return sendEmail({
    to: userEmail,
    subject: `UH Homes: New Site Update — ${projectName}`,
    unsubscribeUrl: `${FRONTEND_URL}/settings`,
    html: projectEmailWrapper("Site Update", `
      <h2 style="color:#1A1A1A;margin-top:0;font-size:20px;">Hi ${userName},</h2>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        A new site update has been posted for your project:
      </p>
      <div style="background:#f9f9f9;border-left:4px solid #C5A572;padding:16px;border-radius:4px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#888;font-size:13px;width:120px;">Project</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${projectName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:13px;">Update</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${updateTitle}</td></tr>
          ${updateDescription ? `<tr><td style="padding:6px 0;color:#888;font-size:13px;">Details</td><td style="padding:6px 0;color:#333;font-size:14px;">${updateDescription}</td></tr>` : ""}
        </table>
      </div>
      <div style="text-align:center;margin:30px 0 10px;">
        <a href="${FRONTEND_URL}/construction-timeline"
           style="background:linear-gradient(135deg,#C5A572,#D4AF37);color:#1A1A1A;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">
          View Timeline
        </a>
      </div>
    `),
  });
};

const sendGalleryUpdateEmail = async (userEmail, { userName, projectName, phase, photoCount }) => {
  return sendEmail({
    to: userEmail,
    subject: `UH Homes: New Photos Added — ${projectName}`,
    unsubscribeUrl: `${FRONTEND_URL}/settings`,
    html: projectEmailWrapper("Gallery Update", `
      <h2 style="color:#1A1A1A;margin-top:0;font-size:20px;">Hi ${userName},</h2>
      <p style="color:#333;font-size:15px;line-height:1.6;">
        New photos have been added to your project gallery:
      </p>
      <div style="background:#f9f9f9;border-left:4px solid #C5A572;padding:16px;border-radius:4px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#888;font-size:13px;width:120px;">Project</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${projectName}</td></tr>
          ${phase ? `<tr><td style="padding:6px 0;color:#888;font-size:13px;">Phase</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${phase}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#888;font-size:13px;">Photos</td><td style="padding:6px 0;color:#1A1A1A;font-size:14px;font-weight:600;">${photoCount} new photo${photoCount > 1 ? "s" : ""}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:30px 0 10px;">
        <a href="${FRONTEND_URL}/gallery"
           style="background:linear-gradient(135deg,#C5A572,#D4AF37);color:#1A1A1A;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">
          View Gallery
        </a>
      </div>
    `),
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendWelcomeEmail,
  sendInquiryNotificationToAdmin,
  sendInquiryResponseToUser,
  sendMilestoneUpdateEmail,
  sendProjectStatusEmail,
  sendSiteUpdateEmail,
  sendGalleryUpdateEmail,
};
