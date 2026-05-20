import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera, LogOut, Info, User, Edit3 } from 'lucide-react-native';
import { Input } from '../src/components/ui/Input';
import { useAuth } from '../src/context/AuthContext';
import { apiFetch, ApiError } from '../src/lib/api';
import { storage } from '../src/lib/storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);

  const hasChanges = name !== (user?.name ?? '') || nickname !== (user?.nickname ?? '');

  const handleSave = async () => {
    setError('');
    if (name.length < 2 || name.length > 80) {
      setError('Nome deve ter entre 2 e 80 caracteres');
      return;
    }
    if (nickname.length < 3 || nickname.length > 30) {
      setError('Nickname deve ter entre 3 e 30 caracteres');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
      setError('Nickname so pode ter letras, numeros e _');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, nickname }),
      });
      await refreshUser();
      Alert.alert('Salvo', 'Perfil atualizado com sucesso!');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao salvar';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissao necessaria', 'Precisamos de acesso a galeria para trocar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
    const filename = asset.uri.split('/').pop() ?? 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('avatar', { uri: asset.uri, name: filename, type } as any);

    try {
      const token = await storage.getAccessToken();
      const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload falhou');
      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      await refreshUser();
    } catch {
      Alert.alert('Erro', 'Nao foi possivel enviar a foto.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 }}>
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
          <Text style={{ fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC' }}>Configurações</Text>
        </View>

        {/* Avatar section */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl.startsWith('/') ? `${API_BASE}${avatarUrl}` : avatarUrl }}
                style={{ width: 88, height: 88, borderRadius: 24 }}
              />
            ) : (
              <LinearGradient
                colors={['#22C55E', '#06B6D4']}
                style={{ width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 36, fontFamily: 'Montserrat_700Bold', color: '#0F172A' }}>
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </Text>
              </LinearGradient>
            )}
            <View style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 30, height: 30, borderRadius: 15,
              backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: '#0F172A',
            }}>
              <Camera size={14} color="#0F172A" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: '#475569', fontSize: 12, marginTop: 10 }}>Toque para alterar a foto</Text>
        </View>

        {/* Profile section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionLabel icon={<User size={14} color="#94A3B8" />} label="Perfil" />

          <View style={{ backgroundColor: '#1E293B', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155', gap: 14 }}>
            <View>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 6 }}>Nome</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                autoCapitalize="words"
              />
            </View>
            <View>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 6 }}>Nickname</Text>
              <Input
                value={nickname}
                onChangeText={(t) => setNickname(t.toLowerCase())}
                placeholder="seu_nickname"
                autoCapitalize="none"
                leftIcon={<Text style={{ color: '#475569', fontSize: 14 }}>@</Text>}
              />
            </View>

            {error !== '' && (
              <Text style={{ color: '#EF4444', fontSize: 12, fontFamily: 'Inter_400Regular' }}>{error}</Text>
            )}

            {hasChanges && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                  backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 10, paddingVertical: 12,
                  borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Edit3 size={14} color="#22C55E" />
                <Text style={{ color: '#22C55E', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionLabel icon={<LogOut size={14} color="#94A3B8" />} label="Conta" />

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 14, paddingVertical: 16,
              borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
            }}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>

        {/* About section */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionLabel icon={<Info size={14} color="#94A3B8" />} label="Sobre" />

          <View style={{ backgroundColor: '#1E293B', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>Versão</Text>
              <Text style={{ color: '#475569', fontSize: 13, fontFamily: 'Inter_500Medium' }}>1.0.0-beta</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_400Regular' }}>Conta</Text>
              <Text style={{ color: '#475569', fontSize: 13, fontFamily: 'Inter_500Medium' }}>{user?.email ?? '—'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      {icon}
      <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium' }}>{label}</Text>
    </View>
  );
}
