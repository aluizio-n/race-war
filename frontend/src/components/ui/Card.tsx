import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  glow?: string;
  padding?: number;
}

export function Card({ children, glow, padding = 16, style, ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: '#1E293B',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: glow ?? '#334155',
          padding,
          shadowColor: glow ?? '#000',
          shadowOpacity: glow ? 0.3 : 0.1,
          shadowRadius: glow ? 12 : 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
