import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, ListRenderItemInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, ChevronLeft } from 'lucide-react-native';
import type { ActivityMode } from '../src/types';
import { MODE_COLORS } from '../src/utils/colors';

interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  mode?: ActivityMode;
  target: number;
  current: number;
  unit: string;
  rewardEmoji: string;
  rewardName: string;
  rewardColor: string;
  expiresIn: string;
}

const CHALLENGES: ChallengeItem[] = [
  {
    id: '1',
    title: 'Tripleta de Quarteirões',
    description: 'Domine 3 quarteirões em 24 horas',
    mode: 'race',
    target: 3,
    current: 1,
    unit: 'territórios',
    rewardEmoji: '🎖️',
    rewardName: 'Médico de Guerra',
    rewardColor: '#22C55E',
    expiresIn: '14h 32min',
  },
  {
    id: '2',
    title: 'Ciclista Imparável',
    description: 'Pedale 20km em um único dia',
    mode: 'bike',
    target: 20,
    current: 8.4,
    unit: 'km',
    rewardEmoji: '⚡',
    rewardName: 'Velocista',
    rewardColor: '#06B6D4',
    expiresIn: '6h 15min',
  },
  {
    id: '3',
    title: 'Domínio Urbano',
    description: 'Conquiste 5.000 m² de área total',
    target: 5000,
    current: 2400,
    unit: 'm²',
    rewardEmoji: '🏰',
    rewardName: 'Senhor da Cidade',
    rewardColor: '#A855F7',
    expiresIn: '2 dias',
  },
  {
    id: '4',
    title: 'Semana do Guerreiro',
    description: 'Complete uma atividade por 7 dias seguidos',
    target: 7,
    current: 3,
    unit: 'dias',
    rewardEmoji: '👑',
    rewardName: 'General Supremo',
    rewardColor: '#F59E0B',
    expiresIn: '4 dias',
  },
  {
    id: '5',
    title: 'Skatista Lendário',
    description: 'Feche um polígono maior que 10.000m² de skate',
    mode: 'skate',
    target: 10000,
    current: 0,
    unit: 'm²',
    rewardEmoji: '🛹',
    rewardName: 'Ícone do Asfalto',
    rewardColor: '#A855F7',
    expiresIn: '3 dias',
  },
];

export default function ChallengesScreen() {
  const router = useRouter();

  const renderItem = ({ item }: ListRenderItemInfo<ChallengeItem>) => {
    const progress = Math.min(item.current / item.target, 1);
    const color = item.mode ? MODE_COLORS[item.mode] : item.rewardColor;
    const isDone = progress >= 1;

    return (
      <View
        style={{
          backgroundColor: '#1E293B',
          borderRadius: 18,
          padding: 18,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: isDone ? color : '#334155',
        }}
      >
        {/* Top row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              backgroundColor: `${color}18`,
              borderWidth: 1,
              borderColor: `${color}40`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 26 }}>{item.rewardEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F8FAFC', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 3 }}>
              {item.title}
            </Text>
            <Text style={{ color: '#475569', fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 }}>
              {item.description}
            </Text>
          </View>
          {isDone && (
            <View
              style={{
                backgroundColor: `${color}20`,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: color,
              }}
            >
              <Text style={{ color, fontSize: 11, fontFamily: 'Inter_700Bold' }}>Feito!</Text>
            </View>
          )}
        </View>

        {/* Progress */}
        <View style={{ height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 8 }}>
          <LinearGradient
            colors={[color, `${color}80`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 3 }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#475569', fontSize: 12 }}>
            <Text style={{ color, fontFamily: 'Inter_700Bold' }}>
              {typeof item.current === 'number' && item.current % 1 !== 0
                ? item.current.toFixed(1)
                : item.current}
            </Text>
            {' '}/{' '}{item.target} {item.unit}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={11} color="#475569" />
            <Text style={{ color: '#475569', fontSize: 11 }}>{item.expiresIn}</Text>
          </View>
        </View>

        {/* Reward chip */}
        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#263548',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 13 }}>🎁</Text>
          <Text style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Inter_500Medium' }}>
            Badge: <Text style={{ color }}>{item.rewardName}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
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
          <ChevronLeft size={18} color="#94A3B8" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC' }}>Desafios</Text>
          <Text style={{ color: '#475569', fontSize: 12, marginTop: 1 }}>Missões especiais e temporárias</Text>
        </View>
      </View>

      <FlatList
        data={CHALLENGES}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}
