/**
 * Email Service
 * Handles sending emails for the Washington Artisan Marketplace
 */

const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
    // For production, use real SMTP credentials from environment variables
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    
    // For development/testing, just log emails to console
    return {
        sendMail: async (options) => {
            console.log('\n📧 ========== EMAIL SENT ==========');
            console.log(`To: ${options.to}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Body Preview: ${options.text?.substring(0, 100) || 'HTML email'}...`);
            console.log('===================================\n');
            return { messageId: 'dev-' + Date.now() };
        }
    };
};

const transporter = createTransporter();

// Company info
const COMPANY_NAME = 'Washington Artisan Marketplace';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'hello@waartisan.com';
const COMPANY_URL = process.env.COMPANY_URL || 'https://waartisan.com';

/**
 * Send Welcome Email to new customers
 */
const sendWelcomeEmail = async (email, name) => {
    const firstName = name ? name.split(' ')[0] : 'there';
    
    const mailOptions = {
        from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
        to: email,
        subject: `Welcome to ${COMPANY_NAME}! 🎨`,
        text: `
Hi ${firstName}!

Welcome to ${COMPANY_NAME}!

We're thrilled to have you join our community of art lovers and supporters. Here's what you can do now:

🛍️ SHOP - Browse unique handmade items from talented Washington artists
❤️ SAVE - Add items to your wishlist for later
🌟 SUPPORT - Every purchase contributes 5% to fighting homelessness

Start exploring: ${COMPANY_URL}

Thank you for being part of our mission to support local artists and make a difference in our community.

With gratitude,
The ${COMPANY_NAME} Team

---
Questions? Reply to this email or visit our help center.
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${COMPANY_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎨 ${COMPANY_NAME}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">Hi ${firstName}! 👋</h2>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Welcome to <strong>${COMPANY_NAME}</strong>! We're thrilled to have you join our community of art lovers and supporters.
                            </p>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Here's what you can do now:
                            </p>
                            
                            <!-- Features -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 15px; background-color: #f5f3ff; border-radius: 12px; margin-bottom: 10px;">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="font-size: 24px; padding-right: 15px;">🛍️</td>
                                                <td>
                                                    <strong style="color: #7c3aed;">SHOP</strong>
                                                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Browse unique handmade items from talented Washington artists</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr><td style="height: 10px;"></td></tr>
                                <tr>
                                    <td style="padding: 15px; background-color: #fef3c7; border-radius: 12px;">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="font-size: 24px; padding-right: 15px;">❤️</td>
                                                <td>
                                                    <strong style="color: #d97706;">SAVE</strong>
                                                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Add items to your wishlist for later</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr><td style="height: 10px;"></td></tr>
                                <tr>
                                    <td style="padding: 15px; background-color: #d1fae5; border-radius: 12px;">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="font-size: 24px; padding-right: 15px;">🌟</td>
                                                <td>
                                                    <strong style="color: #059669;">SUPPORT</strong>
                                                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Every purchase contributes 5% to fighting homelessness</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="${COMPANY_URL}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                                            Start Exploring →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                Thank you for being part of our mission to support local artists.
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                With gratitude,<br>
                                The ${COMPANY_NAME} Team
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Unsubscribe -->
                <table width="600" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                Questions? Reply to this email or visit our help center.<br>
                                © ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim()
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email} (${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send welcome email to ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send Welcome Email to new artists
 */
const sendArtistWelcomeEmail = async (email, businessName) => {
    const mailOptions = {
        from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
        to: email,
        subject: `Welcome to ${COMPANY_NAME}, Artist! 🎨`,
        text: `
Hi ${businessName}!

Welcome to ${COMPANY_NAME}!

We're excited to have you as a seller on our platform. Here's how to get started:

1. Complete your shop profile
2. Add your first products
3. Set up your payment information
4. Start selling!

Remember, 5% of every sale goes to fighting homelessness in Washington.

Visit your dashboard: ${COMPANY_URL}/artist-cms/dashboard.html

Questions? Reply to this email.

The ${COMPANY_NAME} Team
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome Artist!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0;">🎨 Welcome, Artist!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #111827;">Hi ${businessName}!</h2>
                            <p style="color: #4b5563; line-height: 1.6;">
                                We're thrilled to have you join our community of talented Washington artists!
                            </p>
                            <p style="color: #4b5563; line-height: 1.6;">
                                <strong>Get started:</strong>
                            </p>
                            <ol style="color: #4b5563; line-height: 2;">
                                <li>Complete your shop profile</li>
                                <li>Add your first products</li>
                                <li>Set up your payment information</li>
                                <li>Start selling!</li>
                            </ol>
                            <p style="text-align: center; margin-top: 30px;">
                                <a href="${COMPANY_URL}/artist-cms/dashboard.html" style="background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold;">
                                    Go to Dashboard →
                                </a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim()
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Artist welcome email sent to ${email}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send artist welcome email:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (email, resetToken, userType = 'customer') => {
    const resetUrl = `${COMPANY_URL}/frontend/reset-password.html?token=${resetToken}`;
    
    const mailOptions = {
        from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
        to: email,
        subject: `Reset Your Password - ${COMPANY_NAME}`,
        text: `
You requested a password reset.

Click this link to reset your password:
${resetUrl}

This link expires in 1 hour.

If you didn't request this, please ignore this email.

The ${COMPANY_NAME} Team
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px;">
                    <tr>
                        <td style="padding: 40px; text-align: center;">
                            <h2 style="color: #111827;">Reset Your Password</h2>
                            <p style="color: #4b5563;">Click the button below to reset your password. This link expires in 1 hour.</p>
                            <p style="margin: 30px 0;">
                                <a href="${resetUrl}" style="background: #7C3AED; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold;">
                                    Reset Password
                                </a>
                            </p>
                            <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim()
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send password reset email:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendArtistWelcomeEmail,
    sendPasswordResetEmail
};
