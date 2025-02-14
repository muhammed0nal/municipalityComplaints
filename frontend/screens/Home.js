import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function Home({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [supportedComplaints, setSupportedComplaints] = useState(new Set());
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [complaintRating, setComplaintRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Kullanıcı ID'sini AsyncStorage'dan çekme fonksiyonu
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        console.log("Kullanıcı ID'si bulunamadı");
      }
    } catch (error) {
      console.error("getUserId hatası:", error);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://bitirmetezibcknd.onrender.com/api/complaints/all"
      );
      const data = await response.json();

      // Mevcut kullanıcının şikayetlerini filtrele
      const otherUsersComplaints = data.filter(
        (complaint) => complaint.user_id !== parseInt(userId)
      );

      setComplaints(otherUsersComplaints);
    } catch (error) {
      console.error("Şikayetler getirilirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSupport = async (complaintId) => {
    try {
      const endpoint = supportedComplaints.has(complaintId)
        ? "unsupport"
        : "support";
      const response = await fetch(
        `https://bitirmetezibcknd.onrender.com/api/complaints/${complaintId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        setSupportedComplaints((prev) => {
          const newSet = new Set(prev);
          if (endpoint === "support") {
            newSet.add(complaintId);
          } else {
            newSet.delete(complaintId);
          }
          return newSet;
        });

        // Şikayetleri yenile
        const updatedComplaints = await fetch(
          "https://bitirmetezibcknd.onrender.com/api/complaints/all"
        );
        const data = await updatedComplaints.json();
        const otherUsersComplaints = data.filter(
          (complaint) => complaint.user_id !== parseInt(userId)
        );
        setComplaints(otherUsersComplaints);

        // Seçili şikayeti güncelle
        if (selectedComplaint) {
          const updatedComplaint = otherUsersComplaints.find(
            (c) => c.id === selectedComplaint.id
          );
          setSelectedComplaint(updatedComplaint);
        }
      }
    } catch (error) {
      console.error("Destek işlemi sırasında hata:", error);
    }
  };

  // Yenileme işlemi
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (userId) {
      await Promise.all([fetchComplaints(), fetchUserSupports()]);
    }
    setRefreshing(false);
  }, [userId]);

  // Kullanıcının desteklediği şikayetleri getir
  const fetchUserSupports = async () => {
    try {
      const response = await fetch(
        `https://bitirmetezibcknd.onrender.com/api/user-supports/${userId}`
      );
      const supportedIds = await response.json();
      setSupportedComplaints(new Set(supportedIds));
    } catch (error) {
      console.error("Desteklenen şikayetler getirilirken hata:", error);
    }
  };

  useEffect(() => {
    getUserId(); // Kullanıcı ID'sini al
  }, []);

  // userId değiştiğinde şikayetleri getir
  useEffect(() => {
    if (userId) {
      fetchComplaints();
      fetchUserSupports(); // Kullanıcının desteklediği şikayetleri getir
    }
  }, [userId]);

  // selectedComplaint değiştiğinde rating bilgisini çekelim
  useEffect(() => {
    if (selectedComplaint && userId) {
      fetchComplaintRating();
    } else {
      setComplaintRating(null);
    }
  }, [selectedComplaint, userId]);

  // Rating bilgisini çeken fonksiyon
  const fetchComplaintRating = async () => {
    if (!selectedComplaint?.id) {
      return;
    }

    try {
      setRatingLoading(true);
      const response = await fetch(
        `https://bitirmetezibcknd.onrender.com/api/complaint-rating/${selectedComplaint.id}`
      );

      const data = await response.json();

      if (data && data.rating) {
        setComplaintRating(data);
      } else {
        setComplaintRating(null);
      }
    } catch (error) {
      console.error("Değerlendirme bilgisi alınırken hata:", error);
      setComplaintRating(null);
    } finally {
      setRatingLoading(false);
    }
  };

  // Şikayet kartı bileşeni
  const renderComplaintCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedComplaint(item)}
      style={styles.complaintCard}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.municipalityName}>{item.municipality_name}</Text>
          <Text style={styles.dateText}>
            {format(new Date(item.created_at), "dd MMMM yyyy", { locale: tr })}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "Tamamlandı"
                  ? "#4CAF50"
                  : item.status === "İptal Edildi"
                  ? "#F44336"
                  : item.status === "İşleme Alındı"
                  ? "#2196F3"
                  : "#FFC107", // Beklemede durumu için
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.complaintText}>{item.complaint_text}</Text>
      </View>
      <View style={styles.supportSection}>
        <Text style={styles.supportCount}>
          {item.support_count || 0} Destek
        </Text>
        {!["Tamamlandı", "İptal Edildi"].includes(item.status) && (
          <TouchableOpacity
            style={[
              styles.supportButton,
              supportedComplaints.has(item.id) && styles.unsupportButton,
            ]}
            onPress={() => toggleSupport(item.id)}
          >
            <Text style={styles.supportButtonText}>
              {supportedComplaints.has(item.id)
                ? "Desteği Geri Çek"
                : "Destek Ver"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  // Şikayetleri filtreleme fonksiyonu
  const getFilteredComplaints = () => {
    switch (activeFilter) {
      case "ongoing":
        return complaints.filter((complaint) =>
          ["Beklemede", "İşleme Alındı"].includes(complaint.status)
        );
      case "completed":
        return complaints.filter((complaint) =>
          ["Tamamlandı", "İptal Edildi"].includes(complaint.status)
        );
      default:
        return complaints;
    }
  };

  // Filtre butonları bileşeni
  const FilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "all" && styles.activeFilterButton,
        ]}
        onPress={() => setActiveFilter("all")}
      >
        <MaterialIcons
          name="list-alt"
          size={18}
          color={activeFilter === "all" ? "#0EA5E9" : "#64748B"}
          style={styles.filterIcon}
        />
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === "all" && styles.activeFilterText,
          ]}
        >
          Tümü
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "ongoing" && styles.activeFilterButton,
        ]}
        onPress={() => setActiveFilter("ongoing")}
      >
        <MaterialIcons
          name="pending-actions"
          size={18}
          color={activeFilter === "ongoing" ? "#0EA5E9" : "#64748B"}
          style={styles.filterIcon}
        />
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === "ongoing" && styles.activeFilterText,
          ]}
        >
          Devam Eden
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "completed" && styles.activeFilterButton,
        ]}
        onPress={() => setActiveFilter("completed")}
      >
        <MaterialIcons
          name="check-circle-outline"
          size={18}
          color={activeFilter === "completed" ? "#0EA5E9" : "#64748B"}
          style={styles.filterIcon}
        />
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === "completed" && styles.activeFilterText,
          ]}
        >
          Biten
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Modal'ı kapatma fonksiyonunu güncelleyelim
  const closeModal = () => {
    setSelectedComplaint(null);
    setComplaintRating(null); // Modal kapandığında rating'i sıfırla
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#2DD4BF", "#0EA5E9", "#6366F1"]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Şikayetler</Text>
          <Text style={styles.headerSubtitle}>
            Şikayetlerinizi kolayca bildirebilirsiniz
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createComplaintCard}
          onPress={() => navigation.navigate("ComplaintScreen")}
        >
          <MaterialIcons name="add-circle-outline" size={40} color="#4c669f" />
          <Text style={styles.cardTitle}>Şikayet Ekle</Text>
        </TouchableOpacity>

        <View style={styles.complaintsContainer}>
          <Text style={styles.complaintsTitle}>
            Diğer Kullanıcıların Şikayetleri
          </Text>

          <FilterButtons />

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#4c669f" />
              <Text style={styles.loaderText}>Şikayetler yükleniyor...</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredComplaints()}
              renderItem={renderComplaintCard}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
      </LinearGradient>

      <Modal
        transparent={true}
        visible={selectedComplaint !== null}
        onRequestClose={closeModal}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalMunicipalityName}>
                    {selectedComplaint?.municipality_name}
                  </Text>
                  <Text style={styles.modalDate}>
                    {selectedComplaint &&
                      format(
                        new Date(selectedComplaint.created_at),
                        "dd MMMM yyyy",
                        {
                          locale: tr,
                        }
                      )}
                  </Text>
                </View>
                {selectedComplaint && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          selectedComplaint.status === "Tamamlandı"
                            ? "#4CAF50"
                            : selectedComplaint.status === "İptal Edildi"
                            ? "#F44336"
                            : selectedComplaint.status === "İşleme Alındı"
                            ? "#2196F3"
                            : "#FFC107",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {selectedComplaint.status}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.modalComplaintText}>
                {selectedComplaint?.complaint_text}
              </Text>

              {selectedComplaint?.status === "Tamamlandı" ||
              selectedComplaint?.status === "İptal Edildi" ? (
                <View style={styles.ratingSection}>
                  {ratingLoading ? (
                    <View style={styles.ratingLoader}>
                      <ActivityIndicator size="small" color="#4c669f" />
                      <Text style={styles.ratingLoaderText}>
                        Değerlendirme yükleniyor...
                      </Text>
                    </View>
                  ) : complaintRating ? (
                    <>
                      <View style={styles.ratingHeader}>
                        <Text style={styles.ratingTitle}>Değerlendirme</Text>
                        <View style={styles.ratingBadge}>
                          <Text style={styles.ratingText}>
                            {complaintRating.rating}/5
                          </Text>
                        </View>
                      </View>
                      {complaintRating.comment && (
                        <Text style={styles.ratingComment}>
                          {complaintRating.comment}
                        </Text>
                      )}
                      <Text style={styles.ratingDate}>
                        {format(
                          new Date(complaintRating.created_at),
                          "dd MMMM yyyy",
                          { locale: tr }
                        )}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.noRatingText}>
                      Bu şikayet için henüz değerlendirme yapılmamış.
                    </Text>
                  )}
                </View>
              ) : null}

              <View style={styles.modalSupportSection}>
                <Text style={styles.supportCount}>
                  {selectedComplaint?.support_count || 0} Destek
                </Text>
                {selectedComplaint &&
                  !["Tamamlandı", "İptal Edildi"].includes(
                    selectedComplaint.status
                  ) && (
                    <TouchableOpacity
                      style={[
                        styles.supportButton,
                        supportedComplaints.has(selectedComplaint.id) &&
                          styles.unsupportButton,
                      ]}
                      onPress={() => toggleSupport(selectedComplaint.id)}
                    >
                      <Text style={styles.supportButtonText}>
                        {supportedComplaints.has(selectedComplaint.id)
                          ? "Desteği Geri Çek"
                          : "Destek Ver"}
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
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
  createComplaintCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 12,
  },
  complaintsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 80,
  },
  complaintsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  complaintCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  municipalityName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
  },
  complaintText: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  supportSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 12,
  },
  supportCount: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  supportButton: {
    backgroundColor: "#2DD4BF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  unsupportButton: {
    backgroundColor: "#FB7185",
  },
  supportButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    width: "100%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalMunicipalityName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalDate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  modalComplaintText: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
    marginBottom: 24,
  },
  modalSupportSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  closeButton: {
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  closeButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loaderText: {
    color: "#4c669f",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeFilterButton: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#0EA5E9",
  },
  filterIcon: {
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  ratingSection: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ratingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  ratingBadge: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  ratingComment: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 12,
  },
  ratingDate: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
    fontWeight: "500",
  },
  ratingLoader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  ratingLoaderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  noRatingText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    paddingVertical: 12,
  },
});
