-- Create Restaurant Admin Support Table
-- This migration creates the missing restaurant_admins table that's required for admin functionality

-- Create restaurant_admins table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_user_id ON restaurant_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_restaurant_id ON restaurant_admins(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_active ON restaurant_admins(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;

-- Policies are already created in the previous migration

-- Create admin notifications table for better admin experience
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

-- Enable RLS for notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policies are already created in the previous migration

-- Insert admin records for both users
DO $$
DECLARE
    target_user_id uuid;
    target_restaurant_id uuid;
BEGIN
    -- Find Green Leaf restaurant
    SELECT id INTO target_restaurant_id 
    FROM restaurants 
    WHERE name = 'Green Leaf';

    -- Insert admin record for original user (0774986724)
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = '0774986724@bravonest.com';

    IF target_user_id IS NOT NULL AND target_restaurant_id IS NOT NULL THEN
        INSERT INTO restaurant_admins (user_id, restaurant_id, role, is_active)
        VALUES (target_user_id, target_restaurant_id, 'admin', true)
        ON CONFLICT (user_id, restaurant_id) DO NOTHING;
        
        RAISE NOTICE 'Admin access granted to user 0774986724@bravonest.com for Green Leaf restaurant';
    END IF;

    -- Insert admin record for new user (0771525093)
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = '0771525093@bravonest.com';

    IF target_user_id IS NOT NULL AND target_restaurant_id IS NOT NULL THEN
        INSERT INTO restaurant_admins (user_id, restaurant_id, role, is_active)
        VALUES (target_user_id, target_restaurant_id, 'admin', true)
        ON CONFLICT (user_id, restaurant_id) DO NOTHING;
        
        RAISE NOTICE 'Admin access granted to user 0771525093@bravonest.com for Green Leaf restaurant';
    ELSE
        RAISE NOTICE 'Could not find new user or restaurant for admin setup';
    END IF;
END $$;
