import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, ChevronLeft } from 'lucide-react-native';
import type { ActivityMode, UserChallengeResponse } from '../src/types';
import { MODE_COLORS } from '../src/utils/colors';
import { formatTimeRemaining } from '../src/utils/format';
import { apiFetch } from '../src/lib/api';
import { SkeletonCard } from '../src/components/ui/SkeletonLoader';

export default function ChallengesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [challenges, setChallenges] = useState<UserChallengeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<UserChallengeResponse[]>('/api/challenges');
      setChallenges(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: ListRenderItemInfo<UserChallengeResponse>) => {
    const c = item.challenge;
    const progress = Math.min(item.currentValue / c.targetValue, 1);
    const mode = c.mode ? (c.mode.toLowerCase() as ActivityMode) : undefined;
    const color = mode ? MODE_COLORS[mode] : c.rewardColor;
    const isDone = item.status === 'COMPLETED';

    const displayValue = item.currentValue % 1 !== 0
      ? item.currentValue.toFixed(1)
      : String(item.currentValue);

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
            <Text style={{ fontSize: 26 }}>{c.rewardEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F8FAFC', fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 3 }}>
              {c.title}
            </Text>
            <Text style={{ color: '#475569', fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 }}>
              {c.description}
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

        <View style={{ height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 8 }}>
          <LinearGradient
            colors={[color, `${color}80`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${progress * 100}%` as `${number}%`, height: '100%', borderRadius: 3 }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#475569', fontSize: 12 }}>
            <Text style={{ color, fontFamily: 'Inter_700Bold' }}>{displayValue}</Text>
            {' '}/{' '}{c.targetValue} {c.unit === 'territories' ? 'territorios' : c.unit}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={11} color="#475569" />
            <Text style={{ color: '#475569', fontSize: 11 }}>{formatTimeRemaining(c.expiresAt)}</Text>
          </View>
        </View>

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
            Badge: <Text style={{ color }}>{c.rewardName}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
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
          <Text style={{ color: '#475569', fontSize: 12, marginTop: 1 }}>Missoes especiais e temporarias</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : challenges.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
          <Text style={{ color: '#475569', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' }}>
            Nenhum desafio ativo no momento.
          </Text>
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}
