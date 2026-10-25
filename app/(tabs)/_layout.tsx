import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007F78',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + bottomInset,
            paddingBottom: Math.max(bottomInset, 8),
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-group-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <Icon source="trophy-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="academy"
        options={{
          title: 'Academy',
          tabBarIcon: ({ color, size }) => (
            <Icon source="school-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: 65,
    paddingTop: 5,
    paddingBottom: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: -4,
  },
});
