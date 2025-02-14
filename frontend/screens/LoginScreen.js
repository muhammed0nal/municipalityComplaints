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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Hata", "E-posta ve şifre gereklidir!");
    } else {
      try {
        const response = await axios.post(
          `https://bitirmetezibcknd.onrender.com/login`,
          { email, password },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const { token, userId, username } = response.data;

          await AsyncStorage.setItem("userType", "user");
          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("userId", userId.toString());
          await AsyncStorage.setItem("userInfo", JSON.stringify({ username }));

          navigation.replace("Tab");
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
        colors={["#000000", "#121212", "#000000"]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="city" size={80} color="white" />
            <Text style={styles.logoText}>
              Belediye Şikayet ve Geri Bildirimi
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Hoş Geldiniz</Text>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={24}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
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

            <TouchableOpacity style={styles.buttonUser} onPress={handleLogin}>
              <LinearGradient
                colors={["#3498db", "#2980b9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={[styles.buttonText, { opacity: 1 }]}>
                  Kullanıcı Girişi
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonMunicipality}
              onPress={() => navigation.navigate("MunicipalityLoginScreen")}
            >
              <LinearGradient
                colors={["#e74c3c", "#c0392b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={[styles.buttonText, { opacity: 1 }]}>
                  Belediye Girişi
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonRegister}
              onPress={() => navigation.navigate("UserRegister")}
            >
              <Text style={styles.registerText}>
                Hesabınız yok mu? Kayıt Olun
              </Text>
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
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "600",
    marginTop: 15,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputIcon: {
    marginRight: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#ffffff",
  },
  buttonUser: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonMunicipality: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    opacity: 1,
  },
  registerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 25,
  },
});
