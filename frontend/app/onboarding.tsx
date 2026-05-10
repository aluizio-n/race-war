import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Button } from '../src/components/ui/Button';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '⚔️',
    title: 'Escolha sua Arma',
    description: 'Corra, pedale ou ande de skate. Cada modalidade tem sua própria guerra e território.',
    color: '#22C55E',
    gradient: ['#22C55E', '#16A34A'] as [string, string],
    modes: ['🏃 Race', '🚲 Bike', '🛹 Skate'],
  },
  {
    emoji: '📍',
    title: 'Trace o Perímetro',
    description: 'Mova-se pelo mundo real e feche um circuito para criar seu território. Cada quarteirão conta.',
    color: '#06B6D4',
    gradient: ['#06B6D4', '#0891B2'] as [string, string],
    modes: [],
  },
  {
    emoji: '🗺️',
    title: 'Domine o Território',
    description: 'Conquiste áreas, defenda seu domínio e suba no ranking global de generais.',
    color: '#A855F7',
    gradient: ['#A855F7', '#9333EA'] as [string, string],
    modes: [],
  },
  {
    emoji: '🏆',
    title: 'Entre para a Guerra',
    description: 'Compita com amigos, complete desafios e torne-se o General mais temido da cidade.',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'] as [string, string],
    modes: [],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const goNext = () => {
    Haptics.selectionAsync();
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const skip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Skip button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 8 }}>
          <TouchableOpacity onPress={skip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ color: '#475569', fontSize: 14, fontFamily: 'Inter_500Medium' }}>Pular</Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollX.value = e.nativeEvent.contentOffset.x;
          }}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => (
            <SlideItem item={item} index={index} scrollX={scrollX} />
          )}
        />

        {/* Bottom controls */}
        <View style={{ paddingHorizontal: 24, paddingBottom: Platform.OS === 'android' ? 24 : 8, paddingTop: 16 }}>
          {/* Dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
            {SLIDES.map((s, i) => (
              <DotIndicator key={i} index={i} activeIndex={activeIndex} color={SLIDES[activeIndex].color} />
            ))}
          </View>

          <Button
            label={activeIndex === SLIDES.length - 1 ? 'Começar a Guerra' : 'Próximo'}
            onPress={goNext}
            size="lg"
            gradientColors={SLIDES[activeIndex].gradient}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function DotIndicator({ index, activeIndex, color }: { index: number; activeIndex: number; color: string }) {
  const isActive = index === activeIndex;
  return (
    <View
      style={{
        width: isActive ? 24 : 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: isActive ? color : '#334155',
        marginHorizontal: 3,
        overflow: 'hidden',
      }}
    />
  );
}

function SlideItem({
  item,
  index,
  scrollX,
}: {
  item: (typeof SLIDES)[0];
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
        },
        animStyle,
      ]}
    >
      {/* Icon blob */}
      <View
        style={{
          width: 140,
          height: 140,
          borderRadius: 40,
          backgroundColor: `${item.color}18`,
          borderWidth: 2,
          borderColor: `${item.color}60`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
          shadowColor: item.color,
          shadowOpacity: 0.4,
          shadowRadius: 24,
        }}
      >
        <Text style={{ fontSize: 64 }}>{item.emoji}</Text>
      </View>

      <Text
        style={{
          fontSize: 28,
          fontFamily: 'Montserrat_700Bold',
          color: '#F8FAFC',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        {item.title}
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: '#94A3B8',
          textAlign: 'center',
          lineHeight: 24,
          fontFamily: 'Inter_400Regular',
        }}
      >
        {item.description}
      </Text>

      {item.modes.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 28 }}>
          {item.modes.map(m => (
            <View
              key={m}
              style={{
                backgroundColor: '#1E293B',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text style={{ color: '#F8FAFC', fontSize: 13, fontFamily: 'Inter_500Medium' }}>{m}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}
