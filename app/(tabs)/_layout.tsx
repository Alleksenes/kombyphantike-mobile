import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background, // Deep Ink
          borderTopColor: theme.colors.tertiary, // Antique Gold
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.colors.primary, // Antique Gold
        tabBarInactiveTintColor: theme.colors.secondary, // Ancient
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Weaver',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="feather" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Archives',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
