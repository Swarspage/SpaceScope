import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the current directory
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');

if (process.env.EMAIL_PASS) {
    // Check for spaces in password and warn/fix
    if (process.env.EMAIL_PASS.includes(' ')) {
        console.log('⚠️ Warning: EMAIL_PASS contains spaces. Nodemailer might require them removed.');
        console.log('Attempting to strip spaces for the test...');
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        // Google App Passwords often have spaces, helpful to strip them just in case
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '',
    },
});

async function verify() {
    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('Sending test email to self...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'SpaceScope Configuration Test',
            text: 'If you receive this, Nodemailer is configured correctly!',
        });
        console.log('✅ Test Email Sent!', info.messageId);
    } catch (error) {
        console.error('❌ Configuration Error:', error);
    }
}

verify();
