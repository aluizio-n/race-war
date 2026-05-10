import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE, MapViewProps } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers, Filter } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import type { ActivityMode } from '../../src/types';
import { MODE_COLORS } from '../../src/utils/colors';

const { width, height } = Dimensions.get('window');

const MOCK_TERRITORIES = [
  {
    id: '1',
    mode: 'race' as ActivityMode,
    userName: 'General_João',
    polygon: [
      { latitude: -23.555, longitude: -46.633 },
      { latitude: -23.553, longitude: -46.630 },
      { latitude: -23.557, longitude: -46.628 },
      { latitude: -23.559, longitude: -46.631 },
    ],
  },
  {
    id: '2',
    mode: 'bike' as ActivityMode,
    userName: 'CycleKing',
    polygon: [
      { latitude: -23.560, longitude: -46.640 },
      { latitude: -23.558, longitude: -46.636 },
      { latitude: -23.562, longitude: -46.634 },
      { latitude: -23.564, longitude: -46.638 },
    ],
  },
  {
    id: '3',
    mode: 'skate' as ActivityMode,
    userName: 'SkateGeneral',
    polygon: [
      { latitude: -23.548, longitude: -46.628 },
      { latitude: -23.546, longitude: -46.625 },
      { latitude: -23.550, longitude: -46.622 },
      { latitude: -23.552, longitude: -46.625 },
    ],
  },
];

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
  const [selectedTerritory, setSelectedTerritory] = useState<(typeof MOCK_TERRITORIES)[0] | null>(null);
  const mapRef = useRef<MapView>(null);

  const filtered = MOCK_TERRITORIES.filter(t => activeFilter === 'all' || t.mode === activeFilter);

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
          const color = MODE_COLORS[t.mode];
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
      {selectedTerritory && (
        <View
          style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 100 : 80,
            left: 16,
            right: 16,
          }}
        >
          <BlurWrapper padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${MODE_COLORS[selectedTerritory.mode]}20`,
                  borderWidth: 1,
                  borderColor: MODE_COLORS[selectedTerritory.mode],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>{selectedTerritory.mode === 'race' ? '🏃' : selectedTerritory.mode === 'bike' ? '🚲' : '🛹'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                  {selectedTerritory.userName}
                </Text>
                <Text style={{ color: MODE_COLORS[selectedTerritory.mode], fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 2 }}>
                  Líder da Região
                </Text>
              </View>
              <Text style={{ fontSize: 22 }}>👑</Text>
            </View>
          </BlurWrapper>
        </View>
      )}
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
