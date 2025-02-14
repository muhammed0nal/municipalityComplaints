import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function MunicipalityLoginScreen({ navigation }) {
  const [municipalityId, setMunicipalityId] = useState("");
  const [password, setPassword] = useState("");

  const handleMunicipalityLogin = async () => {
    if (municipalityId === "" || password === "") {
      Alert.alert("Hata", "Belediye ID ve şifre gereklidir!");
    } else {
      try {
        const response = await axios.post(
          `https://bitirmetezibcknd.onrender.com/municipality-login`,
          { municipality_id: municipalityId, password },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const token = response.data.token;
          const municipalityId = response.data.municipality_id;

          await AsyncStorage.setItem("userType", "municipality");
          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem(
            "municipalityId",
            municipalityId.toString()
          );

          navigation.replace("MunicipalityTabs");
        }
      } catch (error) {
        if (error.response) {
          const errorMessage =
            error.response.data.error || "Bir şeyler yanlış gitti!";
          Alert.alert("Hata", errorMessage);
        } else {
          Alert.alert("Hata", "Bir şeyler yanlış gitti!");
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#1a237e", "#283593", "#303f9f"]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="office-building"
              size={80}
              color="white"
            />
            <Text style={styles.logoText}>Belediye Yönetim Paneli</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Belediye Girişi</Text>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="office-building-marker"
                size={24}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Belediye ID"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                value={municipalityId}
                onChangeText={setMunicipalityId}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={24}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                placeholderTextColor="#666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleMunicipalityLogin}
            >
              <LinearGradient
                colors={["#303f9f", "#1a237e"]}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Giriş Yap</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonBack}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>Kullanıcı Girişine Dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  card: {
    width: width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 55,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#2c3e50",
  },
  button: {
    width: "100%",
    height: 55,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonBack: {
    marginTop: 10,
  },
  backText: {
    color: "#303f9f",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
});
