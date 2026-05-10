import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { Share2, Home, Repeat } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { formatDuration, formatDistance, formatArea, formatPace } from '../../src/utils/format';
import type { ActivityMode } from '../../src/types';
import { MODE_COLORS } from '../../src/utils/colors';

const { width } = Dimensions.get('window');

const MODE_LABEL = { race: 'Race War', bike: 'Bike War', skate: 'Skate War' };
const MODE_EMOJI = { race: '🏃', bike: '🚲', skate: '🛹' };

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode: string; elapsed: string; distance: string; area: string; conquered: string }>();

  const mode = (params.mode ?? 'race') as ActivityMode;
  const elapsed = parseInt(params.elapsed ?? '0', 10);
  const distanceKm = parseFloat(params.distance ?? '0');
  const areaN = parseInt(params.area ?? '0', 10);
  const isConquered = params.conquered === '1';
  const color = MODE_COLORS[mode];

  const calories = Math.round((elapsed / 60) * (mode === 'race' ? 10 : mode === 'bike' ? 7 : 6));
  const pace = distanceKm > 0 ? (elapsed / 60) / distanceKm : 0;

  // Animate stats in
  const titleAnim = useSharedValue(0);
  const mapAnim = useSharedValue(0);
  const statsAnim = useSharedValue(0);

  useEffect(() => {
    titleAnim.value = withTiming(1, { duration: 600 });
    mapAnim.value = withDelay(200, withSpring(1, { damping: 14 }));
    statsAnim.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleAnim.value,
    transform: [{ translateY: (1 - titleAnim.value) * 20 }],
  }));
  const mapStyle = useAnimatedStyle(() => ({
    opacity: mapAnim.value,
    transform: [{ scale: 0.9 + mapAnim.value * 0.1 }],
  }));
  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsAnim.value,
    transform: [{ translateY: (1 - statsAnim.value) * 16 }],
  }));

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎖️ Acabei de conquistar ${formatArea(areaN)} no Race War!\n${formatDistance(distanceKm)} em ${formatDuration(elapsed)}\n\nBaixe e domine sua cidade! #RaceWar`,
      });
    } catch {}
  };

  // Mock polygon for display
  const mockPolygon = [
    { latitude: -23.555, longitude: -46.633 },
    { latitude: -23.553, longitude: -46.629 },
    { latitude: -23.557, longitude: -46.627 },
    { latitude: -23.559, longitude: -46.631 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <Animated.View style={[{ alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20 }, titleStyle]}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>
            {isConquered ? '🎖️' : '⚡'}
          </Text>
          <Text style={{ fontSize: 26, fontFamily: 'Montserrat_900Black', color: '#F8FAFC', textAlign: 'center' }}>
            {isConquered ? 'Território Conquistado!' : 'Batalha Finalizada'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: `${color}18`,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
              marginTop: 10,
              borderWidth: 1,
              borderColor: `${color}40`,
            }}
          >
            <Text style={{ fontSize: 16 }}>{MODE_EMOJI[mode]}</Text>
            <Text style={{ color, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>{MODE_LABEL[mode]}</Text>
          </View>
        </Animated.View>

        {/* Map preview */}
        <Animated.View style={[{ marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', height: 220 }, mapStyle]}>
          <LinearGradient
            colors={[`${color}30`, `${color}10`]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
          />
          <MapView
            style={{ width: '100%', height: '100%' }}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{ latitude: -23.555, longitude: -46.631, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            customMapStyle={[
              { elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1E293B' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A1628' }] },
              { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            ]}
          >
            <Polygon
              coordinates={mockPolygon}
              fillColor={`${color}40`}
              strokeColor={color}
              strokeWidth={3}
            />
          </MapView>
          {isConquered && (
            <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, backgroundColor: `${color}20`, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: color }}>
              <Text style={{ color, fontSize: 12, fontFamily: 'Inter_700Bold' }}>{formatArea(areaN)}</Text>
            </View>
          )}
        </Animated.View>

        {/* Stats grid */}
        <Animated.View style={[{ marginHorizontal: 20, marginTop: 20 }, statsStyle]}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <StatCard label="Distância" value={formatDistance(distanceKm)} color={color} />
            <StatCard label="Tempo" value={formatDuration(elapsed)} color={color} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <StatCard label="Calorias" value={`${calories} kcal`} color={color} />
            <StatCard label="Ritmo" value={distanceKm > 0 ? formatPace(pace) : '—'} color={color} />
          </View>
          {isConquered && (
            <StatCard label="Área Conquistada" value={formatArea(areaN)} color={color} large />
          )}
        </Animated.View>

        {/* Actions */}
        <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 10 }}>
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: `${color}15`,
              borderRadius: 14,
              paddingVertical: 15,
              borderWidth: 1,
              borderColor: `${color}40`,
            }}
          >
            <Share2 size={18} color={color} />
            <Text style={{ color, fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
              Compartilhar Conquista
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/home')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#1E293B',
                borderRadius: 14,
                paddingVertical: 15,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Home size={16} color="#94A3B8" />
              <Text style={{ color: '#94A3B8', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Início</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/start')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#1E293B',
                borderRadius: 14,
                paddingVertical: 15,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Repeat size={16} color="#94A3B8" />
              <Text style={{ color: '#94A3B8', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Nova batalha</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <View
      style={{
        flex: large ? undefined : 1,
        width: large ? '100%' : undefined,
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <Text style={{ color, fontSize: large ? 24 : 20, fontFamily: 'Inter_700Bold', marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ color: '#475569', fontSize: 12, fontFamily: 'Inter_500Medium' }}>{label}</Text>
    </View>
  );
}
