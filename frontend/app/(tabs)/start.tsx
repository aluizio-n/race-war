import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Zap, Heart, ChevronRight } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { ModeToggle } from '../../src/components/ui/ModeToggle';
import { Card } from '../../src/components/ui/Card';
import type { ActivityMode } from '../../src/types';
import { MODE_COLORS } from '../../src/utils/colors';

const TIPS: Record<ActivityMode, string> = {
  race: 'Corra no mínimo 400m antes de tentar fechar o polígono.',
  bike: 'Pedale um circuito fechado. Quanto maior a área, mais pontos!',
  skate: 'Skate rende bônus de território em áreas urbanas densas.',
};

export default function StartScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<ActivityMode>('race');
  const color = MODE_COLORS[mode];
  const [gpsStatus, setGpsStatus] = useState<'ok' | 'error'>('error');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setGpsStatus('ok');
      } else {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        setGpsStatus(newStatus === 'granted' ? 'ok' : 'error');
      }

      const level = await Battery.getBatteryLevelAsync();
      if (level >= 0) setBatteryLevel(Math.round(level * 100));
    })();
  }, []);

  const batteryStatus: 'ok' | 'error' = batteryLevel !== null && batteryLevel >= 20 ? 'ok' : 'error';
  const batteryLabel = batteryLevel !== null ? `Bateria: ${batteryLevel}%` : 'Bateria: verificando...';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
      >
        <Text style={{ fontSize: 24, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC', marginBottom: 4 }}>
          Setup da Guerra
        </Text>
        <Text style={{ color: '#475569', fontSize: 14, marginBottom: 28, fontFamily: 'Inter_400Regular' }}>
          Configure sua próxima batalha
        </Text>

        {/* Mode selector */}
        <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 10 }}>
          Modalidade
        </Text>
        <ModeToggle value={mode} onChange={setMode} />

        {/* Tip */}
        <View
          style={{
            backgroundColor: `${color}12`,
            borderRadius: 12,
            padding: 14,
            marginTop: 16,
            borderWidth: 1,
            borderColor: `${color}30`,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 18 }}>💡</Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, flex: 1, lineHeight: 20 }}>{TIPS[mode]}</Text>
        </View>

        {/* Checklist */}
        <Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 28, marginBottom: 12 }}>
          Verificação Pré-batalha
        </Text>
        <Card style={{ gap: 0 }}>
          <CheckItem icon={<MapPin size={18} color={gpsStatus === 'ok' ? '#22C55E' : '#EF4444'} />} label="GPS ativo" status={gpsStatus} />
          <View style={{ height: 1, backgroundColor: '#334155', marginVertical: 12 }} />
          <CheckItem icon={<Zap size={18} color={batteryStatus === 'ok' ? '#F59E0B' : '#EF4444'} />} label={batteryLabel} status={batteryStatus} />
          <View style={{ height: 1, backgroundColor: '#334155', marginVertical: 12 }} />
          <CheckItem icon={<Heart size={18} color="#EF4444" />} label="Monitor Cardíaco" status="optional" />
        </Card>

        {/* Start button */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={gpsStatus !== 'ok'}
          onPress={() => router.push({ pathname: '/activity/tracking', params: { mode } })}
          style={{ marginTop: 32, opacity: gpsStatus === 'ok' ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={[color, `${color}99`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 62,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              shadowColor: color,
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Montserrat_700Bold', letterSpacing: 1 }}>
              INICIAR BATALHA
            </Text>
            <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function CheckItem({ icon, label, status }: { icon: React.ReactNode; label: string; status: 'ok' | 'error' | 'optional' }) {
  const statusConfig = {
    ok: { text: 'Pronto', color: '#22C55E' },
    error: { text: 'Erro', color: '#EF4444' },
    optional: { text: 'Opcional', color: '#475569' },
  }[status];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {icon}
      <Text style={{ flex: 1, color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{label}</Text>
      <Text style={{ color: statusConfig.color, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
        {statusConfig.text}
      </Text>
    </View>
  );
}
