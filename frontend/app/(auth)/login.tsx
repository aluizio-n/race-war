import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock } from 'lucide-react-native';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';
import { ApiError } from '../../src/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.includes('@')) e.email = 'Email inválido';
    if (password.length < 8) e.password = 'Mínimo 8 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao conectar com o servidor';
      Alert.alert('Falha no login', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 44 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: 'rgba(34,197,94,0.1)',
                borderWidth: 2,
                borderColor: '#22C55E',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: '#22C55E',
                shadowOpacity: 0.3,
                shadowRadius: 16,
              }}
            >
              <Text style={{ fontSize: 32 }}>⚔️</Text>
            </View>
            <Text style={{ fontSize: 26, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC' }}>
              Bem-vindo de volta
            </Text>
            <Text style={{ color: '#475569', fontSize: 14, marginTop: 6, fontFamily: 'Inter_400Regular' }}>
              Entre na guerra. Retome seu território.
            </Text>
          </View>

          {/* Social login */}
          <View style={{ gap: 10, marginBottom: 24 }}>
            <SocialButton emoji="🇬" label="Continuar com Google" />
            {Platform.OS === 'ios' && <SocialButton emoji="🍎" label="Continuar com Apple" />}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#334155' }} />
            <Text style={{ color: '#475569', paddingHorizontal: 12, fontSize: 12 }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#334155' }} />
          </View>

          {/* Form */}
          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Mail size={16} color="#475569" />}
          />

          <Input
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
            leftIcon={<Lock size={16} color="#475569" />}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignSelf: 'flex-end', marginBottom: 24, marginTop: -8 }}
          >
            <Text style={{ color: '#22C55E', fontSize: 13, fontFamily: 'Inter_500Medium' }}>
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          <Button label="Entrar" onPress={handleLogin} loading={loading} size="lg" fullWidth />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#475569', fontSize: 14 }}>Novo aqui? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={{ color: '#22C55E', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SocialButton({ emoji, label }: { emoji: string; label: string }) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#334155',
        gap: 10,
        opacity: 0.5,
      }}
    >
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={{ color: '#F8FAFC', fontSize: 14, fontFamily: 'Inter_500Medium' }}>{label}</Text>
      <View style={{ backgroundColor: '#F59E0B', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
        <Text style={{ color: '#0F172A', fontSize: 9, fontFamily: 'Inter_700Bold' }}>EM BREVE</Text>
      </View>
    </TouchableOpacity>
  );
}
