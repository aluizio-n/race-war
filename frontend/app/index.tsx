import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.7);
  const scanY = useSharedValue(-height * 0.3);
  const scanOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.4)) });

    scanOpacity.value = withDelay(600, withTiming(0.7, { duration: 300 }));
    scanY.value = withDelay(
      600,
      withRepeat(
        withTiming(height * 0.3, { duration: 1200, easing: Easing.linear }),
        2,
        false,
      ),
    );

    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));

    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const scanStyle = useAnimatedStyle(() => ({
    opacity: scanOpacity.value,
    transform: [{ translateY: scanY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' }}>
      {/* Grid background */}
      <View style={{ position: 'absolute', width, height, opacity: 0.06 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`h${i}`}
            style={{
              position: 'absolute',
              top: (i / 20) * height,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: '#22C55E',
            }}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={`v${i}`}
            style={{
              position: 'absolute',
              left: (i / 12) * width,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: '#22C55E',
            }}
          />
        ))}
      </View>

      {/* Scan line */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#22C55E',
            shadowColor: '#22C55E',
            shadowOpacity: 1,
            shadowRadius: 8,
          },
          scanStyle,
        ]}
      />

      {/* Logo */}
      <Animated.View style={[{ alignItems: 'center' }, logoStyle]}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 28,
            backgroundColor: 'rgba(34,197,94,0.1)',
            borderWidth: 2,
            borderColor: '#22C55E',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            shadowColor: '#22C55E',
            shadowOpacity: 0.4,
            shadowRadius: 20,
          }}
        >
          <Text style={{ fontSize: 48 }}>⚔️</Text>
        </View>

        <Text
          style={{
            fontSize: 42,
            fontFamily: 'Montserrat_900Black',
            color: '#F8FAFC',
            letterSpacing: 4,
          }}
        >
          RACE
        </Text>
        <LinearGradient
          colors={['#22C55E', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 4, paddingHorizontal: 12, paddingVertical: 2, marginTop: -4 }}
        >
          <Text
            style={{
              fontSize: 42,
              fontFamily: 'Montserrat_900Black',
              color: '#0F172A',
              letterSpacing: 4,
            }}
          >
            WAR
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.Text
        style={[
          {
            color: '#475569',
            fontSize: 13,
            letterSpacing: 3,
            marginTop: 32,
            fontFamily: 'Inter_500Medium',
          },
          subtitleStyle,
        ]}
      >
        DOMINATE YOUR TERRITORY
      </Animated.Text>
    </View>
  );
}
