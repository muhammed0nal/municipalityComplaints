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
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function UserRegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUserRegister = async () => {
    if (
      username === "" ||
      email === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    } else if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler uyuşmuyor!");
    } else {
      try {
        const response = await axios.post(
          `https://bitirmetezibcknd.onrender.com/register`,
          {
            username,
            email,
            password,
          }
        );

        if (response.status === 200) {
          navigation.goBack();
        } else {
          Alert.alert("Hata", response.data.error);
        }
      } catch (error) {
        Alert.alert("Hata", "Bir şeyler yanlış gitti! Lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#f8f9fa", "#e9ecef", "#dee2e6"]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="account-plus"
              size={80}
              color="#333"
            />
            <Text style={styles.logoText}>Yeni Hesap Oluştur</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Kayıt Ol</Text>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="account-outline"
                size={24}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı Adı"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
              />
            </View>

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
                placeholderTextColor="#666"
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

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={24}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Şifre Tekrar"
                placeholderTextColor="#666"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonBackground]}
              onPress={handleUserRegister}
            >
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginText}>
                Zaten hesabınız var mı? Giriş Yapın
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    color: "#333",
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  card: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
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
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: "100%",
    height: 55,
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonBackground: {
    backgroundColor: "#2c3e50",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginText: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "600",
  },
});
