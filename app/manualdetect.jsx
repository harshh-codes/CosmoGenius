import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const GEMINI_API_KEY = 'AIzaSyAQ3Huvu3RaSAF5HUz3JKroD0CiLFTMqIk';

const questions = [
  {
    id: 1,
    question: "What's your skin type?",
    key: "skinType",
    multiSelect: false,
    options: [
      "Oily",
      "Dry",
      "Combination",
      "Normal",
      "Sensitive"
    ]
  },
  {
    id: 2,
    question: "What's your main skin concern?",
    key: "skinConcerns",
    multiSelect: true,
    options: [
      "Acne",
      "Dark spots",
      "Aging",
      "Large pores",
      "Dullness",
      "Redness",
      "Pigmentation",
      "Fine lines",
      "Wrinkles",
      "Hyper-pigmentation",
      "Enlarged pores",
      "Uneven skin tone",
      "Blackheads",
      "Whiteheads",
    ]
  },  
  {
    id: 3,
    question: "How would you describe your current skincare routine?",
    key: "currentRoutine",
    multiSelect: false,
    options: [
      "Basic (Cleanser & Moisturizer)",
      "Intermediate (Basic + Toner & Serum)",
      "Advanced (Full routine)",
      "No routine yet",
      "Varies/Inconsistent"
    ]
  },
  {
    id: 4,
    question: "Have you experienced any allergies or reactions?",
    key: "allergies",
    multiSelect: true,
    options: [
      "No known allergies",
      "Sensitive to fragrances",
      "Sensitive to certain oils",
      "Sensitive to chemical sunscreens",
      "Multiple sensitivities"
    ]
  },
  {
    id: 5,
    question: "What's your primary skincare goal?",
    key: "goals",
    multiSelect: true,
    options: [
      "Clear acne",
      "Anti-aging",
      "Even skin tone",
      "Hydration",
      "Reduce pore size",
      "Maintain healthy skin"
    ]
  },
  {
    id: 6,
    question: "What's your typical daily water intake?",
    key: "waterIntake",
    multiSelect: false,
    options: [
      "Less than 4 glasses",
      "4-6 glasses",
      "6-8 glasses",
      "More than 8 glasses"
    ]
  },
  {
    id: 7,
    question: "How many hours do you sleep on average?",
    key: "sleep",
    multiSelect: false,
    options: [
      "Less than 6 hours",
      "6-7 hours",
      "7-8 hours",
      "More than 8 hours"
    ]
  },
  {
    id: 8,
    question: "Do you have any dietary restrictions?",
    key: "diet",
    multiSelect: true,
    options: [
      "No restrictions",
      "Vegetarian",
      "Vegan",
      "Dairy-free",
      "Gluten-free"
    ]
  }
];

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetApp = () => {
    setCurrentScreen('home');
    setCurrentStep(0);
    setAnswers({});
    setAiResponse('');
  };

  const handleAnswer = useCallback((key, value, multiSelect) => {
    setAnswers(prev => {
      if (multiSelect) {
        // If this is a multi-select question
        const currentSelections = prev[key] || [];
        
        // Check if the option is already selected
        if (currentSelections.includes(value)) {
          // If already selected, remove it
          return {
            ...prev,
            [key]: currentSelections.filter(item => item !== value)
          };
        } else {
          // If not selected, add it
          return {
            ...prev,
            [key]: [...currentSelections, value]
          };
        }
      } else {
        // Single select behavior
        return {
          ...prev,
          [key]: value
        };
      }
    });

    // Only auto-advance for single-select questions
    if (!multiSelect && currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const isOptionSelected = (key, value) => {
    if (questions[currentStep].multiSelect) {
      return answers[key] && answers[key].includes(value);
    } else {
      return answers[key] === value;
    }
  };

  const canProceed = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion.multiSelect) {
      return answers[currentQuestion.key] && answers[currentQuestion.key].length > 0;
    } else {
      return !!answers[currentQuestion.key];
    }
  };

  const generatePrompt = () => {
    const formatAnswer = (key) => {
      const answer = answers[key];
      if (Array.isArray(answer)) {
        return answer.join(', ');
      }
      return answer || 'Not specified';
    };

    return `
Please provide comprehensive skincare advice based on the following information:

Skin Profile:
- Skin Type: ${formatAnswer('skinType')}
- Main Concerns: ${formatAnswer('skinConcerns')}
- Current Routine: ${formatAnswer('currentRoutine')}
- Allergies/Sensitivities: ${formatAnswer('allergies')}
- Skincare Goals: ${formatAnswer('goals')}

Lifestyle Factors:
- Water Intake: ${formatAnswer('waterIntake')}
- Sleep Pattern: ${formatAnswer('sleep')}
- Dietary Habits: ${formatAnswer('diet')}

Please provide a detailed response including:
1. Recommended skincare routine (morning and evening)
2. Product recommendations for their skin type and concerns
3. Key ingredients to look for
4. Ingredients to avoid
5. Specific exercises that could help with their skin concerns
6. DIY home remedies and face masks suitable for their skin type
7. Dietary recommendations for better skin health
8. Lifestyle changes that could improve their skin condition
9. Weekly skincare routine (including masks and treatments)
10. Stress management techniques for better skin health

Please format the response clearly with headings and bullet points.
    `.trim();
  };

  const sendToGemini = async () => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      Alert.alert('API Key Required', 'Please add your Gemini API key to the app.');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = generatePrompt();
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setAiResponse(data.candidates[0].content.parts[0].text);
        setCurrentScreen('results');
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert(
        'Error',
        'Failed to get recommendations. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const shareRecommendation = async () => {
    if (!aiResponse) {
      Alert.alert('No Recommendations', 'Please generate recommendations first.');
      return;
    }

    try {
      // Generate a title for the shared content
      const title = `Skincare Recommendation for ${answers.skinType || 'Your'} Skin`;
      
      // Format the message
      const message = `${title}\n\n${aiResponse}`;

      // Use Share API to allow saving/sharing the content
      const result = await Share.share({
        message,
        title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type');
        } else {
          // shared
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const HomePage = () => {
    const navigation = useNavigation();
    
    return (
      <View style={styles.homeContainer}>
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            padding: 10,
            zIndex: 1
          }}
          onPress={() => navigation.navigate('welcomescreen')}
        >
          <Text style={{
            fontSize: 24,
            color: '#000'
          }}>←</Text>
        </TouchableOpacity>

        <View style={styles.homeContent}>
          <Text style={styles.homeTitle}>Skincare Quiz</Text>
          <Text style={styles.homeSubtitle}>Get your personalized skincare plan</Text>
          
          <View style={styles.homeImagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🧴</Text>
          </View>
          
          <Text style={styles.homeDescription}>
            Answer a few simple questions to receive customized skincare recommendations.
          </Text>
          
          <View style={styles.homeFeatures}>
            <Text style={styles.featureText}>• Personalized routine</Text>
            <Text style={styles.featureText}>• Product suggestions</Text>
            <Text style={styles.featureText}>• Lifestyle tips</Text>
            <Text style={styles.featureText}>• Expert advice</Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.startButton]} 
            onPress={() => setCurrentScreen('questions')}
          >
            <Text style={styles.buttonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const QuestionPage = () => {
    const currentQuestion = questions[currentStep];
    const isMultiSelect = currentQuestion.multiSelect;
    
    return (
      <View style={styles.pageContainer}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={resetApp}
        >
          <Text style={styles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
  
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentStep + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
  
        <View style={styles.mainContent}>
          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>
          
          {isMultiSelect && (
            <Text style={styles.multiSelectHint}>
              (Select all that apply)
            </Text>
          )}
          
          <ScrollView 
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isOptionSelected(currentQuestion.key, option) && styles.selectedOption
                ]}
                onPress={() => handleAnswer(currentQuestion.key, option, isMultiSelect)}
              >
                <Text style={[
                  styles.optionText,
                  isOptionSelected(currentQuestion.key, option) && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
  
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={[styles.button, styles.backButton]} 
              onPress={() => setCurrentStep(prev => prev - 1)}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {isMultiSelect && (
            <TouchableOpacity 
              style={[
                styles.button, 
                !canProceed() && styles.disabledButton
              ]} 
              onPress={() => {
                if (canProceed()) {
                  if (currentStep < questions.length - 1) {
                    setCurrentStep(prev => prev + 1);
                  } else {
                    sendToGemini();
                  }
                }
              }}
              disabled={!canProceed()}
            >
              <Text style={styles.buttonText}>
                {currentStep === questions.length - 1 ? 'Get Results' : 'Next'}
              </Text>
            </TouchableOpacity>
          )}
          
          {!isMultiSelect && currentStep === questions.length - 1 && answers[currentQuestion.key] && (
            <TouchableOpacity 
              style={styles.button} 
              onPress={sendToGemini}
            >
              <Text style={styles.buttonText}>Get Results</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const ResultsPage = () => (
    <View style={styles.pageContainer}>
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={resetApp}
      >
        <Text style={styles.homeButtonText}>🏠 Home</Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsScroll}>
        <Text style={styles.resultsTitle}>Your Personalized Skincare Plan</Text>
        <Text style={styles.resultsText}>{aiResponse}</Text>
      </ScrollView>
      
      <View style={styles.buttonsRow}>
        <TouchableOpacity 
          style={[styles.button, styles.downloadButton]} 
          onPress={shareRecommendation}
        >
          <Text style={styles.buttonText}>Download/Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetApp}
        >
          <Text style={styles.buttonText}>New Consultation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000000" />
      <Text style={styles.loadingText}>Getting your personalized advice...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'home' ? (
        <HomePage />
      ) : isLoading ? (
        <LoadingScreen />
      ) : currentScreen === 'questions' ? (
        <QuestionPage />
      ) : (
        <ResultsPage />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  homeContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },
  optionsContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    borderColor: '#BBBBBB',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  questionContainer: {
    flex: 1,
    marginBottom: 20,
  },
  homeSubtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  homeImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePlaceholderText: {
    fontSize: 50,
  },
  homeDescription: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  homeFeatures: {
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
    lineHeight: 24,
  },
  pageContainer: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 22,
    color: '#000000',
    marginBottom: 20,
    lineHeight: 30,
  },
  multiSelectHint: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: -15,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 15,
    minHeight: 100,
    color: '#000000',
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  startButton: {
    width: '80%',
    padding: 18,
  },
  backButton: {
    backgroundColor: '#333333',
  },
  resetButton: {
    backgroundColor: '#333333',
    flex: 1,
    marginLeft: 10,
  },
  downloadButton: {
    backgroundColor: '#007BFF',
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  homeButtonText: {
    fontSize: 18,
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
  resultsScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 50,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resultsTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  resultsText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 26,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  resultSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  resultSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    marginTop: 8,
  },
  resultSectionContent: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resultSectionText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  pageContainer: {
    flex: 1,
    padding: 20,
  },
  mainContent: {
    flex: 1,
    marginTop: 20,
  },
  questionText: {
    fontSize: 22,
    color: '#000000',
    marginBottom: 20,
    lineHeight: 30,
  },
  optionsContainer: {
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#333333',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  homeButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  homeButtonText: {
    fontSize: 18,
    color: '#000000',
  },
});

export default App;