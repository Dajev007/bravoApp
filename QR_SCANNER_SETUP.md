# QR Scanner Setup Guide

This guide covers the setup and troubleshooting of the QR scanning functionality in the BravoNest Restaurant App.

## Prerequisites

1. **Expo SDK 53+** - The app uses `expo-camera` version ~16.1.5
2. **Supabase Database** - For restaurant and table validation
3. **Physical Device or Emulator with Camera** - QR scanning doesn't work on web

## Environment Setup

### 1. Configure Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Database Schema

Ensure your Supabase database has the following tables:

#### Restaurants Table
```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT,
  image_url TEXT,
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  delivery_time_min INTEGER,
  delivery_time_max INTEGER,
  delivery_fee DECIMAL DEFAULT 0,
  minimum_order DECIMAL DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  address TEXT,
  phone TEXT,
  qr_code_url TEXT,
  total_tables INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### Restaurant Tables
```sql
CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);
```

## QR Code Format

The app expects QR codes in the following JSON format:

```json
{
  "restaurantId": "uuid-of-restaurant",
  "restaurantName": "Restaurant Name",
  "tableNumber": 5,
  "type": "restaurant_table"
}
```

### Example Valid QR Code Data:
```json
{
  "restaurantId": "123e4567-e89b-12d3-a456-426614174000",
  "restaurantName": "Test Restaurant",
  "tableNumber": 5,
  "type": "restaurant_table"
}
```

## Permissions Setup

### iOS (app.json)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs access to camera to scan QR codes on restaurant tables for dine-in ordering.",
        "NSMicrophoneUsageDescription": "This app may need microphone access for camera functionality."
      }
    }
  }
}
```

### Android (app.json)
```json
{
  "expo": {
    "android": {
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO"
      ]
    }
  }
}
```

## Troubleshooting

### 1. Camera Permission Issues
**Problem**: "Camera Access Required" screen appears
**Solutions**:
- Check if camera permissions are properly configured in `app.json`
- Manually grant camera permissions in device settings
- Restart the app after granting permissions

### 2. QR Code Not Scanning
**Problem**: Camera opens but doesn't detect QR codes
**Solutions**:
- Ensure good lighting conditions
- Hold the device steady and at appropriate distance (6-12 inches)
- Make sure the QR code is clearly visible within the scanning frame
- Try toggling the flashlight if in low light
- Check if the QR code format is correct

### 3. "Invalid QR Code" Errors
**Problem**: QR code is detected but shows error message
**Solutions**:
- Verify the QR code contains valid JSON data
- Check that the `type` field is exactly `"restaurant_table"`
- Ensure all required fields are present: `restaurantId`, `restaurantName`, `tableNumber`, `type`
- Use the debug utility to validate QR code format:

```typescript
import { debugQRCode } from '@/lib/qr-test-utils';
debugQRCode('your-qr-code-data-here');
```

### 4. "Restaurant Not Found" Errors
**Problem**: QR code is valid but restaurant doesn't exist
**Solutions**:
- Verify the restaurant exists in the Supabase `restaurants` table
- Check that the `restaurantId` in the QR code matches the database
- Ensure the restaurant record has `is_open: true`

### 5. "Table Not Found" Errors
**Problem**: Restaurant exists but table is not found
**Solutions**:
- Verify the table exists in the `restaurant_tables` table
- Check that the `table_number` matches exactly
- Ensure the table has `is_active: true`
- Verify the `restaurant_id` foreign key is correct

### 6. Database Connection Issues
**Problem**: Network errors or timeout during validation
**Solutions**:
- Check internet connection
- Verify Supabase credentials in `.env` file
- Ensure Supabase project is active and accessible
- Check Supabase service status

### 7. Camera Initialization Issues
**Problem**: "Initializing Camera..." appears indefinitely
**Solutions**:
- Restart the app
- Check device camera functionality in other apps
- Ensure `expo-camera` dependency is properly installed
- Try clearing app cache/data

## Testing QR Codes

Use the provided test utilities to generate and validate QR codes:

```typescript
import { generateSampleQRCode, SAMPLE_QR_CODES, validateTableQRCode } from '@/lib/qr-test-utils';

// Generate a test QR code
const testQR = generateSampleQRCode('restaurant-uuid', 'Test Restaurant', 1);

// Validate QR code format
const validation = validateTableQRCode(testQR);
console.log(validation);

// Use sample QR codes for testing
console.log(SAMPLE_QR_CODES.validTableQR);
```

## Development Tips

1. **Enable Debug Logging**: The scanner logs detailed information to console during QR processing
2. **Test with Sample Data**: Use the provided sample QR codes for testing
3. **Database Setup**: Ensure your database has test restaurants and tables for development
4. **Physical Device Testing**: Always test on physical devices as camera simulation may not work properly

## Performance Optimization

- The scanner automatically resets after 2 seconds on successful scan
- Camera initialization is handled gracefully with loading states
- Flash and camera toggle are disabled during initialization
- Processing state prevents multiple simultaneous scans

## Support

If you continue to experience issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with the provided sample QR codes
4. Ensure database schema matches the expected format 