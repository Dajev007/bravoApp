import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { updateRestaurantDetails } from '@/lib/admin-database';
import { SaveIcon, EditIcon, StoreIcon, PhoneIcon, MapPinIcon, ClockIcon } from 'lucide-react-native';

const isWeb = Platform.OS === 'web';

export default function RestaurantManagement() {
  const { restaurantId, adminData, refreshAdminData } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine_type: '',
    address: '',
    phone: '',
    is_open: true,
    total_tables: 0,
  });

  useEffect(() => {
    if (adminData?.restaurant) {
      setFormData({
        name: adminData.restaurant.name || '',
        description: adminData.restaurant.description || '',
        cuisine_type: adminData.restaurant.cuisine_type || '',
        address: adminData.restaurant.address || '',
        phone: adminData.restaurant.phone || '',
        is_open: adminData.restaurant.is_open || true,
        total_tables: adminData.restaurant.total_tables || 0,
      });
    }
  }, [adminData]);

  const handleSave = async () => {
    if (!restaurantId) return;

    setLoading(true);
    try {
      await updateRestaurantDetails(restaurantId, formData);
      await refreshAdminData();
      setIsEditing(false);
      Alert.alert('Success', 'Restaurant details updated successfully');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      Alert.alert('Error', 'Failed to update restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (adminData?.restaurant) {
      setFormData({
        name: adminData.restaurant.name || '',
        description: adminData.restaurant.description || '',
        cuisine_type: adminData.restaurant.cuisine_type || '',
        address: adminData.restaurant.address || '',
        phone: adminData.restaurant.phone || '',
        is_open: adminData.restaurant.is_open || true,
        total_tables: adminData.restaurant.total_tables || 0,
      });
    }
    setIsEditing(false);
  };

  const handleToggleOperatingStatus = async () => {
    if (!restaurantId) return;

    const newStatus = !formData.is_open;
    setFormData(prev => ({ ...prev, is_open: newStatus }));

    try {
      await updateRestaurantDetails(restaurantId, { is_open: newStatus });
      await refreshAdminData();
      Alert.alert(
        'Status Updated', 
        `Restaurant is now ${newStatus ? 'open' : 'closed'}`
      );
    } catch (error) {
      console.error('Error updating status:', error);
      setFormData(prev => ({ ...prev, is_open: !newStatus }));
      Alert.alert('Error', 'Failed to update operating status');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <StoreIcon size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>Restaurant Management</Text>
        </View>
        
        <View style={styles.headerActions}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>
              {formData.is_open ? 'Open' : 'Closed'}
            </Text>
            <Switch
              value={formData.is_open}
              onValueChange={handleToggleOperatingStatus}
              trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
              thumbColor={formData.is_open ? '#16a34a' : '#9ca3af'}
            />
          </View>
          
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <EditIcon size={20} color="#ffffff" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <SaveIcon size={20} color="#ffffff" />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Restaurant Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurant Information</Text>
        
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              editable={isEditing}
              placeholder="Enter restaurant name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textarea, !isEditing && styles.inputDisabled]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              editable={isEditing}
              placeholder="Enter restaurant description"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cuisine Type</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.cuisine_type}
              onChangeText={(text) => setFormData(prev => ({ ...prev, cuisine_type: text }))}
              editable={isEditing}
              placeholder="e.g., Italian, Mexican, Asian"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputWithIcon}>
              <MapPinIcon size={20} color="#64748b" />
              <TextInput
                style={[styles.inputWithIconText, !isEditing && styles.inputDisabled]}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                editable={isEditing}
                placeholder="Full restaurant address"
                multiline
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWithIcon}>
              <PhoneIcon size={20} color="#64748b" />
              <TextInput
                style={[styles.inputWithIconText, !isEditing && styles.inputDisabled]}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                editable={isEditing}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Tables</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.total_tables.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, total_tables: parseInt(text) || 0 }))}
              editable={isEditing}
              placeholder="Number of tables"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Operating Hours */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ClockIcon size={20} color="#64748b" />
          <Text style={styles.sectionTitle}>Operating Hours</Text>
        </View>
        
        <View style={styles.operatingHours}>
          {[
            { day: 'Monday', hours: '11:00 AM - 10:00 PM' },
            { day: 'Tuesday', hours: '11:00 AM - 10:00 PM' },
            { day: 'Wednesday', hours: '11:00 AM - 10:00 PM' },
            { day: 'Thursday', hours: '11:00 AM - 10:00 PM' },
            { day: 'Friday', hours: '11:00 AM - 11:00 PM' },
            { day: 'Saturday', hours: '11:00 AM - 11:00 PM' },
            { day: 'Sunday', hours: '12:00 PM - 9:00 PM' },
          ].map((item, index) => (
            <View key={index} style={styles.operatingHourRow}>
              <Text style={styles.dayText}>{item.day}</Text>
              <Text style={styles.hoursText}>{item.hours}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.editHoursButton}>
          <Text style={styles.editHoursButtonText}>Edit Operating Hours</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{adminData?.restaurant?.total_tables || 0}</Text>
            <Text style={styles.statLabel}>Total Tables</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>324</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formData.is_open ? 'Open' : 'Closed'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Sections
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  
  // Form
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  
  // Operating Hours
  operatingHours: {
    gap: 12,
  },
  operatingHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  hoursText: {
    fontSize: 16,
    color: '#64748b',
  },
  editHoursButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 6,
  },
  editHoursButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
}); 