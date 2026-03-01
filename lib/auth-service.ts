/**
 * Authentication service
 * Handles user registration, login, and password operations
 */

import { supabase, getSupabaseServerClient } from './supabase-client';
import crypto from 'crypto';

interface RegisterData {
  email: string;
  password: string;
  companyName: string;
  facilityType: string;
  country: string;
  phone?: string;
  message?: string;
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a secure temporary password
 */
export function generateTempPassword(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

/**
 * Hash a password using bcrypt-like approach (basic)
 * In production, use bcrypt library
 */
export async function hashPassword(password: string): Promise<string> {
  // Using basic approach - in production, use bcrypt or argon2
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return hash;
}

/**
 * User registration - creates pending registration
 */
export async function registerUser(data: RegisterData) {
  try {
    const supabaseServer = getSupabaseServerClient();

    // Check if email already exists
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if email is already pending
    const { data: existingPending } = await supabaseServer
      .from('pending_registrations')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingPending) {
      throw new Error('This email is already pending approval');
    }

    // Create pending registration
    const verificationCode = generateVerificationCode();
    const { data: pendingReg, error } = await supabaseServer
      .from('pending_registrations')
      .insert({
        email: data.email,
        company_name: data.companyName,
        facility_type: data.facilityType,
        country: data.country,
        phone: data.phone,
        message: data.message,
        status: 'pending',
        verification_code: verificationCode,
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      registrationId: pendingReg.id,
      email: data.email,
      message: 'Registration received. An administrator will review your request shortly.',
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Admin: Approve registration
 */
export async function approveRegistration(registrationId: string, adminUserId: string) {
  try {
    const supabaseServer = getSupabaseServerClient();

    // Get pending registration
    const { data: pendingReg, error: fetchError } = await supabaseServer
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (fetchError || !pendingReg) {
      throw new Error('Registration not found');
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // Create user account
    const { data: newUser, error: insertError } = await supabaseServer
      .from('users')
      .insert({
        email: pendingReg.email,
        password_hash: hashedPassword,
        company_name: pendingReg.company_name,
        facility_type: pendingReg.facility_type,
        country: pendingReg.country,
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: adminUserId,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Delete pending registration (no longer needed after approval)
    await supabaseServer
      .from('pending_registrations')
      .delete()
      .eq('id', registrationId);

    return {
      success: true,
      user: newUser,
      tempPassword,
      email: newUser.email,
    };
  } catch (error) {
    console.error('Approval error:', error);
    throw error;
  }
}

/**
 * Admin: Reject registration
 */
export async function rejectRegistration(registrationId: string, reason?: string) {
  try {
    const supabaseServer = getSupabaseServerClient();

    // Delete pending registration (clear the entry from database)
    const { error } = await supabaseServer
      .from('pending_registrations')
      .delete()
      .eq('id', registrationId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Registration rejected and deleted',
    };
  } catch (error) {
    console.error('Rejection error:', error);
    throw error;
  }
}

/**
 * User login
 */
export async function loginUser(data: LoginData) {
  try {
    const supabaseServer = getSupabaseServerClient();

    // Find user by email
    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single();

    if (error || !user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is not active. Please contact administrator.');
    }

    // Verify password
    const hashedPassword = await hashPassword(data.password);
    if (hashedPassword !== user.password_hash) {
      throw new Error('Invalid email or password');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.company_name,
        facilityType: user.facility_type,
        country: user.country,
        isAdmin: user.is_admin || false,
        two_fa_enabled: user.two_fa_enabled || false,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Get pending registrations (admin only)
 */
export async function getPendingRegistrations() {
  try {
    const supabaseServer = getSupabaseServerClient();

    const { data, error } = await supabaseServer
      .from('pending_registrations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    return [];
  }
}
