/*
  # Add Restaurant Tables and QR Support

  1. New Tables
    - `restaurant_tables` - Table management for dine-in QR code scanning
    
  2. Add missing columns to existing tables
    - Add fields needed for QR scanning functionality
    
  3. Seed Data
    - Add test restaurants and tables matching the QR codes from logs
*/

-- Add restaurant_tables table for QR scanning functionality
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  qr_code_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

-- Add missing columns to restaurants table for QR functionality
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS qr_code_url text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS total_tables integer DEFAULT 0;

-- Add missing columns to orders table for dine-in support
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'takeaway', 'dine_in'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id uuid REFERENCES restaurant_tables(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurant_tables
CREATE POLICY "Anyone can view restaurant tables" ON restaurant_tables
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage tables" ON restaurant_tables
  FOR ALL TO authenticated
  USING (true);

-- Insert test restaurants that match the QR codes from logs
INSERT INTO restaurants (id, name, description, cuisine_type, address, phone, is_open, is_featured, total_tables) VALUES
('6932e569-6b87-487c-aae1-f8496075fecf', 'Taco Fiesta', 'Authentic Mexican cuisine with fresh ingredients and bold flavors', 'Mexican', '123 Main St, San Francisco, CA', '+1-555-123-4567', true, true, 10),
('4608828b-a335-4b34-808c-53cb743cf1e1', 'Green Leaf', 'Farm-to-table vegetarian and vegan restaurant', 'Vegetarian', '456 Green Ave, San Francisco, CA', '+1-555-987-6543', true, false, 8),
('c053f026-e397-4048-97a8-c5e50ebaed36', 'DAJEV DA KADI', 'Modern fusion cuisine with international flavors', 'International', '789 Fusion Blvd, San Francisco, CA', '+1-555-456-7890', true, true, 12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  total_tables = EXCLUDED.total_tables;

-- Insert restaurant tables for the test restaurants
INSERT INTO restaurant_tables (restaurant_id, table_number, is_active) VALUES
-- Taco Fiesta tables
('6932e569-6b87-487c-aae1-f8496075fecf', 1, true),
('6932e569-6b87-487c-aae1-f8496075fecf', 2, true),
('6932e569-6b87-487c-aae1-f8496075fecf', 3, true),
('6932e569-6b87-487c-aae1-f8496075fecf', 4, true),
('6932e569-6b87-487c-aae1-f8496075fecf', 5, true),

-- Green Leaf tables
('4608828b-a335-4b34-808c-53cb743cf1e1', 1, true),
('4608828b-a335-4b34-808c-53cb743cf1e1', 2, true),
('4608828b-a335-4b34-808c-53cb743cf1e1', 3, true),
('4608828b-a335-4b34-808c-53cb743cf1e1', 4, true),

-- DAJEV DA KADI tables
('c053f026-e397-4048-97a8-c5e50ebaed36', 1, true),
('c053f026-e397-4048-97a8-c5e50ebaed36', 2, true),
('c053f026-e397-4048-97a8-c5e50ebaed36', 3, true),
('c053f026-e397-4048-97a8-c5e50ebaed36', 4, true),
('c053f026-e397-4048-97a8-c5e50ebaed36', 5, true)
ON CONFLICT (restaurant_id, table_number) DO NOTHING;

-- Add some sample menu items for testing
INSERT INTO categories (name, icon) VALUES
('Mexican', '🌮'),
('Vegetarian', '🥗'),
('International', '🍽️')
ON CONFLICT DO NOTHING;

-- Add sample menu items for Taco Fiesta
INSERT INTO menu_items (restaurant_id, name, description, price, is_available, category_id) 
SELECT 
  '6932e569-6b87-487c-aae1-f8496075fecf',
  item.name,
  item.description,
  item.price,
  true,
  (SELECT id FROM categories WHERE name = 'Mexican' LIMIT 1)
FROM (VALUES
  ('Chicken Tacos', 'Three soft shell tacos with grilled chicken, lettuce, cheese, and salsa', 12.99),
  ('Beef Burrito', 'Large flour tortilla filled with seasoned beef, rice, beans, and cheese', 14.99),
  ('Vegetarian Quesadilla', 'Grilled tortilla with cheese, peppers, and onions', 10.99),
  ('Guacamole & Chips', 'Fresh made guacamole served with crispy tortilla chips', 8.99),
  ('Fish Tacos', 'Grilled fish with cabbage slaw and chipotle sauce', 15.99)
) AS item(name, description, price)
ON CONFLICT DO NOTHING;

-- Add sample menu items for Green Leaf
INSERT INTO menu_items (restaurant_id, name, description, price, is_available, category_id) 
SELECT 
  '4608828b-a335-4b34-808c-53cb743cf1e1',
  item.name,
  item.description,
  item.price,
  true,
  (SELECT id FROM categories WHERE name = 'Vegetarian' LIMIT 1)
FROM (VALUES
  ('Buddha Bowl', 'Quinoa, roasted vegetables, avocado, and tahini dressing', 16.99),
  ('Veggie Burger', 'House-made black bean patty with sweet potato fries', 14.99),
  ('Kale Caesar Salad', 'Organic kale with vegan caesar dressing and croutons', 13.99),
  ('Mushroom Risotto', 'Creamy arborio rice with wild mushrooms and herbs', 18.99),
  ('Acai Bowl', 'Acai puree topped with granola, berries, and coconut', 11.99)
) AS item(name, description, price)
ON CONFLICT DO NOTHING;

-- Update environment variables for local development
-- Note: These should match your .env file for the app to work properly
