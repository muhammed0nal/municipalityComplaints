import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Home from "../screens/Home";
import ComplaintsScreen from "../screens/ComplaintsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MunicipalitiesScreen from "../screens/MunicipalitiesScreen";

const Tab = createBottomTabNavigator();

export function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
        contentStyle: {
          paddingBottom: 90,
        },
        tabBarActiveTintColor: "#2DD4BF",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
          marginTop: 4,
        },
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Şikayetlerim"
        component={ComplaintsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Belediyeler"
        component={MunicipalitiesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
