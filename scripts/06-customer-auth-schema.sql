-- Customer Authentication Schema for GharMart

-- Customers table (extends existing if needed)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT false,
  profile_photo_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  preferred_language VARCHAR(10) DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_unused_reset UNIQUE(user_id, expires_at) WHERE used_at IS NULL
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- Customer addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(50), -- 'Home', 'Office', 'Other'
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street_address VARCHAR(500) NOT NULL,
  apartment_number VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON customer_addresses(customer_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_customer_addresses_location ON customer_addresses USING GIST(
  ll_to_earth(latitude, longitude)
);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_cart_item UNIQUE(customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_shopping_cart_customer_id ON shopping_cart(customer_id);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  price_at_addition DECIMAL(10, 2),
  CONSTRAINT unique_wishlist_item UNIQUE(customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id ON wishlists(customer_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
  delivery_address_id UUID REFERENCES customer_addresses(id),
  order_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed
  payment_method VARCHAR(50), -- card, upi, cod
  subtotal DECIMAL(12, 2) NOT NULL,
  delivery_fee DECIMAL(8, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  promo_code VARCHAR(50),
  total_amount DECIMAL(12, 2) NOT NULL,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  delivery_person_id UUID,
  delivery_person_name VARCHAR(255),
  delivery_person_phone VARCHAR(20),
  delivery_person_location GEOGRAPHY(POINT, 4326),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  return_requested BOOLEAN DEFAULT false,
  return_reason TEXT,
  return_approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_person ON orders(delivery_person_id) WHERE delivery_person_id IS NOT NULL;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) NOT NULL, -- card, upi, netbanking, wallet, cod
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed, cancelled
  error_message TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Order tracking table
CREATE TABLE IF NOT EXISTS order_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- pending, confirmed, preparing, ready, on_the_way, delivered
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  estimated_arrival TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_status ON order_tracking(status);
CREATE INDEX IF NOT EXISTS idx_order_tracking_created_at ON order_tracking(created_at DESC);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID,
  shop_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  review_type VARCHAR(50), -- product, shop, delivery
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  has_photos BOOLEAN DEFAULT false,
  moderation_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop_id ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  notification_type VARCHAR(50), -- order_confirmed, order_preparing, order_on_way, order_delivered, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(customer_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Rewards/Cashback wallet table
CREATE TABLE IF NOT EXISTS rewards_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  cashback_balance DECIMAL(10, 2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  total_earned_cashback DECIMAL(10, 2) DEFAULT 0,
  total_earned_points INTEGER DEFAULT 0,
  total_redeemed_cashback DECIMAL(10, 2) DEFAULT 0,
  total_redeemed_points INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rewards_wallet_customer_id ON rewards_wallet(customer_id);

-- Reward transactions table
CREATE TABLE IF NOT EXISTS reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES rewards_wallet(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50), -- earned, redeemed
  amount DECIMAL(10, 2),
  points INTEGER,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_customer_id ON reward_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_wallet_id ON reward_transactions(wallet_id);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referred_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  referral_code VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, registered, completed
  bonus_cashback DECIMAL(10, 2),
  bonus_points INTEGER,
  referred_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_customer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_customer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_wallet_updated_at BEFORE UPDATE ON rewards_wallet
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
