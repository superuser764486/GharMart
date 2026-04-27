-- Order Tracking and Live Status Migration
-- Updates orders table to support live tracking and status timeline

-- Check if orders table exists and update schema
ALTER TABLE IF EXISTS public.orders
ADD COLUMN IF NOT EXISTS tracking_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS delivery_location JSONB DEFAULT NULL;

-- Update orders table to use users instead of customers if needed
-- Note: If the table was created with customer_id, this might need manual migration

-- Create order_status_history table for tracking changes
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  reason TEXT,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_tracking_updates table for real-time location updates
CREATE TABLE IF NOT EXISTS public.order_tracking_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  location JSONB NOT NULL, -- {"latitude": number, "longitude": number}
  status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  order_status_updates BOOLEAN DEFAULT true,
  promotional_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_tracking_updates_order_id ON public.order_tracking_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_updates_created_at ON public.order_tracking_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Enable RLS for new tables
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_status_history
CREATE POLICY order_status_history_select ON public.order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.customer_id = auth.uid())
    OR auth.jwt()->>'user_type' = 'admin'
  );

-- RLS Policies for order_tracking_updates
CREATE POLICY order_tracking_updates_select ON public.order_tracking_updates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_tracking_updates.order_id AND orders.customer_id = auth.uid())
    OR auth.jwt()->>'user_type' = 'admin'
  );

CREATE POLICY order_tracking_updates_insert ON public.order_tracking_updates
  FOR INSERT WITH CHECK (auth.jwt()->>'user_type' = 'admin' OR auth.jwt()->>'user_type' = 'vendor');

-- RLS Policies for notification_preferences
CREATE POLICY notification_preferences_select ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notification_preferences_update ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY notification_preferences_insert ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
