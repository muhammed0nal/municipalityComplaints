import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import MunicipalityDashboard from "../screens/MunicipalityDashboard";
import MunicipalityProfile from "../screens/MunicipalityProfile";
import MunicipalityAnnouncements from "../screens/MunicipalityAnnouncements";

const Tab = createBottomTabNavigator();

export function MunicipalityTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Panel"
        component={MunicipalityDashboard}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Duyurular"
        component={MunicipalityAnnouncements}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="megaphone-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={MunicipalityProfile}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
