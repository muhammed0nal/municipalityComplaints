import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  Pressable,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function MunicipalityDashboard({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [feedback, setFeedback] = useState(""); // Geri bildirim için yeni state
  const [refreshing, setRefreshing] = useState(false);
  const [complaintRating, setComplaintRating] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Durum seçeneklerini sabit olarak tanımlayalım
  const statusOptions = [
    "Beklemede",
    "İşleme Alındı",
    "Tamamlandı",
    "İptal Edildi",
  ];

  // Belediye şikayetlerini al
  const fetchComplaints = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Hata", "Giriş yapmanız gerekiyor!");
        navigation.replace("LoginScreen");
        return;
      }

      const response = await axios.get(
        `https://bitirmetezibcknd.onrender.com/api/municipality-complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setComplaints(response.data);
      } else {
        Alert.alert("Hata", "Şikayetler alınamadı.");
      }
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
      Alert.alert("Hata", "Şikayetler alınamadı.");
    } finally {
      console.log("Complaints:", complaints);
      setLoading(false);
    }
  };

  // Şikayet durumu güncelleme
  const updateComplaintStatus = async () => {
    setIsUpdating(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Hata", "Giriş yapmanız gerekiyor!");
        navigation.replace("LoginScreen");
        return;
      }

      const response = await axios.put(
        `https://bitirmetezibcknd.onrender.com/api/complaints/${selectedComplaint.id}`,
        { status: newStatus, feedback },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setIsModalVisible(false);
        fetchComplaints();
      } else {
        Alert.alert("Hata", "Şikayet durumu güncellenemedi.");
      }
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
      Alert.alert("Hata", "Şikayet durumu güncellenemedi.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Şikayet değerlendirmesini getir
  const fetchComplaintRating = async (complaintId) => {
    try {
      const response = await axios.get(
        `https://bitirmetezibcknd.onrender.com/api/complaint-rating/${complaintId}`
      );
      console.log(response.data);
      setComplaintRating(response.data);
    } catch (error) {
      console.error("Değerlendirme getirme hatası:", error);
    }
  };

  const handleComplaintPress = async (item) => {
    setSelectedComplaint(item);
    setNewStatus(item.status);
    setFeedback(item.feedback || "");
    await fetchComplaintRating(item.id); // Değerlendirmeyi getir
    setIsModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userType"); // Belediye tipi sil
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }], // Login ekranına yönlendir
      });
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComplaints().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const renderComplaintItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.complaintContainer,
        pressed && styles.complaintPressed,
      ]}
      onPress={() => handleComplaintPress(item)}
      android_ripple={{ color: "#E2E8F0" }}
    >
      <View style={styles.complaintHeader}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "Beklemede"
                  ? "#FFC107"
                  : item.status === "İşleme Alındı"
                  ? "#2196F3"
                  : item.status === "Tamamlandı"
                  ? "#4CAF50"
                  : "#FF5722",
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.complaintDate}>
          {new Date(item.created_at).toLocaleDateString("tr-TR")}
        </Text>
      </View>
      <Text style={styles.complaintText}>{item.complaint_text}</Text>

      <View style={styles.supportContainer}>
        <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
        <Text style={styles.supportText}>{item.support_count || 0} Destek</Text>
      </View>

      {item.feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Belediye Yanıtı:</Text>
          <Text style={styles.feedbackText}>{item.feedback}</Text>
        </View>
      )}
    </Pressable>
  );

  const renderModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Şikayet Detayları</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.complaintDetails}>
              <Text style={styles.detailLabel}>Şikayet:</Text>
              <Text style={styles.detailText}>
                {selectedComplaint?.complaint_text}
              </Text>

              <Text style={styles.detailLabel}>Tarih:</Text>
              <Text style={styles.detailText}>
                {new Date(selectedComplaint?.created_at).toLocaleDateString(
                  "tr-TR"
                )}
              </Text>

              <Text style={styles.detailLabel}>Toplam Destek:</Text>
              <View style={styles.modalSupportContainer}>
                <Ionicons name="thumbs-up-outline" size={18} color="#4B5563" />
                <Text style={styles.modalSupportText}>
                  {selectedComplaint?.support_count || 0} Destek
                </Text>
              </View>

              {selectedComplaint?.feedback && (
                <>
                  <Text style={styles.detailLabel}>Önceki Geri Bildirim:</Text>
                  <Text style={styles.detailText}>
                    {selectedComplaint.feedback}
                  </Text>
                </>
              )}

              {(selectedComplaint?.status === "Tamamlandı" ||
                selectedComplaint?.status === "İptal Edildi") &&
                complaintRating && (
                  <View style={styles.ratingSection}>
                    <Text style={styles.detailLabel}>
                      Vatandaş Değerlendirmesi:
                    </Text>
                    <View style={styles.ratingContainer}>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={
                              star <= complaintRating.rating
                                ? "star"
                                : "star-outline"
                            }
                            size={20}
                            color="#FFD700"
                          />
                        ))}
                      </View>
                      <Text style={styles.ratingDate}>
                        {new Date(
                          complaintRating.created_at
                        ).toLocaleDateString("tr-TR")}
                      </Text>
                    </View>
                    {complaintRating.comment && (
                      <Text style={styles.ratingComment}>
                        "{complaintRating.comment}"
                      </Text>
                    )}
                  </View>
                )}
            </View>

            <Text style={styles.modalLabel}>Durum</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newStatus}
                onValueChange={(itemValue) => setNewStatus(itemValue)}
                style={styles.picker}
              >
                {statusOptions.map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Geri Bildirim</Text>
            <TextInput
              style={[styles.modalInput, styles.feedbackInput]}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Geri bildirim yazın"
              multiline={true}
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[
                styles.updateButton,
                isUpdating && styles.updateButtonDisabled,
              ]}
              onPress={updateComplaintStatus}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.updateButtonText}>Güncelle</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Belediye Paneli</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={complaints}
          renderItem={renderComplaintItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.complaintList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        />
      )}

      {renderModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0F2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
  },
  logoutButton: {
    padding: 8,
  },
  complaintList: {
    padding: 15,
  },
  complaintContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    transform: [{ scale: 1 }],
    transition: "transform 0.2s",
  },
  complaintPressed: {
    backgroundColor: "#F8FAFC",
    transform: [{ scale: 0.98 }],
    elevation: 2,
    shadowOpacity: 0.05,
  },
  complaintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  complaintDate: {
    color: "#6B7280",
    fontSize: 13,
  },
  complaintText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: Platform.OS === "ios" ? "85%" : "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    marginBottom: 18,
  },
  feedbackInput: {
    height: 160,
    textAlignVertical: "top",
  },
  updateButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  pickerContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginBottom: 18,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  complaintDetails: {
    backgroundColor: "#F9FAFB",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  detailText: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  feedbackContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  feedbackText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  supportContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  supportText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  modalSupportContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  modalSupportText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#4B5563",
    fontWeight: "500",
  },
  ratingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 6,
  },
  ratingDate: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  ratingComment: {
    fontSize: 15,
    color: "#4B5563",
    fontStyle: "italic",
    marginTop: 10,
    lineHeight: 24,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    letterSpacing: 0.2,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
});
