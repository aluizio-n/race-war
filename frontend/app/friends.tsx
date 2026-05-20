import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Search, Check, UserPlus } from 'lucide-react-native';
import { Input } from '../src/components/ui/Input';
import { apiFetch, ApiError } from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import { SkeletonCard } from '../src/components/ui/SkeletonLoader';

interface FriendUser {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface PendingRequest {
  id: string;
  senderId: string;
  receiverId: string;
  accepted: boolean;
  createdAt: string;
  sender: FriendUser;
}

export default function FriendsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const loadFriends = useCallback(async () => {
    const [friendsRes, pendingRes] = await Promise.allSettled([
      apiFetch<FriendUser[]>('/api/users/friends'),
      apiFetch<PendingRequest[]>('/api/users/friends/pending'),
    ]);
    if (friendsRes.status === 'fulfilled') setFriends(friendsRes.value);
    if (pendingRes.status === 'fulfilled') setPending(pendingRes.value);
    setLoading(false);
  }, []);

  useEffect(() => { loadFriends(); }, [loadFriends]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await apiFetch<FriendUser[]>(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        const friendIds = new Set(friends.map(f => f.id));
        setSearchResults(results.filter(u => u.id !== user?.id && !friendIds.has(u.id)));
      } catch {}
      setSearchLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, friends, user?.id]);

  const handleAccept = async (requestId: string) => {
    try {
      await apiFetch(`/api/users/friends/requests/${requestId}/accept`, { method: 'PATCH' });
      await loadFriends();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao aceitar';
      Alert.alert('Erro', msg);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await apiFetch(`/api/users/friends/${userId}`, { method: 'POST' });
      Alert.alert('Enviado!', 'Solicitacao de amizade enviada.');
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao enviar';
      Alert.alert('Erro', msg);
    }
  };

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 }}>
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
          <Text style={{ fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC' }}>Amigos</Text>
          <Text style={{ color: '#475569', fontSize: 12, marginTop: 1 }}>Gerencie suas conexoes</Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <Input
          placeholder="Buscar por nickname ou nome..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          leftIcon={<Search size={16} color="#475569" />}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 + insets.bottom }}
      >
        {isSearchActive ? (
          <>
            <SectionTitle title="Resultados" />
            {searchLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator color="#22C55E" />
              </View>
            ) : searchResults.length === 0 ? (
              <Text style={{ color: '#475569', fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
                Nenhum usuario encontrado
              </Text>
            ) : (
              searchResults.map(u => (
                <SearchResultItem key={u.id} user={u} onAdd={() => handleSendRequest(u.id)} />
              ))
            )}
          </>
        ) : loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Pending requests */}
            {pending.length > 0 && (
              <>
                <SectionTitle title={`Solicitacoes Pendentes (${pending.length})`} />
                {pending.map(req => (
                  <PendingItem key={req.id} request={req} onAccept={() => handleAccept(req.id)} />
                ))}
              </>
            )}

            {/* Friends list */}
            <SectionTitle title={`Meus Amigos (${friends.length})`} />
            {friends.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 36, marginBottom: 10 }}>👥</Text>
                <Text style={{ color: '#475569', fontSize: 13, textAlign: 'center' }}>
                  Nenhum amigo ainda. Busque e adicione!
                </Text>
              </View>
            ) : (
              friends.map(f => (
                <FriendItem
                  key={f.id}
                  user={f}
                  onPress={() => router.push({ pathname: '/user/[id]', params: { id: f.id } })}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 12, marginTop: 12 }}>
      {title}
    </Text>
  );
}

function FriendItem({ user, onPress }: { user: FriendUser; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
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
          borderRadius: 22,
          backgroundColor: 'rgba(34,197,94,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(34,197,94,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#22C55E', fontSize: 16, fontFamily: 'Montserrat_700Bold' }}>
          {user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>{user.name}</Text>
        <Text style={{ color: '#475569', fontSize: 12 }}>@{user.nickname}</Text>
      </View>
      <ChevronRight size={16} color="#475569" />
    </TouchableOpacity>
  );
}

function PendingItem({ request, onAccept }: { request: PendingRequest; onAccept: () => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.3)',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: 'rgba(245,158,11,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(245,158,11,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#F59E0B', fontSize: 16, fontFamily: 'Montserrat_700Bold' }}>
          {request.sender.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>{request.sender.name}</Text>
        <Text style={{ color: '#475569', fontSize: 12 }}>@{request.sender.nickname}</Text>
      </View>
      <TouchableOpacity
        onPress={onAccept}
        style={{
          backgroundColor: 'rgba(34,197,94,0.15)',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: 'rgba(34,197,94,0.3)',
        }}
      >
        <Check size={16} color="#22C55E" />
      </TouchableOpacity>
    </View>
  );
}

function SearchResultItem({ user, onAdd }: { user: FriendUser; onAdd: () => void }) {
  return (
    <View
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
          borderRadius: 22,
          backgroundColor: 'rgba(6,182,212,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(6,182,212,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#06B6D4', fontSize: 16, fontFamily: 'Montserrat_700Bold' }}>
          {user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>{user.name}</Text>
        <Text style={{ color: '#475569', fontSize: 12 }}>@{user.nickname}</Text>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: 'rgba(34,197,94,0.15)',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: 'rgba(34,197,94,0.3)',
        }}
      >
        <UserPlus size={14} color="#22C55E" />
        <Text style={{ color: '#22C55E', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Adicionar</Text>
      </TouchableOpacity>
    </View>
  );
}
