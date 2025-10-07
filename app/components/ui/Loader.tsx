import React from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  type?: 'spinner' | 'dots' | 'pulse';
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const IBLoader: React.FC<LoaderProps> = ({
  size = 'medium',
  color = '#1E40AF',
  text,
  type = 'spinner',
  overlay = false,
  style,
  textStyle,
}) => {
  const [dotAnimation] = React.useState(new Animated.Value(0));
  const [pulseAnimation] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (type === 'dots') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnimation, {
            toValue: 1,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (type === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [type, dotAnimation, pulseAnimation]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 32;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const renderSpinner = () => (
    <ActivityIndicator size={size} color={color} />
  );

  const renderDots = () => {
    const dotSize = getSize() / 3;
    const dotStyle = {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: color,
      marginHorizontal: dotSize / 4,
    };

    const animatedStyle = {
      opacity: dotAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
      transform: [
        {
          scale: dotAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.2],
          }),
        },
      ],
    };

    return (
      <View style={styles.dotsContainer}>
        <Animated.View style={[dotStyle, animatedStyle]} />
        <Animated.View 
          style={[
            dotStyle, 
            animatedStyle,
            { animationDelay: '200ms' }
          ]} 
        />
        <Animated.View 
          style={[
            dotStyle, 
            animatedStyle,
            { animationDelay: '400ms' }
          ]} 
        />
      </View>
    );
  };

  const renderPulse = () => {
    const pulseSize = getSize();
    
    return (
      <Animated.View
        style={[
          styles.pulse,
          {
            width: pulseSize,
            height: pulseSize,
            borderRadius: pulseSize / 2,
            backgroundColor: color,
            transform: [{ scale: pulseAnimation }],
          },
        ]}
      />
    );
  };

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  const containerStyle = [
    styles.container,
    overlay && styles.overlay,
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.loaderContent}>
        {renderLoader()}
        {text && (
          <Text
            style={[
              styles.text,
              { fontSize: getTextSize(), color },
              textStyle,
            ]}
          >
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

// Full-screen loading component
export const FullScreenLoader: React.FC<Omit<LoaderProps, 'overlay'>> = (props) => (
  <View style={styles.fullScreen}>
    <IBLoader size="large" type="spinner" {...props} />
  </View>
);

// Inline loading component
export const InlineLoader: React.FC<Omit<LoaderProps, 'overlay'>> = (props) => (
  <IBLoader size="small" type="dots" {...props} />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    opacity: 0.7,
  },
  text: {
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default IBLoader;