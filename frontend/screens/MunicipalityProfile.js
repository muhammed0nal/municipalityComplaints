import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

export default function MunicipalityProfileScreen({ navigation }) {
  const [municipalityData, setMunicipalityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMunicipalityData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          Alert.alert("Hata", "Giriş yapmanız gerekiyor!");
          navigation.replace("LoginScreen");
          return;
        }

        // Backend'den belediye bilgilerini al
        const response = await axios.get(
          `https://bitirmetezibcknd.onrender.com/api/municipality-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          setMunicipalityData(response.data);
        } else {
          Alert.alert("Hata", "Belediye bilgileri alınamadı.");
        }
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
        Alert.alert("Hata", "Belediye bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchMunicipalityData();
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Tüm AsyncStorage verilerini temizle
      navigation.replace("LoginScreen"); // Kullanıcıyı giriş ekranına yönlendir
    } catch (error) {
      console.error("Çıkış hatası:", error);
      Alert.alert("Hata", "Çıkış yapılamadı. Lütfen tekrar deneyin.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Belediye Profili</Text>
      </View>

      {municipalityData ? (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={24} color="#4c669f" />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Belediye Adı</Text>
                <Text style={styles.value}>{municipalityData.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="location" size={24} color="#4c669f" />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Konum</Text>
                <Text style={styles.value}>{municipalityData.location}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="star" size={24} color="#4c669f" />
              <View style={styles.infoContent}>
                <Text style={styles.label}>Değerlendirme</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingValue}>
                    {municipalityData.averageRating
                      ? Number(municipalityData.averageRating).toFixed(1)
                      : "0.0"}
                  </Text>
                  <Text style={styles.ratingCount}>
                    ({municipalityData.totalRatings || 0} değerlendirme)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.errorText}>Belediye bilgileri yüklenemedi.</Text>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LinearGradient
          colors={["#FF6B6B", "#FF3B30"]}
          style={styles.logoutGradient}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#fff"
            style={styles.logoutIcon}
          />
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardContent: {
    padding: 25,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    fontSize: 18,
    color: "#2C3E50",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: 15,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: "auto",
    marginBottom: 30,
    borderRadius: 15,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 18,
    color: "#2C3E50",
    fontWeight: "600",
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
});
