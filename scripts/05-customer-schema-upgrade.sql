-- Customer Panel Database Enhancements
-- Tables for cart, wishlist, addresses, reviews, returns, notifications, wallet, and search history

-- Disable RLS temporarily to set it up properly
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- User Addresses Table
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label VARCHAR(50),
  full_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, full_address, pincode)
);

-- Shopping Cart Table
CREATE TABLE IF NOT EXISTS public.shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist/Favorites Table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Return Requests Table
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, shipped, completed, rejected
  refund_amount NUMERIC(10, 2),
  refund_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- order_status, payment, promo, review_request, return
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_order_id UUID REFERENCES public.orders(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

-- Customer Wallet Table
CREATE TABLE IF NOT EXISTS public.wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  balance NUMERIC(10, 2) DEFAULT 0,
  total_earned NUMERIC(10, 2) DEFAULT 0,
  total_spent NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallet(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- credit, debit, refund, cashback, referral
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  related_order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search History Table
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON public.shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_shop_id ON public.shopping_cart(shop_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);

-- Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_addresses
CREATE POLICY user_addresses_select ON public.user_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_addresses_insert ON public.user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_addresses_update ON public.user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_addresses_delete ON public.user_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for shopping_cart
CREATE POLICY shopping_cart_select ON public.shopping_cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY shopping_cart_insert ON public.shopping_cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY shopping_cart_update ON public.shopping_cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY shopping_cart_delete ON public.shopping_cart
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wishlists
CREATE POLICY wishlists_select ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY wishlists_insert ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY wishlists_delete ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for wallet
CREATE POLICY wallet_select ON public.wallet
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for search_history
CREATE POLICY search_history_insert ON public.search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY search_history_select ON public.search_history
  FOR SELECT USING (auth.uid() = user_id);
