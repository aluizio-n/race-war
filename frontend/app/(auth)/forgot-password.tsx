import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, SendHorizonal } from 'lucide-react-native';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!email.includes('@')) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32, marginTop: 8 }}>
          <Text style={{ color: '#22C55E', fontSize: 14, fontFamily: 'Inter_500Medium' }}>← Voltar</Text>
        </TouchableOpacity>

        {!sent ? (
          <>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: 'rgba(34,197,94,0.1)',
                borderWidth: 1,
                borderColor: '#22C55E',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Mail size={28} color="#22C55E" />
            </View>

            <Text style={{ fontSize: 26, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC', marginBottom: 10 }}>
              Esqueceu a senha?
            </Text>
            <Text style={{ color: '#475569', fontSize: 14, marginBottom: 32, lineHeight: 22 }}>
              Insira seu email e enviaremos um link para redefinir sua senha.
            </Text>

            <Input
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={16} color="#475569" />}
            />

            <Button label="Enviar link" onPress={handleSend} loading={loading} size="lg" fullWidth style={{ marginTop: 8 }} />
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 56, marginBottom: 24 }}>📬</Text>
            <Text style={{ fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 12 }}>
              Email enviado!
            </Text>
            <Text style={{ color: '#475569', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 36 }}>
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </Text>
            <Button label="Voltar ao login" onPress={() => router.replace('/(auth)/login')} variant="secondary" size="lg" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
