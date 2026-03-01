/**
 * Email service using Resend Batch API
 * Sends registration confirmation and admin notifications using batch sending
 */

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const adminEmail = process.env.ADMIN_EMAIL || 'khanmaghaz29@gmail.com';

const resend = new Resend(resendApiKey);

interface RegistrationEmailData {
  userEmail: string;
  companyName: string;
  facilityType: string;
  country: string;
}

interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Send batch emails using Resend Batch API
 */
async function sendBatchEmails(emails: EmailMessage[]) {
  try {
    if (emails.length === 0) return { data: [], error: null };

    // Use batch API for multiple emails
    const result = await resend.batch.send(emails);
    return result;
  } catch (error) {
    console.error('Error sending batch emails:', error);
    throw error;
  }
}

/**
 * Send registration confirmation to user
 */
export async function sendRegistrationConfirmationEmail(data: RegistrationEmailData) {
  try {
    const email: EmailMessage = {
      from: 'onboarding@resend.dev',
      to: data.userEmail,
      subject: 'AuraCarbon Registration Received ✨',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00FF88;">Thank you for registering with AuraCarbon!</h1>
          
          <p>Hi,</p>
          
          <p>We've received your registration request with the following details:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Facility Type:</strong> ${data.facilityType}</p>
            <p><strong>Country:</strong> ${data.country}</p>
            <p><strong>Email:</strong> ${data.userEmail}</p>
          </div>
          
          <p>An administrator will review your request and approve your account shortly. You'll receive a confirmation email with your login credentials once approved.</p>
          
          <p>Thank you for joining us on this sustainability journey!</p>
          
          <p>Best regards,<br/>The AuraCarbon Team</p>
        </div>
      `,
    };

    const result = await sendBatchEmails([email]);
    return result;
  } catch (error) {
    console.error('Error sending registration confirmation:', error);
    throw error;
  }
}

/**
 * Send approval notification to admin
 */
export async function sendAdminNotificationEmail(data: RegistrationEmailData, registrationId: string) {
  try {
    const approvalUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin/approvals?id=${registrationId}`;

    const email: EmailMessage = {
      from: 'onboarding@resend.dev',
      to: adminEmail,
      subject: `New AuraCarbon Registration: ${data.companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00CCFF;">New Registration Pending Approval</h1>
          
          <p>A new user has registered for AuraCarbon:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Facility Type:</strong> ${data.facilityType}</p>
            <p><strong>Country:</strong> ${data.country}</p>
            <p><strong>Email:</strong> ${data.userEmail}</p>
          </div>
          
          <p>
            <a href="${approvalUrl}" style="background: #00FF88; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Review Registration
            </a>
          </p>
          
          <p>You can also log in to the admin panel to manage registrations.</p>
        </div>
      `,
    };

    const result = await sendBatchEmails([email]);
    return result;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw error;
  }
}

/**
 * Send approval confirmation to user
 */
export async function sendApprovalConfirmationEmail(
  userEmail: string,
  companyName: string,
  tempPassword: string
) {
  try {
    const email: EmailMessage = {
      from: 'onboarding@resend.dev',
      to: userEmail,
      subject: 'Your AuraCarbon Account is Approved! 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00FF88;">Your Account is Approved!</h1>
          
          <p>Hi,</p>
          
          <p>Great news! Your AuraCarbon account for <strong>${companyName}</strong> has been approved by our administrator.</p>
          
          <h3>Login Details:</h3>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          
          <p>
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" style="background: #00FF88; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Log in now
            </a>
          </p>
          
          <p><strong>Important:</strong> Please change your password immediately after your first login.</p>
          
          <p>Welcome to AuraCarbon! 🌱</p>
        </div>
      `,
    };

    const result = await sendBatchEmails([email]);
    return result;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
}

/**
 * Send rejection notification to user
 */
export async function sendRejectionEmail(userEmail: string, companyName: string, reason?: string) {
  try {
    const email: EmailMessage = {
      from: 'onboarding@resend.dev',
      to: userEmail,
      subject: 'AuraCarbon Registration Status Update',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF3366;">Registration Status Update</h1>
          
          <p>Hi,</p>
          
          <p>Thank you for your interest in AuraCarbon. Unfortunately, your registration for <strong>${companyName}</strong> could not be approved at this time.</p>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          
          <p>If you believe this is in error or would like to appeal, please contact us.</p>
          
          <p>Best regards,<br/>The AuraCarbon Team</p>
        </div>
      `,
    };

    const result = await sendBatchEmails([email]);
    return result;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
}
