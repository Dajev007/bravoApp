/*
  # Fix user signup database error

  1. Database Changes
    - Update the handle_new_user trigger function to properly handle user profile creation
    - Ensure RLS policies allow the trigger to insert user profiles
    - Add a policy that allows the service role to insert user profiles during signup

  2. Security
    - Maintain existing RLS policies for user data protection
    - Add specific policy for automated user profile creation
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, phone, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add a policy to allow the trigger to insert user profiles
CREATE POLICY "Allow service role to insert profiles during signup"
  ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure the existing policies are correct
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);