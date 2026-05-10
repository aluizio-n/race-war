import React from 'react';
import { View, Text } from 'react-native';

interface StatBadgeProps {
  label: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
}

export function StatBadge({ label, value, color = '#22C55E', icon }: StatBadgeProps) {
  return (
    <View
      style={{
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        flex: 1,
      }}
    >
      {icon && <View style={{ marginBottom: 4 }}>{icon}</View>}
      <Text style={{ color, fontSize: 18, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: '#475569', fontSize: 11, marginTop: 2, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}
