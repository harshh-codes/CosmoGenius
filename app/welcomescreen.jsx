import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);

  const defaultStats = { message: "Tap to Start Face Scan" };

  useEffect(() => { setStats(defaultStats); }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('home')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require('./../assets/images/Designer.jpeg')}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>Hello,</Text>
            <Text style={styles.heroTitle}>Welcome Cosmo User</Text>
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>FEATURES</Text>
          
          <View style={styles.featuresGrid}>
            <FeatureCard
              image={require('./../assets/images/3.jpg')}
              title="Skin Check"
              subtitle="Helps you to detect your skin concern manually"
              onPress={() => navigation.navigate('manualdetect')}
            />
            <FeatureCard
              image={require('./../assets/images/15.png')}
              title="Scan Here"
              subtitle="Helps you to detect your skin concern"
              onPress={() => navigation.navigate('Scanhere')}
            />
            <FeatureCard
              image={require('./../assets/images/14.png')}
              title="Dos & Donts"
              subtitle="Helps you to know what to do and what not to do"
              onPress={() => navigation.navigate('dos&dont')}
            />
            <FeatureCard
              image={require('./../assets/images/doe.jpg')}
              title="BlendWise"
              subtitle="Check through CosmoAI weather your product is comedogenic or not"
              onPress={() => navigation.navigate('blendwise')}
            />
          </View>
        </View>

        <Text style={styles.footerText}>
          Your trusted companion in facial analysis. We're committed to providing accurate results.
        </Text>
      </ScrollView>
    </View>
  );
};

const FeatureCard = ({ image, title, subtitle, onPress }) => (
  <TouchableOpacity
    style={styles.featureCard}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <Image source={image} style={styles.featureImage} />
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    zIndex: 150,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    height: 220,
    borderRadius: 20,
    margin: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 25,
  },
  heroSubtitle: {
    color: 'white',
    fontSize: 22,
    marginBottom: 8,
  },
  heroTitle: {
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
  },
  features: {
    padding: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
  },
  featureImage: {
    width: '100%',
    height: '60%',
    opacity: 0.8,
  },
  featureTextContainer: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureSubtitle: {
    color: '#999',
    fontSize: 13,
  },
  footerText: {
    color: '#999',
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 25,
    lineHeight: 24,
    marginTop: 20,
  },
});

export default WelcomeScreen;