/**
 * Email Service - Artist Onboarding & Notifications
 * Automated email sequences for Amy's Haven
 */

const nodemailer = require('nodemailer');
const { supabaseAdmin } = require('../config/supabase');

// Email templates
const EMAIL_TEMPLATES = {
    WELCOME: {
        subject: "Welcome to Amy's Haven! 🎨",
        html: (artistName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #6B46C1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .impact-box { background: #E9D5FF; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Amy's Haven!</h1>
            <p>Where your art creates change</p>
        </div>
        <div class="content">
            <h2>Hi ${artistName}! 👋</h2>
            <p>We're thrilled to have you join our community of talented artisans making a difference.</p>
            
            <div class="impact-box">
                <strong>🤝 Your Impact Matters</strong>
                <p>Every sale you make contributes 5% to homelessness solutions in communities across America. Together, we're crafting change, one purchase at a time.</p>
            </div>
            
            <h3>Getting Started in 3 Easy Steps:</h3>
            <ol>
                <li><strong>Complete Your Profile</strong> - Add your photo, bio, and tell your story</li>
                <li><strong>List Your First Product</strong> - Upload beautiful photos and descriptions</li>
                <li><strong>Share Your Shop</strong> - Spread the word and start selling!</li>
            </ol>
            
            <a href="https://amyshaven.com/artist-cms/dashboard.html" class="button">Go to Your Dashboard</a>
            
            <p>Need help? We're here for you:</p>
            <ul>
                <li>📧 Email: support@amyshaven.com</li>
                <li>📚 <a href="https://amyshaven.com/artist-help">Artist Guide</a></li>
                <li>💬 <a href="https://amyshaven.com/artist-community">Join Artist Community</a></li>
            </ul>
            
            <p>Looking forward to seeing your amazing creations!</p>
            <p>— The Amy's Haven Team</p>
        </div>
        <div class="footer">
            <p>Amy's Haven | Crafting Change, One Purchase at a Time</p>
            <p><a href="https://amyshaven.com">amyshaven.com</a></p>
        </div>
    </div>
</body>
</html>
        `
    },
    
    FIRST_PRODUCT: {
        subject: "🎉 Congratulations on Your First Product!",
        html: (artistName, productName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #6B46C1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .tip-box { background: #DBEAFE; padding: 15px; border-left: 4px solid #3B82F6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Product Published!</h1>
        </div>
        <div class="content">
            <h2>Awesome, ${artistName}!</h2>
            <p>Your product "<strong>${productName}</strong>" is now live on Amy's Haven!</p>
            
            <div class="tip-box">
                <strong>💡 Pro Tip: Boost Your Sales</strong>
                <ul>
                    <li>Share your product on social media</li>
                    <li>Add 3-5 more products (variety attracts more customers)</li>
                    <li>Use high-quality photos with good lighting</li>
                    <li>Tell the story behind your craft in descriptions</li>
                </ul>
            </div>
            
            <a href="https://amyshaven.com/artist-cms/dashboard.html" class="button">Add More Products</a>
            
            <h3>What's Next?</h3>
            <p>Keep building your shop! Artists with 5+ products see 3x more sales.</p>
            
            <p>You're doing great! 🌟</p>
            <p>— The Amy's Haven Team</p>
        </div>
    </div>
</body>
</html>
        `
    },
    
    FIRST_SALE: {
        subject: "🎊 You Made Your First Sale!",
        html: (artistName, orderTotal) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .celebration { font-size: 48px; text-align: center; margin: 20px 0; }
        .stats-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #6B46C1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="celebration">🎊 🎉 🎊</div>
            <h1>Congratulations!</h1>
            <h2>You Made Your First Sale!</h2>
        </div>
        <div class="content">
            <h2>Amazing work, ${artistName}!</h2>
            <p>Someone just purchased your beautiful creation!</p>
            
            <div class="stats-box">
                <h3 style="margin: 0; color: #6B46C1;">$${orderTotal}</h3>
                <p style="margin: 5px 0 0 0; color: #666;">Order Total</p>
                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                    💚 <strong>$${(orderTotal * 0.05).toFixed(2)}</strong> will go toward homelessness solutions
                </p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
                <li>Check your dashboard for order details</li>
                <li>Package your item with care</li>
                <li>Ship within 3-5 business days</li>
                <li>Add tracking info in your dashboard</li>
            </ol>
            
            <a href="https://amyshaven.com/artist-cms/orders.html" class="button">View Order Details</a>
            
            <p>This is just the beginning! Keep creating amazing work. 🌟</p>
            <p>— The Amy's Haven Team</p>
        </div>
    </div>
</body>
</html>
        `
    },
    
    TIPS_DAY3: {
        subject: "3 Quick Tips to Boost Your Amy's Haven Shop 📈",
        html: (artistName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .tip { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #6B46C1; border-radius: 4px; }
        .button { display: inline-block; background: #6B46C1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tips from Successful Artists</h1>
        </div>
        <div class="content">
            <h2>Hi ${artistName}! 👋</h2>
            <p>Here are 3 proven strategies from our top-performing artists:</p>
            
            <div class="tip">
                <h3>📸 1. Photography Makes the Difference</h3>
                <p>Products with 3+ high-quality photos sell 2x faster. Use natural lighting and show different angles.</p>
            </div>
            
            <div class="tip">
                <h3>📝 2. Tell Your Story</h3>
                <p>Customers connect with the story behind your work. Share your inspiration and creative process in product descriptions.</p>
            </div>
            
            <div class="tip">
                <h3>🔄 3. Keep Adding Products</h3>
                <p>Artists with 8+ products see 5x more traffic. Aim to add 1-2 new products per week.</p>
            </div>
            
            <a href="https://amyshaven.com/artist-cms/dashboard.html" class="button">Update Your Shop</a>
            
            <p>You've got this! 💪</p>
            <p>— The Amy's Haven Team</p>
        </div>
    </div>
</body>
</html>
        `
    }
};

// Create transporter
const createTransporter = () => {
    if (process.env.SENDGRID_API_KEY) {
        // Use SendGrid
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    } else if (process.env.SMTP_HOST) {
        // Use SMTP (Gmail, etc.)
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        console.warn('⚠️ No email service configured - emails will be logged only');
        return null;
    }
};

/**
 * Log email to database
 */
const logEmail = async (artistId, emailType, recipientEmail, subject, status, errorMessage = null) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('email_logs')
            .insert([{
                artist_id: artistId,
                email_type: emailType,
                recipient_email: recipientEmail,
                subject: subject,
                status: status,
                error_message: errorMessage,
                sent_at: status === 'sent' ? new Date() : null
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error logging email:', error);
        return null;
    }
};

/**
 * Send email
 */
const sendEmail = async (to, subject, html, artistId = null, emailType = 'general') => {
    const transporter = createTransporter();
    
    // If no transporter (dev mode), just log
    if (!transporter) {
        console.log(`
        ════════════════════════════════════════
        📧 EMAIL (Development Mode - Not Sent)
        ════════════════════════════════════════
        To: ${to}
        Subject: ${subject}
        Type: ${emailType}
        ════════════════════════════════════════
        `);
        
        if (artistId) {
            await logEmail(artistId, emailType, to, subject, 'sent');
        }
        
        return { success: true, mode: 'development' };
    }
    
    try {
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@amyshaven.com',
            to: to,
            subject: subject,
            html: html
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent: ${subject} to ${to}`);
        
        if (artistId) {
            await logEmail(artistId, emailType, to, subject, 'sent');
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        
        if (artistId) {
            await logEmail(artistId, emailType, to, subject, 'failed', error.message);
        }
        
        return { success: false, error: error.message };
    }
};

/**
 * Artist Onboarding Sequence
 */
const sendWelcomeEmail = async (artistId, artistName, artistEmail) => {
    const template = EMAIL_TEMPLATES.WELCOME;
    return await sendEmail(
        artistEmail,
        template.subject,
        template.html(artistName),
        artistId,
        'welcome'
    );
};

const sendFirstProductEmail = async (artistId, artistName, artistEmail, productName) => {
    const template = EMAIL_TEMPLATES.FIRST_PRODUCT;
    return await sendEmail(
        artistEmail,
        template.subject,
        template.html(artistName, productName),
        artistId,
        'first_product'
    );
};

const sendFirstSaleEmail = async (artistId, artistName, artistEmail, orderTotal) => {
    const template = EMAIL_TEMPLATES.FIRST_SALE;
    return await sendEmail(
        artistEmail,
        template.subject,
        template.html(artistName, orderTotal),
        artistId,
        'first_sale'
    );
};

const sendDay3TipsEmail = async (artistId, artistName, artistEmail) => {
    const template = EMAIL_TEMPLATES.TIPS_DAY3;
    return await sendEmail(
        artistEmail,
        template.subject,
        template.html(artistName),
        artistId,
        'tips_day3'
    );
};

/**
 * Schedule day 3 tips email (call this from a cron job or scheduled task)
 */
const scheduleDay3Tips = async () => {
    try {
        // Find artists who registered 3 days ago and haven't received day 3 tips
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const { data: artists, error } = await supabaseAdmin
            .from('artists')
            .select('id, business_name, email')
            .gte('created_at', threeDaysAgo.toISOString())
            .lte('created_at', new Date(threeDaysAgo.getTime() + 86400000).toISOString()) // +24 hours
            .eq('email_notifications', true);
        
        if (error) throw error;
        
        for (const artist of artists) {
            // Check if already sent
            const { data: existing } = await supabaseAdmin
                .from('email_logs')
                .select('id')
                .eq('artist_id', artist.id)
                .eq('email_type', 'tips_day3')
                .eq('status', 'sent')
                .single();
            
            if (!existing) {
                await sendDay3TipsEmail(artist.id, artist.business_name, artist.email);
            }
        }
        
        console.log(`✅ Sent day 3 tips to ${artists.length} artists`);
    } catch (error) {
        console.error('Error scheduling day 3 tips:', error);
    }
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendFirstProductEmail,
    sendFirstSaleEmail,
    sendDay3TipsEmail,
    scheduleDay3Tips
};
