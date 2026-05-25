-- Vendor Complete Schema - All missing tables and features
-- This migration creates comprehensive vendor management system

-- 1. VENDOR KYC DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS vendor_kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- aadhar, pan, gst, bank_account, shop_license, address_proof
  document_url TEXT NOT NULL,
  document_number VARCHAR(100),
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, submitted, verified, rejected, expired
  rejection_reason TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vendor_document UNIQUE (vendor_id, document_type)
);

CREATE INDEX idx_vendor_kyc_documents_vendor_id ON vendor_kyc_documents(vendor_id);
CREATE INDEX idx_vendor_kyc_documents_status ON vendor_kyc_documents(status);

-- 2. VENDOR BANK ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS vendor_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_holder_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  ifsc_code VARCHAR(11) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20) NOT NULL, -- savings, current
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_bank_accounts_vendor_id ON vendor_bank_accounts(vendor_id);
CREATE INDEX idx_vendor_bank_accounts_is_verified ON vendor_bank_accounts(is_verified);

-- 3. VENDOR UPI ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS vendor_upi_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upi_id VARCHAR(255) NOT NULL,
  account_holder_name VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vendor_upi UNIQUE (vendor_id, upi_id)
);

CREATE INDEX idx_vendor_upi_accounts_vendor_id ON vendor_upi_accounts(vendor_id);

-- 4. VENDOR PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS vendor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  commission_amount DECIMAL(15, 2) NOT NULL,
  net_amount DECIMAL(15, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, requested, approved, processing, completed, failed, cancelled
  method VARCHAR(20) NOT NULL, -- bank_transfer, upi, wallet
  bank_account_id UUID REFERENCES vendor_bank_accounts(id),
  upi_id VARCHAR(255),
  requested_at TIMESTAMP,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  transaction_id VARCHAR(100),
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_payouts_vendor_id ON vendor_payouts(vendor_id);
CREATE INDEX idx_vendor_payouts_status ON vendor_payouts(status);
CREATE INDEX idx_vendor_payouts_period ON vendor_payouts(period_start, period_end);

-- 5. VENDOR PAYOUT LOGS TABLE (Audit trail)
CREATE TABLE IF NOT EXISTS vendor_payout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES vendor_payouts(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- requested, approved, processing, completed, failed
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_payout_logs_payout_id ON vendor_payout_logs(payout_id);

-- 6. VENDOR SETTLEMENTS TABLE
CREATE TABLE IF NOT EXISTS vendor_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(15, 2) NOT NULL,
  total_orders INTEGER NOT NULL,
  commission_rate DECIMAL(5, 3) NOT NULL DEFAULT 0.050, -- 5%
  commission_amount DECIMAL(15, 2) NOT NULL,
  refunds DECIMAL(15, 2) DEFAULT 0,
  deductions DECIMAL(15, 2) DEFAULT 0,
  net_payable DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, payout_issued, settled
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_settlements_vendor_id ON vendor_settlements(vendor_id);
CREATE INDEX idx_vendor_settlements_period ON vendor_settlements(period_start, period_end);

-- 7. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- billing, technical, product, order, payout, account, other
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, waiting_customer, resolved, closed
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_tickets_vendor_id ON support_tickets(vendor_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);

-- 8. SUPPORT TICKET COMMENTS TABLE
CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_ticket_comments_ticket_id ON support_ticket_comments(ticket_id);

-- 9. PROMOTIONS/COUPONS TABLE (already exists, but ensure complete)
CREATE TABLE IF NOT EXISTS promotions_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(30) NOT NULL, -- discount_percentage, discount_fixed, buy_one_get_one, free_shipping, category_discount
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  applicable_categories TEXT[], -- Array of category names
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, expired, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_promotions_coupons_vendor_id ON promotions_coupons(vendor_id);
CREATE INDEX IF NOT EXISTS idx_promotions_coupons_code ON promotions_coupons(code);

-- 10. VENDOR ACTIVITY LOGS (Already exists, but verify)
CREATE TABLE IF NOT EXISTS vendor_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_vendor_activity_logs_vendor_id ON vendor_activity_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_activity_logs_action ON vendor_activity_logs(action);

-- 11. VENDOR ANALYTICS TABLE (Daily aggregates)
CREATE TABLE IF NOT EXISTS vendor_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  order_count INTEGER DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vendor_daily UNIQUE (vendor_id, date)
);

CREATE INDEX idx_vendor_analytics_daily_vendor_id ON vendor_analytics_daily(vendor_id);
CREATE INDEX idx_vendor_analytics_daily_date ON vendor_analytics_daily(date);

-- 12. Update notifications table if needed
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS data JSONB;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Permissions/RLS for vendors

-- Vendors can view their own KYC documents
CREATE POLICY IF NOT EXISTS vendor_kyc_select ON vendor_kyc_documents
FOR SELECT USING (vendor_id = current_user_id());

-- Vendors can insert their own KYC documents
CREATE POLICY IF NOT EXISTS vendor_kyc_insert ON vendor_kyc_documents
FOR INSERT WITH CHECK (vendor_id = current_user_id());

-- Vendors can view their own payouts
CREATE POLICY IF NOT EXISTS vendor_payouts_select ON vendor_payouts
FOR SELECT USING (vendor_id = current_user_id());

-- Vendors can view their own bank accounts
CREATE POLICY IF NOT EXISTS vendor_bank_accounts_select ON vendor_bank_accounts
FOR SELECT USING (vendor_id = current_user_id());

-- Vendors can insert their own bank accounts
CREATE POLICY IF NOT EXISTS vendor_bank_accounts_insert ON vendor_bank_accounts
FOR INSERT WITH CHECK (vendor_id = current_user_id());

-- Vendors can view their own support tickets
CREATE POLICY IF NOT EXISTS support_tickets_select ON support_tickets
FOR SELECT USING (vendor_id = current_user_id() OR assigned_to = current_user_id());

-- Commit message
-- Added comprehensive vendor management schema including:
-- - KYC documents and verification
-- - Bank accounts and UPI payment methods
-- - Payouts and settlement system
-- - Support ticketing system
-- - Detailed activity logging and analytics
