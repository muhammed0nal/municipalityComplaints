import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function MunicipalityAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const municipalityId = await AsyncStorage.getItem("municipalityId");

      if (!municipalityId) {
        Alert.alert("Hata", "Belediye bilgisi bulunamadı");
        return;
      }

      const announcementsResponse = await axios.get(
        `https://bitirmetezibcknd.onrender.com/api/announcements/${municipalityId}`
      );

      setAnnouncements(announcementsResponse.data);
    } catch (error) {
      console.error("Duyurular alınırken hata:", error);
      Alert.alert("Hata", "Duyurular alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert("Hata", "Başlık ve içerik alanları zorunludur");
      return;
    }

    setIsSubmitting(true);
    try {
      const municipalityId = await AsyncStorage.getItem("municipalityId");

      if (!municipalityId) {
        Alert.alert("Hata", "Belediye bilgisi bulunamadı");
        return;
      }

      await axios.post(
        `https://bitirmetezibcknd.onrender.com/api/announcements`,
        {
          title,
          content,
          municipality_id: municipalityId,
        }
      );

      setTitle("");
      setContent("");
      fetchAnnouncements();
    } catch (error) {
      console.error("Duyuru oluşturma hatası:", error);
      Alert.alert("Hata", "Duyuru oluşturulamadı");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Duyuru Silme",
      "Bu duyuruyu silmek istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setDeletingId(id);
            try {
              await axios.delete(
                `https://bitirmetezibcknd.onrender.com/api/announcements/${id}`
              );
              fetchAnnouncements();
            } catch (error) {
              console.error("Duyuru silme hatası:", error);
              Alert.alert("Hata", "Duyuru silinemedi");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnouncements().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Duyuru Başlığı"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="Duyuru İçeriği"
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Duyuru Ekle</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.announcementCard}>
              <Text style={styles.announcementTitle}>{item.title}</Text>
              <Text style={styles.announcementContent}>{item.content}</Text>
              <Text style={styles.announcementDate}>
                {new Date(item.created_at).toLocaleString("tr-TR", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Sil</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#E8F0F2",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    color: "#1F2937",
  },
  contentInput: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    height: 45,
    alignSelf: "center",
    width: "50%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  announcementCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },
  announcementDate: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    alignSelf: "flex-end",
    width: 100,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
