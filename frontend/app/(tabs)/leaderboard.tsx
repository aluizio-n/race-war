import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy } from 'lucide-react-native';
import { SkeletonCard } from '../../src/components/ui/SkeletonLoader';
import { formatArea } from '../../src/utils/format';
import type { ActivityMode } from '../../src/types';
import { MODE_COLORS } from '../../src/utils/colors';

const TABS: { key: 'global' | ActivityMode; label: string }[] = [
  { key: 'global', label: '🌍 Global' },
  { key: 'race', label: '🏃 Race' },
  { key: 'bike', label: '🚲 Bike' },
  { key: 'skate', label: '🛹 Skate' },
];

interface LeaderboardUser {
  rank: number;
  name: string;
  nickname: string;
  area: number;
  mode: ActivityMode;
  isMe?: boolean;
}

const MOCK_DATA: LeaderboardUser[] = [
  { rank: 1, name: 'Carlos Silva', nickname: '@general_carlos', area: 284000, mode: 'race' },
  { rank: 2, name: 'Ana Paula', nickname: '@queenpaula', area: 231000, mode: 'bike' },
  { rank: 3, name: 'Rafael Lima', nickname: '@skate_lord', area: 196000, mode: 'skate' },
  { rank: 4, name: 'Beatriz Costa', nickname: '@bea_runs', area: 174000, mode: 'race' },
  { rank: 5, name: 'Lucas Mendes', nickname: '@luca_bike', area: 152000, mode: 'bike' },
  { rank: 6, name: 'Mariana Torres', nickname: '@mari_skate', area: 138000, mode: 'skate' },
  { rank: 7, name: 'Pedro Alves', nickname: '@pedro_war', area: 121000, mode: 'race' },
  { rank: 8, name: 'Julia Santos', nickname: '@juli_speed', area: 109000, mode: 'race' },
  { rank: 9, name: 'André Rocha', nickname: '@andre_roll', area: 97000, mode: 'skate' },
  { rank: 10, name: 'Fernanda Melo', nickname: '@fer_cycle', area: 88000, mode: 'bike' },
  { rank: 47, name: 'Você', nickname: '@general_you', area: 12400, mode: 'race', isMe: true },
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<'global' | ActivityMode>('global');

  const filtered = activeTab === 'global' ? MOCK_DATA : MOCK_DATA.filter(u => u.mode === activeTab || u.isMe);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Trophy size={22} color="#F59E0B" />
          <Text style={{ fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC' }}>Ranking</Text>
        </View>
        <Text style={{ color: '#475569', fontSize: 13, fontFamily: 'Inter_400Regular' }}>
          Os Generais mais poderosos da cidade
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 }}>
        {TABS.map(t => {
          const active = activeTab === t.key;
          const color = t.key === 'global' ? '#F59E0B' : MODE_COLORS[t.key as ActivityMode];
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: active ? `${color}20` : '#1E293B',
                borderWidth: 1,
                borderColor: active ? color : '#334155',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: active ? color : '#475569', fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Top 3 podium */}
      {activeTab === 'global' && (
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Podium data={MOCK_DATA.slice(0, 3)} />
        </View>
      )}

      {/* List */}
      <FlatList
        data={filtered.filter(u => !u.isMe && u.rank > 3)}
        keyExtractor={item => String(item.rank)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: ListRenderItemInfo<LeaderboardUser>) => <LeaderRow item={item} />}
        ListFooterComponent={
          MOCK_DATA.find(u => u.isMe) ? (
            <View style={{ marginTop: 8 }}>
              <View style={{ height: 1, backgroundColor: '#334155', marginBottom: 8 }} />
              <LeaderRow item={MOCK_DATA.find(u => u.isMe)!} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function Podium({ data }: { data: LeaderboardUser[] }) {
  const order = [data[1], data[0], data[2]]; // 2nd, 1st, 3rd
  const heights = [80, 100, 60];
  const medals = ['🥈', '🥇', '🥉'];
  const colors = ['#94A3B8', '#F59E0B', '#CD7F32'];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
      {order.map((user, i) => (
        <View key={user.rank} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4, fontFamily: 'Inter_500Medium' }}>
            {user.nickname}
          </Text>
          <Text style={{ fontSize: 22, marginBottom: 4 }}>{medals[i]}</Text>
          <View
            style={{
              height: heights[i],
              width: '100%',
              borderRadius: 12,
              backgroundColor: `${colors[i]}18`,
              borderWidth: 1,
              borderColor: colors[i],
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: 8,
            }}
          >
            <Text style={{ color: colors[i], fontSize: 14, fontFamily: 'Montserrat_700Bold' }}>
              #{user.rank}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function LeaderRow({ item }: { item: LeaderboardUser }) {
  const color = MODE_COLORS[item.mode];
  const isMe = item.isMe;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isMe ? 'rgba(34,197,94,0.08)' : '#1E293B',
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: isMe ? '#22C55E' : '#334155',
        gap: 12,
      }}
    >
      <Text style={{ width: 28, color: '#475569', fontSize: 14, fontFamily: 'Inter_700Bold', textAlign: 'center' }}>
        {item.rank}
      </Text>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${color}20`,
          borderWidth: 1,
          borderColor: `${color}40`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color, fontSize: 14, fontFamily: 'Montserrat_700Bold' }}>
          {item.name.charAt(0)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: isMe ? '#22C55E' : '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          {isMe ? 'Você' : item.name}
        </Text>
        <Text style={{ color: '#475569', fontSize: 12, fontFamily: 'Inter_400Regular' }}>{item.nickname}</Text>
      </View>
      <Text style={{ color, fontSize: 13, fontFamily: 'Inter_700Bold' }}>
        {formatArea(item.area)}
      </Text>
    </View>
  );
}
