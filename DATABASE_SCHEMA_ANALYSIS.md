# Database Schema Analysis

Based on the analysis of Supabase migrations and current database state.

## Current Status

✅ **Supabase CLI Installed and Configured**
✅ **Project Linked to Remote Database**
❌ **Missing Tables** - `restaurant_admins` table doesn't exist in remote database
❌ **Migration Sync Issue** - Local migrations not applied to remote database

## Database Schema Overview

### Core Tables (from 20250618000437_small_spark.sql)

1. **`categories`** - Food categories (Pizza, Burgers, etc.)
2. **`restaurants`** - Restaurant information and details  
3. **`menu_items`** - Individual menu items for each restaurant
4. **`user_profiles`** - Extended user profile information
5. **`delivery_addresses`** - User's saved delivery addresses
6. **`orders`** - Customer orders
7. **`order_items`** - Items within each order
8. **`reviews`** - Restaurant and item reviews
9. **`favorites`** - User's favorite restaurants
10. **`restaurant_hours`** - Operating hours for restaurants
11. **`promotions`** - Active promotions and discounts

### QR Code Support Tables (from 20250621102606_add_restaurant_tables_and_qr_support.sql)

12. **`restaurant_tables`** - Table management for dine-in QR code scanning

### Admin Tables (from 20250622000000_add_restaurant_admin_tables.sql - **NOT APPLIED**)

13. **`restaurant_admins`** ❌ - Restaurant admin users and permissions
14. **`admin_notifications`** ❌ - Notifications for restaurant admins  
15. **`order_requests`** ❌ - Dine-in and takeaway approval requests
16. **`restaurant_analytics`** ❌ - Analytics tracking for restaurants

## Remote Database Status

### ✅ Tables That Exist
- categories
- restaurants (with sample data: Green Leaf, jood, Gee da kadai)
- menu_items
- user_profiles  
- delivery_addresses
- orders
- order_items
- reviews
- favorites
- restaurant_hours
- promotions
- restaurant_tables

### ❌ Missing Tables (Causing Current Error)
- **restaurant_admins** - Main cause of the error
- admin_notifications
- order_requests  
- restaurant_analytics

## The Problem

The app is trying to query the `restaurant_admins` table which doesn't exist in the remote database. This happens because:

1. The admin-related migrations (20250622000000 and later) were never applied to the remote database
2. The `getRestaurantAdminByUserId()` function tries to query `restaurant_admins` table
3. Supabase returns error: "relation 'public.restaurant_admins' does not exist"

## Solutions Provided

### Option 1: Manual SQL Execution (Recommended)
- File: `SETUP_ADMIN_TABLE.sql`
- Copy and paste the SQL into Supabase Dashboard → SQL Editor
- This will create the missing table and grant admin access

### Option 2: Migration Approach  
- File: `supabase/migrations/20250627124341_create_restaurant_admins_table.sql`
- Use `npx supabase db push` (requires database password)

### Option 3: Code Changes Made
- Modified queries in `lib/admin-database.ts` to not rely on foreign key relationships
- Updated `lib/admin-setup.ts` and `lib/database.ts` with similar fixes
- These changes make the app more robust against PostgREST schema cache issues

## User Setup

**Target User:** `0774986724@bravonest.com`
**Available Restaurants:** 
- Green Leaf (4608828b-a335-4b34-808c-53cb743cf1e1)
- jood (3a58cc5d-69a4-425e-9787-862177b998a6)  
- Gee da kadai (507abd19-7d21-4495-9655-26a61dff001d)

## Next Steps

1. **Execute the SQL** in `SETUP_ADMIN_TABLE.sql` via Supabase Dashboard
2. **Test the app** - restart Expo and try logging in
3. **Verify admin access** - check if admin features work

## Database Connection Issues

- Direct CLI database connection failed due to authentication issues
- Password authentication is failing with remote database
- Manual SQL execution through dashboard is the most reliable approach