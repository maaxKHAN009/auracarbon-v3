-- Create registration_history table for audit trail of all registrations
CREATE TABLE IF NOT EXISTS registration_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(20),
  message TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'approved', 'rejected', 'pending'
  rejection_reason TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- links to user if approved
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_registration_history_email ON registration_history(email);
CREATE INDEX idx_registration_history_status ON registration_history(status);
CREATE INDEX idx_registration_history_created_at ON registration_history(created_at DESC);

-- Update pending_registrations table to store password_hash for approval
-- Add password_hash column if it doesn't exist
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(256);

-- Remove old verification columns if they exist
ALTER TABLE pending_registrations 
DROP COLUMN IF EXISTS verification_code,
DROP COLUMN IF EXISTS is_verified;

-- This table now stores pending approvals with the user's password hash
