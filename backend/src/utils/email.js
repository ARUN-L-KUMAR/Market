const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter;

function getTransporter() {
    if (transporter) return transporter;

    // In production, use configured SMTP settings
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Verify connection configuration
        transporter.verify((error, success) => {
            if (error) {
                console.error('[Email] Transporter configuration error:', error.message);
            } else {
                console.log('[Email] Server is ready to take our messages');
            }
        });
    } else {
        // Fallback: log emails to console in development
        console.warn('[Email] SMTP not configured — emails will be logged to console.');
        transporter = {
            sendMail: async (options) => {
                console.log('\n📧 ====== EMAIL (dev mode) ======');
                console.log(`To: ${options.to}`);
                console.log(`Subject: ${options.subject}`);
                console.log(`Text: ${options.text || '(HTML email)'}`);
                console.log('================================\n');
                return { messageId: 'dev-' + Date.now() };
            }
        };
    }

    return transporter;
}

/**
 * Send an email
 * @param {Object} options - { to, subject, text, html }
 */
async function sendEmail({ to, subject, text, html }) {
    const transport = getTransporter();
    // Gmail often blocks emails if the 'from' address doesn't match the authenticated user
    const fromAddress = process.env.SMTP_FROM || `MARKET <${process.env.SMTP_USER}>`;

    const mailOptions = {
        from: fromAddress,
        to,
        subject,
        text,
        html
    };

    try {
        const info = await transport.sendMail(mailOptions);
        console.log(`[Email] Sent to ${to} — messageId: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`[Email] Failed to send to ${to}:`, err.message);
        throw err;
    }
}

/**
 * Send email verification email
 */
async function sendVerificationEmail(user, verificationToken) {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    return sendEmail({
        to: user.email,
        subject: 'Verify your email — MARKET',
        text: `Hi ${user.name},\n\nPlease verify your email by clicking the link below:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to MARKET! 🛒</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thanks for signing up! Please verify your email address to get started.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `
    });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    return sendEmail({
        to: user.email,
        subject: 'Reset your password — MARKET',
        text: `Hi ${user.name},\n\nYou requested a password reset. Click the link below:\n${resetUrl}\n\nThis link expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested a password reset for your MARKET account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #666; font-size: 14px;">This link expires in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      </div>
    `
    });
}

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
