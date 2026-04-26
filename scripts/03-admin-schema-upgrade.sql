-- Admin Schema Upgrade for GharMart Platform
-- Adds comprehensive admin management, security, and content management tables

-- 1. Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- users, vendors, products, orders, etc
  target_id UUID,
  changes JSONB, -- Before/after changes for audit trail
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success', -- success, error
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_activity_logs_created ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON admin_activity_logs(action);

-- 2. Vendor Requests Table
CREATE TABLE IF NOT EXISTS vendor_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  business_type VARCHAR(50), -- sole_proprietor, partnership, company
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  documents JSONB, -- {aadhar_url, pan_url, business_registration_url, bank_details}
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendor_requests_status ON vendor_requests(status);
CREATE INDEX idx_vendor_requests_email ON vendor_requests(email);

-- 3. Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type VARCHAR(20), -- string, number, boolean, json
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO admin_settings (key, value, type, description) VALUES
  ('platform_commission_percent', '10', 'number', 'Platform commission percentage on orders'),
  ('min_order_value', '100', 'number', 'Minimum order value in INR'),
  ('max_delivery_distance_km', '15', 'number', 'Maximum delivery distance in kilometers'),
  ('delivery_charge_base', '30', 'number', 'Base delivery charge in INR'),
  ('delivery_charge_per_km', '5', 'number', 'Delivery charge per kilometer in INR'),
  ('gst_rate', '5', 'number', 'GST rate percentage'),
  ('vendor_payout_interval', '7', 'number', 'Vendor payout interval in days'),
  ('order_cancellation_deadline_mins', '10', 'number', 'Minutes allowed to cancel after order placement'),
  ('refund_processing_days', '3', 'number', 'Days to process refund'),
  ('smtp_host', 'smtp.gmail.com', 'string', 'Email SMTP host'),
  ('smtp_port', '587', 'number', 'Email SMTP port'),
  ('smtp_user', '', 'string', 'Email SMTP username'),
  ('platform_name', 'GharMart', 'string', 'Platform name'),
  ('support_email', 'support@gharmart.com', 'string', 'Support email address')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX idx_settings_key ON admin_settings(key);

-- 4. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20), -- percentage, fixed
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount_amount DECIMAL(10, 2),
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  applicable_to VARCHAR(50) DEFAULT 'all', -- all, vendors, categories
  applicable_ids UUID[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_from ON coupons(valid_from);

-- 5. Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link VARCHAR(500),
  position VARCHAR(50), -- homepage_hero, category_featured, shop_featured
  position_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_to TIMESTAMP WITH TIME ZONE,
  target_type VARCHAR(50), -- category, vendor, product
  target_id UUID,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_active ON banners(is_active);

-- 6. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_by UUID NOT NULL REFERENCES users(id),
  report_type VARCHAR(50), -- inappropriate, fraud, quality, missing_items, late_delivery
  target_type VARCHAR(50), -- user, vendor, product, order, review
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'open', -- open, investigating, resolved, closed
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- order_status, vendor_approval, payment, promotion, system
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- 8. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  reason VARCHAR(100) NOT NULL,
  reason_details TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, processed
  approval_notes TEXT,
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  refund_transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refunds_order ON refunds(order_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_created ON refunds(created_at DESC);

-- 9. Payout Logs Table
CREATE TABLE IF NOT EXISTS payout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  gross_amount DECIMAL(12, 2) NOT NULL,
  commission_amount DECIMAL(12, 2) NOT NULL,
  refunds_amount DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processed, failed
  payout_method VARCHAR(50), -- bank_transfer, upi, cheque
  bank_account_id VARCHAR(100),
  transaction_id VARCHAR(100),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payout_logs_vendor ON payout_logs(vendor_id);
CREATE INDEX idx_payout_logs_status ON payout_logs(status);
CREATE INDEX idx_payout_logs_period ON payout_logs(period_start, period_end);

-- Add admin role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_secret VARCHAR(100);

-- Create RLS policies for admin tables
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view/edit admin tables
CREATE POLICY "admins_manage_activity_logs" ON admin_activity_logs
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin' AND admin_role IS NOT NULL
    )
  );

CREATE POLICY "admins_manage_vendor_requests" ON vendor_requests
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin' AND admin_role IS NOT NULL
    )
  );

CREATE POLICY "admins_manage_settings" ON admin_settings
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin' AND admin_role IS NOT NULL
    )
  );

-- Users can read their own notifications
CREATE POLICY "users_read_own_notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admins_manage_notifications" ON notifications
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin' AND admin_role IS NOT NULL
    )
  );
