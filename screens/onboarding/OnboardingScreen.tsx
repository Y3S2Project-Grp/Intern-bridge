import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenNames } from '../../constants/ScreenNames';

interface OnboardingScreenProps {
  navigation: any;
}

// Simple colored placeholder images
const onboardingData = [
  {
    id: '1',
    title: 'Find Your Perfect Internship',
    description: 'Discover internships that match your skills, location, and career goals',
    image: { uri: 'https://via.placeholder.com/280x280/1E40AF/FFFFFF?text=Internship+Search' },
  },
  {
    id: '2',
    title: 'Check Your Eligibility',
    description: 'Use our smart eligibility checker to see which internships you qualify for',
    image: { uri: 'https://via.placeholder.com/280x280/10B981/FFFFFF?text=Eligibility+Check' },
  },
  {
    id: '3',
    title: 'Build Your Career',
    description: 'Get skill recommendations and build ATS-friendly CVs to stand out',
    image: { uri: 'https://via.placeholder.com/280x280/F59E0B/FFFFFF?text=Career+Growth' },
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback image component
  const ImageWithFallback = ({ source, style }: any) => {
    const [error, setError] = useState(false);

    if (error) {
      // Return colored placeholder with icon text
      return (
        <View style={[style, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>📊</Text>
          <Text style={styles.placeholderSubtext}>Internship Search</Text>
        </View>
      );
    }

    return (
      <Image 
        source={source} 
        style={style} 
        resizeMode="contain"
        onError={() => setError(true)}
      />
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.slide}>
      <ImageWithFallback source={item.image} style={styles.image} />
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const goToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      // Scroll to next
    } else {
      navigation.navigate(ScreenNames.REGISTER);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.navigate(ScreenNames.REGISTER)}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Carousel */}
      <FlatList
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.id}
      />

      {/* Indicators */}
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.indicatorActive,
            ]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width: 390, // Adjust based on screen width
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  image: {
    width: 280,
    height: 280,
    marginBottom: 40,
  },
  // Placeholder styles
  placeholderImage: {
    width: 280,
    height: 280,
    marginBottom: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderSubtext: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#1E40AF',
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  nextButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;