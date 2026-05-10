import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, UserPlus, Share2, Map, Flame, Trophy, Star } from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { StatBadge } from '../../src/components/ui/StatBadge';
import { formatArea, formatDistance } from '../../src/utils/format';
import type { ActivityMode } from '../../src/types';
import { MODE_COLORS } from '../../src/utils/colors';

const { width } = Dimensions.get('window');

const BADGES = [
  { id: '1', emoji: '🏆', name: 'Primeiro Território', color: '#F59E0B', unlocked: true },
  { id: '2', emoji: '🔥', name: 'Em Chamas', color: '#EF4444', unlocked: true },
  { id: '3', emoji: '🌊', name: 'Ciclista Aquático', color: '#06B6D4', unlocked: true },
  { id: '4', emoji: '⚡', name: 'Velocista', color: '#F59E0B', unlocked: false },
  { id: '5', emoji: '🎯', name: '10 Quarteirões', color: '#22C55E', unlocked: false },
  { id: '6', emoji: '👑', name: 'General Supremo', color: '#A855F7', unlocked: false },
];

const RECENT = [
  { mode: 'race' as ActivityMode, area: 12400, distance: 2.3, date: 'Hoje' },
  { mode: 'bike' as ActivityMode, area: 34200, distance: 6.1, date: 'Ontem' },
  { mode: 'skate' as ActivityMode, area: 8100, distance: 1.8, date: 'Segunda' },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'history'>('stats');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <TouchableOpacity
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#1E293B',
              borderWidth: 1,
              borderColor: '#334155',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <LinearGradient
            colors={['#1E293B', '#263548']}
            style={{ borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              {/* Avatar */}
              <LinearGradient
                colors={['#22C55E', '#06B6D4']}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 28, fontFamily: 'Montserrat_700Bold', color: '#0F172A' }}>V</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 19, fontFamily: 'Montserrat_700Bold' }}>Você</Text>
                <Text style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>@general_you</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ color: '#F59E0B', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Rank #47 Global</Text>
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(34,197,94,0.15)',
                  borderRadius: 10,
                  paddingVertical: 10,
                  gap: 6,
                  borderWidth: 1,
                  borderColor: 'rgba(34,197,94,0.3)',
                }}
              >
                <UserPlus size={14} color="#22C55E" />
                <Text style={{ color: '#22C55E', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>Amigos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#263548',
                  borderRadius: 10,
                  paddingVertical: 10,
                  gap: 6,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              >
                <Share2 size={14} color="#94A3B8" />
                <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 }}>
          <StatBadge label="Territórios" value="12" color="#22C55E" icon={<Map size={14} color="#22C55E" />} />
          <StatBadge label="Km Totais" value="48.2" color="#06B6D4" icon={<Flame size={14} color="#06B6D4" />} />
          <StatBadge label="Medalhas" value="3" color="#F59E0B" icon={<Trophy size={14} color="#F59E0B" />} />
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#1E293B', borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {(['stats', 'badges', 'history'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 9,
                backgroundColor: activeTab === tab ? '#263548' : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: activeTab === tab ? '#F8FAFC' : '#475569',
                fontSize: 13,
                fontFamily: activeTab === tab ? 'Inter_600SemiBold' : 'Inter_400Regular',
              }}>
                {tab === 'stats' ? 'Stats' : tab === 'badges' ? 'Medalhas' : 'Histórico'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={{ paddingHorizontal: 20 }}>
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'badges' && <BadgesTab />}
          {activeTab === 'history' && <HistoryTab />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatsTab() {
  const stats = [
    { label: 'Área Total Dominada', value: formatArea(54700), color: '#22C55E' },
    { label: 'Km Race', value: formatDistance(24.3), color: '#22C55E' },
    { label: 'Km Bike', value: formatDistance(18.6), color: '#06B6D4' },
    { label: 'Km Skate', value: formatDistance(5.3), color: '#A855F7' },
    { label: 'Tempo Total', value: '8h 42min', color: '#F59E0B' },
    { label: 'Calorias', value: '3.240 kcal', color: '#EF4444' },
  ];

  return (
    <View style={{ gap: 8 }}>
      {stats.map(s => (
        <View
          key={s.label}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1E293B',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>{s.label}</Text>
          <Text style={{ color: s.color, fontSize: 14, fontFamily: 'Inter_700Bold' }}>{s.value}</Text>
        </View>
      ))}
    </View>
  );
}

function BadgesTab() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {BADGES.map(b => (
        <View
          key={b.id}
          style={{
            width: (width - 60) / 3,
            backgroundColor: b.unlocked ? `${b.color}15` : '#1E293B',
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: b.unlocked ? b.color : '#334155',
            opacity: b.unlocked ? 1 : 0.5,
          }}
        >
          <Text style={{ fontSize: 28, marginBottom: 6 }}>{b.unlocked ? b.emoji : '🔒'}</Text>
          <Text style={{ color: b.unlocked ? '#F8FAFC' : '#475569', fontSize: 10, fontFamily: 'Inter_500Medium', textAlign: 'center' }}>
            {b.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

function HistoryTab() {
  const modeEmoji = { race: '🏃', bike: '🚲', skate: '🛹' };
  const modeLabel = { race: 'Race', bike: 'Bike', skate: 'Skate' };

  return (
    <View style={{ gap: 10 }}>
      {RECENT.map((a, i) => {
        const color = MODE_COLORS[a.mode];
        return (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1E293B',
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: '#334155',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${color}18`,
                borderWidth: 1,
                borderColor: `${color}40`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>{modeEmoji[a.mode]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                {modeLabel[a.mode]} War
              </Text>
              <Text style={{ color: '#475569', fontSize: 12 }}>{a.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color, fontSize: 13, fontFamily: 'Inter_700Bold' }}>{formatArea(a.area)}</Text>
              <Text style={{ color: '#475569', fontSize: 11 }}>{formatDistance(a.distance)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
