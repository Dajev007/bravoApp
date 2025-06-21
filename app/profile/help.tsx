import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MessageCircle, Phone, Mail, CircleHelp as HelpCircle, FileText, Star, ChevronRight } from 'lucide-react-native';

const helpTopics = [
  {
    id: '1',
    title: 'Order Issues',
    description: 'Problems with your order, delivery, or refunds',
    icon: '📦',
  },
  {
    id: '2',
    title: 'Account & Profile',
    description: 'Managing your account, profile, and preferences',
    icon: '👤',
  },
  {
    id: '3',
    title: 'Payment & Billing',
    description: 'Payment methods, charges, and billing questions',
    icon: '💳',
  },
  {
    id: '4',
    title: 'App & Technical',
    description: 'App crashes, bugs, and technical difficulties',
    icon: '📱',
  },
  {
    id: '5',
    title: 'Restaurant Partners',
    description: 'Questions about restaurants and menu items',
    icon: '🍽️',
  },
  {
    id: '6',
    title: 'Promotions & Offers',
    description: 'Coupons, discounts, and promotional codes',
    icon: '🎁',
  },
];

const contactMethods = [
  {
    id: '1',
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: MessageCircle,
    action: () => console.log('Opening live chat...'),
    available: '24/7',
  },
  {
    id: '2',
    title: 'Phone Support',
    description: 'Call our customer service',
    icon: Phone,
    action: () => Linking.openURL('tel:+1-800-BRAVO-NEST'),
    available: '9 AM - 9 PM',
  },
  {
    id: '3',
    title: 'Email Support',
    description: 'Send us an email',
    icon: Mail,
    action: () => Linking.openURL('mailto:support@bravonest.com'),
    available: 'Response within 24h',
  },
];

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#0077b6" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactCard}
              onPress={method.action}
            >
              <View style={styles.contactInfo}>
                <View style={styles.contactIcon}>
                  <method.icon color="#0077b6" size={20} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactDescription}>{method.description}</Text>
                  <Text style={styles.contactAvailability}>{method.available}</Text>
                </View>
              </View>
              <ChevronRight color="#90e0ef" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Help Topics</Text>
          
          {helpTopics.map((topic) => (
            <TouchableOpacity key={topic.id} style={styles.topicCard}>
              <View style={styles.topicInfo}>
                <Text style={styles.topicIcon}>{topic.icon}</Text>
                <View style={styles.topicDetails}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
              </View>
              <ChevronRight color="#90e0ef" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle color="#0077b6" size={20} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          
          <TouchableOpacity style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I track my order?</Text>
            <Text style={styles.faqAnswer}>
              You can track your order in real-time from the Orders section or by tapping 
              the notification when your order status updates.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.faqCard}>
            <Text style={styles.faqQuestion}>What if my order is late?</Text>
            <Text style={styles.faqAnswer}>
              If your order is significantly delayed, you'll receive automatic updates. 
              You can also contact the restaurant directly or reach out to our support team.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I cancel my order?</Text>
            <Text style={styles.faqAnswer}>
              Orders can be cancelled within 5 minutes of placing them. After that, 
              please contact our support team for assistance.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <TouchableOpacity style={styles.resourceCard}>
            <FileText color="#0077b6" size={20} />
            <Text style={styles.resourceText}>Terms of Service</Text>
            <ChevronRight color="#90e0ef" size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <FileText color="#0077b6" size={20} />
            <Text style={styles.resourceText}>Privacy Policy</Text>
            <ChevronRight color="#90e0ef" size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <Star color="#0077b6" size={20} />
            <Text style={styles.resourceText}>Rate BravoNest</Text>
            <ChevronRight color="#90e0ef" size={20} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>BravoNest v1.0.0</Text>
          <Text style={styles.appInfoText}>
            Need more help? Our support team is here to assist you 24/7.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ade8f4',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ade8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginBottom: 2,
  },
  contactAvailability: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#48cae4',
  },
  topicCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ade8f4',
  },
  topicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  topicDetails: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  faqCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ade8f4',
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    lineHeight: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ade8f4',
    gap: 12,
  },
  resourceText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    textAlign: 'center',
    lineHeight: 20,
  },
});