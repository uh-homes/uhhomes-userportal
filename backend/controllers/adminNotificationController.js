const { Alert, User } = require("../models");
const { sendEmail } = require("../utils/sendEmail");

// POST /admin/notifications/push - Send push notification (in-app + optional email)
const sendPushNotification = async (req, res) => {
  try {
    const { title, message, type, recipients, sendEmail: shouldEmail } = req.body;
    // recipients: "all" | array of user IDs

    if (!title || !message) {
      return res.status(400).json({ status: "error", message: "Title and message are required." });
    }

    let targetUsers;
    if (recipients === "all" || !recipients) {
      targetUsers = await User.findAll({ where: { role: "user" }, attributes: ["id", "email", "fullName"] });
    } else {
      targetUsers = await User.findAll({ where: { id: recipients }, attributes: ["id", "email", "fullName"] });
    }

    if (targetUsers.length === 0) {
      return res.status(400).json({ status: "error", message: "No recipients found." });
    }

    // Create in-app alerts for all targets
    const alerts = await Alert.bulkCreate(
      targetUsers.map((u) => ({
        userId: u.id,
        title,
        message,
        type: type || "INFO",
        channel: "IN_APP",
        read: false,
      }))
    );

    // Optionally send email notifications
    let emailsSent = 0;
    if (shouldEmail) {
      for (const user of targetUsers) {
        try {
          await sendEmail({
            to: user.email,
            subject: `UH Homes: ${title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #C5A572, #D4AF37); padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="color: white; margin: 0;">UH Homes Notification</h2>
                </div>
                <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <h3 style="color: #1a1a1a; margin-top: 0;">${title}</h3>
                  <p style="color: #666; line-height: 1.6;">${message}</p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                  <p style="color: #999; font-size: 12px;">Hi ${user.fullName}, this notification was sent from your UH Homes project portal.</p>
                </div>
              </div>
            `,
          });
          emailsSent++;
        } catch (err) {
          console.error(`Failed to send email to ${user.email}:`, err.message);
        }
      }
    }

    res.status(201).json({
      status: "success",
      data: {
        alertsCreated: alerts.length,
        emailsSent,
        recipients: targetUsers.length,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/notifications/bulk - Send notification to multiple users with different messages
const sendBulkNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;
    // notifications: [{ userId, title, message, type }]

    if (!notifications || !notifications.length) {
      return res.status(400).json({ status: "error", message: "No notifications provided." });
    }

    const alerts = await Alert.bulkCreate(
      notifications.map((n) => ({
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type || "INFO",
        channel: "IN_APP",
        read: false,
      }))
    );

    res.status(201).json({ status: "success", data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/notifications/history - Get notification history with stats
const getNotificationHistory = async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    const totalSent = await Alert.count();
    const unread = await Alert.count({ where: { read: false } });
    const read = await Alert.count({ where: { read: true } });

    res.json({
      status: "success",
      data: {
        alerts,
        stats: { totalSent, unread, read, readRate: totalSent ? Math.round((read / totalSent) * 100) : 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { sendPushNotification, sendBulkNotifications, getNotificationHistory };
