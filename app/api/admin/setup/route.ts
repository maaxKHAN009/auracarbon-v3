/**
 * Admin Setup Endpoint
 * Creates initial admin account
 * Run once at startup
 */

import { getSupabaseServerClient } from '@/lib/supabase-client';
import { hashPassword } from '@/lib/auth-service';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { adminEmail, adminPassword } = await request.json();

    // Validate inputs
    if (!adminEmail || !adminPassword) {
      return Response.json(
        { error: 'Admin email and password required' },
        { status: 400 }
      );
    }

    if (adminPassword.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServerClient();

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (existingAdmin) {
      return Response.json(
        { error: 'Admin account already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(adminPassword);

    // Create admin user
    const { data: adminUser, error } = await supabaseServer
      .from('users')
      .insert({
        email: adminEmail,
        password_hash: hashedPassword,
        company_name: 'AuraCarbon Admin',
        facility_type: 'Administration',
        country: 'Global',
        status: 'active',
        is_admin: true,
        approved_at: new Date().toISOString(),
        approved_by: 'system',
      })
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: 'Failed to create admin account', details: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Admin account created successfully',
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          company_name: adminUser.company_name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin setup error:', error);
    return Response.json(
      { error: 'Failed to setup admin account' },
      { status: 500 }
    );
  }
}

/**
 * GET: Check if admin account exists
 */
export async function GET() {
  try {
    const supabaseServer = getSupabaseServerClient();

    const { data: adminUsers } = await supabaseServer
      .from('users')
      .select('email, is_admin')
      .eq('is_admin', true)
      .eq('status', 'active');

    return Response.json(
      {
        adminExists: (adminUsers?.length ?? 0) > 0,
        adminCount: adminUsers?.length ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { adminExists: false, error: 'Could not check admin status' },
      { status: 500 }
    );
  }
}
