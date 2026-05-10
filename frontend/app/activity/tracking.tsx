import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import MapView, { Polyline, Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Pause, Play, Square, Navigation } from 'lucide-react-native';
import { formatDuration, formatDistance, formatArea } from '../../src/utils/format';
import type { ActivityMode, Coordinate } from '../../src/types';
import { MODE_COLORS, MODE_GLOW } from '../../src/utils/colors';

const { width, height } = Dimensions.get('window');

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0F172A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1E293B' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A1628' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

function haversineKm(a: Coordinate, b: Coordinate): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function polygonAreaM2(coords: Coordinate[]): number {
  if (coords.length < 3) return 0;
  const R = 6371000;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const xi = (coords[i].longitude * Math.PI) / 180;
    const yi = (coords[i].latitude * Math.PI) / 180;
    const xj = (coords[j].longitude * Math.PI) / 180;
    const yj = (coords[j].latitude * Math.PI) / 180;
    area += xi * Math.sin(yj);
    area -= xj * Math.sin(yi);
  }
  return Math.abs((area * R * R) / 2);
}

export default function TrackingScreen() {
  const router = useRouter();
  const { mode = 'race' } = useLocalSearchParams<{ mode: ActivityMode }>();
  const activeMode = (mode as ActivityMode) ?? 'race';
  const color = MODE_COLORS[activeMode];
  const glow = MODE_GLOW[activeMode];

  const mapRef = useRef<MapView>(null);
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isConquered, setIsConquered] = useState(false);
  const [conqueredPolygon, setConqueredPolygon] = useState<Coordinate[] | null>(null);
  const [distance, setDistance] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationRef = useRef<Location.LocationSubscription | null>(null);
  const conqueredRef = useRef(false);

  // Pulse animation for conquest
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    requestAndStart();
    return () => {
      locationRef.current?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused]);

  const requestAndStart = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de GPS', 'Precisamos da localização para rastrear sua atividade.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    locationRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 3 },
      (loc) => {
        if (isPaused || conqueredRef.current) return;

        const newCoord: Coordinate = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        setRoute(prev => {
          const updated = [...prev, newCoord];

          // update distance
          if (updated.length > 1) {
            const last = updated[updated.length - 2];
            setDistance(d => d + haversineKm(last, newCoord));
          }

          // follow user
          mapRef.current?.animateToRegion({
            latitude: newCoord.latitude,
            longitude: newCoord.longitude,
            latitudeDelta: 0.004,
            longitudeDelta: 0.004,
          }, 500);

          // Check if polygon closes
          if (!conqueredRef.current && updated.length > 10) {
            const distToStart = haversineKm(updated[0], newCoord) * 1000;
            if (distToStart < 30) {
              conqueredRef.current = true;
              setIsConquered(true);
              setConqueredPolygon(updated);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              triggerConquestAnimation();
            }
          }

          return updated;
        });
      },
    );
  };

  const triggerConquestAnimation = () => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.3, { duration: 300 }), withTiming(1, { duration: 300 })),
      4,
      false,
    );
    pulseOpacity.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 300 }), withTiming(1, { duration: 300 })),
      4,
      false,
    );
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handleStop = () => {
    Alert.alert('Encerrar Batalha', 'Deseja finalizar a atividade?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        style: 'destructive',
        onPress: () => {
          locationRef.current?.remove();
          if (timerRef.current) clearInterval(timerRef.current);
          router.replace({
            pathname: '/activity/result',
            params: {
              mode: activeMode,
              elapsed: String(elapsed),
              distance: String(distance.toFixed(3)),
              area: String(conqueredPolygon ? Math.round(polygonAreaM2(conqueredPolygon)) : 0),
              conquered: conqueredPolygon ? '1' : '0',
            },
          });
        },
      },
    ]);
  };

  const calories = Math.round(elapsed / 60 * (activeMode === 'race' ? 10 : activeMode === 'bike' ? 7 : 6));

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ width, height }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={MAP_STYLE}
        initialRegion={{ latitude: -23.555, longitude: -46.633, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        followsUserLocation
      >
        {route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeColor={color}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {conqueredPolygon && (
          <Polygon
            coordinates={conqueredPolygon}
            fillColor={`${color}30`}
            strokeColor={color}
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Top stats overlay */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <View style={{ paddingTop: Platform.OS === 'ios' ? 54 : 32, paddingHorizontal: 16 }}>
          <OverlayCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <StatItem label="Tempo" value={formatDuration(elapsed)} color={color} />
              <View style={{ width: 1, backgroundColor: '#334155' }} />
              <StatItem label="Distância" value={formatDistance(distance)} color={color} />
              <View style={{ width: 1, backgroundColor: '#334155' }} />
              <StatItem label="Calorias" value={`${calories} kcal`} color={color} />
            </View>
          </OverlayCard>
        </View>
      </View>

      {/* Conquest banner */}
      {isConquered && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: Platform.OS === 'ios' ? 140 : 120,
              left: 16,
              right: 16,
            },
            pulseStyle,
          ]}
        >
          <View
            style={{
              backgroundColor: `${color}20`,
              borderRadius: 14,
              padding: 14,
              borderWidth: 2,
              borderColor: color,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 28 }}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color, fontSize: 15, fontFamily: 'Montserrat_700Bold' }}>
                TERRITÓRIO CONQUISTADO!
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
                Área: {conqueredPolygon ? formatArea(polygonAreaM2(conqueredPolygon)) : '—'}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Bottom controls */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: Platform.OS === 'ios' ? 40 : 24, paddingHorizontal: 24 }}>
        <OverlayCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Mode chip */}
            <View
              style={{
                backgroundColor: `${color}20`,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: `${color}50`,
              }}
            >
              <Text style={{ color, fontSize: 12, fontFamily: 'Inter_700Bold' }}>
                {activeMode.toUpperCase()} WAR
              </Text>
            </View>

            {/* Controls */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Pause / Resume */}
              <TouchableOpacity
                onPress={() => { setIsPaused(p => !p); Haptics.selectionAsync(); }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: '#263548',
                  borderWidth: 1,
                  borderColor: '#334155',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isPaused ? <Play size={22} color="#F8FAFC" /> : <Pause size={22} color="#F8FAFC" />}
              </TouchableOpacity>

              {/* Stop */}
              <TouchableOpacity
                onPress={handleStop}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  borderWidth: 1,
                  borderColor: '#EF4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Square size={20} color="#EF4444" fill="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </OverlayCard>
      </View>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color, fontSize: 16, fontFamily: 'Inter_700Bold' }}>{value}</Text>
      <Text style={{ color: '#475569', fontSize: 11, marginTop: 2, fontFamily: 'Inter_400Regular' }}>{label}</Text>
    </View>
  );
}

function OverlayCard({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={60}
        tint="dark"
        style={{
          borderRadius: 16,
          padding: 14,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#334155',
        }}
      >
        {children}
      </BlurView>
    );
  }
  return (
    <View
      style={{
        borderRadius: 16,
        padding: 14,
        backgroundColor: 'rgba(15,23,42,0.92)',
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      {children}
    </View>
  );
}
