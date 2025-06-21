// QR Code Test Utilities for Development and Debugging

export interface TableQRData {
  restaurantId: string;
  restaurantName: string;
  tableNumber: number;
  type: 'restaurant_table';
}

/**
 * Validates if a QR code data string is a valid table QR code
 */
export function validateTableQRCode(data: string): { isValid: boolean; error?: string; qrData?: TableQRData } {
  try {
    const qrData: TableQRData = JSON.parse(data);
    
    // Check required fields
    if (!qrData.restaurantId) {
      return { isValid: false, error: 'Missing restaurantId' };
    }
    
    if (!qrData.type || qrData.type !== 'restaurant_table') {
      return { isValid: false, error: 'Invalid or missing type (must be "restaurant_table")' };
    }
    
    if (!qrData.tableNumber || qrData.tableNumber <= 0) {
      return { isValid: false, error: 'Invalid or missing tableNumber' };
    }
    
    if (!qrData.restaurantName) {
      return { isValid: false, error: 'Missing restaurantName' };
    }
    
    return { isValid: true, qrData };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
}

/**
 * Generates a sample QR code data string for testing
 */
export function generateSampleQRCode(restaurantId: string, restaurantName: string, tableNumber: number): string {
  const qrData: TableQRData = {
    restaurantId,
    restaurantName,
    tableNumber,
    type: 'restaurant_table'
  };
  
  return JSON.stringify(qrData);
}

/**
 * Common sample QR codes for testing
 */
export const SAMPLE_QR_CODES = {
  validTableQR: generateSampleQRCode('123e4567-e89b-12d3-a456-426614174000', 'Test Restaurant', 5),
  invalidFormat: 'not-a-json-string',
  missingType: JSON.stringify({ restaurantId: '123', restaurantName: 'Test', tableNumber: 1 }),
  wrongType: JSON.stringify({ restaurantId: '123', restaurantName: 'Test', tableNumber: 1, type: 'menu_item' }),
  missingTableNumber: JSON.stringify({ restaurantId: '123', restaurantName: 'Test', type: 'restaurant_table' }),
};

/**
 * Debug function to test QR code validation
 */
export function debugQRCode(data: string): void {
  console.log('=== QR Code Debug ===');
  console.log('Raw data:', data);
  
  const validation = validateTableQRCode(data);
  console.log('Validation result:', validation);
  
  if (validation.isValid && validation.qrData) {
    console.log('Parsed QR Data:', validation.qrData);
  }
  
  console.log('==================');
} 