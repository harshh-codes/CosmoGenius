import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const ComedogenicChecker = () => {
  const navigation = useNavigation();
  const [ingredient, setIngredient] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyDL5DXY5Lwy35pkBNvrRdEPDG98q6DNQPE'; // Replace with your actual API key

  const checkComedogenic = async () => {
    if (!ingredient.trim()) {
      setResult('Please enter an ingredient');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze if the following skincare ingredient "${ingredient}" is comedogenic. 
                       Provide a rating from 0-5 where:
                       0 = Non-comedogenic
                       1 = Slightly comedogenic
                       2 = Moderately comedogenic
                       3 = Considerably comedogenic
                       4 = Highly comedogenic
                       5 = Severely comedogenic
                       
                       Also provide a brief explanation of why.`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setResult(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error details:', error);
      setResult(`Error checking ingredient: ${error.message}`);
      Alert.alert('Error', 'Failed to check ingredient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comedogenic Checker</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter skincare ingredient"
          value={ingredient}
          onChangeText={setIngredient}
          placeholderTextColor="#666"
        />
        
        <TouchableOpacity 
          style={styles.checkButton}
          onPress={checkComedogenic}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Check</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        {result ? (
          <Text style={styles.resultText}>{result}</Text>
        ) : null}
      </ScrollView>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack('welcomescreen')}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    color: '#000',
  },
  checkButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    marginBottom: 60,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
  },
});

export default ComedogenicChecker;