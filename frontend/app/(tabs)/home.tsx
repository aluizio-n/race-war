import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Flame, Map, Target, Trophy } from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { StatBadge } from '../../src/components/ui/StatBadge';
import { formatArea, formatDistance } from '../../src/utils/format';
import type { ActivityMode } from '../../src/types';

const { width } = Dimensions.get('window');

const MOCK_ACTIVITIES = [
  { id: '1', mode: 'race' as ActivityMode, area: 12400, distance: 2.3, date: 'Hoje, 07:30' },
  { id: '2', mode: 'bike' as ActivityMode, area: 34200, distance: 6.1, date: 'Ontem, 18:15' },
  { id: '3', mode: 'skate' as ActivityMode, area: 8100, distance: 1.8, date: 'Seg, 16:00' },
];

const MODE_COLORS = { race: '#22C55E', bike: '#06B6D4', skate: '#A855F7' };
const MODE_EMOJI = { race: '🏃', bike: '🚲', skate: '🛹' };
const MODE_LABEL = { race: 'Race', bike: 'Bike', skate: 'Skate' };

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
          <View>
            <Text style={{ color: '#475569', fontSize: 13, fontFamily: 'Inter_400Regular' }}>Bom dia, General</Text>
            <Text style={{ color: '#F8FAFC', fontSize: 22, fontFamily: 'Montserrat_700Bold' }}>Missão do Dia</Text>
          </View>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#1E293B',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <Bell size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Hero CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/start')}
          style={{ marginHorizontal: 20, marginBottom: 20 }}
        >
          <LinearGradient
            colors={['#22C55E', '#06B6D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 24,
              overflow: 'hidden',
            }}
          >
            <View style={{ position: 'absolute', right: -20, top: -20, opacity: 0.15 }}>
              <Text style={{ fontSize: 120 }}>⚔️</Text>
            </View>
            <Text style={{ color: '#0F172A', fontSize: 13, fontFamily: 'Inter_600SemiBold', letterSpacing: 2, marginBottom: 4 }}>
              PRONTO PARA BATALHAR?
            </Text>
            <Text style={{ color: '#0F172A', fontSize: 28, fontFamily: 'Montserrat_900Black', marginBottom: 16 }}>
              START WAR
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 8,
                alignSelf: 'flex-start',
                gap: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>Iniciar atividade</Text>
              <ChevronRight size={14} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 24 }}>
          <StatBadge label="Territórios" value="12" color="#22C55E" icon={<Map size={16} color="#22C55E" />} />
          <StatBadge label="Km Totais" value="48.2" color="#06B6D4" icon={<Flame size={16} color="#06B6D4" />} />
          <StatBadge label="Ranking" value="#47" color="#A855F7" icon={<Trophy size={16} color="#A855F7" />} />
        </View>

        {/* Daily Challenge */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Desafio do Dia" action="Ver todos" onAction={() => router.push('/challenges')} />
          <Card glow="#F59E0B">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: 'rgba(245,158,11,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>🎯</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 2 }}>
                  Domine 3 Quarteirões
                </Text>
                <Text style={{ color: '#475569', fontSize: 12, fontFamily: 'Inter_400Regular' }}>
                  Expira em 14h 32min
                </Text>
              </View>
              <View>
                <Text style={{ color: '#F59E0B', fontSize: 22, fontFamily: 'Montserrat_700Bold' }}>1/3</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={{ marginTop: 14, height: 6, backgroundColor: '#334155', borderRadius: 3 }}>
              <View style={{ width: '33%', height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 }} />
            </View>
          </Card>
        </View>

        {/* Recent activities */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader title="Batalhas Recentes" action="Ver histórico" onAction={() => {}} />
          {MOCK_ACTIVITIES.map(a => (
            <ActivityRow key={a.id} activity={a} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text style={{ color: '#F8FAFC', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>{title}</Text>
      <TouchableOpacity onPress={onAction}>
        <Text style={{ color: '#22C55E', fontSize: 13, fontFamily: 'Inter_500Medium' }}>{action}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ActivityRow({ activity }: { activity: (typeof MOCK_ACTIVITIES)[0] }) {
  const color = MODE_COLORS[activity.mode];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
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
        <Text style={{ fontSize: 20 }}>{MODE_EMOJI[activity.mode]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 }}>
          {MODE_LABEL[activity.mode]} War
        </Text>
        <Text style={{ color: '#475569', fontSize: 12 }}>{activity.date}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color, fontSize: 13, fontFamily: 'Inter_700Bold' }}>{formatArea(activity.area)}</Text>
        <Text style={{ color: '#475569', fontSize: 11 }}>{formatDistance(activity.distance)}</Text>
      </View>
    </TouchableOpacity>
  );
}
