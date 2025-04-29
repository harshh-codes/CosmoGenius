import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const STORAGE_KEY = 'chatMessages';
const MESSAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const ChatBot = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const GEMINI_API_KEY = 'AIzaSyBxiMx9Bm2fdbOW5arB8NcSK6eWfV74VOs';
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  // Load messages from storage on component mount
  useEffect(() => {
    loadMessages();
    // Set up periodic cleanup
    const cleanup = setInterval(cleanupExpiredMessages, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(cleanup);
  }, []);

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        // Filter out expired messages during load
        const currentTime = new Date().getTime();
        const validMessages = parsedMessages.filter(msg => 
          currentTime - new Date(msg.createdAt).getTime() < MESSAGE_EXPIRY
        );
        setMessages(validMessages);
        // If we filtered out any messages, update storage
        if (validMessages.length !== parsedMessages.length) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validMessages));
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const cleanupExpiredMessages = async () => {
    try {
      const currentTime = new Date().getTime();
      const updatedMessages = messages.filter(msg =>
        currentTime - new Date(msg.createdAt).getTime() < MESSAGE_EXPIRY
      );
      if (updatedMessages.length !== messages.length) {
        setMessages(updatedMessages);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
      }
    } catch (error) {
      console.error('Error cleaning up messages:', error);
    }
  };

  const getGeminiResponse = async (userMessage) => {
    try {
      const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: userMessage
            }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I apologize, but I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const currentTime = new Date();
    const userMessage = {
      id: messages.length,
      text: inputText,
      isUser: true,
      timestamp: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: currentTime.toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
    
    setInputText('');
    setIsLoading(true);

    const botResponse = await getGeminiResponse(inputText);
    
    const botMessage = {
      id: messages.length + 1,
      text: botResponse,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    const finalMessages = [...updatedMessages, botMessage];
    setMessages(finalMessages);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessages));
    setIsLoading(false);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
      <View style={[styles.message, item.isUser ? styles.userMessage : styles.botMessage]}>
        <Text style={item.isUser ? styles.userMessageText : styles.botMessageText}>
          {item.text}
        </Text>
        <Text style={styles.timestampText}>{item.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CosmoGenius AI</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000000" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything..."
          placeholderTextColor="#666666"
          multiline
          maxHeight={100}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 20,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    width: '100%',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: '#000000',
    borderTopRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
  },
  botMessageText: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 20,
  },
  timestampText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    marginRight: 12,
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    color: '#000000',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#000000',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatBot;