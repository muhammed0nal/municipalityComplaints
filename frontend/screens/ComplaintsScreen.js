import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Rating } from "react-native-ratings";
import { LinearGradient } from "expo-linear-gradient";

export default function Profile({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [existingRating, setExistingRating] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [existingComment, setExistingComment] = useState(null);
  const [isRatingLoading, setIsRatingLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  console.log(existingComment);
  console.log(existingRating);
  console.log(selectedComplaint);
  const animatedValues = {};
  complaints.forEach((complaint) => {
    if (!animatedValues[complaint.id]) {
      animatedValues[complaint.id] = new Animated.Value(1);
    }
  });

  const pressAnimation = (id) => {
    Animated.sequence([
      Animated.timing(animatedValues[id], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchComplaints = async () => {
    if (!userId) {
      console.error("Kullanıcı ID'si bulunamadı");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://bitirmetezibcknd.onrender.com/api/complaints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }),
        }
      );
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error("Şikayetler alınamadı: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  const getUserId = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    console.log("storedUserId", storedUserId);
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("Kullanıcı ID'si bulunamadı");
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComplaints().then(() => setRefreshing(false));
  }, [userId]);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchComplaints();
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (userId) {
        fetchComplaints();
      }
    });

    return unsubscribe;
  }, [navigation, userId]);

  useEffect(() => {
    const checkExistingRating = async () => {
      if (selectedComplaint) {
        setIsRatingLoading(true);
        try {
          const userId = await AsyncStorage.getItem("userId");
          const response = await fetch(
            `https://bitirmetezibcknd.onrender.com/api/municipality-rating?municipalityId=${selectedComplaint.municipality_id}&userId=${userId}&complaintId=${selectedComplaint.id}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data === null) {
              setExistingRating(null);
              setRating(0);
              setExistingComment(null);
              setComment("");
            } else {
              setExistingRating(data.rating);
              setRating(data.rating);
              setExistingComment(data.comment);
              setComment(data.comment || "");
            }
          } else {
            setExistingRating(null);
            setRating(0);
            setExistingComment(null);
            setComment("");
          }
        } catch (error) {
          console.error("Değerlendirme bilgisi alınamadı:", error);
          setExistingRating(null);
          setRating(0);
          setExistingComment(null);
          setComment("");
        } finally {
          setIsRatingLoading(false);
        }
      } else {
        setExistingRating(null);
        setRating(0);
        setExistingComment(null);
        setComment("");
        setIsRatingLoading(false);
      }
    };

    checkExistingRating();
  }, [selectedComplaint]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "devam ediyor":
        return "#3498db"; // Mavi
      case "tamamlandı":
        return "#2ecc71"; // Yeşil
      case "reddedildi":
        return "#e74c3c"; // Kırmızı
      case "beklemede":
        return "#f1c40f"; // Sarı
      case "iptal edildi":
        return "#95a5a6"; // Gri
      default:
        return "#95a5a6"; // Gri
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "devam ediyor":
        return "Devam Ediyor";
      case "tamamlandı":
        return "Tamamlandı";
      case "reddedildi":
        return "Reddedildi";
      case "beklemede":
        return "Beklemede";
      case "iptal edildi":
        return "İptal Edildi";
      default:
        return status || "Bilinmiyor";
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleDeleteComplaint = async () => {
    try {
      const response = await fetch(
        `https://bitirmetezibcknd.onrender.com/api/complaints/${selectedComplaint.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        Alert.alert("Başarılı", "Şikayet başarıyla silindi");
        setDeleteModalVisible(false);
        setModalVisible(false);
        fetchComplaints();
      } else {
        const error = await response.json();
        Alert.alert(
          "Hata",
          error.error || "Şikayet silinirken bir hata oluştu"
        );
      }
    } catch (error) {
      console.error("Şikayet silme hatası:", error);
      Alert.alert("Hata", "Şikayet silinirken bir hata oluştu");
    }
  };

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalVisible(true);
  };

  const handleSubmitRating = async () => {
    if (!rating) {
      Alert.alert("Hata", "Lütfen bir puan verin");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");
      const response = await fetch(
        "https://bitirmetezibcknd.onrender.com/api/rate-municipality",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            municipalityId: selectedComplaint.municipality_id,
            userId: userId,
            rating: rating,
            comment: comment.trim(),
            complaintId: selectedComplaint.id,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Başarılı", "Değerlendirmeniz kaydedildi");
        setExistingRating(rating);
        setExistingComment(comment.trim());
        setSelectedComplaint({ ...selectedComplaint });
      } else {
        const error = await response.json();
        Alert.alert("Hata", error.error || "Değerlendirme kaydedilemedi");
      }
    } catch (error) {
      console.error("Değerlendirme gönderme hatası:", error);
      Alert.alert("Hata", "Değerlendirme gönderilirken bir hata oluştu");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#2DD4BF", "#0EA5E9", "#6366F1"]}
        style={styles.gradientContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Şikayetlerim</Text>
          <Text style={styles.headerSubtitle}>
            Gönderdiğiniz şikayetleri takip edin
          </Text>
        </View>

        <View style={styles.complaintsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0EA5E9" />
              <Text style={styles.loadingText}>Şikayetler yükleniyor...</Text>
            </View>
          ) : (
            <FlatList
              data={complaints}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    pressAnimation(item.id);
                    setTimeout(() => {
                      openModal(item);
                    }, 150);
                  }}
                >
                  <Animated.View
                    style={[
                      styles.card,
                      {
                        transform: [{ scale: animatedValues[item.id] }],
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.municipalityName}>
                          {item.municipality_name || "Belediye"}
                        </Text>
                        <Text style={styles.dateText}>
                          {format(new Date(item.created_at), "dd MMMM yyyy", {
                            locale: tr,
                          })}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(item.status) },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {getStatusText(item.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.complaintText}>
                        {item.complaint_text}
                      </Text>
                    </View>

                    {item.feedback && (
                      <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackLabel}>Geri Bildirim:</Text>
                        <Text style={styles.feedbackText}>{item.feedback}</Text>
                      </View>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedComplaint && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalMunicipalityName}>
                      {selectedComplaint.municipality_name || "Belediye"}
                    </Text>
                    <Text style={styles.modalDate}>
                      {format(
                        new Date(selectedComplaint.created_at),
                        "dd MMMM yyyy",
                        {
                          locale: tr,
                        }
                      )}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(
                          selectedComplaint.status
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(selectedComplaint.status)}
                    </Text>
                  </View>
                </View>

                <ScrollView
                  style={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.modalComplaintText}>
                    {selectedComplaint.complaint_text}
                  </Text>

                  {selectedComplaint.feedback && (
                    <View style={styles.modalFeedbackSection}>
                      <Text style={styles.modalFeedbackTitle}>
                        Geri Bildirim
                      </Text>
                      <Text style={styles.modalFeedbackText}>
                        {selectedComplaint.feedback}
                      </Text>
                    </View>
                  )}

                  {selectedComplaint.status.toLowerCase() === "tamamlandı" ||
                  selectedComplaint.status === "İptal Edildi" ? (
                    <View style={styles.ratingSection}>
                      <Text style={styles.ratingTitle}>
                        {existingRating
                          ? "Değerlendirmeniz"
                          : "Belediyeyi Değerlendirin"}
                      </Text>

                      {isRatingLoading ? (
                        <View style={styles.ratingLoader}>
                          <ActivityIndicator size="large" color="#0EA5E9" />
                        </View>
                      ) : (
                        <>
                          <Rating
                            type="star"
                            ratingCount={5}
                            imageSize={30}
                            startingValue={existingRating || rating}
                            readonly={existingRating !== null}
                            onFinishRating={(rating) =>
                              !existingRating && setRating(rating)
                            }
                            style={styles.ratingStars}
                          />

                          {existingRating ? (
                            <>
                              <Text style={styles.ratingValue}>
                                Verdiğiniz Puan: {existingRating}/5
                              </Text>
                              {existingComment && (
                                <View style={styles.existingCommentContainer}>
                                  <Text style={styles.commentTitle}>
                                    Yorumunuz:
                                  </Text>
                                  <Text style={styles.existingComment}>
                                    {existingComment}
                                  </Text>
                                </View>
                              )}
                            </>
                          ) : (
                            <>
                              <TextInput
                                style={styles.commentInput}
                                multiline
                                numberOfLines={3}
                                value={comment}
                                onChangeText={setComment}
                                placeholder="Deneyiminizi paylaşın..."
                                placeholderTextColor="#94A3B8"
                              />
                              {(rating > 0 || comment.trim() !== "") && (
                                <TouchableOpacity
                                  style={styles.submitRatingButton}
                                  onPress={handleSubmitRating}
                                >
                                  <Text style={styles.submitRatingButtonText}>
                                    Değerlendir
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </View>
                  ) : null}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => setDeleteModalVisible(true)}
                  >
                    <Text style={styles.deleteButtonText}>Şikayeti Sil</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Kapat</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.confirmModalView}>
            <Text style={styles.confirmModalTitle}>Şikayeti Sil</Text>
            <Text style={styles.confirmModalText}>
              Bu şikayeti silmek istediğinize emin misiniz?
            </Text>
            <View style={styles.confirmModalButtons}>
              <Pressable
                style={[
                  styles.confirmModalButton,
                  styles.confirmModalButtonCancel,
                ]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.confirmModalButtonText}>İptal</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmModalButton,
                  styles.confirmModalButtonDelete,
                ]}
                onPress={handleDeleteComplaint}
              >
                <Text style={styles.confirmModalButtonText}>Sil</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  gradientContainer: {
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
  complaintsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 80,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
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
  cardBody: {
    marginBottom: 12,
  },
  complaintText: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  feedbackContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 12,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "center",
  },
  modalContent: {
    flexGrow: 1,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 10,
    marginBottom: 5,
  },
  modalText: {
    fontSize: 15,
    color: "#34495e",
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#2c3e50",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  ratingContainer: {
    marginTop: 15,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    paddingTop: 15,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  rateButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  rateButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 15,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  confirmModalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  confirmModalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#34495e",
  },
  confirmModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  confirmModalButton: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  confirmModalButtonCancel: {
    backgroundColor: "#95a5a6",
  },
  confirmModalButtonDelete: {
    backgroundColor: "#e74c3c",
  },
  confirmModalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  commentContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    paddingTop: 15,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#2c3e50",
    textAlignVertical: "top",
    minHeight: 80,
  },
  commentButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "center",
  },
  commentButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 10,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 15,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  existingComment: {
    fontSize: 14,
    color: "#34495e",
    backgroundColor: "#f5f6fa",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    minHeight: 80,
  },
  loaderContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "90%",
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
  modalScrollContent: {
    marginBottom: 16,
  },
  modalComplaintText: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
    marginBottom: 20,
  },
  modalFeedbackSection: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  modalFeedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalFeedbackText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  ratingSection: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  ratingLoader: {
    padding: 20,
    alignItems: "center",
  },
  ratingStars: {
    paddingVertical: 10,
  },
  existingCommentContainer: {
    marginTop: 16,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  existingComment: {
    fontSize: 15,
    color: "#334155",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ratingValue: {
    fontSize: 16,
    color: "#0F172A",
    textAlign: "center",
    marginTop: 10,
  },
  commentInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#0F172A",
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: 16,
  },
  submitRatingButton: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },
  submitRatingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
  },
  ratingHeaderContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
});
