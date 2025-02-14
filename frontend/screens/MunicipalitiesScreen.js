import { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

const StarRating = ({ rating }) => {
  const stars = [];
  const size = 20;
  const color = "#FFD700";

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <FontAwesome
        key={i}
        name={i <= rating ? "star" : "star-o"}
        size={size}
        color={color}
        style={{ marginRight: 2 }}
      />
    );
  }

  return <View style={{ flexDirection: "row" }}>{stars}</View>;
};

const DetailModal = ({ visible, municipality, onClose, navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcementsModalVisible, setAnnouncementsModalVisible] =
    useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  useEffect(() => {
    if (municipality?.id) {
      fetchComplaints();
    }
  }, [municipality]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://bitirmetezibcknd.onrender.com/api/municipality-completed-complaints/${municipality.id}`
      );
      setComplaints(response.data);
    } catch (error) {
      console.error("Şikayetler yüklenirken hata:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  }, [municipality]);

  const fetchAnnouncements = async () => {
    if (!municipality?.id) return;

    setLoadingAnnouncements(true);
    try {
      const response = await axios.get(
        `https://bitirmetezibcknd.onrender.com/api/announcements/${municipality.id}`
      );
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Duyurular yüklenirken hata:", error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {initialLoading ? (
            <View style={styles.initialLoaderContainer}>
              <ActivityIndicator size="large" color="#4c669f" />
              <Text style={styles.loaderText}>Yükleniyor...</Text>
            </View>
          ) : (
            <>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{municipality?.name}</Text>
                  <Text style={styles.modalLocation}>
                    {municipality?.city} {municipality?.district}
                  </Text>
                  <Text style={styles.modalAddress}>
                    {municipality?.location}
                  </Text>
                </View>
                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    style={styles.addComplaintButton}
                    onPress={() => {
                      onClose();
                      navigation.navigate("ComplaintScreen", {
                        selectedMunicipalityId: municipality?.id,
                        selectedMunicipalityName: municipality?.name,
                      });
                    }}
                  >
                    <FontAwesome name="plus" size={16} color="#fff" />
                    <Text style={styles.addComplaintButtonText}>
                      Şikayet Ekle
                    </Text>
                  </TouchableOpacity>

                  <Pressable onPress={onClose} style={{ marginLeft: 12 }}>
                    <FontAwesome name="close" size={24} color="#666" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.detailRatingContainer}>
                <StarRating rating={municipality?.average_rating || 0} />
                <Text style={styles.detailRatingText}>
                  {municipality?.average_rating
                    ? `${municipality.average_rating.toFixed(1)} (${
                        municipality.total_ratings
                      } değerlendirme)`
                    : "Değerlendirme yok"}
                </Text>
              </View>

              <Text style={styles.complaintsTitle}>Tamamlanan Şikayetler</Text>

              <View style={styles.complaintsListContainer}>
                {loading ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4c669f" />
                    <Text style={styles.loaderText}>
                      Şikayetler yükleniyor...
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={complaints}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.complaintCard}>
                        <View style={styles.complaintHeader}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  item.status === "Tamamlandı"
                                    ? "#4CAF50"
                                    : item.status === "İptal Edildi"
                                    ? "#F44336"
                                    : "#FFC107",
                              },
                            ]}
                          >
                            <Text style={styles.statusText}>
                              {item.status === "tamamlandı" ? "✅ " : ""}
                              {item.status.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.complaintDate}>
                            {formatDate(item.created_at)}
                          </Text>
                        </View>
                        <Text style={styles.complaintText}>
                          {item.complaint_text}
                        </Text>
                        {item.feedback && (
                          <View style={styles.feedbackContainer}>
                            <Text style={styles.feedbackLabel}>
                              Belediye Yanıtı:
                            </Text>
                            <Text style={styles.feedbackText}>
                              {item.feedback}
                            </Text>
                          </View>
                        )}
                        {item.rating && (
                          <View style={styles.ratingContainer}>
                            <View style={styles.ratingHeader}>
                              <Text style={styles.ratingTitle}>
                                Değerlendirme
                              </Text>
                              <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>
                                  {item.rating}/5
                                </Text>
                              </View>
                            </View>
                            {item.rating_comment && (
                              <Text style={styles.ratingComment}>
                                {item.rating_comment}
                              </Text>
                            )}
                          </View>
                        )}
                        <View style={styles.complaintFooter}>
                          <Text style={styles.supportCount}>
                            <FontAwesome
                              name="thumbs-up"
                              size={14}
                              color="#666"
                            />{" "}
                            {item.support_count}
                          </Text>
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>
                        Henüz tamamlanmış şikayet bulunmuyor.
                      </Text>
                    }
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    }
                  />
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Kapat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.announcementsButton}
                  onPress={() => {
                    fetchAnnouncements();
                    setAnnouncementsModalVisible(true);
                  }}
                >
                  <FontAwesome name="bullhorn" size={16} color="#fff" />
                  <Text style={styles.announcementsButtonText}>Duyurular</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={announcementsModalVisible}
        onRequestClose={() => setAnnouncementsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Belediye Duyuruları</Text>
              <Pressable
                onPress={() => setAnnouncementsModalVisible(false)}
                style={{ padding: 8 }}
              >
                <FontAwesome name="close" size={24} color="#666" />
              </Pressable>
            </View>

            {loadingAnnouncements ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4c669f" />
                <Text style={styles.loaderText}>Duyurular yükleniyor...</Text>
              </View>
            ) : (
              <FlatList
                data={announcements}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.announcementCard}>
                    <Text style={styles.announcementTitle}>{item.title}</Text>
                    <Text style={styles.announcementContent}>
                      {item.content}
                    </Text>
                    <Text style={styles.announcementDate}>
                      {new Date(item.created_at).toLocaleDateString("tr-TR")}
                    </Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Henüz duyuru bulunmuyor.</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const MunicipalitiesScreen = ({ navigation }) => {
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMunicipalities();
  }, []);

  const fetchMunicipalities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://bitirmetezibcknd.onrender.com/api/municipalities`
      );
      const processedData = response.data.map((item) => ({
        ...item,
        average_rating: item.average_rating ? Number(item.average_rating) : 0,
      }));
      setMunicipalities(processedData);
    } catch (error) {
      console.error("Belediyeler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMunicipality = ({ item }) => {
    const rating = item.average_rating ? Number(item.average_rating) : 0;
    const totalRatings = item.total_ratings || 0;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedMunicipality(item);
          setDetailModalVisible(true);
        }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.dateText}>
              {item.city} {item.district}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.ratingContainer}>
            <StarRating rating={rating} />
            <Text style={styles.ratingText2}>
              {rating
                ? `${rating.toFixed(1)} (${totalRatings} değerlendirme)`
                : "Değerlendirme yok"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMunicipalities();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#2DD4BF", "#0EA5E9", "#6366F1"]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Belediyeler</Text>
          <Text style={styles.headerSubtitle}>
            Belediyelerin performansını değerlendirin
          </Text>
        </View>

        <View style={styles.contentContainer}>
          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#4c669f" />
              <Text style={styles.loaderText}>Belediyeler yükleniyor...</Text>
            </View>
          ) : (
            <FlatList
              data={municipalities}
              renderItem={renderMunicipality}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#4c669f"]}
                  tintColor="#4c669f"
                />
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>Henüz belediye bulunmuyor.</Text>
              }
            />
          )}
        </View>
      </LinearGradient>

      <DetailModal
        visible={detailModalVisible}
        municipality={selectedMunicipality}
        onClose={() => setDetailModalVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

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
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 80,
  },
  listContainer: {
    padding: 0,
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
    marginBottom: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
  },
  cardBody: {
    marginTop: 0,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  ratingText2: {
    color: "#4b5986",
    fontSize: 15,
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
    height: "90%",
    display: "flex",
    flexDirection: "column",
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
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalBody: {
    flex: 1,
  },
  modalLocation: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  detailButton: {
    backgroundColor: "#0EA5E9",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailModalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#0EA5E9",
    fontWeight: "600",
  },
  detailModalContent: {
    flex: 1,
    padding: 20,
  },
  detailModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  complaintsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 24,
    marginBottom: 16,
  },
  complaintCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  complaintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  complaintStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  complaintDate: {
    fontSize: 13,
    color: "#94A3B8",
  },
  complaintText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  feedbackContainer: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  complaintFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  supportCount: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  userName: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    marginTop: 24,
  },
  ratingContainer: {
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
  ratingComment: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4c669f",
    fontWeight: "600",
  },
  complaintsListContainer: {
    flex: 1,
    marginBottom: 16,
  },
  detailRatingText: {
    fontSize: 14,
    color: "#334155",
    marginLeft: 8,
    fontWeight: "500",
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
  initialLoaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalAddress: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  addComplaintButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addComplaintButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  announcementsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    padding: 16,
    borderRadius: 16,
  },
  announcementsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  announcementCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 12,
  },
  announcementDate: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
  },
});
export default MunicipalitiesScreen;
