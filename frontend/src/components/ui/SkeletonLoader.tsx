import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.4, { duration: 800 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#263548',
        },
        animStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={{ backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Skeleton height={14} width="60%" style={{ marginBottom: 6 }} />
          <Skeleton height={11} width="40%" />
        </View>
        <Skeleton width={50} height={20} borderRadius={10} />
      </View>
      <Skeleton height={11} width="90%" style={{ marginBottom: 4 }} />
      <Skeleton height={11} width="70%" />
    </View>
  );
}
