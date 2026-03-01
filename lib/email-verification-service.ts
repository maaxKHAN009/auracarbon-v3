/**
 * Email Verification Service
 * Handles email verification for new accounts using Brevo API
 * Brevo: Free tier - 300 emails/day
 */

const brevoApiKey = process.env.BREVO_API_KEY || '';
const brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

interface VerificationEmailData {
  userEmail: string;
  userName: string;
  verificationCode: string;
}

interface BrevoEmailPayload {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent: string;
}

/**
 * Send email using Brevo API
 */
async function sendBrevoEmail(to: string, subject: string, htmlContent: string, toName?: string) {
  try {
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const payload: BrevoEmailPayload = {
      sender: {
        name: 'AuraCarbon',
        email: 'noreply@auracarbon.com',
      },
      to: [
        {
          email: to,
          name: toName,
        },
      ],
      subject,
      htmlContent,
    };

    const response = await fetch(brevoApiUrl, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo API error:', error);
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log(`Email sent successfully to ${to}, Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    throw error;
  }
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(data: VerificationEmailData) {
  try {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?code=${data.verificationCode}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00FF88;">Verify Your Email</h1>
        
        <p>Hi ${data.userName},</p>
        
        <p>Thank you for registering with AuraCarbon. Please verify your email address to continue.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="text-align: center; margin-bottom: 15px;">Your verification code:</p>
          <code style="background: #e0e0e0; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
            ${data.verificationCode}
          </code>
        </div>
        
        <p>Or click the link below to verify:</p>
        <p>
          <a href="${verificationUrl}" style="background: #00FF88; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            Verify Email
          </a>
        </p>
        
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
      </div>
    `;

    const result = await sendBrevoEmail(
      data.userEmail,
      'Verify Your AuraCarbon Email 🔐',
      htmlContent,
      data.userName
    );
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userEmail: string, resetCode: string, userName: string) {
  try {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?code=${resetCode}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00CCFF;">Reset Your Password</h1>
        
        <p>Hi ${userName},</p>
        
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        
        <p>
          <a href="${resetUrl}" style="background: #00CCFF; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </p>
        
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, you can ignore this email.</p>
      </div>
    `;

    const result = await sendBrevoEmail(
      userEmail,
      'Reset Your AuraCarbon Password 🔑',
      htmlContent,
      userName
    );
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Send 2FA code via email
 */
export async function send2FACode(userEmail: string, code: string, userName: string) {
  try {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FFCC00;">Two-Factor Authentication</h1>
        
        <p>Hi ${userName},</p>
        
        <p>Someone is trying to access your AuraCarbon account. Your verification code is:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <code style="background: #e0e0e0; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${code}
          </code>
        </div>
        
        <p style="color: #999; font-size: 12px;">This code will expire in 10 minutes. Do not share this code with anyone.</p>
        
        <p>If you didn't request this code, please ignore this email and your account will remain secure.</p>
      </div>
    `;

    const result = await sendBrevoEmail(
      userEmail,
      'Your AuraCarbon 2FA Code 🔐',
      htmlContent,
      userName
    );
    return result;
  } catch (error) {
    console.error('Error sending 2FA code:', error);
    throw error;
  }
}
