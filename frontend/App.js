import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

// Screens
import LoginScreen from "./screens/LoginScreen";
import MunicipalityLoginScreen from "./screens/MunicipalityLoginScreen";
import UserRegisterScreen from "./screens/UserRegisterScreen";
import ComplaintScreen from "./screens/ComplaintScreen";
import ComplaintsScreen from "./screens/ComplaintsScreen";

// Navigation
import { UserTabs } from "./navigation/UserTabs";
import { MunicipalityTabs } from "./navigation/MunicipalityTabs";

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem("userType");
        setUserType(storedUserType);
      } catch (error) {
        console.error("AsyncStorage Hatası:", error);
      } finally {
        setLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    checkUserType();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="UserRegister" component={UserRegisterScreen} />
        <Stack.Screen
          name="MunicipalityLoginScreen"
          component={MunicipalityLoginScreen}
        />
        <Stack.Screen name="ComplaintScreen" component={ComplaintScreen} />
        <Stack.Screen name="ComplaintsScreen" component={ComplaintsScreen} />
        <Stack.Screen name="Tab" component={UserTabs} />
        <Stack.Screen name="MunicipalityTabs" component={MunicipalityTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
