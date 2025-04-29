import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from './../configs/supabase';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const navigation = useNavigation();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch error:', error);
        return;
      }
      
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Unexpected error during fetch:', error);
    }
  };

  const setupSubscription = () => {
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages'
        }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => msg.id === payload.new.id ? payload.new : msg)
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => 
              prev.filter(msg => msg.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });
      
    return channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: messageContent,
          user_email: 'anant20042003@gmail.com'
        })
        .select() // Add this to get the inserted row
        .single(); // We only inserted one row

      if (error) {
        console.error('Send error:', error);
        return;
      }

      // No need to manually update the messages array since the subscription should catch this
      // But keeping this as a fallback in case of subscription issues
      if (data && !messages.find(msg => msg.id === data.id)) {
        setMessages(prevMessages => [data, ...prevMessages]);
      }
    } catch (error) {
      console.error('Unexpected error during send:', error);
    }
  };

  // Initial setup and cleanup
  useEffect(() => {
    fetchMessages();
    const subscription = setupSubscription();
    
    // Add reconnection logic
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // Re-fetch messages and check subscription when app comes to foreground
        fetchMessages();
        setConnectionStatus('reconnecting');
        supabase.removeChannel(subscription);
        setupSubscription();
      }
    };
    
    // Add app state listener for background/foreground transitions
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      supabase.removeChannel(subscription);
      appStateSubscription.remove();
    };
  }, []);

  // Re-fetch messages when returning to this screen
  useFocusEffect(
    useCallback(() => {
      fetchMessages();
      return () => {};
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>COSMOCHAT</Text>
        {connectionStatus !== 'connected' && (
          <Text style={styles.connectionStatus}>
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
          </Text>
        )}
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.email}>Cosmouser</Text>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        inverted={false}
        onRefresh={fetchMessages}
        refreshing={false}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          style={styles.button}
          disabled={connectionStatus !== 'connected'}
        >
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    left: 15,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  connectionStatus: {
    position: 'absolute',
    right: 15,
    color: '#ff9900',
    fontSize: 12,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#222',
    borderRadius: 5,
  },
  email: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    color: '#fff',
    backgroundColor: '#222',
  },
  button: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});