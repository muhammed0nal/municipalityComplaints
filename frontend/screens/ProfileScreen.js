import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

export default function Profile({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const shouldFetchData = () => {
        // Eğer hiç veri çekilmemişse veya son çekilmeden bu yana 5 dakika geçmişse
        if (!lastFetchTime || !userProfile) return true;
        const fiveMinutes = 5 * 60 * 1000; // 5 dakika milisaniye cinsinden
        return Date.now() - lastFetchTime > fiveMinutes;
      };

      if (shouldFetchData()) {
        fetchUserProfile();
      }
    }, [lastFetchTime, userProfile])
  );

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `https://bitirmetezibcknd.onrender.com/api/user-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserProfile(response.data);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error("Profil bilgileri alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userType");
    await AsyncStorage.removeItem("userToken");
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserProfile().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["#2DD4BF", "#0EA5E9", "#6366F1"]}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profilim</Text>
            <Text style={styles.headerSubtitle}>
              Hesap bilgileriniz ve istatistikler
            </Text>
          </View>

          <View style={[styles.contentContainer, styles.loaderWrapper]}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.loaderText}>Profil yükleniyor...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#2DD4BF", "#0EA5E9", "#6366F1"]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profilim</Text>
          <Text style={styles.headerSubtitle}>
            Hesap bilgileriniz ve istatistikler
          </Text>
        </View>

        <ScrollView
          style={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0EA5E9"
              colors={["#0EA5E9"]}
            />
          }
        >
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userProfile?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.username}>{userProfile?.username}</Text>
                <Text style={styles.email}>{userProfile?.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Şikayet İstatistikleri</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {userProfile?.statistics.totalComplaints || 0}
                </Text>
                <Text style={styles.statLabel}>Toplam Şikayet</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {userProfile?.statistics.activeComplaints || 0}
                </Text>
                <Text style={styles.statLabel}>Aktif Şikayet</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {userProfile?.statistics.completedComplaints || 0}
                </Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.3,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 80,
  },
  profileCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#64748B",
  },
  statsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0EA5E9",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#FB7185",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    marginTop: "auto",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    color: "#64748B",
    fontSize: 16,
    marginTop: 12,
  },
});
