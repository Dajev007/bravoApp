import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, User, Phone, Mail, Calendar, Save } from 'lucide-react-native';
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    dietaryPreferences: [] as string[],
    favoriteCuisines: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Keto',
    'Paleo',
    'Halal',
    'Kosher',
  ];

  const cuisineOptions = [
    'Italian',
    'Japanese',
    'Chinese',
    'Indian',
    'Mexican',
    'Thai',
    'American',
    'Mediterranean',
    'French',
    'Korean',
    'Vietnamese',
    'Greek',
  ];

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
          dateOfBirth: profileData.date_of_birth || '',
          dietaryPreferences: profileData.dietary_preferences || [],
          favoriteCuisines: profileData.favorite_cuisines || [],
        });
      } else {
        // Use auth data as fallback
        setFormData(prev => ({
          ...prev,
          name: user?.user_metadata?.name || '',
          phone: user?.user_metadata?.phone || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth || null,
        dietary_preferences: formData.dietaryPreferences,
        favorite_cuisines: formData.favoriteCuisines,
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleDietaryPreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference],
    }));
  };

  const toggleFavoriteCuisine = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteCuisines: prev.favoriteCuisines.includes(cuisine)
        ? prev.favoriteCuisines.filter(c => c !== cuisine)
        : [...prev.favoriteCuisines, cuisine],
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#0077b6" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saving}
        >
          <Save color="#0077b6" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User color="#0077b6" size={20} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor="#90e0ef"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone color="#0077b6" size={20} />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                placeholderTextColor="#90e0ef"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.inputWrapper}>
              <Calendar color="#0077b6" size={20} />
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#90e0ef"
              />
            </View>
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Text style={styles.sectionDescription}>
            Select your dietary restrictions and preferences
          </Text>
          
          <View style={styles.chipContainer}>
            {dietaryOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.chip,
                  formData.dietaryPreferences.includes(option) && styles.chipSelected,
                ]}
                onPress={() => toggleDietaryPreference(option)}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.dietaryPreferences.includes(option) && styles.chipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Favorite Cuisines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Cuisines</Text>
          <Text style={styles.sectionDescription}>
            Choose your favorite types of cuisine
          </Text>
          
          <View style={styles.chipContainer}>
            {cuisineOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.chip,
                  formData.favoriteCuisines.includes(option) && styles.chipSelected,
                ]}
                onPress={() => toggleFavoriteCuisine(option)}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.favoriteCuisines.includes(option) && styles.chipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity 
            style={[styles.saveButtonLarge, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#caf0f8',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#90e0ef',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ade8f4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#ade8f4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#90e0ef',
  },
  chipSelected: {
    backgroundColor: '#0077b6',
    borderColor: '#0077b6',
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  saveSection: {
    padding: 20,
  },
  saveButtonLarge: {
    backgroundColor: '#0077b6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});