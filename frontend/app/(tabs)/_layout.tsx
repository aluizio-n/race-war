import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Home, Map, Trophy, User, Swords } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

function TabIcon({ color, focused, Icon }: { color: string; focused: boolean; Icon: any }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: focused ? `${color}20` : 'transparent',
      }}
    >
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#475569',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          backgroundColor: Platform.OS === 'android' ? '#0F172A' : 'transparent',
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} Icon={Home} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} Icon={Map} />,
        }}
      />
      <Tabs.Screen
        name="start"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: '#22C55E',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Platform.OS === 'ios' ? 12 : 4,
                shadowColor: '#22C55E',
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Swords size={26} color="#0F172A" strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} Icon={Trophy} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} Icon={User} />,
        }}
      />
    </Tabs>
  );
}
