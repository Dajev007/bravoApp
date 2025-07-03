import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Phone, Mail, MessageCircle, Globe, FileText, ChevronDown, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const helpTopics = [
  {
    id: '1',
    title: 'Getting Started',
    icon: '🚀',
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Tap "Sign Up" on the welcome screen and enter your phone number. You\'ll receive a verification code to complete the registration process.',
      },
      {
        question: 'How do I find restaurants near me?',
        answer: 'Use the search bar on the home screen or browse by cuisine type. Make sure location services are enabled for the best results.',
      },
      {
        question: 'How do I scan QR codes for dine-in orders?',
        answer: 'Tap the QR Scanner tab at the bottom and point your camera at the QR code on your table. This will open the restaurant\'s menu for table ordering.',
      },
    ],
  },
  {
    id: '2',
    title: 'Ordering & Payment',
    icon: '🛒',
    faqs: [
      {
        question: 'How do I place an order?',
        answer: 'Browse restaurants, select items to add to your cart, choose pickup or dine-in, and proceed to checkout. You can pay with credit card or other available payment methods.',
      },
      {
        question: 'Can I modify my order after placing it?',
        answer: 'You can modify your order within a few minutes of placing it, as long as the restaurant hasn\'t started preparing it. Contact the restaurant directly for urgent changes.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. Cash on delivery may be available for some restaurants.',
      },
    ],
  },
  {
    id: '3',
    title: 'Pickup & Dine-In',
    icon: '🥡',
    faqs: [
      {
        question: 'How long does order preparation take?',
        answer: 'Preparation times vary by restaurant and order complexity, typically 15-30 minutes. You\'ll see estimated ready times before placing your order.',
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes! Once your order is confirmed, you can track it in real-time from the Orders section. You\'ll receive notifications when your order status changes.',
      },
      {
        question: 'What if my order is late or missing items?',
        answer: 'Contact us immediately through the app or call our support line. We\'ll work with the restaurant to resolve the issue and may provide a refund or credit.',
      },
    ],
  },
  {
    id: '4',
    title: 'Account & Settings',
    icon: '⚙️',
    faqs: [
      {
        question: 'How do I update my profile information?',
        answer: 'Go to Profile > Edit Profile to update your name, phone number, and other details. Changes are saved automatically.',
      },
      {
        question: 'How do I manage my addresses?',
        answer: 'In your profile, tap "Delivery Addresses" to add, edit, or delete saved addresses. You can set a default address for faster checkout.',
      },
      {
        question: 'How do I change notification settings?',
        answer: 'Go to Profile > Settings > Notifications to customize which notifications you receive and how you receive them.',
      },
    ],
  },
];

const contactMethods = [
  {
    id: '1',
    title: 'Call Us',
    description: 'Speak with our support team',
    icon: Phone,
    action: () => Linking.openURL('tel:+1234567890'),
  },
  {
    id: '2',
    title: 'Email Support',
    description: 'Send us a detailed message',
    icon: Mail,
    action: () => Linking.openURL('mailto:support@bravonest.com'),
  },
  {
    id: '3',
    title: 'Live Chat',
    description: 'Chat with us in real-time',
    icon: MessageCircle,
    action: () => {}, // Would open chat interface
  },
  {
    id: '4',
    title: 'Visit Website',
    description: 'Browse our help center',
    icon: Globe,
    action: () => Linking.openURL('https://bravonest.com/help'),
  },
];

export default function HelpScreen() {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b8dba', '#a2c7e7']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Help */}
        <View style={styles.quickHelpSection}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <Text style={styles.sectionDescription}>
            Get instant answers to common questions
          </Text>
        </View>

        {/* FAQ Topics */}
        <View style={styles.faqSection}>
          {helpTopics.map((topic) => (
            <View key={topic.id} style={styles.topicContainer}>
              <TouchableOpacity
                style={styles.topicHeader}
                onPress={() => toggleTopic(topic.id)}
              >
                <View style={styles.topicInfo}>
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                </View>
                {expandedTopic === topic.id ? (
                  <ChevronDown color="#3b8dba" size={20} />
                ) : (
                  <ChevronRight color="#3b8dba" size={20} />
                )}
              </TouchableOpacity>

              {expandedTopic === topic.id && (
                <View style={styles.topicContent}>
                  {topic.faqs.map((faq, index) => (
                    <View key={index} style={styles.faqCard}>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <Text style={styles.sectionDescription}>
            Still need help? Our support team is here for you
          </Text>

          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactCard}
              onPress={method.action}
            >
              <method.icon color="#3b8dba" size={24} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
              </View>
              <ChevronRight color="#a2c7e7" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Information */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoTitle}>BravoNest</Text>
          <Text style={styles.appInfoText}>
            Version 1.0.0{'\n'}
            Making food delivery simple and delightful.{'\n'}
            © 2024 BravoNest. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
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
  quickHelpSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    lineHeight: 22,
  },
  faqSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  topicContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
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
  topicTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
  },
  topicContent: {
    borderTopWidth: 1,
    borderTopColor: '#f0f8ff',
  },
  faqCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f8ff',
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    lineHeight: 20,
  },
  contactSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    textAlign: 'center',
    lineHeight: 20,
  },
});