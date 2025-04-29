import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CosmogeniusHomePage = () => {
  const navigation = useNavigation();
  const [bannerImages] = useState([
    { id: 1, image: require('./../../assets/images/banner1.jpg') },
    { id: 2, image: require('./../../assets/images/banner2.jpg') },
    { id: 3, image: require('./../../assets/images/banner3.jpg') }
  ]);

  const scrollX = useRef(new Animated.Value(0)).current;

  const navigationRoutes = {
    'ChatBot': 'chatbotscreen',
    'CosmoChat': 'cosmochatscreen',
    'CosmoScanner': 'facescannerscreen',
    
     
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          <Text style={styles.bold}>COSMOGENIUS</Text>
        </Text>
        <View style={styles.headerAccent} />
      </View>

      <View style={styles.bannerContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={styles.bannerScrollContent}
        >
          {bannerImages.map((item) => (
            <View key={item.id} style={styles.bannerImageWrapper}>
              <Image 
                source={item.image} 
                style={styles.bannerImage} 
                resizeMode="cover" 
              />
              <View style={styles.bannerOverlay} />
            </View>
          ))}
        </ScrollView>

        <View style={styles.dotContainer}>
          {bannerImages.map((_, index) => {
            const inputRange = [
              (index - 1) * screenWidth,
              index * screenWidth,
              (index + 1) * screenWidth
            ];
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });

            return (
              <Animated.View 
                key={index} 
                style={[styles.dot, { opacity }]} 
              />
            );
          })}
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.paragraph}>
          CosmoGenius is an innovative AI-powered skincare recommendation app designed to revolutionize the way you care for your skin. With advanced facial recognition technology, the app analyzes your skin's unique needs, identifies potential concerns, and provides personalized recommendations for products and routines.
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          <Text style={styles.bold}>ABOUT US</Text>
        </Text>
        <View style={styles.sectionAccent} />
      </View>

      <View style={styles.aboutImageContainer}>
        <Image 
          source={require('./../../assets/images/profilepic.webp')} 
          style={styles.aboutImage} 
          resizeMode="cover" 
        />
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.paragraph}>
          Team Axiom is not just a team; it's a powerhouse of creativity, passion, and determination. Together, we inspire each other, tackle challenges with confidence, and strive to create something extraordinary.
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          <Text style={styles.bold}>OUR EXCLUSIVE FEATURES</Text>
        </Text>
        <View style={styles.sectionAccent} />
      </View>

      <View style={styles.buttonContainer}>
        {Object.keys(navigationRoutes).map((page) => (
          <TouchableOpacity 
            key={page}
            style={styles.button} 
            onPress={() => navigation.navigate(navigationRoutes[page])}
          >
            <Text style={styles.buttonText}>{page}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.thankYouContainer}>
        <Text style={styles.thankYouText}>
          Thank you for exploring Cosmogenius!!!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  headerAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 2,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  bannerScrollContent: {
    alignItems: 'center',
  },
  bannerImageWrapper: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.35,
    marginHorizontal: screenWidth * 0.05,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dotContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },
  contentSection: {
    backgroundColor: '#111',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    marginVertical: 10,
  },
  paragraph: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  sectionContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  sectionAccent: {
    width: 40,
    height: 3,
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 1.5,
  },
  aboutImageContainer: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.4,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 20,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  aboutImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    alignSelf: 'center',
    width: screenWidth * 0.9,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  thankYouContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 20,
    borderRadius: 15,
  },
  thankYouText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  }
});

export default CosmogeniusHomePage;