// WelcomeScreens.jsx
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigation = useNavigation();

  const screens = [
    {
      title: 'DISCOVER YOUR PERFECT SKINCARE',
      description: 'Find personalized skincare routines tailored just for you',
      image: require('./../assets/images/1.jpg'),
    },
    {
      title: 'TRACK YOUR PROGRESS',
      description: 'Monitor your skins journey and see real results over time',
      image: require('./../assets/images/2.jpg'),
    },
    {
      title: 'EXPERT RECOMMENDATION',
      description: 'Get professional advice and product suggestions based on your skin type',
      image: require('./../assets/images/3.jpg'),
    },
  ];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigation.navigate('welcomescreen');
    }
  };

  const handleSkip = () => {
    navigation.navigate('welcomescreen');
  };

  return (
    <View style={styles.container}>
      <Image
        source={screens[currentScreen].image}
        style={styles.image}
        resizeMode="contain"
      />
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{screens[currentScreen].title}</Text>
        <Text style={styles.description}>{screens[currentScreen].description}</Text>
      </View>

      <View style={styles.indicatorContainer}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentScreen === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {currentScreen === 0 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentScreen === screens.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#333',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  skipButton: {
    padding: 16,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;