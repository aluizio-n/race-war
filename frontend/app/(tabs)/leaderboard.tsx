import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy } from 'lucide-react-native';
import { formatArea } from '../../src/utils/format';
import type { ActivityMode } from '../../src/types';
import { MODE_COLORS } from '../../src/utils/colors';
import { apiFetch } from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';

const TABS: { key: 'global' | ActivityMode; label: string }[] = [
  { key: 'global', label: '🌍 Global' },
  { key: 'race', label: '🏃 Race' },
  { key: 'bike', label: '🚲 Bike' },
  { key: 'skate', label: '🛹 Skate' },
];

interface LeaderboardEntry {
  rank: number;
  user: { id: string; name: string; nickname: string };
  totalAreaM2: number;
}

interface MyRank {
  rank: number;
  totalAreaM2: number;
}

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | ActivityMode>('global');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);

  const load = useCallback(async () => {
    const mode = activeTab === 'global' ? '' : `&mode=${activeTab.toUpperCase()}`;
    const [listRes, rankRes] = await Promise.allSettled([
      apiFetch<LeaderboardEntry[]>(`/api/leaderboard?limit=50${mode}`),
      apiFetch<MyRank>(`/api/leaderboard/me${activeTab !== 'global' ? `?mode=${activeTab.toUpperCase()}` : ''}`),
    ]);
    if (listRes.status === 'fulfilled') setData(listRes.value);
    if (rankRes.status === 'fulfilled') setMyRank(rankRes.value);
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

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
      {top3.length >= 3 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Podium data={top3} />
        </View>
      )}

      {/* List */}
      <FlatList
        data={rest}
        keyExtractor={item => String(item.rank)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: ListRenderItemInfo<LeaderboardEntry>) => (
          <LeaderRow item={item} isMe={item.user.id === user?.id} />
        )}
        ListFooterComponent={
          myRank && user ? (
            <View style={{ marginTop: 8 }}>
              <View style={{ height: 1, backgroundColor: '#334155', marginBottom: 8 }} />
              <LeaderRow
                item={{ rank: myRank.rank, user: { id: user.id, name: user.name, nickname: user.nickname }, totalAreaM2: myRank.totalAreaM2 }}
                isMe
              />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function Podium({ data }: { data: LeaderboardEntry[] }) {
  const order = [data[1], data[0], data[2]];
  const heights = [80, 100, 60];
  const medals = ['🥈', '🥇', '🥉'];
  const colors = ['#94A3B8', '#F59E0B', '#CD7F32'];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
      {order.map((entry, i) => (
        <View key={entry.rank} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4, fontFamily: 'Inter_500Medium' }}>
            {entry.user.nickname}
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
              #{entry.rank}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function LeaderRow({ item, isMe }: { item: LeaderboardEntry; isMe?: boolean }) {
  const color = isMe ? '#22C55E' : '#06B6D4';

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
          {item.user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: isMe ? '#22C55E' : '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
          {isMe ? 'Você' : item.user.name}
        </Text>
        <Text style={{ color: '#475569', fontSize: 12, fontFamily: 'Inter_400Regular' }}>@{item.user.nickname}</Text>
      </View>
      <Text style={{ color, fontSize: 13, fontFamily: 'Inter_700Bold' }}>
        {formatArea(item.totalAreaM2)}
      </Text>
    </View>
  );
}
