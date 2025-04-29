import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const SKIN_CONCERNS = [
  { id: 'acne', name: 'Acne', icon: '🌋' },
  { id: 'aging', name: 'Anti-Aging', icon: '⏳' },
  { id: 'sensitivity', name: 'Sensitive Skin', icon: '🌿' },
  { id: 'hyperpigmentation', name: 'Dark Spots', icon: '🌚' },
  { id: 'dryness', name: 'Hydration', icon: '💧' }
];

const SKIN_TYPES = [
  { id: 'oily', name: 'Oily', color: '#333' },
  { id: 'dry', name: 'Dry', color: '#444' },
  { id: 'combination', name: 'Combination', color: '#555' },
  { id: 'normal', name: 'Normal', color: '#666' },
  { id: 'sensitive', name: 'Sensitive', color: '#777' }
];

const ROUTINE_STEPS = {
  morning: [
    { id: 'cleanse', name: 'Cleanse', description: 'Start with a gentle face wash' },
    { id: 'tone', name: 'Tone', description: 'Balance skin pH' },
    { id: 'treat', name: 'Treat', description: 'Apply targeted serums' },
    { id: 'moisturize', name: 'Moisturize', description: 'Hydrate and protect' },
    { id: 'sunscreen', name: 'Sunscreen', description: 'Final protective layer' }
  ],
  evening: [
    { id: 'doubleClean', name: 'Double Cleanse', description: 'Remove makeup and impurities' },
    { id: 'exfoliate', name: 'Exfoliate', description: 'Remove dead skin cells' },
    { id: 'treat', name: 'Treat', description: 'Night repair serums' },
    { id: 'nightCream', name: 'Night Cream', description: 'Overnight regeneration' }
  ]
};

const SkinCareRoutineGenerator = () => {
  const [selectedSkinType, setSelectedSkinType] = useState(null);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [generatedRoutine, setGeneratedRoutine] = useState(null);

  const toggleConcern = (concern) => {
    setSelectedConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  const generateRoutine = () => {
    if (!selectedSkinType) return;

    const morningSteps = ROUTINE_STEPS.morning.map(step => ({
      ...step,
      recommendation: getPersonalizedRecommendation(step.id, selectedSkinType, selectedConcerns)
    }));

    const eveningSteps = ROUTINE_STEPS.evening.map(step => ({
      ...step,
      recommendation: getPersonalizedRecommendation(step.id, selectedSkinType, selectedConcerns)
    }));

    setGeneratedRoutine({ morning: morningSteps, evening: eveningSteps });
  };

  const getPersonalizedRecommendation = (step, skinType, concerns) => {
    const recommendations = {
      cleanse: {
        oily: 'Gel cleanser with salicylic acid',
        dry: 'Creamy, hydrating cleanser',
        sensitive: 'Fragrance-free, mild cleanser'
      },
      sunscreen: {
        oily: 'Lightweight, mattifying SPF',
        dry: 'Hydrating SPF with moisturizing properties',
        sensitive: 'Mineral-based, gentle SPF'
      }
    };

    const concernProducts = {
      acne: 'Look for products with benzoyl peroxide or tea tree',
      aging: 'Include retinol or peptide-based products',
      sensitivity: 'Avoid fragrances and harsh chemicals',
      hyperpigmentation: 'Use vitamin C or niacinamide',
      dryness: 'Prioritize hyaluronic acid and ceramides'
    };

    let baseRecommendation = recommendations[step]?.[skinType] || 'Standard product';
    
    const concernRecommendations = concerns
      .map(concern => concernProducts[concern])
      .join(', ');

    return concernRecommendations 
      ? `${baseRecommendation}. Additional focus: ${concernRecommendations}` 
      : baseRecommendation;
  };

  const resetRoutine = () => {
    setSelectedSkinType(null);
    setSelectedConcerns([]);
    setGeneratedRoutine(null);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Skincare Routine Generator</Text>

        {!selectedSkinType && (
          <View>
            <Text style={styles.subtitle}>Select Your Skin Type</Text>
            {SKIN_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeButton, { backgroundColor: type.color }]}
                onPress={() => setSelectedSkinType(type.id)}
              >
                <Text style={styles.typeButtonText}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedSkinType && !generatedRoutine && (
          <View>
            <Text style={styles.subtitle}>Select Your Skin Concerns</Text>
            <View style={styles.concernsContainer}>
              {SKIN_CONCERNS.map(concern => (
                <TouchableOpacity
                  key={concern.id}
                  style={[
                    styles.concernButton,
                    selectedConcerns.includes(concern.id) && styles.selectedConcern
                  ]}
                  onPress={() => toggleConcern(concern.id)}
                >
                  <Text style={styles.concernIcon}>{concern.icon}</Text>
                  <Text style={styles.concernText}>{concern.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.generateButton} onPress={generateRoutine}>
              <Text style={styles.generateButtonText}>Generate My Routine</Text>
            </TouchableOpacity>
          </View>
        )}

        {generatedRoutine && (
          <View>
            <TouchableOpacity onPress={resetRoutine} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>← Restart</Text>
            </TouchableOpacity>

            <Text style={styles.routineSection}>Morning Routine</Text>
            {generatedRoutine.morning.map(step => (
              <View key={step.id} style={styles.routineStep}>
                <Text style={styles.stepName}>{step.name}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
                <Text style={styles.stepRecommendation}>
                  Recommendation: {step.recommendation}
                </Text>
              </View>
            ))}

            <Text style={styles.routineSection}>Evening Routine</Text>
            {generatedRoutine.evening.map(step => (
              <View key={step.id} style={styles.routineStep}>
                <Text style={styles.stepName}>{step.name}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
                <Text style={styles.stepRecommendation}>
                  Recommendation: {step.recommendation}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT, // Ensures full screen scrollability
    paddingTop: 60,  // Shifts content down
    paddingBottom: 100, // Adds padding at bottom for scrolling
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
  },
  typeButton: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  concernsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  concernButton: {
    backgroundColor: '#222',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    width: '28%',
  },
  selectedConcern: {
    backgroundColor: '#444',
  },
  concernIcon: {
    fontSize: 30,
  },
  concernText: {
    color: '#fff',
    marginTop: 5,
  },
  generateButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  resetButton: {
    marginBottom: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  routineSection: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
  },
  routineStep: {
    backgroundColor: '#222',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  stepName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stepDescription: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 5,
  },
  stepRecommendation: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default SkinCareRoutineGenerator;