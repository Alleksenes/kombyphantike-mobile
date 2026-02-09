import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { IconButton } from 'react-native-paper';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Fixed: sceneContainerStyle is not a valid prop on Tabs.
        // Using sceneStyle in screenOptions for transparent background.
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarStyle: {
          backgroundColor: '#1a1918', // Fallback for Android
          borderTopColor: '#3e0a15',
          borderTopWidth: 1,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C5A059', // Gold
        tabBarInactiveTintColor: 'rgba(227, 220, 203, 0.5)', // Dim Parchment
        tabBarLabelStyle: {
          fontFamily: 'NeueHaasGrotesk-Display',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Weaver',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="feather" iconColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Archives',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="history" iconColor={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
