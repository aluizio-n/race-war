import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';
import { ChevronLeft, Map, Flame, UserPlus, UserCheck, Clock } from 'lucide-react-native';
import { StatBadge } from '../../src/components/ui/StatBadge';
import { formatArea } from '../../src/utils/format';
import { MODE_COLORS } from '../../src/utils/colors';
import { apiFetch, ApiError } from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import { Skeleton } from '../../src/components/ui/SkeletonLoader';
import type { ActivityMode } from '../../src/types';

interface PublicUser {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string | null;
  createdAt: string;
  _count: { territories: number; activities: number };
  totalAreaM2: number;
}

interface TerritoryStats {
  totalAreaM2: number;
  totalCount: number;
  byMode: Array<{ mode: string; areaM2: number; count: number }>;
}

type FriendStatus = 'none' | 'pending' | 'friends';

const MODE_EMOJI: Record<string, string> = { race: '🏃', bike: '🚲', skate: '🛹' };

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [stats, setStats] = useState<TerritoryStats | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);

  const load = useCallback(async () => {
    const [profileRes, statsRes, friendsRes] = await Promise.allSettled([
      apiFetch<PublicUser>(`/api/users/${id}`),
      apiFetch<TerritoryStats>(`/api/territories/user/${id}/stats`),
      apiFetch<Array<{ id: string }>>('/api/users/friends'),
    ]);
    if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    if (friendsRes.status === 'fulfilled') {
      const isFriend = friendsRes.value.some(f => f.id === id);
      setFriendStatus(isFriend ? 'friends' : 'none');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddFriend = async () => {
    setSendingRequest(true);
    try {
      await apiFetch(`/api/users/friends/${id}`, { method: 'POST' });
      setFriendStatus('pending');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao enviar solicitacao';
      if (msg.toLowerCase().includes('já existe') || msg.toLowerCase().includes('ja existe')) {
        setFriendStatus('pending');
      } else {
        Alert.alert('Erro', msg);
      }
    } finally {
      setSendingRequest(false);
    }
  };

  const memberSince = profile
    ? new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={18} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC' }}>Perfil</Text>
        </View>
        <View style={{ padding: 20 }}>
          <Skeleton height={180} borderRadius={20} style={{ marginBottom: 16 }} />
          <Skeleton height={58} borderRadius={14} style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Skeleton height={80} borderRadius={12} style={{ flex: 1 }} />
            <Skeleton height={80} borderRadius={12} style={{ flex: 1 }} />
            <Skeleton height={80} borderRadius={12} style={{ flex: 1 }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
        <Text style={{ color: '#475569', fontSize: 14 }}>Usuario nao encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#22C55E', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={18} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC' }}>Perfil</Text>
        </View>

        {/* Profile card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <LinearGradient
            colors={['#1E293B', '#263548']}
            style={{ borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              {profile.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl.startsWith('/') ? `${API_BASE}${profile.avatarUrl}` : profile.avatarUrl }}
                  style={{ width: 68, height: 68, borderRadius: 20 }}
                />
              ) : (
                <LinearGradient
                  colors={['#06B6D4', '#A855F7']}
                  style={{ width: 68, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 28, fontFamily: 'Montserrat_700Bold', color: '#0F172A' }}>
                    {profile.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 19, fontFamily: 'Montserrat_700Bold' }}>
                  {profile.name}
                </Text>
                <Text style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>@{profile.nickname}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <Clock size={12} color="#94A3B8" />
                  <Text style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Inter_400Regular' }}>
                    Membro desde {memberSince}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Friend action button */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          {friendStatus === 'none' && (
            <TouchableOpacity
              onPress={handleAddFriend}
              disabled={sendingRequest}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: 'rgba(34,197,94,0.15)',
                borderRadius: 14,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: 'rgba(34,197,94,0.3)',
                opacity: sendingRequest ? 0.6 : 1,
              }}
            >
              <UserPlus size={18} color="#22C55E" />
              <Text style={{ color: '#22C55E', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                {sendingRequest ? 'Enviando...' : 'Adicionar Amigo'}
              </Text>
            </TouchableOpacity>
          )}
          {friendStatus === 'pending' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: 'rgba(245,158,11,0.12)',
                borderRadius: 14,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: 'rgba(245,158,11,0.3)',
              }}
            >
              <Clock size={18} color="#F59E0B" />
              <Text style={{ color: '#F59E0B', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                Solicitacao Enviada
              </Text>
            </View>
          )}
          {friendStatus === 'friends' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: 'rgba(34,197,94,0.12)',
                borderRadius: 14,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: 'rgba(34,197,94,0.3)',
              }}
            >
              <UserCheck size={18} color="#22C55E" />
              <Text style={{ color: '#22C55E', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                Amigos
              </Text>
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 24 }}>
          <StatBadge
            label="Territorios"
            value={String(profile._count.territories)}
            color="#22C55E"
            icon={<Map size={14} color="#22C55E" />}
          />
          <StatBadge
            label="Atividades"
            value={String(profile._count.activities)}
            color="#06B6D4"
            icon={<Flame size={14} color="#06B6D4" />}
          />
          <StatBadge
            label="Area Total"
            value={formatArea(profile.totalAreaM2)}
            color="#A855F7"
            icon={<Map size={14} color="#A855F7" />}
          />
        </View>

        {/* Territory breakdown by mode */}
        {stats && stats.byMode.length > 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 12 }}>
              Territorios por Modalidade
            </Text>
            {stats.byMode.map(m => {
              const modeKey = m.mode.toLowerCase() as ActivityMode;
              const color = MODE_COLORS[modeKey];
              const emoji = MODE_EMOJI[modeKey] ?? '🏃';
              return (
                <View
                  key={m.mode}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#1E293B',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: '#334155',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>
                      {modeKey.charAt(0).toUpperCase() + modeKey.slice(1)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color, fontSize: 14, fontFamily: 'Inter_700Bold' }}>{formatArea(m.areaM2)}</Text>
                    <Text style={{ color: '#475569', fontSize: 11 }}>{m.count} territorios</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
