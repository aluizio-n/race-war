import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCheck, UserPlus, UserCheck, Trophy, Bell } from 'lucide-react-native';
import { apiFetch } from '../src/lib/api';
import { formatRelativeTime } from '../src/utils/format';
import { SkeletonCard } from '../src/components/ui/SkeletonLoader';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, string> | null;
  read: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  friend_request: { icon: <UserPlus size={18} color="#06B6D4" />, color: '#06B6D4' },
  friend_accepted: { icon: <UserCheck size={18} color="#22C55E" />, color: '#22C55E' },
  challenge_completed: { icon: <Trophy size={18} color="#F59E0B" />, color: '#F59E0B' },
};

const DEFAULT_CONFIG = { icon: <Bell size={18} color="#94A3B8" />, color: '#94A3B8' };

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<NotificationItem[]>('/api/notifications?limit=50');
      setNotifications(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleTap = async (notification: NotificationItem) => {
    if (!notification.read) {
      apiFetch(`/api/notifications/${notification.id}/read`, { method: 'PATCH' }).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    }

    if (notification.type === 'friend_request') {
      router.push('/friends');
    } else if (notification.type === 'friend_accepted' && notification.data?.acceptorId) {
      router.push({ pathname: '/user/[id]', params: { id: notification.data.acceptorId } });
    } else if (notification.type === 'challenge_completed') {
      router.push('/challenges');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={18} color="#94A3B8" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC' }}>Notificações</Text>
            {unreadCount > 0 && (
              <Text style={{ color: '#475569', fontSize: 12, marginTop: 1 }}>
                {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 8,
              paddingHorizontal: 10, paddingVertical: 6,
              borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
            }}
          >
            <CheckCheck size={14} color="#22C55E" />
            <Text style={{ color: '#22C55E', fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>Ler todas</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 + insets.bottom }}
      >
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔔</Text>
            <Text style={{ color: '#475569', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' }}>
              Nenhuma notificação ainda
            </Text>
          </View>
        ) : (
          notifications.map(n => {
            const config = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
            return (
              <TouchableOpacity
                key={n.id}
                onPress={() => handleTap(n)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: n.read ? '#1E293B' : '#1E293B',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: n.read ? '#334155' : `${config.color}40`,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: `${config.color}15`,
                    borderWidth: 1, borderColor: `${config.color}30`,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {config.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{
                      color: '#F8FAFC', fontSize: 14,
                      fontFamily: n.read ? 'Inter_400Regular' : 'Inter_600SemiBold',
                      flex: 1,
                    }}>
                      {n.title}
                    </Text>
                    {!n.read && (
                      <View style={{
                        width: 8, height: 8, borderRadius: 4,
                        backgroundColor: config.color,
                      }} />
                    )}
                  </View>
                  <Text style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>{n.body}</Text>
                  <Text style={{ color: '#334155', fontSize: 11, marginTop: 4 }}>
                    {formatRelativeTime(n.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
