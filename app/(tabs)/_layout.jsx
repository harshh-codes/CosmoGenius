import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#757575',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={focused ? '#000000' : '#757575'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="foryou"
        options={{
          tabBarLabel: 'ToDo List',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'list-circle' : 'list-circle-outline'}
              size={24}
              color={focused ? '#000000' : '#757575'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: 'Routine Generator',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline'}
              size={24}
              color={focused ? '#000000' : '#757575'}
            />
          )
        }}
      />
    </Tabs>
  );
}