# Manual Admin Setup Guide

Since the migrations haven't been applied automatically, you need to manually create the admin tables in your Supabase dashboard.

## Step 1: Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query

## Step 2: Run This SQL Command

Copy and paste this SQL into the SQL editor and run it:

```sql
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

-- Enable Row Level Security
ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurant_admins
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
```

## Step 3: Create Admin User Record

After creating the table, run this SQL to make your user an admin:

```sql
-- Insert admin record for user with phone 0774986724
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
    AND r.name = 'Green Leaf'  -- Change this to your preferred restaurant
ON CONFLICT (user_id, restaurant_id) DO NOTHING;
```

## Step 4: Verify Setup

Run this query to verify the admin was created:

```sql
SELECT 
    ra.id,
    ra.role,
    ra.is_active,
    u.email,
    r.name as restaurant_name
FROM restaurant_admins ra
JOIN auth.users u ON u.id = ra.user_id
JOIN restaurants r ON r.id = ra.restaurant_id
WHERE u.email = '0774986724@bravonest.com';
```

## Alternative: Quick Setup Script

If you prefer, you can also try running the automated script:

```bash
node scripts/setup-missing-admin-table.js
```

But this might fail due to permission restrictions with the anonymous key.

## Available Restaurants

Based on the database check, these restaurants are available:
- Green Leaf (4608828b-a335-4b34-808c-53cb743cf1e1)
- jood (3a58cc5d-69a4-425e-9787-862177b998a6)  
- Gee da kadai (507abd19-7d21-4495-9655-26a61dff001d)

Choose one to assign admin access to in Step 3. 