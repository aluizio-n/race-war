import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, AtSign } from 'lucide-react-native';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';
import { ApiError } from '../../src/lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', nickname: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.nickname.trim()) e.nickname = 'Nickname obrigatório';
    if (!form.email.includes('@')) e.email = 'Email inválido';
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(form.password)) e.password = 'Precisa de ao menos uma letra maiúscula';
    if (!/[0-9]/.test(form.password)) e.password = 'Precisa de ao menos um número';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.nickname, form.email, form.password);
      router.replace('/(tabs)/home');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar conta';
      Alert.alert('Falha no cadastro', message);
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
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 28, marginTop: 8 }}>
            <Text style={{ color: '#22C55E', fontSize: 14, fontFamily: 'Inter_500Medium' }}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 28, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC', marginBottom: 8 }}>
            Criar conta
          </Text>
          <Text style={{ color: '#475569', fontSize: 14, marginBottom: 32, fontFamily: 'Inter_400Regular' }}>
            Junte-se à guerra. Conquiste territórios.
          </Text>

          <Input
            label="Nome completo"
            placeholder="João da Silva"
            value={form.name}
            onChangeText={set('name')}
            error={errors.name}
            leftIcon={<User size={16} color="#475569" />}
          />
          <Input
            label="Nickname (público)"
            placeholder="@general_joao"
            value={form.nickname}
            onChangeText={set('nickname')}
            autoCapitalize="none"
            error={errors.nickname}
            leftIcon={<AtSign size={16} color="#475569" />}
          />
          <Input
            label="Email"
            placeholder="seu@email.com"
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Mail size={16} color="#475569" />}
          />
          <Input
            label="Senha"
            placeholder="••••••••"
            value={form.password}
            onChangeText={set('password')}
            isPassword
            error={errors.password}
            leftIcon={<Lock size={16} color="#475569" />}
          />

          <Text style={{ color: '#475569', fontSize: 12, marginBottom: 24, lineHeight: 18 }}>
            Ao criar uma conta, você concorda com os{' '}
            <Text style={{ color: '#22C55E' }}>Termos de Uso</Text> e a{' '}
            <Text style={{ color: '#22C55E' }}>Política de Privacidade</Text>.
          </Text>

          <Button label="Criar minha conta" onPress={handleRegister} loading={loading} size="lg" fullWidth />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#475569', fontSize: 14 }}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: '#22C55E', fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
