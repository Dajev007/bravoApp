import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { QrCode, Camera, FlashlightOff as FlashOff, Slash as Flash } from 'lucide-react-native';
import { router } from 'expo-router';
import { getRestaurantById, getTableByNumber } from '@/lib/database';

interface TableQRData {
  restaurantId: string;
  restaurantName: string;
  tableNumber: number;
  type: 'restaurant_table';
}

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <QrCode color="#0077b6" size={64} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan table QR codes for dine-in ordering.
          </Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <QrCode color="#0077b6" size={64} />
          <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
          <Text style={styles.permissionText}>
            Please grant camera permission to scan table QR codes for dine-in ordering.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);
    
    try {
      // Parse the QR code data
      const qrData: TableQRData = JSON.parse(data);
      
      // Validate the QR code structure - only accept table QR codes
      if (!qrData.restaurantId || !qrData.type || qrData.type !== 'restaurant_table' || !qrData.tableNumber) {
        throw new Error('Invalid table QR code format');
      }

      // Verify the restaurant exists in the database
      const restaurant = await getRestaurantById(qrData.restaurantId);
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      // Verify the table exists
      const table = await getTableByNumber(qrData.restaurantId, qrData.tableNumber);
      
      if (!table) {
        throw new Error('Table not found');
      }

      // Navigate to restaurant page with table context for dine-in ordering
      router.push({
        pathname: `/restaurant/${qrData.restaurantId}`,
        params: { 
          tableId: table.id,
          tableNumber: qrData.tableNumber,
          orderType: 'dine_in'
        }
      });
      
    } catch (error) {
      console.error('QR Code processing error:', error);
      
      let errorMessage = 'Invalid table QR code';
      
      if (error instanceof SyntaxError) {
        errorMessage = 'This QR code is not a valid table QR code from BravoNest.';
      } else if (error instanceof Error) {
        if (error.message === 'Restaurant not found') {
          errorMessage = 'Restaurant not found. This QR code may be outdated.';
        } else if (error.message === 'Table not found') {
          errorMessage = 'Table not found. Please contact restaurant staff.';
        } else if (error.message === 'Invalid table QR code format') {
          errorMessage = 'This QR code is not a valid table QR code. Please scan the QR code on your table.';
        }
      }
      
      Alert.alert(
        'QR Code Error',
        errorMessage,
        [
          {
            text: 'Scan Again',
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            },
          },
        ]
      );
      return;
    }
    
    setIsProcessing(false);
  };

  const resetScanner = () => {
    setScanned(false);
    setIsProcessing(false);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webContainer}>
          <QrCode color="#0077b6" size={80} />
          <Text style={styles.webTitle}>Table QR Scanner</Text>
          <Text style={styles.webText}>
            Table QR code scanning is not available on web. Please use the mobile app to scan table QR codes for dine-in ordering.
          </Text>
          <TouchableOpacity style={styles.webButton}>
            <Text style={styles.webButtonText}>Download Mobile App</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        flash={flashOn ? 'on' : 'off'}
      />

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <Text style={styles.headerTitle}>Scan Table QR Code</Text>
        <Text style={styles.headerSubtitle}>
          {isProcessing 
            ? 'Processing...' 
            : 'Point camera at the QR code on your table'
          }
        </Text>
      </View>

      {/* Scanning Frame Overlay */}
      <View style={styles.scanningOverlay}>
        <View style={styles.scanningFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Processing overlay */}
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <Text style={styles.processingText}>Processing Table QR Code...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Controls Overlay */}
      <View style={styles.controlsOverlay}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
          {flashOn ? (
            <Flash color="#FFFFFF" size={24} />
          ) : (
            <FlashOff color="#FFFFFF" size={24} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Camera color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        {scanned && (
          <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
            <Text style={styles.resetButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Instructions Overlay */}
      <View style={styles.instructionsOverlay}>
        <Text style={styles.instructionText}>
          {scanned 
            ? 'Table QR code detected! Processing...' 
            : 'Scan the QR code on your restaurant table to start ordering'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#caf0f8',
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#caf0f8',
  },
  webTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginTop: 24,
    marginBottom: 16,
  },
  webText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  webButton: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  webButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scanningFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#48cae4',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
    alignItems: 'center',
    zIndex: 1,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    padding: 15,
  },
  resetButton: {
    backgroundColor: '#0077b6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  instructionsOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});