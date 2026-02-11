
import nodemailer from 'nodemailer';
import { config } from '../config/env';

export class MailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        if (config.smtp.host && config.smtp.user && config.smtp.pass) {
            this.transporter = nodemailer.createTransport({
                host: config.smtp.host,
                port: config.smtp.port,
                secure: config.smtp.secure, // true for 465, false for other ports
                auth: {
                    user: config.smtp.user,
                    pass: config.smtp.pass,
                },
            });
            console.log('MailService initialized with SMTP settings');
        } else {
            console.log('MailService: SMTP settings not configured. Emails will strictly log to console.');
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        // If no transporter (or mock mode), log and return
        if (!this.transporter) {
            console.log('--- MOCK EMAIL SEND ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('--- Body ---');
            console.log(html);
            console.log('-----------------------');
            return true;
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
                to,
                subject,
                html,
            });
            console.log(`Email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            // Fallback to logging if sending fails
            console.log('--- FAILED EMAIL LOG ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(error);
            return false;
        }
    }

    async sendTestEmail(to: string): Promise<boolean> {
        const subject = 'Test Email from Gallery Studio';
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #4F46E5;">It Works!</h1>
                <p>This is a test email from your Gallery Studio application.</p>
                <p>If you are receiving this, your SMTP settings are configured correctly.</p>
                <p>Time sent: ${new Date().toLocaleString()}</p>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }
}

export const mailService = new MailService();
