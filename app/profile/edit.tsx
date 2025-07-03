import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, User, Phone, Mail, MapPin, Edit, Save, X } from 'lucide-react-native';
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/database';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen() {
  const { colors, isDark } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date_of_birth: '',
    dietary_preferences: [] as string[],
    favorite_cuisines: [] as string[],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
      if (profileData) {
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          date_of_birth: profileData.date_of_birth || '',
          dietary_preferences: profileData.dietary_preferences || [],
          favorite_cuisines: profileData.favorite_cuisines || [],
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      await updateUserProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditingField(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        dietary_preferences: profile.dietary_preferences || [],
        favorite_cuisines: profile.favorite_cuisines || [],
      });
    }
    setEditingField(null);
  };

  const styles = createStyles(colors, isDark);

  // Gradient colors based on theme
  const gradientColors = isDark 
    ? ['#1a1a1a', '#2d2d2d'] as const // Dark ash colors
    : [colors.primary, colors.primaryLight] as const; // Light theme

  const renderField = (
    field: keyof typeof formData,
    label: string,
    icon: any,
    placeholder: string,
    multiline = false
  ) => {
    const isEditing = editingField === field;
    const IconComponent = icon;

    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldIcon}>
            <IconComponent color={colors.primary} size={20} />
          </View>
          <Text style={styles.fieldLabel}>{label}</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => handleEdit(field)}>
              <Edit color={colors.primary} size={16} />
            </TouchableOpacity>
          )}
        </View>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[styles.input, multiline && styles.multilineInput]}
              value={formData[field]}
              onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <X color="#ffffff" size={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.fieldValue}>
            <Text style={styles.valueText}>
              {formData[field] || `Add ${label.toLowerCase()}`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <User color={colors.primary} size={40} />
          </View>
          <TouchableOpacity style={styles.editImageButton}>
            <Edit color="#ffffff" size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldsContainer}>
          {renderField('name', 'Full Name', User, 'Enter your full name')}
          {renderField('phone', 'Phone', Phone, 'Enter your phone number')}
          {renderField('date_of_birth', 'Date of Birth', Mail, 'Enter your date of birth (YYYY-MM-DD)')}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.saveAllButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size={20} />
            ) : (
              <Save color="#ffffff" size={20} />
            )}
            <Text style={styles.saveAllButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 32,
    right: 'calc(50% - 60px)',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fieldsContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  fieldContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldIcon: {
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    flex: 1,
  },
  fieldValue: {
    marginLeft: 32,
  },
  valueText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  editContainer: {
    marginLeft: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    backgroundColor: colors.inputBackground,
    marginBottom: 12,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: colors.accent,
    padding: 8,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  saveAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveAllButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});