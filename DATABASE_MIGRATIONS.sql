-- AuraCarbon v3 - Database Schema Migrations
-- Execute these SQL commands in Supabase to enable all new features

-- ============================================================================
-- 1. UPDATE USERS TABLE - Add Security Fields
-- ============================================================================

-- First, ensure is_admin column exists (required for RLS policies)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT; -- JSON array stored as string

-- Create index for reset token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- ============================================================================
-- 2. UPDATE PENDING_REGISTRATIONS TABLE - Add Email Verification Fields
-- ============================================================================

ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create index for verification code lookups
CREATE INDEX IF NOT EXISTS idx_pending_registrations_verification_code ON pending_registrations(verification_code);

-- ============================================================================
-- 3. CREATE AUDIT_LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 4. POLICIES FOR AUDIT_LOGS (RLS)
-- ============================================================================

-- Enable Row Level Security for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "allow_admins_audit_logs" ON audit_logs
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Users can view only their own activity
CREATE POLICY "allow_users_own_audit_logs" ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = target_user_id);

-- ============================================================================
-- 5. TEST DATA - Sample Audit Log Query
-- ============================================================================

-- Example query to retrieve all admin approvals in the last 7 days:
/*
SELECT 
  id,
  action,
  admin_id,
  target_user_id,
  details,
  created_at
FROM audit_logs
WHERE action = 'admin_approved_registration'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
*/

-- ============================================================================
-- 6. BACKUP CODES FUNCTION (Optional - For TOTP Integration Later)
-- ============================================================================

-- Helper function to encrypt/decrypt backup codes (for future use)
/*
CREATE OR REPLACE FUNCTION encrypt_backup_codes(codes TEXT[])
RETURNS TEXT AS $$
BEGIN
  -- In production, use pgcrypto extension
  -- For now, just return JSON string
  RETURN array_to_json(codes)::text;
END;
$$ LANGUAGE plpgsql;
*/

-- ============================================================================
-- 7. CLEANUP - Remove Old Data (Optional)
-- ============================================================================

-- If you have old unverified registrations, mark them as verified:
/*
UPDATE pending_registrations
SET is_verified = true
WHERE created_at < NOW() - INTERVAL '30 days';
*/

-- ============================================================================
-- 8. MIGRATION VERIFICATION QUERIES
-- ============================================================================

-- Verify users table has new columns:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name IN ('reset_token', 'two_fa_enabled', 'backup_codes');

-- Verify pending_registrations has new columns:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'pending_registrations' AND column_name IN ('verification_code', 'is_verified');

-- Verify audit_logs table exists:
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs');

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. All backup_codes are stored as JSON arrays in a TEXT field
--    Example: '["ABCD-1234", "EFGH-5678", "IJKL-9012", "MNOP-3456", "QRST-7890"]'
--
-- 2. Reset tokens expire after 1 hour - the API enforces this, not the database
--
-- 3. Verification codes don't have expiry in DB - API enforces reasonable limits
--
-- 4. Audit logs table uses JSONB for details - stores arbitrary action context
--
-- 5. All timestamp fields use UTC (default PostgreSQL behavior)
--
-- 6. Foreign key references have ON DELETE SET NULL to preserve audit history
--
-- 7. Indexes are created for frequently queried fields to improve performance
--
-- 8. RLS policies are basic - customize based on your security requirements
