import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ActivityMode } from '../../types';
import { MODE_COLORS } from '../../utils/colors';

const MODES: { key: ActivityMode; emoji: string; label: string }[] = [
  { key: 'race', emoji: '🏃', label: 'Race' },
  { key: 'bike', emoji: '🚲', label: 'Bike' },
  { key: 'skate', emoji: '🛹', label: 'Skate' },
];

interface ModeToggleProps {
  value: ActivityMode;
  onChange: (mode: ActivityMode) => void;
}

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  const handleSelect = (mode: ActivityMode) => {
    Haptics.selectionAsync();
    onChange(mode);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      {MODES.map(m => {
        const active = value === m.key;
        const color = MODE_COLORS[m.key];
        return (
          <TouchableOpacity
            key={m.key}
            onPress={() => handleSelect(m.key)}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: 10,
              backgroundColor: active ? `${color}22` : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: active ? color : 'transparent',
            }}
          >
            <Text style={{ fontSize: 20, marginBottom: 2 }}>{m.emoji}</Text>
            <Text style={{ color: active ? color : '#475569', fontSize: 11, fontWeight: '600' }}>
              {m.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
