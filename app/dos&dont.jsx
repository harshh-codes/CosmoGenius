import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const SkincareGuideScreen = () => {
  const navigation = useNavigation();
  const scrollY = new Animated.Value(0);

  const skincareItems = [
    {
      type: 'do',
      icon: require('./../assets/images/Hydration.png'),
      title: 'Hydrate Daily',
      description: 'Drink water and use moisturizer to keep skin hydrated'
    },
    {
      type: 'dont',
      icon: require('./../assets/images/giphy.gif'),
      title: 'Avoid Touching Face',
      description: 'Minimize touching your face to prevent bacteria transfer'
    },
    {
      type: 'do',
      icon: require('./../assets/images/ss.jpg'),
      title: 'Use Sunscreen',
      description: 'Apply broad-spectrum SPF 50+ every day, even indoors'
    },
    {
      type: 'dont',
      icon: require('./../assets/images/harshscrub.jpg'),
      title: 'Skip Harsh Scrubs',
      description: 'Avoid aggressive exfoliation that damages skin barrier'
    },
    {
      type: 'do',
      icon: require('./../assets/images/maxres.jpg'),
      title: 'Clean Makeup Brushes',
      description: 'Wash brushes weekly to prevent bacterial buildup'
    },
    {
      type: 'dont',
      icon: require('./../assets/images/doe2.gif'),
      title: 'Dont Over-Exfoliate',
      description: 'Too much can damage the skin barrier'
    },
    {
      type: 'do',
      icon: require('./../assets/images/ges.jpg'),
      title: 'Get Enough Sleep',
      description: 'Aim for 7-9 hours to prevent dark circles and dullness'
    },
    {
      type: 'dont',
      icon: require('./../assets/images/me-you.gif'),
      title: 'Don’t Ignore Your Neck and Hands',
      description: 'These areas also show signs of aging'
    },
    {
      type: 'do',
      icon: require('./../assets/images/patch.webp'),
      title: 'Patch Test New Products ',
      description: 'Test on a small area before full application to avoid irritation'
    },
    {
      type: 'dont',
      icon: require('./../assets/images/th.jpg'),
      title: 'Don’t Pick at Pimples',
      description: 'This can cause scars and spread bacteria'
    },
  ];

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  const renderItem = (item, index) => {
    const translateX = scrollY.interpolate({
      inputRange: [
        (index - 1) * 200,
        index * 200,
        (index + 1) * 200
      ],
      outputRange: [50, 0, 0],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View 
        key={index}
        style={[
          styles.itemContainer,
          {
            transform: [{ translateX }]
          },
          item.type === 'do' ? styles.doContainer : styles.dontContainer
        ]}
      >
        <View style={styles.iconWrapper}>
          <Image 
            source={item.icon} 
            style={styles.icon}
            resizeMode="cover"
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.typeLabelContainer}>
            <Text style={[
              styles.typeLabel,
              item.type === 'do' ? styles.doLabel : styles.dontLabel
            ]}>
              {item.type === 'do' ? 'DO' : "DON'T"}
            </Text>
          </View>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack('welcomescreen')}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Animated.Text 
          style={[
            styles.headerTitle,
            {
              transform: [{ scale: headerScale }]
            }
          ]}
        >
          SKINCARE GUIDE
        </Animated.Text>
      </View>
      
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.introText}>
          Follow these essential tips for healthy, glowing skin
        </Text>
        {skincareItems.map((item, index) => renderItem(item, index))}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 20,
  },
  backText: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 30,
  },
  introText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  itemContainer: {
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  doContainer: {
    backgroundColor: '#222',
    borderLeftWidth: 4,
    borderLeftColor: '#fff',
  },
  dontContainer: {
    backgroundColor: '#222',
    borderLeftWidth: 4,
    borderLeftColor: '#666',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    overflow: 'hidden',
    marginBottom: 15,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  typeLabelContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  doLabel: {
    color: '#fff',
  },
  dontLabel: {
    color: '#666',
  },
  titleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SkincareGuideScreen;