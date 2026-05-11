import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, UserPlus, Share2, Map, Flame, Trophy, Star } from 'lucide-react-native';
import { StatBadge } from '../../src/components/ui/StatBadge';
import { formatArea, formatDistance } from '../../src/utils/format';
import type { ActivityMode } from '../../src/types';
import { MODE_COLORS } from '../../src/utils/colors';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/lib/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ApiActivity {
  id: string;
  mode: 'RACE' | 'BIKE' | 'SKATE';
  distanceKm: number;
  durationSec: number;
  calories: number;
  startedAt: string;
  territory: { areaM2: number } | null;
}

interface TerritoryStats {
  totalAreaM2: number;
  totalCount: number;
  byMode: Array<{ mode: string; areaM2: number; count: number }>;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'history'>('stats');
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [stats, setStats] = useState<TerritoryStats | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [actRes, statsRes, rankRes] = await Promise.allSettled([
      apiFetch<{ items: ApiActivity[] }>('/api/activities?limit=10'),
      apiFetch<TerritoryStats>('/api/territories/my/stats'),
      apiFetch<{ rank: number }>('/api/leaderboard/me'),
    ]);
    if (actRes.status === 'fulfilled') setActivities(actRes.value.items);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    if (rankRes.status === 'fulfilled') setRank(rankRes.value.rank);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <TouchableOpacity
            onPress={handleLogout}
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
                <Text style={{ fontSize: 28, fontFamily: 'Montserrat_700Bold', color: '#0F172A' }}>
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 19, fontFamily: 'Montserrat_700Bold' }}>{user?.name ?? '—'}</Text>
                <Text style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>@{user?.nickname ?? '—'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ color: '#F59E0B', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                    Rank #{rank ?? '—'} Global
                  </Text>
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
          <StatBadge label="Territórios" value={String(stats?.totalCount ?? '—')} color="#22C55E" icon={<Map size={14} color="#22C55E" />} />
          <StatBadge label="Km Totais" value={activities.reduce((s, a) => s + a.distanceKm, 0).toFixed(1)} color="#06B6D4" icon={<Flame size={14} color="#06B6D4" />} />
          <StatBadge label="Atividades" value={String(activities.length)} color="#F59E0B" icon={<Trophy size={14} color="#F59E0B" />} />
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
          {activeTab === 'stats' && <StatsTab stats={stats} activities={activities} />}
          {activeTab === 'badges' && <BadgesTab />}
          {activeTab === 'history' && <HistoryTab activities={activities} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatsTab({ stats, activities }: { stats: TerritoryStats | null; activities: ApiActivity[] }) {
  const modeKm = (mode: string) =>
    activities.filter(a => a.mode === mode).reduce((s, a) => s + a.distanceKm, 0);
  const totalDurSec = activities.reduce((s, a) => s + (a.durationSec ?? 0), 0);
  const totalCal = activities.reduce((s, a) => s + (a.calories ?? 0), 0);
  const hours = Math.floor(totalDurSec / 3600);
  const mins = Math.floor((totalDurSec % 3600) / 60);

  const rows = [
    { label: 'Área Total Dominada', value: formatArea(stats?.totalAreaM2 ?? 0), color: '#22C55E' },
    { label: 'Km Race', value: formatDistance(modeKm('RACE')), color: '#22C55E' },
    { label: 'Km Bike', value: formatDistance(modeKm('BIKE')), color: '#06B6D4' },
    { label: 'Km Skate', value: formatDistance(modeKm('SKATE')), color: '#A855F7' },
    { label: 'Tempo Total', value: `${hours}h ${mins}min`, color: '#F59E0B' },
    { label: 'Calorias', value: `${totalCal.toLocaleString('pt-BR')} kcal`, color: '#EF4444' },
  ];

  return (
    <View style={{ gap: 8 }}>
      {rows.map(s => (
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

const STATIC_BADGES = [
  { id: '1', emoji: '🏆', name: 'Primeiro Território', color: '#F59E0B', unlocked: true },
  { id: '2', emoji: '🔥', name: 'Em Chamas', color: '#EF4444', unlocked: false },
  { id: '3', emoji: '⚡', name: 'Velocista', color: '#F59E0B', unlocked: false },
  { id: '4', emoji: '🎯', name: '10 Quarteirões', color: '#22C55E', unlocked: false },
  { id: '5', emoji: '🌊', name: 'Ciclista', color: '#06B6D4', unlocked: false },
  { id: '6', emoji: '👑', name: 'General Supremo', color: '#A855F7', unlocked: false },
];

function BadgesTab() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {STATIC_BADGES.map(b => (
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

function HistoryTab({ activities }: { activities: ApiActivity[] }) {
  const modeEmoji = { RACE: '🏃', BIKE: '🚲', SKATE: '🛹' };
  const modeLabel = { RACE: 'Race', BIKE: 'Bike', SKATE: 'Skate' };

  if (activities.length === 0) {
    return (
      <Text style={{ color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 12, fontFamily: 'Inter_400Regular' }}>
        Nenhuma atividade ainda.
      </Text>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {activities.map(a => {
        const mode = a.mode as 'RACE' | 'BIKE' | 'SKATE';
        const modeKey = mode.toLowerCase() as ActivityMode;
        const color = MODE_COLORS[modeKey];
        const date = new Date(a.startedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        return (
          <View
            key={a.id}
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
              <Text style={{ fontSize: 20 }}>{modeEmoji[mode]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                {modeLabel[mode]} War
              </Text>
              <Text style={{ color: '#475569', fontSize: 12 }}>{date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {a.territory && (
                <Text style={{ color, fontSize: 13, fontFamily: 'Inter_700Bold' }}>{formatArea(a.territory.areaM2)}</Text>
              )}
              <Text style={{ color: '#475569', fontSize: 11 }}>{formatDistance(a.distanceKm)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
