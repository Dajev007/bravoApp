import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Sparkles, ChefHat, Heart, TrendingUp } from 'lucide-react-native';
import { RestaurantRecommendations } from '@/components/ui/RestaurantRecommendations';

export default function RecommendationsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Restaurant Recommendations</Text>
        <View style={styles.headerRight}>
          <Sparkles color="#FFFFFF" size={24} />
        </View>
      </View>

      {/* Main Content */}
      <RestaurantRecommendations />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0077b6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    padding: 8,
  },
}); 