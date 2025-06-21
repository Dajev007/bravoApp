import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, X, Send } from 'lucide-react-native';
import { geminiService } from '@/lib/gemini';

interface AIRecommendationsProps {
  visible: boolean;
  onClose: () => void;
}

export function AIRecommendations({ visible, onClose }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string>('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await geminiService.getRecommendations({
        cuisine: 'varied',
        mood: 'hungry',
        budget: 'moderate'
      });
      setRecommendations(result);
    } catch (error) {
      setRecommendations('Unable to get recommendations at the moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setIsChatLoading(true);
    try {
      const response = await geminiService.getChatResponse(chatMessage);
      setChatResponse(response);
      setChatMessage('');
    } catch (error) {
      setChatResponse('Sorry, I cannot respond right now.');
    } finally {
      setIsChatLoading(false);
    }
  };

  React.useEffect(() => {
    if (visible && !recommendations) {
      getRecommendations();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles color="#0077b6" size={24} />
            <Text style={styles.title}>AI Assistant</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#0077b6" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#0077b6" />
                <Text style={styles.loadingText}>Getting recommendations...</Text>
              </View>
            ) : (
              <View style={styles.recommendationCard}>
                <Text style={styles.recommendationText}>{recommendations}</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={getRecommendations}>
                  <Text style={styles.refreshButtonText}>Get New Recommendations</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ask Me Anything</Text>
            <View style={styles.chatContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.chatInput}
                  value={chatMessage}
                  onChangeText={setChatMessage}
                  placeholder="Ask about restaurants, food, or dining..."
                  placeholderTextColor="#90e0ef"
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={sendChatMessage}
                  disabled={isChatLoading || !chatMessage.trim()}
                >
                  {isChatLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Send color="#FFFFFF" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              
              {chatResponse ? (
                <View style={styles.responseCard}>
                  <Text style={styles.responseText}>{chatResponse}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    marginTop: 12,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  recommendationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
    lineHeight: 24,
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#0077b6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  chatContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ade8f4',
    alignItems: 'flex-end',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#0077b6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  responseText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
    lineHeight: 24,
  },
});