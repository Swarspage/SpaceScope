import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    // Strip spaces just in case user copied them from Google
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '',
  },
});

export const sendISSPassEmail = async (user, passData) => {
  const { riseTime, maxElevation, duration, direction } = passData;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background: #000; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; color: #00d4ff; margin: 0; }
        .details { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .label { color: #888; }
        .value { color: #00d4ff; font-weight: bold; }
        .cta { text-align: center; margin: 30px 0; }
        .button { background: #00d4ff; color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">🛰️ ISS Passes Over ${user.notificationSettings?.location?.city || 'Your Location'} Soon!</h1>
        </div>
        
        <p>Hi ${user.username},</p>
        <p>The International Space Station will be visible from your location soon!</p>
        
        <div class="details">
          <div class="detail-row">
            <span class="label">Rise Time</span>
            <span class="value">${riseTime}</span>
          </div>
          <div class="detail-row">
            <span class="label">Max Elevation</span>
            <span class="value">${maxElevation}° above horizon</span>
          </div>
          <div class="detail-row">
            <span class="label">Duration</span>
            <span class="value">${duration} minutes</span>
          </div>
          <div class="detail-row">
            <span class="label">Direction</span>
            <span class="value">${direction}</span>
          </div>
        </div>
        
        <p><strong>Viewing Tips:</strong></p>
        <ul>
          <li>Look for a bright moving "star" - no telescope needed!</li>
          <li>The ISS moves fast - it will cross the sky in ${duration} minutes</li>
          <li>Best viewed away from city lights</li>
        </ul>
        
        <div class="cta">
          <a href="${process.env.FRONTEND_URL}/iss-tracker" class="button">Track Live on SpaceScope</a>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you enabled ISS pass notifications.</p>
          <p><a href="${process.env.FRONTEND_URL}/settings" style="color: #00d4ff;">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SpaceScope" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🛰️ ISS visible in ${passData.hoursUntil} hours!`,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};
