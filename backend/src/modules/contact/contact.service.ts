import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { ContactSubmissionDTO } from './contact.types';

function sanitizeInput(str: string): string {
  if (!str) return '';
  // Strip HTML tags and dangerous characters
  return str.replace(/<[^>]*>?/gm, '').trim();
}

export class ContactService {
  private static mockTransporter: Transporter | null = null;

  /**
   * Allows setting a mock transporter for testing purposes
   */
  public static setMockTransporter(transporter: Transporter | null) {
    this.mockTransporter = transporter;
  }

  private static getTransporter(): Transporter | null {
    if (this.mockTransporter) {
      return this.mockTransporter;
    }

    if (env.SMTP_HOST && (env.SMTP_USER || process.env.SMTP_PASS)) {
      const port = env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : 587;
      const secure = env.SMTP_SECURE === 'true' || port === 465;
      return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port,
        secure,
        auth: env.SMTP_USER
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS || '',
            }
          : undefined,
      });
    }

    return null;
  }

  public static async submitContactForm(
    data: ContactSubmissionDTO,
  ): Promise<{ success: boolean; message: string }> {
    const cleanName = sanitizeInput(data.name);
    const cleanEmail = sanitizeInput(data.email);
    const cleanSubject = sanitizeInput(data.subject);
    const cleanMessage = sanitizeInput(data.message);

    const recipient = env.CONTACT_RECIPIENT_EMAIL || 'support@rideroundup.com';
    const transporter = this.getTransporter();

    if (!transporter) {
      logger.warn(
        { recipient, subject: cleanSubject },
        'Contact form submission attempted but SMTP email provider is not configured.',
      );
      throw new Error('EMAIL_NOT_CONFIGURED');
    }

    const mailOptions = {
      from: env.SMTP_FROM || `"${cleanName}" <noreply@rideroundup.com>`,
      replyTo: `"${cleanName}" <${cleanEmail}>`,
      to: recipient,
      subject: `[Contact Us] ${cleanSubject} - from ${cleanName}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="color: #2563eb;">New Contact Us Form Submission</h2>
          <p><strong>From:</strong> ${cleanName} (&lt;${cleanEmail}&gt;)</p>
          <p><strong>Subject:</strong> ${cleanSubject}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <h3 style="color: #374151;">Message:</h3>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${cleanMessage}</div>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(
        { messageId: info.messageId, recipient },
        'Contact email successfully sent via email provider.',
      );

      return {
        success: true,
        message: 'Thank you for reaching out! Your message has been sent successfully.',
      };
    } catch (err: any) {
      logger.error({ err, recipient }, 'Email provider failed to deliver contact message.');
      throw new Error(`Email delivery failed: ${err.message || 'Unknown provider error'}`);
    }
  }
}
