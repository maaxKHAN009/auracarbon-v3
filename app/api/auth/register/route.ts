/**
 * User registration API endpoint
 */

import { registerUser } from '@/lib/auth-service';
import { sendRegistrationConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email-service';
import { sendVerificationEmail } from '@/lib/email-verification-service';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, password, companyName, facilityType, country, phone, message } = body;

    // Basic validation
    if (!email || !password || !companyName || !facilityType || !country) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Register user
    const result = await registerUser({
      email,
      password,
      companyName,
      facilityType,
      country,
      phone,
      message,
    });

    // Get the verification code from the result
    const fullName = companyName;
    
    // Send verification email to user with code
    try {
      // Check if RESEND_API_KEY is configured
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured in environment variables');
        throw new Error('Email service not configured. Please contact administrator.');
      }

      // Extract verification code from pending registration (need to fetch it)
      const { getSupabaseServerClient } = await import('@/lib/supabase-client');
      const supabase = getSupabaseServerClient();
      const { data: pendingReg } = await supabase
        .from('pending_registrations')
        .select('verification_code')
        .eq('id', result.registrationId)
        .single();
      
      if (pendingReg?.verification_code) {
        console.log(`Sending verification email to ${email} with code ${pendingReg.verification_code}`);
        await sendVerificationEmail({
          userEmail: email,
          userName: fullName,
          verificationCode: pendingReg.verification_code,
        });
        console.log(`Verification email sent successfully to ${email}`);
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Return error to client for debugging
      return Response.json(
        { 
          error: 'Registration created but email delivery failed',
          details: emailError instanceof Error ? emailError.message : 'Unknown error',
          registrationId: result.registrationId
        },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    try {
      await sendRegistrationConfirmationEmail({
        userEmail: email,
        companyName,
        facilityType,
        country,
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    // Send notification to admin
    try {
      await sendAdminNotificationEmail(
        {
          userEmail: email,
          companyName,
          facilityType,
          country,
        },
        result.registrationId
      );
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
      // Don't fail the registration if email fails
    }

    return Response.json(
      {
        success: true,
        message: 'Registration successful. Please verify your email address.',
        registrationId: result.registrationId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Registration failed';

    return Response.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
