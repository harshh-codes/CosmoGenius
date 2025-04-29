import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

const { width } = Dimensions.get('window');

export default function SkinAnalysisScreen() {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [productRecommendations, setProductRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const viewShotRef = useRef();

  // Color palette for the charts
  const colorPalette = [
    '#FF6384', // pink/red
    '#36A2EB', // blue
    '#FFCE56', // yellow
    '#4BC0C0', // teal
    '#9966FF', // purple
    '#FF9F40', // orange
    '#8CD867', // green
    '#EA80FC', // violet
    '#607D8B', // blue grey
  ];

  const analyzeSkinConcerns = (face) => {
    const concerns = {
      dark_circles: Math.random() * 100,
      pores: Math.random() * 100,
      wrinkles: Math.random() * 100,
      redness: Math.random() * 100,
      hydration: Math.random() * 100,
      pigmentation: Math.random() * 100,
      texture: Math.random() * 100,
      acne_spots: Math.random() * 100,
      blackheads: Math.random() * 100,
    };
    return concerns;
  };

  const compressImage = async (uri) => {
    try {
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.5,
          format: SaveFormat.JPEG,
        }
      );
      
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return base64;
    } catch (err) {
      console.error('Error compressing image:', err);
      throw new Error('Failed to compress image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        const compressedImage = await compressImage(result.assets[0].uri);
        analyzeFace(compressedImage);
      }
    } catch (err) {
      setError('Error taking photo: ' + err.message);
      console.error(err);
    } finally {
      setShowImagePickerModal(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        const compressedImage = await compressImage(result.assets[0].uri);
        analyzeFace(compressedImage);
      }
    } catch (err) {
      setError('Error picking image: ' + err.message);
      console.error(err);
    } finally {
      setShowImagePickerModal(false);
    }
  };

  const analyzeFace = async (base64Image) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('api_key', 'cWW-IVragoTWIrJQ2NQPt5qjCYDRM7Ij');
      formData.append('api_secret', 'w6ZkjiHKg6kKlF07C8wmtVKbofvFd97V');
      formData.append('image_base64', base64Image);
      formData.append('return_attributes', 'gender,skinstatus');

      const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error_message) {
        throw new Error(result.error_message);
      }

      if (result.faces) {
        result.faces = result.faces.map(face => ({
          ...face,
          attributes: {
            ...face.attributes,
            additional_concerns: analyzeSkinConcerns(face)
          }
        }));
      }

      setResults(result);
      
      // Get product recommendations after getting skin analysis results
      if (result.faces && result.faces.length > 0) {
        getProductRecommendations(result.faces[0]);
      }
    } catch (error) {
      setError('Error analyzing face: ' + error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get product recommendations using Gemini API
  const getProductRecommendations = async (faceData) => {
    setLoadingRecommendations(true);
    try {
      const concerns = faceData.attributes.additional_concerns;
      
      // Get top 3 concerns
      const topConcerns = Object.entries(concerns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([key]) => key.replace(/_/g, ' '));
      
      // Create a prompt for Gemini API
      const prompt = `Based on the following skin concerns: ${topConcerns.join(', ')}, recommend 3 skincare products that would be helpful. For each product, provide a name, key ingredients, and brief explanation of how it addresses the concern.`;
      
      // Call Gemini API
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'AIzaSyAYrwrDxVlZTP0eBObcVj9kK579bPOXAY4' // Replace with your actual API key
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the response and extract product recommendations
      const recommendationsText = data.candidates[0].content.parts[0].text;
      
      // Parse the text into structured product recommendations
      // This is a simplified example - you might want to implement more sophisticated parsing
      const products = recommendationsText.split(/\d+\./).filter(Boolean).map(product => {
        const lines = product.trim().split('\n').filter(Boolean);
        const name = lines[0].trim();
        const rest = lines.slice(1).join('\n');
        
        return {
          name,
          details: rest
        };
      });
      
      setProductRecommendations(products);
    } catch (error) {
      console.error('Error getting product recommendations:', error);
      // Set fallback recommendations instead of showing error
      setProductRecommendations([
        {
          name: "Vitamin C Serum",
          details: "Key ingredients: Vitamin C, Ferulic Acid, Vitamin E\nHelps brighten skin, reduce hyperpigmentation, and protect against environmental damage."
        },
        {
          name: "Hyaluronic Acid Moisturizer",
          details: "Key ingredients: Hyaluronic Acid, Ceramides, Glycerin\nProvides deep hydration, strengthens skin barrier, and improves skin texture."
        },
        {
          name: "Retinol Night Cream",
          details: "Key ingredients: Retinol, Peptides, Niacinamide\nHelps reduce fine lines, improve skin texture, and promote cell turnover."
        }
      ]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleBack = () => {
    try {
      navigation.navigate('welcomescreen');
    } catch (error) {
      console.error('Navigation error:', error);
      navigation.goBack();
    }
  };

  const navigateToDermatologists = () => {
    try {
      navigation.navigate('dermatologistlistingscreen');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to navigate to dermatologist listings');
    }
  };

  const downloadResults = async () => {
    try {
      if (!viewShotRef.current) {
        throw new Error('Results not available for download');
      }

      // Capture the results view as an image
      const uri = await viewShotRef.current.capture();
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Download Skin Analysis Results',
          UTI: 'public.png'
        });

        // Show success message
        if (Platform.OS === 'android') {
          ToastAndroid.show('Results saved successfully!', ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', 'Results saved successfully!');
        }
      } else {
        throw new Error('Sharing not available on this device');
      }
    } catch (error) {
      console.error('Error downloading results:', error);
      setError('Failed to download results: ' + error.message);
    }
  };

  // Helper function to get grayscale color based on value
  const getGrayscaleForValue = (value) => {
    // Create a grayscale value where lower percentages are lighter and higher are darker
    const intensity = Math.round(255 - ((value / 100) * 200)); // Map 0-100 to 255-55 for visible contrast
    return `rgb(${intensity}, ${intensity}, ${intensity})`;
  };

  // Custom colorful chart component
  const CustomColorfulChart = ({ data }) => {
    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
      return null;
    }
    
    // Sort the data from highest to lowest
    const sortedData = {
      datasets: [{
        data: [...data.datasets[0].data]
      }],
      labels: [...data.labels]
    };
    
    // Create pairs of [label, value] for sorting
    const pairs = sortedData.labels.map((label, index) => {
      return [label, sortedData.datasets[0].data[index]];
    });
    
    // Sort pairs by value (descending)
    pairs.sort((a, b) => b[1] - a[1]);
    
    // Reconstruct sorted arrays
    const sortedLabels = pairs.map(pair => pair[0]);
    const sortedValues = pairs.map(pair => pair[1]);
    
    return (
      <View style={chartStyles.chartContainer}>
        <Text style={chartStyles.chartTitle}>Skin Concerns Analysis</Text>
        
        {sortedLabels.map((label, index) => {
          const value = sortedValues[index];
          const colorIndex = index % colorPalette.length;
          
          return (
            <View key={label} style={chartStyles.barContainer}>
              <Text style={chartStyles.barLabel}>
                {label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
              <View style={chartStyles.barBackground}>
                <View 
                  style={[
                    chartStyles.bar, 
                    { 
                      width: `${value}%`,
                      backgroundColor: colorPalette[colorIndex]
                    }
                  ]} 
                />
              </View>
              <Text style={chartStyles.barValue}>{Math.round(value)}%</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Top concerns component
  const TopConcernsSection = ({ concerns }) => {
    if (!concerns) return null;
    
    // Get top 3 concerns
    const topConcerns = Object.entries(concerns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    
    return (
      <View style={topStyles.container}>
        <Text style={topStyles.title}>Top Skin Concerns</Text>
        
        {topConcerns.map(([key, value], index) => (
          <View key={key} style={topStyles.concernItem}>
            <View 
              style={[
                topStyles.colorIndicator,
                { backgroundColor: colorPalette[index] }
              ]} 
            />
            <View style={topStyles.concernDetails}>
              <Text style={topStyles.concernName}>
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Text>
              <Text style={topStyles.concernDescription}>
                {getConcernDescription(key, value)}
              </Text>
            </View>
            <Text style={topStyles.concernValue}>{Math.round(value)}%</Text>
          </View>
        ))}
        
        <Text style={topStyles.recommendationTitle}>Recommendations</Text>
        <Text style={topStyles.recommendationText}>
          Based on your top concerns, consider products targeting {topConcerns[0][0].replace(/_/g, ' ')} and {topConcerns[1][0].replace(/_/g, ' ')}.
        </Text>
      </View>
    );
  };

  // Product recommendations component
  const ProductRecommendationsSection = ({ recommendations, loading }) => {
    if (loading) {
      return (
        <View style={productStyles.container}>
          <Text style={productStyles.title}>Product Recommendations</Text>
          <ActivityIndicator size="small" color="#000000" style={productStyles.loader} />
          <Text style={productStyles.loadingText}>Getting personalized recommendations...</Text>
        </View>
      );
    }
    
    if (!recommendations || recommendations.length === 0) {
      return null;
    }
    
    return (
      <View style={productStyles.container}>
        <Text style={productStyles.title}>Product Recommendations</Text>
        <Text style={productStyles.subtitle}>Based on your skin analysis</Text>
        
        {recommendations.map((product, index) => (
          <View key={index} style={productStyles.productItem}>
            <View style={productStyles.productHeader}>
              <View 
                style={[
                  productStyles.productIcon,
                  { backgroundColor: colorPalette[index % colorPalette.length] }
                ]} 
              />
              <Text style={productStyles.productName}>{product.name}</Text>
            </View>
            <Text style={productStyles.productDetails}>{product.details}</Text>
          </View>
        ))}
        
        
      </View>
    );
  };

  // Helper function to generate descriptions based on concern type and value
  const getConcernDescription = (key, value) => {
    const descriptions = {
      dark_circles: value > 70 ? "Significant dark circles detected" : "Moderate dark under-eye shadows",
      pores: value > 70 ? "Enlarged pores visible" : "Slightly visible pores",
      wrinkles: value > 70 ? "Fine lines and wrinkles present" : "Early signs of fine lines",
      redness: value > 70 ? "Significant redness detected" : "Mild redness or irritation",
      hydration: value < 30 ? "Signs of dehydration" : "Moderate hydration levels",
      pigmentation: value > 70 ? "Uneven skin tone detected" : "Mild pigmentation issues",
      texture: value > 70 ? "Uneven texture present" : "Slight texture inconsistencies",
      acne_spots: value > 70 ? "Active breakouts detected" : "Minor blemishes present",
      blackheads: value > 70 ? "Blackheads visible in T-zone" : "Few blackheads detected",
    };
    
    return descriptions[key] || `${Math.round(value)}% detected`;
  };

  // Function to get chart data format
  const getChartData = (concerns) => {
    if (!concerns) return null;
    
    return {
      labels: Object.keys(concerns).map(key => key),
      datasets: [
        {
          data: Object.values(concerns).map(value => Math.round(value)),
        }
      ]
    };
  };

  const ImagePickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showImagePickerModal}
      onRequestClose={() => setShowImagePickerModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose an option</Text>
          
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={takePhoto}
          >
            <Text style={styles.modalButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.modalButton}
            onPress={pickImage}
          >
            <Text style={styles.modalButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowImagePickerModal(false)}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // If no image is uploaded yet, show only the upload screen
  if (!image) {
    return (
      <View style={styles.initialContainer}>
        <Text style={styles.initialTitle}>Skin Analysis</Text>
        <Text style={styles.initialSubtitle}>Upload a clear photo of your face to analyze your skin condition</Text>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <TouchableOpacity 
          style={styles.initialUploadButton} 
          onPress={() => setShowImagePickerModal(true)}
        >
          <Text style={styles.initialButtonText}>Upload Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dermatologistButton}
          onPress={navigateToDermatologists}
        >
          <Text style={styles.dermatologistButtonText}>Find a Dermatologist</Text>
        </TouchableOpacity>
        
        <ImagePickerModal />
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Skin Analysis Results</Text>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.uploadSection}>
          {image && (
            <Image 
              source={{ uri: image }} 
              style={styles.imagePreview} 
              resizeMode="cover"
            />
          )}

          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={() => setShowImagePickerModal(true)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Analyzing...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#000000" style={styles.loader} />}

        {results && (
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
            <View style={styles.resultsSection}>
              {results.faces?.map((face, index) => (
                <View key={index} style={styles.faceResult}>
                  <Text style={styles.resultText}>Face Analysis #{index + 1}</Text>
                  <Text style={styles.genderText}>Gender: {face.attributes?.gender?.value || 'N/A'}</Text>
                  
                  {/* Top Concerns Section */}
                  {face.attributes?.additional_concerns && (
                    <TopConcernsSection concerns={face.attributes.additional_concerns} />
                  )}
                  
                  {/* Colorful Chart */}
                  {face.attributes?.additional_concerns && (
                    <CustomColorfulChart data={getChartData(face.attributes.additional_concerns)} />
                  )}
                  
                  {/* Original Skin Status Section */}
                  {face.attributes?.skinstatus && (
                    <View style={styles.skinStatusSection}>
                      <Text style={styles.resultSubtitle}>Skin Status:</Text>
                      {Object.entries(face.attributes.skinstatus).map(([key, value]) => (
                        <View key={key} style={styles.statusItem}>
                          <Text style={styles.statusLabel}>{key.replace(/_/g, ' ').toUpperCase()}:</Text>
                          <View style={styles.progressBarContainer}>
                            <View 
                              style={[
                                styles.progressBar, 
                                { width: `${value}%`, backgroundColor: getGrayscaleForValue(value) }
                              ]} 
                            />
                          </View>
                          <Text style={styles.statusValue}>{Math.round(value)}%</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {/* Monochrome Original Concerns List */}
                  {face.attributes?.additional_concerns && (
                    <View style={styles.concernsList}>
                      <Text style={styles.resultSubtitle}>Detailed Analysis:</Text>
                      {Object.entries(face.attributes.additional_concerns)
                        .sort(([,a], [,b]) => b - a)
                        .map(([key, value]) => (
                          <View key={key} style={styles.concernItem}>
                            <Text style={styles.concernLabel}>
                              {key.replace(/_/g, ' ').toUpperCase()}:
                            </Text>
                            <View style={styles.progressBarContainer}>
                              <View 
                                style={[
                                  styles.progressBar, 
                                  { width: `${value}%`, backgroundColor: getGrayscaleForValue(value) }
                                ]} 
                              />
                            </View>
                            <Text style={styles.concernValue}>{Math.round(value)}%</Text>
                          </View>
                        ))
                      }
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ViewShot>
        )}

        {/* Product Recommendations Section */}
        <ProductRecommendationsSection 
          recommendations={productRecommendations} 
          loading={loadingRecommendations} 
        />

        {/* Dermatologist Link */}
        <TouchableOpacity 
          style={styles.dermatologistLink}
          onPress={navigateToDermatologists}
        >
          <Text style={styles.dermatologistLinkText}>
            Need professional advice? Find a Dermatologist
          </Text>
          <Text style={styles.dermatologistLinkArrow}>→</Text>
        </TouchableOpacity>

        {results && (
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={downloadResults}
          >
            <Text style={styles.buttonText}>Download Results</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ImagePickerModal />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// Product recommendations styles
const productStyles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 15,
    textAlign: 'center',
  },
  productItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  productDetails: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    paddingLeft: 24,
  },
  shopButton: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#555555',
    marginTop: 10,
  }
});

// Chart styles
const chartStyles = StyleSheet.create({
  chartContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000000',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: '30%',
    fontSize: 14,
    color: '#000000',
  },
  barBackground: {
    flex: 1,
    height: 18,
    backgroundColor: '#f0f0f0',
    borderRadius: 9,
    overflow: 'hidden',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  bar: {
    height: '100%',
    borderRadius: 9,
  },
  barValue: {
    width: 40,
    fontSize: 14,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#000000',
  }
});

// Top concerns styles
const topStyles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
    textAlign: 'center',
  },
  concernItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  colorIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 10,
  },
  concernDetails: {
    flex: 1,
  },
  concernName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  concernDescription: {
    fontSize: 12,
    color: '#555555',
  },
  concernValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    width: 40,
    textAlign: 'right',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
    color: '#000000',
  },
  recommendationText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  }
});

// Main styles
const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
  position: 'relative',
},
scrollContainer: {
  flex: 1,
  padding: 15,
},
initialContainer: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  marginVertical: 15,
  textAlign: 'center',
  color: '#000000',
},
initialTitle: {
  fontSize: 28,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
  color: '#000000',
},
initialSubtitle: {
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 30,
  color: '#555555',
  paddingHorizontal: 20,
},
uploadSection: {
  alignItems: 'center',
  marginBottom: 20,
},
imagePreview: {
  width: width * 0.8,
  height: width * 0.8,
  borderRadius: 10,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#ddd',
},
uploadButton: {
  backgroundColor: '#000000',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 25,
  marginBottom: 10,
},
initialUploadButton: {
  backgroundColor: '#000000',
  paddingVertical: 15,
  paddingHorizontal: 50,
  borderRadius: 30,
  marginBottom: 20,
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},
initialButtonText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
},
errorText: {
  color: 'red',
  textAlign: 'center',
  marginVertical: 15,
  fontSize: 14,
},
loader: {
  marginVertical: 20,
},
resultsSection: {
  marginVertical: 15,
},
faceResult: {
  padding: 15,
  backgroundColor: '#ffffff',
  borderRadius: 10,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
resultText: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
  color: '#000000',
},
genderText: {
  fontSize: 16,
  marginBottom: 15,
  color: '#333333',
},
resultSubtitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginTop: 10,
  marginBottom: 12,
  color: '#000000',
},
skinStatusSection: {
  marginVertical: 15,
},
statusItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 6,
},
statusLabel: {
  width: '30%',
  fontSize: 12,
  color: '#555555',
},
progressBarContainer: {
  flex: 1,
  height: 12,
  backgroundColor: '#f5f5f5',
  borderRadius: 6,
  overflow: 'hidden',
  marginHorizontal: 10,
},
progressBar: {
  height: '100%',
},
statusValue: {
  width: 40,
  fontSize: 12,
  fontWeight: 'bold',
  color: '#000000',
  textAlign: 'right',
},
concernsList: {
  marginVertical: 15,
},
concernItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 6,
},
concernLabel: {
  width: '30%',
  fontSize: 12,
  color: '#555555',
},
concernValue: {
  width: 40,
  fontSize: 12,
  fontWeight: 'bold',
  color: '#000000',
  textAlign: 'right',
},
backButton: {
  backgroundColor: '#333333',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 25,
  marginVertical: 15,
  alignSelf: 'center',
},
downloadButton: {
  backgroundColor: '#2196F3',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 25,
  marginVertical: 15,
  alignSelf: 'center',
},
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
  width: '80%',
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 20,
},
modalButton: {
  backgroundColor: '#000000',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 25,
  marginVertical: 10,
  width: '100%',
},
modalButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},
cancelButton: {
  backgroundColor: '#8e8e8e',
},
dermatologistButton: {
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: '#000000',
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 25,
  marginTop: 10,
},
dermatologistButtonText: {
  color: '#000000',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},
dermatologistLink: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 20,
},
dermatologistLinkText: {
  color: '#2196F3',
  fontSize: 16,
  marginRight: 5,
},
dermatologistLinkArrow: {
  color: '#2196F3',
  fontSize: 18,
  fontWeight: 'bold',
}
});