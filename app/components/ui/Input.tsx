import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  variant?: 'default' | 'outline' | 'filled';
}

export const IBInput: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  variant = 'default',
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getContainerStyle = () => {
    const baseStyle = [styles.container, styles[variant]];
    
    if (isFocused) {
      return [...baseStyle, styles.focused];
    }
    
    if (error) {
      return [...baseStyle, styles.error];
    }
    
    return baseStyle;
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={getContainerStyle()}>
        {leftIcon && (
          <View style={styles.leftIcon}>{leftIcon}</View>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
          >
            <Text style={styles.iconText}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  default: {
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  outline: {
    borderColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  filled: {
    borderColor: 'transparent',
    backgroundColor: '#F9FAFB',
  },
  focused: {
    borderColor: '#1E40AF',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  error: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 48,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  rightIcon: {
    paddingLeft: 8,
    paddingRight: 16,
  },
  iconText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});

// Pre-styled input variants for easy use
export const OutlineInput = (props: Omit<InputProps, 'variant'>) => (
  <IBInput variant="outline" {...props} />
);

export const FilledInput = (props: Omit<InputProps, 'variant'>) => (
  <IBInput variant="filled" {...props} />
);

export default IBInput;