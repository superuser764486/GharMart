-- GharMart Database Schema
-- This script creates all tables with proper structure and RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================================================
-- USERS TABLE - Customer profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  address TEXT,
  pincode TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  user_type TEXT DEFAULT 'customer' CHECK (user_type IN ('customer', 'vendor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_pincode ON users(pincode);

-- RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id OR auth.jwt()->>'user_type' = 'admin');

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view vendor profiles (vendors only)"
  ON users FOR SELECT
  USING (user_type = 'vendor' OR auth.uid() = id);

-- ============================================================================
-- CATEGORIES TABLE - Product categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_name ON categories(name);

-- RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify categories"
  ON categories FOR INSERT
  USING (auth.jwt()->>'user_type' = 'admin');

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  USING (auth.jwt()->>'user_type' = 'admin');

-- ============================================================================
-- SHOPS TABLE - Shop listings
-- ============================================================================
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  opening_time TIME,
  closing_time TIME,
  delivery_time_min INTEGER DEFAULT 30,
  delivery_time_max INTEGER DEFAULT 45,
  delivery_radius_km DECIMAL(5, 2) DEFAULT 5,
  is_open BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shops_vendor_id ON shops(vendor_id);
CREATE INDEX idx_shops_category ON shops(category);
CREATE INDEX idx_shops_pincode ON shops(pincode);
CREATE INDEX idx_shops_city ON shops(city);
CREATE INDEX idx_shops_location ON shops(latitude, longitude);
CREATE INDEX idx_shops_is_active ON shops(is_active);

-- RLS for shops
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shops"
  ON shops FOR SELECT
  USING (is_active = true);

CREATE POLICY "Vendors can view their own shops"
  ON shops FOR SELECT
  USING (vendor_id = auth.uid() OR auth.jwt()->>'user_type' = 'admin');

CREATE POLICY "Vendors can insert their own shops"
  ON shops FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own shops"
  ON shops FOR UPDATE
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Admins can delete shops"
  ON shops FOR DELETE
  USING (auth.jwt()->>'user_type' = 'admin');

-- ============================================================================
-- PRODUCTS TABLE - Shop products
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_available ON products(is_available);

-- RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (is_available = true);

CREATE POLICY "Vendors can view their own products"
  ON products FOR SELECT
  USING (vendor_id = auth.uid() OR auth.jwt()->>'user_type' = 'admin');

CREATE POLICY "Vendors can insert products"
  ON products FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own products"
  ON products FOR UPDATE
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete their own products"
  ON products FOR DELETE
  USING (vendor_id = auth.uid());

-- ============================================================================
-- REVIEWS TABLE - Shop and product reviews
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_shop_id ON reviews(shop_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  USING (auth.jwt()->>'user_type' = 'admin');

-- ============================================================================
-- ORDERS TABLE - Customer orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'on_way', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  delivery_time_estimate INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt()->>'user_type' = 'admin');

CREATE POLICY "Vendors can view their own orders"
  ON orders FOR SELECT
  USING (vendor_id = auth.uid() OR auth.jwt()->>'user_type' = 'admin');

CREATE POLICY "Customers can insert orders"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendors can update their own orders"
  ON orders FOR UPDATE
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Customers can update their own orders"
  ON orders FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'cancelled'));

-- ============================================================================
-- ORDER_ITEMS TABLE - Individual items in orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR auth.jwt()->>'user_type' = 'admin')
    )
  );

CREATE POLICY "Vendors can view their order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.vendor_id = auth.uid() OR auth.jwt()->>'user_type' = 'admin')
    )
  );

CREATE POLICY "Customers can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ADMIN_USERS TABLE - Admin profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'moderator' CHECK (role IN ('moderator', 'manager', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- RLS for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin users"
  ON admin_users FOR SELECT
  USING (auth.jwt()->>'user_type' = 'admin');

CREATE POLICY "Only super admins can modify admin users"
  ON admin_users FOR INSERT
  USING (auth.jwt()->>'user_type' = 'admin');

-- ============================================================================
-- FUNCTIONS FOR TRIGGERS
-- ============================================================================

-- Function to update shop rating when review is added
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shops
  SET 
    avg_rating = (SELECT AVG(rating) FROM reviews WHERE shop_id = NEW.shop_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE shop_id = NEW.shop_id),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.shop_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reviews
DROP TRIGGER IF EXISTS review_rating_trigger ON reviews;
CREATE TRIGGER review_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_rating();

-- Function to update shop updated_at timestamp
CREATE OR REPLACE FUNCTION update_shop_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
DROP TRIGGER IF EXISTS shop_timestamp_trigger ON shops;
CREATE TRIGGER shop_timestamp_trigger
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_timestamp();

DROP TRIGGER IF EXISTS product_timestamp_trigger ON products;
CREATE TRIGGER product_timestamp_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_timestamp();

DROP TRIGGER IF EXISTS order_timestamp_trigger ON orders;
CREATE TRIGGER order_timestamp_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_timestamp();

-- Function to update user timestamp
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_timestamp_trigger ON users;
CREATE TRIGGER user_timestamp_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_timestamp();
