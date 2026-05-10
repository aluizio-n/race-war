import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  color?: string;
  gradientColors?: [string, string];
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  color,
  gradientColors,
  style,
  fullWidth = false,
}: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const sizeClasses = {
    sm: { height: 36, px: 14, text: 13 },
    md: { height: 48, px: 20, text: 15 },
    lg: { height: 58, px: 28, text: 17 },
  }[size];

  const isDisabled = disabled || loading;

  if (variant === 'primary' || gradientColors) {
    const colors = gradientColors ?? ['#22C55E', '#16A34A'];
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[{ opacity: isDisabled ? 0.5 : 1, width: fullWidth ? '100%' : undefined }, style]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: sizeClasses.height,
            paddingHorizontal: sizeClasses.px,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: sizeClasses.text, letterSpacing: 0.5 }}>
              {label}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          {
            height: sizeClasses.height,
            paddingHorizontal: sizeClasses.px,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1E293B',
            borderWidth: 1,
            borderColor: '#334155',
            opacity: isDisabled ? 0.5 : 1,
            width: fullWidth ? '100%' : undefined,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#94A3B8" size="small" />
        ) : (
          <Text style={{ color: '#F8FAFC', fontWeight: '600', fontSize: sizeClasses.text }}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          {
            height: sizeClasses.height,
            paddingHorizontal: sizeClasses.px,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDisabled ? 0.5 : 1,
            width: fullWidth ? '100%' : undefined,
          },
          style,
        ]}
      >
        <Text style={{ color: color ?? '#94A3B8', fontWeight: '600', fontSize: sizeClasses.text }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  // danger
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        {
          height: sizeClasses.height,
          paddingHorizontal: sizeClasses.px,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(239,68,68,0.15)',
          borderWidth: 1,
          borderColor: '#EF4444',
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: sizeClasses.text }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
