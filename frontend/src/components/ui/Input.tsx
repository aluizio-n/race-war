import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({ label, error, leftIcon, isPassword, style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? '#EF4444' : focused ? '#22C55E' : '#334155';

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1E293B',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor,
          paddingHorizontal: 14,
          height: 52,
        }}
      >
        {leftIcon && <View style={{ marginRight: 10 }}>{leftIcon}</View>}
        <TextInput
          style={{
            flex: 1,
            color: '#F8FAFC',
            fontSize: 15,
            height: '100%',
          }}
          placeholderTextColor="#475569"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {showPassword ? (
              <EyeOff size={18} color="#475569" />
            ) : (
              <Eye size={18} color="#475569" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
}
