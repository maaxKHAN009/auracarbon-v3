/**
 * User registration API endpoint
 * Simplified: No email verification, admin approves directly
 */

import { registerUser } from '@/lib/auth-service';
import { sendAdminNotificationEmail } from '@/lib/email-service';
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

    // Register user (creates pending registration entry)
    const result = await registerUser({
      email,
      password,
      companyName,
      facilityType,
      country,
      phone,
      message,
    });

    // Send notification to admin about new registration
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
        message: 'Registration successful. Pending admin approval.',
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
