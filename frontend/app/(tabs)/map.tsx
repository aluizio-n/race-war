import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import type { ActivityMode } from '../../src/types';
import { MODE_COLORS } from '../../src/utils/colors';
import { apiFetch } from '../../src/lib/api';

const { width, height } = Dimensions.get('window');

interface ApiTerritory {
  id: string;
  mode: 'RACE' | 'BIKE' | 'SKATE';
  polygon: Array<{ latitude: number; longitude: number }>;
  areaM2: number;
  user: { id: string; name: string; nickname: string };
}

const FILTERS: { key: ActivityMode | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'race', label: '🏃 Race' },
  { key: 'bike', label: '🚲 Bike' },
  { key: 'skate', label: '🛹 Skate' },
];

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0F172A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1E293B' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A1628' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export default function MapScreen() {
  const [activeFilter, setActiveFilter] = useState<ActivityMode | 'all'>('all');
  const [territories, setTerritories] = useState<ApiTerritory[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<ApiTerritory | null>(null);
  const mapRef = useRef<MapView>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ items: ApiTerritory[] }>('/api/territories?limit=200');
      setTerritories(res.items);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const modeFilter = activeFilter === 'all' ? null : activeFilter.toUpperCase();
  const filtered = territories.filter(t => !modeFilter || t.mode === modeFilter);

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <MapView
        ref={mapRef}
        style={{ width, height }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={MAP_STYLE}
        initialRegion={{
          latitude: -23.555,
          longitude: -46.633,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => setSelectedTerritory(null)}
      >
        {filtered.map(t => {
          const mode = t.mode.toLowerCase() as ActivityMode;
          const color = MODE_COLORS[mode];
          return (
            <Polygon
              key={t.id}
              coordinates={t.polygon}
              fillColor={`${color}30`}
              strokeColor={color}
              strokeWidth={2}
              tappable
              onPress={() => setSelectedTerritory(t)}
            />
          );
        })}
      </MapView>

      {/* Top overlay - SafeArea */}
      <SafeAreaView
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        edges={['top']}
        pointerEvents="box-none"
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <BlurWrapper>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Layers size={16} color="#94A3B8" />
              <Text style={{ color: '#F8FAFC', fontSize: 15, fontFamily: 'Montserrat_700Bold' }}>War Room</Text>
            </View>
          </BlurWrapper>
        </View>

        {/* Filter chips */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 10 }}>
          {FILTERS.map(f => {
            const active = activeFilter === f.key;
            const color = f.key !== 'all' ? MODE_COLORS[f.key as ActivityMode] : '#22C55E';
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: active ? `${color}25` : 'rgba(15,23,42,0.8)',
                  borderWidth: 1,
                  borderColor: active ? color : '#334155',
                }}
              >
                <Text style={{ color: active ? color : '#475569', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {/* Territory info popup */}
      {selectedTerritory && (() => {
        const mode = selectedTerritory.mode.toLowerCase() as ActivityMode;
        const color = MODE_COLORS[mode];
        const emoji = mode === 'race' ? '🏃' : mode === 'bike' ? '🚲' : '🛹';
        return (
          <View style={{ position: 'absolute', bottom: Platform.OS === 'ios' ? 100 : 80, left: 16, right: 16 }}>
            <BlurWrapper padding={16}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${color}20`, borderWidth: 1, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                    {selectedTerritory.user.name}
                  </Text>
                  <Text style={{ color, fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 2 }}>
                    Líder da Região
                  </Text>
                </View>
                <Text style={{ fontSize: 22 }}>👑</Text>
              </View>
            </BlurWrapper>
          </View>
        );
      })()}
    </View>
  );
}

function BlurWrapper({ children, padding = 12 }: { children: React.ReactNode; padding?: number }) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={60}
        tint="dark"
        style={{
          borderRadius: 14,
          padding,
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
        borderRadius: 14,
        padding,
        backgroundColor: 'rgba(15,23,42,0.92)',
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      {children}
    </View>
  );
}
