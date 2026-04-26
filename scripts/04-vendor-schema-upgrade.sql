-- Vendor-specific schema upgrades

-- Promotions & Coupons Table
CREATE TABLE IF NOT EXISTS promotions_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Activity Logs
CREATE TABLE IF NOT EXISTS vendor_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50), -- 'product', 'order', 'shop', 'coupon', etc.
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Return Requests
CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  refund_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Vendor Payment Details
CREATE TABLE IF NOT EXISTS vendor_payment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bank_account_number VARCHAR(50),
  bank_ifsc_code VARCHAR(20),
  bank_name VARCHAR(255),
  account_holder_name VARCHAR(255),
  upi_id VARCHAR(255),
  payment_preference VARCHAR(50) DEFAULT 'bank', -- 'bank' or 'upi'
  is_verified BOOLEAN DEFAULT false,
  kyc_document_url VARCHAR(500),
  kyc_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue Analytics
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  commission_amount DECIMAL(10, 2) DEFAULT 0,
  payout_amount DECIMAL(10, 2) DEFAULT 0,
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  returns_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, date)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_promotions_vendor ON promotions_coupons(vendor_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_logs_vendor ON vendor_activity_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON vendor_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_returns_vendor ON return_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_analytics_vendor_date ON revenue_analytics(vendor_id, date);

-- Row Level Security Policies for Vendor Tables
ALTER TABLE promotions_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;

-- Vendors can only see their own data
CREATE POLICY "vendor_promotions_rls" ON promotions_coupons
  USING (vendor_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "vendor_activity_logs_rls" ON vendor_activity_logs
  USING (vendor_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "vendor_returns_rls" ON return_requests
  USING (vendor_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "vendor_payment_details_rls" ON vendor_payment_details
  USING (vendor_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "vendor_analytics_rls" ON revenue_analytics
  USING (vendor_id = (SELECT id FROM users WHERE id = auth.uid()));
