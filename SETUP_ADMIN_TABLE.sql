-- ========================================
-- SUPABASE ADMIN TABLE SETUP
-- ========================================
-- Execute this SQL in your Supabase Dashboard > SQL Editor
-- This will create the missing restaurant_admins table and set up your admin access

-- Step 1: Create restaurant_admins table
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

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_user_id ON restaurant_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_restaurant_id ON restaurant_admins(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_active ON restaurant_admins(is_active) WHERE is_active = true;

-- Step 3: Enable Row Level Security
ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for restaurant_admins
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

-- Step 5: Create admin notifications table (optional but recommended)
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

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

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

-- Step 6: Grant admin access to your user
-- This will make the user with phone 0774986724 an admin for Green Leaf restaurant
INSERT INTO restaurant_admins (user_id, restaurant_id, role, is_active)
SELECT 
    u.id as user_id,
    r.id as restaurant_id,
    'admin' as role,
    true as is_active
FROM 
    auth.users u,
    restaurants r
WHERE 
    u.email = '0774986724@bravonest.com'
    AND r.name = 'Green Leaf'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Step 7: Verify the setup worked
SELECT 
    'SUCCESS: Admin table created and user granted access' as status,
    u.email,
    r.name as restaurant_name,
    ra.role,
    ra.is_active,
    ra.created_at
FROM restaurant_admins ra
JOIN auth.users u ON u.id = ra.user_id
JOIN restaurants r ON r.id = ra.restaurant_id
WHERE u.email = '0774986724@bravonest.com';

-- If no rows are returned above, check what restaurants are available:
-- SELECT id, name FROM restaurants ORDER BY name; 