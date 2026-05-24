-- Product Reviews System Migration
-- Creates tables for managing product reviews with helpful votes

-- Create reviews table if not exists
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, customer_id)
);

-- Create review votes table for tracking helpful/unhelpful votes
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, customer_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON product_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status ON product_reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_customer_id ON review_votes(customer_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS review_timestamp_trigger ON product_reviews;
CREATE TRIGGER review_timestamp_trigger
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_review_timestamp();
