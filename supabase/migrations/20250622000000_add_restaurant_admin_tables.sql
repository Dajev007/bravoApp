-- Add Restaurant Admin Support

-- Restaurant Admin Users table
CREATE TABLE IF NOT EXISTS restaurant_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Notifications table for restaurant admins
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_order', 'order_update', 'table_request', 'review', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Order requests for dine-in and takeaway approval
CREATE TABLE IF NOT EXISTS order_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text,
  order_type text NOT NULL CHECK (order_type IN ('dine_in', 'takeaway')),
  table_id uuid REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  requested_time timestamptz DEFAULT now(),
  guest_count integer DEFAULT 1,
  special_requests text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'seated', 'completed')),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add restaurant analytics tracking
CREATE TABLE IF NOT EXISTS restaurant_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_orders integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  dine_in_orders integer DEFAULT 0,
  takeaway_orders integer DEFAULT 0,
  delivery_orders integer DEFAULT 0,
  avg_order_value numeric(8,2) DEFAULT 0,
  peak_hour integer DEFAULT 12, -- Hour of day (0-23)
  customer_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, date)
);

-- Enable Row Level Security
ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for restaurant_admins
CREATE POLICY "Restaurant admins can view their restaurant data" ON restaurant_admins
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM restaurant_admins ra 
      WHERE ra.restaurant_id = restaurant_admins.restaurant_id 
      AND ra.user_id = auth.uid() 
      AND ra.is_active = true
    )
  );

CREATE POLICY "Only authenticated users can manage admin records" ON restaurant_admins
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Policies for admin_notifications
CREATE POLICY "Restaurant admins can view their notifications" ON admin_notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_admins ra 
      WHERE ra.restaurant_id = admin_notifications.restaurant_id 
      AND ra.user_id = auth.uid() 
      AND ra.is_active = true
    )
  );

CREATE POLICY "Restaurant admins can update their notifications" ON admin_notifications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_admins ra 
      WHERE ra.restaurant_id = admin_notifications.restaurant_id 
      AND ra.user_id = auth.uid() 
      AND ra.is_active = true
    )
  );

-- Policies for order_requests
CREATE POLICY "Restaurant admins can manage order requests" ON order_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_admins ra 
      WHERE ra.restaurant_id = order_requests.restaurant_id 
      AND ra.user_id = auth.uid() 
      AND ra.is_active = true
    )
  );

CREATE POLICY "Anyone can create order requests" ON order_requests
  FOR INSERT TO public
  WITH CHECK (true);

-- Policies for restaurant_analytics
CREATE POLICY "Restaurant admins can view their analytics" ON restaurant_analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_admins ra 
      WHERE ra.restaurant_id = restaurant_analytics.restaurant_id 
      AND ra.user_id = auth.uid() 
      AND ra.is_active = true
    )
  );

-- Function to create notification when new order request is made
CREATE OR REPLACE FUNCTION create_order_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (
    restaurant_id,
    type,
    title,
    message,
    priority,
    data
  ) VALUES (
    NEW.restaurant_id,
    'table_request',
    CASE 
      WHEN NEW.order_type = 'dine_in' THEN 'New Dine-in Request'
      ELSE 'New Takeaway Request'
    END,
    CASE 
      WHEN NEW.order_type = 'dine_in' THEN 
        'Customer ' || NEW.customer_name || ' requested table for ' || NEW.guest_count || ' guests'
      ELSE 
        'Customer ' || NEW.customer_name || ' requested takeaway order'
    END,
    'high',
    jsonb_build_object(
      'order_request_id', NEW.id,
      'customer_name', NEW.customer_name,
      'order_type', NEW.order_type,
      'guest_count', NEW.guest_count
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_request_notification_trigger
  AFTER INSERT ON order_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_order_request_notification();

-- Function to update analytics when order is completed
CREATE OR REPLACE FUNCTION update_restaurant_analytics()
RETURNS TRIGGER AS $$
DECLARE
  analytics_date date := CURRENT_DATE;
BEGIN
  IF NEW.status = 'delivered' OR NEW.status = 'ready' THEN
    INSERT INTO restaurant_analytics (
      restaurant_id,
      date,
      total_orders,
      total_revenue,
      dine_in_orders,
      takeaway_orders,
      delivery_orders,
      customer_count
    ) VALUES (
      NEW.restaurant_id,
      analytics_date,
      1,
      NEW.total,
      CASE WHEN NEW.order_type = 'dine_in' THEN 1 ELSE 0 END,
      CASE WHEN NEW.order_type = 'takeaway' THEN 1 ELSE 0 END,
      CASE WHEN NEW.order_type = 'delivery' THEN 1 ELSE 0 END,
      1
    )
    ON CONFLICT (restaurant_id, date) 
    DO UPDATE SET
      total_orders = restaurant_analytics.total_orders + 1,
      total_revenue = restaurant_analytics.total_revenue + NEW.total,
      dine_in_orders = restaurant_analytics.dine_in_orders + CASE WHEN NEW.order_type = 'dine_in' THEN 1 ELSE 0 END,
      takeaway_orders = restaurant_analytics.takeaway_orders + CASE WHEN NEW.order_type = 'takeaway' THEN 1 ELSE 0 END,
      delivery_orders = restaurant_analytics.delivery_orders + CASE WHEN NEW.order_type = 'delivery' THEN 1 ELSE 0 END,
      customer_count = restaurant_analytics.customer_count + 1,
      avg_order_value = (restaurant_analytics.total_revenue + NEW.total) / (restaurant_analytics.total_orders + 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_analytics();

-- Sample data for testing
INSERT INTO restaurant_admins (user_id, restaurant_id, role) 
SELECT 
  auth.uid(),
  r.id,
  'admin'
FROM restaurants r
WHERE r.name IN ('Taco Fiesta', 'Green Leaf', 'DAJEV DA KADI')
LIMIT 1; 