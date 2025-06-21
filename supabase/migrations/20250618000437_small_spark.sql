/*
  # BravoNest Restaurant App Database Schema

  1. New Tables
    - `restaurants` - Restaurant information and details
    - `categories` - Food categories (Pizza, Burger, etc.)
    - `menu_items` - Individual menu items for each restaurant
    - `orders` - Customer orders
    - `order_items` - Items within each order
    - `user_profiles` - Extended user profile information
    - `reviews` - Restaurant and item reviews
    - `favorites` - User's favorite restaurants and items
    - `delivery_addresses` - User's saved delivery addresses
    - `restaurant_hours` - Operating hours for restaurants
    - `promotions` - Active promotions and discounts

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate

  3. Mock Data
    - Comprehensive sample data for all tables
    - Realistic restaurant information
    - Sample menu items with proper categorization
    - Sample orders and reviews
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  color text DEFAULT '#0077b6',
  created_at timestamptz DEFAULT now()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cuisine_type text NOT NULL,
  image_url text,
  rating numeric(2,1) DEFAULT 0.0,
  review_count integer DEFAULT 0,
  delivery_time_min integer DEFAULT 30,
  delivery_time_max integer DEFAULT 45,
  delivery_fee numeric(4,2) DEFAULT 2.99,
  minimum_order numeric(6,2) DEFAULT 15.00,
  is_open boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  address text,
  phone text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(6,2) NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  is_popular boolean DEFAULT false,
  is_vegetarian boolean DEFAULT false,
  is_vegan boolean DEFAULT false,
  is_gluten_free boolean DEFAULT false,
  calories integer,
  prep_time_minutes integer DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  phone text,
  avatar_url text,
  date_of_birth date,
  dietary_preferences text[],
  favorite_cuisines text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Delivery addresses table
CREATE TABLE IF NOT EXISTS delivery_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL, -- 'Home', 'Work', etc.
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  latitude numeric(10,8),
  longitude numeric(11,8),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  delivery_address_id uuid REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')),
  subtotal numeric(8,2) NOT NULL,
  delivery_fee numeric(4,2) DEFAULT 2.99,
  service_fee numeric(4,2) DEFAULT 1.50,
  tax numeric(6,2) DEFAULT 0.00,
  tip numeric(6,2) DEFAULT 0.00,
  total numeric(8,2) NOT NULL,
  payment_method text DEFAULT 'card',
  special_instructions text,
  estimated_delivery_time timestamptz,
  actual_delivery_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(6,2) NOT NULL,
  total_price numeric(6,2) NOT NULL,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  food_rating integer CHECK (food_rating >= 1 AND food_rating <= 5),
  delivery_rating integer CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  service_rating integer CHECK (service_rating >= 1 AND service_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Restaurant hours table
CREATE TABLE IF NOT EXISTS restaurant_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  open_time time,
  close_time time,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_delivery')),
  discount_value numeric(6,2),
  minimum_order numeric(6,2),
  max_discount numeric(6,2),
  promo_code text UNIQUE,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Restaurants: Public read access
CREATE POLICY "Restaurants are viewable by everyone"
  ON restaurants FOR SELECT
  TO public
  USING (true);

-- Menu items: Public read access
CREATE POLICY "Menu items are viewable by everyone"
  ON menu_items FOR SELECT
  TO public
  USING (true);

-- User profiles: Users can manage their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Delivery addresses: Users can manage their own addresses
CREATE POLICY "Users can manage own addresses"
  ON delivery_addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Orders: Users can manage their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Order items: Users can manage items in their own orders
CREATE POLICY "Users can manage own order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Reviews: Users can manage their own reviews, everyone can read
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Restaurant hours: Public read access
CREATE POLICY "Restaurant hours are viewable by everyone"
  ON restaurant_hours FOR SELECT
  TO public
  USING (true);

-- Promotions: Public read access for active promotions
CREATE POLICY "Active promotions are viewable by everyone"
  ON promotions FOR SELECT
  TO public
  USING (is_active = true AND start_date <= now() AND end_date >= now());

-- Insert mock data

-- Categories
INSERT INTO categories (name, icon, color) VALUES
('Pizza', '🍕', '#FF6B6B'),
('Burger', '🍔', '#4ECDC4'),
('Sushi', '🍣', '#45B7D1'),
('Pasta', '🍝', '#96CEB4'),
('Salad', '🥗', '#FFEAA7'),
('Dessert', '🍰', '#DDA0DD'),
('Coffee', '☕', '#8B4513'),
('Asian', '🥢', '#FF7675'),
('Mexican', '🌮', '#FDCB6E'),
('Indian', '🍛', '#E17055');

-- Restaurants
INSERT INTO restaurants (name, description, cuisine_type, image_url, rating, review_count, delivery_time_min, delivery_time_max, is_featured, address, phone) VALUES
('Bella Vista', 'Authentic Italian cuisine with fresh ingredients and traditional recipes', 'Italian', 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400', 4.8, 324, 25, 35, true, '123 Italian Way, San Francisco, CA', '(555) 123-4567'),
('Sakura Sushi', 'Premium sushi and Japanese dishes made by expert chefs', 'Japanese', 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400', 4.9, 256, 30, 40, true, '456 Sushi Street, San Francisco, CA', '(555) 234-5678'),
('Spice Garden', 'Flavorful Indian cuisine with aromatic spices and traditional cooking methods', 'Indian', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', 4.7, 189, 20, 30, false, '789 Curry Lane, San Francisco, CA', '(555) 345-6789'),
('Burger Palace', 'Gourmet burgers made with premium beef and fresh toppings', 'American', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400', 4.6, 412, 15, 25, false, '321 Burger Blvd, San Francisco, CA', '(555) 456-7890'),
('Green Leaf', 'Fresh, healthy meals with organic ingredients and nutritious options', 'Healthy', 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400', 4.5, 167, 20, 30, false, '654 Health Ave, San Francisco, CA', '(555) 567-8901'),
('Taco Fiesta', 'Authentic Mexican street food with bold flavors and fresh ingredients', 'Mexican', 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400', 4.4, 298, 18, 28, false, '987 Taco Street, San Francisco, CA', '(555) 678-9012'),
('Dragon Wok', 'Traditional Chinese cuisine with modern presentation and authentic flavors', 'Chinese', 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=400', 4.6, 203, 25, 35, false, '147 Dragon Road, San Francisco, CA', '(555) 789-0123'),
('Café Mocha', 'Artisan coffee, pastries, and light meals in a cozy atmosphere', 'Cafe', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400', 4.3, 156, 10, 20, false, '258 Coffee Corner, San Francisco, CA', '(555) 890-1234');

-- Menu Items for Bella Vista (Italian)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_popular, is_vegetarian) VALUES
((SELECT id FROM restaurants WHERE name = 'Bella Vista'), (SELECT id FROM categories WHERE name = 'Pizza'), 'Margherita Pizza', 'Classic pizza with fresh mozzarella, tomatoes, and basil', 18.99, 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400', true, true),
((SELECT id FROM restaurants WHERE name = 'Bella Vista'), (SELECT id FROM categories WHERE name = 'Pizza'), 'Pepperoni Pizza', 'Traditional pepperoni pizza with mozzarella cheese', 21.99, 'https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg?auto=compress&cs=tinysrgb&w=400', true, false),
((SELECT id FROM restaurants WHERE name = 'Bella Vista'), (SELECT id FROM categories WHERE name = 'Pasta'), 'Spaghetti Carbonara', 'Creamy pasta with pancetta, eggs, and parmesan cheese', 16.99, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400', true, false),
((SELECT id FROM restaurants WHERE name = 'Bella Vista'), (SELECT id FROM categories WHERE name = 'Pasta'), 'Fettuccine Alfredo', 'Rich and creamy fettuccine with parmesan cheese', 15.99, 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=400', false, true),
((SELECT id FROM restaurants WHERE name = 'Bella Vista'), (SELECT id FROM categories WHERE name = 'Salad'), 'Caesar Salad', 'Crisp romaine lettuce with caesar dressing and croutons', 12.99, 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400', false, true);

-- Menu Items for Sakura Sushi (Japanese)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_popular) VALUES
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi'), (SELECT id FROM categories WHERE name = 'Sushi'), 'Salmon Roll', 'Fresh salmon with avocado and cucumber', 14.99, 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400', true),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi'), (SELECT id FROM categories WHERE name = 'Sushi'), 'California Roll', 'Crab, avocado, and cucumber with sesame seeds', 12.99, 'https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=400', true),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi'), (SELECT id FROM categories WHERE name = 'Sushi'), 'Tuna Sashimi', 'Fresh tuna slices served with wasabi and ginger', 18.99, 'https://images.pexels.com/photos/271715/pexels-photo-271715.jpeg?auto=compress&cs=tinysrgb&w=400', false),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi'), (SELECT id FROM categories WHERE name = 'Asian'), 'Miso Soup', 'Traditional Japanese soup with tofu and seaweed', 4.99, 'https://images.pexels.com/photos/5409751/pexels-photo-5409751.jpeg?auto=compress&cs=tinysrgb&w=400', false),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi'), (SELECT id FROM categories WHERE name = 'Asian'), 'Chicken Teriyaki', 'Grilled chicken with teriyaki sauce and steamed rice', 16.99, 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400', true);

-- Menu Items for Spice Garden (Indian)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_popular, is_vegetarian, is_vegan) VALUES
((SELECT id FROM restaurants WHERE name = 'Spice Garden'), (SELECT id FROM categories WHERE name = 'Indian'), 'Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces', 17.99, 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400', true, false, false),
((SELECT id FROM restaurants WHERE name = 'Spice Garden'), (SELECT id FROM categories WHERE name = 'Indian'), 'Palak Paneer', 'Spinach curry with cottage cheese cubes', 15.99, 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400', true, true, false),
((SELECT id FROM restaurants WHERE name = 'Spice Garden'), (SELECT id FROM categories WHERE name = 'Indian'), 'Biryani', 'Fragrant basmati rice with spices and your choice of protein', 19.99, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', true, false, false),
((SELECT id FROM restaurants WHERE name = 'Spice Garden'), (SELECT id FROM categories WHERE name = 'Indian'), 'Dal Tadka', 'Yellow lentils tempered with spices', 13.99, 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400', false, true, true),
((SELECT id FROM restaurants WHERE name = 'Spice Garden'), (SELECT id FROM categories WHERE name = 'Indian'), 'Naan Bread', 'Fresh baked Indian flatbread', 3.99, 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400', false, true, false);

-- Menu Items for Burger Palace (American)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_popular) VALUES
((SELECT id FROM restaurants WHERE name = 'Burger Palace'), (SELECT id FROM categories WHERE name = 'Burger'), 'Classic Cheeseburger', 'Beef patty with cheese, lettuce, tomato, and special sauce', 13.99, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400', true),
((SELECT id FROM restaurants WHERE name = 'Burger Palace'), (SELECT id FROM categories WHERE name = 'Burger'), 'BBQ Bacon Burger', 'Beef patty with BBQ sauce, bacon, and onion rings', 16.99, 'https://images.pexels.com/photos/1556698/pexels-photo-1556698.jpeg?auto=compress&cs=tinysrgb&w=400', true),
((SELECT id FROM restaurants WHERE name = 'Burger Palace'), (SELECT id FROM categories WHERE name = 'Burger'), 'Veggie Burger', 'Plant-based patty with avocado and sprouts', 14.99, 'https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=400', false),
((SELECT id FROM restaurants WHERE name = 'Burger Palace'), (SELECT id FROM categories WHERE name = 'Salad'), 'Crispy Chicken Salad', 'Mixed greens with crispy chicken and ranch dressing', 12.99, 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400', false),
((SELECT id FROM restaurants WHERE name = 'Burger Palace'), (SELECT id FROM categories WHERE name = 'Dessert'), 'Chocolate Milkshake', 'Rich chocolate milkshake topped with whipped cream', 5.99, 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=400', true);

-- Menu Items for Green Leaf (Healthy)
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_popular, is_vegetarian, is_vegan, is_gluten_free) VALUES
((SELECT id FROM restaurants WHERE name = 'Green Leaf'), (SELECT id FROM categories WHERE name = 'Salad'), 'Quinoa Power Bowl', 'Quinoa with roasted vegetables, avocado, and tahini dressing', 14.99, 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400', true, true, true, true),
((SELECT id FROM restaurants WHERE name = 'Green Leaf'), (SELECT id FROM categories WHERE name = 'Salad'), 'Kale Caesar Salad', 'Massaged kale with vegan caesar dressing and hemp seeds', 12.99, 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400', true, true, true, false),
((SELECT id FROM restaurants WHERE name = 'Green Leaf'), (SELECT id FROM categories WHERE name = 'Salad'), 'Acai Bowl', 'Acai berries with granola, fresh fruits, and coconut', 11.99, 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400', true, true, true, false),
((SELECT id FROM restaurants WHERE name = 'Green Leaf'), (SELECT id FROM categories WHERE name = 'Coffee'), 'Green Smoothie', 'Spinach, banana, mango, and coconut water', 8.99, 'https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg?auto=compress&cs=tinysrgb&w=400', false, true, true, true),
((SELECT id FROM restaurants WHERE name = 'Green Leaf'), (SELECT id FROM categories WHERE name = 'Salad'), 'Buddha Bowl', 'Brown rice with roasted vegetables and peanut sauce', 13.99, 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400', false, true, true, true);

-- Restaurant Hours (Monday = 1, Sunday = 0)
INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time) 
SELECT r.id, d.day, '11:00'::time, '22:00'::time
FROM restaurants r
CROSS JOIN (VALUES (0), (1), (2), (3), (4), (5), (6)) AS d(day);

-- Update some restaurants to have different hours
UPDATE restaurant_hours 
SET open_time = '07:00'::time, close_time = '15:00'::time
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Café Mocha');

-- Sample Promotions
INSERT INTO promotions (restaurant_id, title, description, discount_type, discount_value, minimum_order, promo_code, start_date, end_date) VALUES
((SELECT id FROM restaurants WHERE name = 'Bella Vista'), 'Free Delivery Weekend', 'Free delivery on orders over $25', 'free_delivery', 0, 25.00, 'FREEDELIVERY', now() - interval '1 day', now() + interval '7 days'),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi'), '20% Off First Order', 'Get 20% off your first order', 'percentage', 20, 15.00, 'FIRST20', now() - interval '1 day', now() + interval '30 days'),
((SELECT id FROM restaurants WHERE name = 'Burger Palace'), '$5 Off Large Orders', '$5 off orders over $30', 'fixed_amount', 5.00, 30.00, 'SAVE5', now() - interval '1 day', now() + interval '14 days');

-- Functions to update restaurant ratings
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE restaurants 
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews 
      WHERE restaurant_id = NEW.restaurant_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews 
      WHERE restaurant_id = NEW.restaurant_id
    )
  WHERE id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update restaurant ratings
CREATE TRIGGER update_restaurant_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_rating();

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();