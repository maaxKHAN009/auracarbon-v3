/**
 * Admin approval API endpoint
 */

import { approveRegistration, rejectRegistration, getPendingRegistrations } from '@/lib/auth-service';
import { sendApprovalConfirmationEmail, sendRejectionEmail } from '@/lib/email-service';
import { logAuditEvent } from '@/lib/audit-service';
import { getSupabaseServerClient } from '@/lib/supabase-client';
import type { NextRequest } from 'next/server';

/**
 * GET: Fetch pending registrations (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication check
    const registrations = await getPendingRegistrations();

    return Response.json(
      { success: true, registrations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return Response.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

/**
 * POST: Approve or reject registration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, registrationId, adminUserId, reason } = body;

    if (!action || !registrationId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve registration
      const result = await approveRegistration(registrationId, adminUserId || 'system');

      // Send approval email (user already has password from registration)
      try {
        await sendApprovalConfirmationEmail(result.email, result.user.company_name);
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
      }

      // Log audit event
      await logAuditEvent({
        action: 'admin_approved_registration',
        adminId: adminUserId || 'system',
        targetUserId: result.user.id,
        details: { email: result.email, company: result.user.company_name },
      });

      return Response.json(
        {
          success: true,
          message: 'Registration approved',
          user: result.user,
        },
        { status: 200 }
      );
    } else if (action === 'reject') {
      // Get pending registration details
      const supabaseServer = getSupabaseServerClient();
      const { data: pendingReg } = await supabaseServer
        .from('pending_registrations')
        .select('email')
        .eq('id', registrationId)
        .single();

      // Reject registration
      await rejectRegistration(registrationId, reason);

      // Send rejection email
      if (pendingReg) {
        try {
          await sendRejectionEmail(pendingReg.email, '', reason);
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError);
        }
      }

      // Log audit event
      await logAuditEvent({
        action: 'admin_rejected_registration',
        adminId: adminUserId || 'system',
        details: { email: pendingReg?.email, reason },
      });

      return Response.json(
        { success: true, message: 'Registration rejected' },
        { status: 200 }
      );
    } else {
      return Response.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Approval error:', error);
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
