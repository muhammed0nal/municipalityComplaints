import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

export default function ComplaintScreen({ navigation, route }) {
  const [complaint, setComplaint] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState(
    route.params?.selectedMunicipalityId || null
  );
  const [municipalities, setMunicipalities] = useState([]);
  const [municipalityRating, setMunicipalityRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`https://bitirmetezibcknd.onrender.com/api/municipalities`)
      .then((response) => {
        setMunicipalities(
          response.data.map((municipality) => ({
            label: municipality.name,
            value: municipality.id,
          }))
        );
      })
      .catch((error) => {
        console.error("Belediyeler alınırken bir hata oluştu", error);
      });
  }, []);

  useEffect(() => {
    if (selectedMunicipality) {
      setIsLoading(true);
      axios
        .get(
          `https://bitirmetezibcknd.onrender.com/api/municipality-average-rating/${selectedMunicipality}`
        )
        .then((response) => {
          if (response.data) {
            setMunicipalityRating(response.data.averageRating || 0);
            setTotalRatings(response.data.totalRatings || 0);
          } else {
            setMunicipalityRating(0);
            setTotalRatings(0);
          }
        })
        .catch((error) => {
          console.error("Belediye puanı alınırken hata:", error);
          setMunicipalityRating(0);
          setTotalRatings(0);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    if (route.params?.selectedMunicipalityId) {
      setSelectedMunicipality(route.params.selectedMunicipalityId);
    }
  }, [route.params]);

  const handleSubmitComplaint = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.log("Kullanıcı giriş yapmamış!");
      return;
    }

    const complaintData = {
      complaint: complaint,
      municipalityId: selectedMunicipality,
    };

    axios
      .post(
        `https://bitirmetezibcknd.onrender.com/api/submit-complaint`,
        complaintData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Şikayet başarıyla gönderildi:", response.data);
        navigation.goBack();
      })
      .catch((error) => {
        console.error("Şikayet gönderilirken bir hata oluştu:", error);
      });
  };

  const renderRating = () => {
    if (!selectedMunicipality) return null;

    if (isLoading) {
      return (
        <View style={styles.ratingContainer}>
          <View style={styles.ratingBox}>
            <ActivityIndicator size="small" color="#4c669f" />
          </View>
        </View>
      );
    }

    const rating = Number(municipalityRating) || 0;
    const total = Number(totalRatings) || 0;

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.ratingBox}>
          <MaterialIcons name="star" size={24} color="#FFD700" />
          <Text style={styles.ratingText}>
            {rating.toFixed(1)}
            <Text style={styles.maxRating}>/5.0</Text>
            <Text style={styles.ratingCount}> ({total} değerlendirme)</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <LinearGradient
            colors={["#2DD4BF", "#0EA5E9", "#6366F1"]}
            style={styles.container}
          >
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Şikayet Oluştur</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Şikayetinizi detaylı bir şekilde açıklayın
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.formContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedMunicipality}
                    onValueChange={(value) => setSelectedMunicipality(value)}
                    style={styles.picker}
                    enabled={!route.params?.selectedMunicipalityId}
                  >
                    <Picker.Item
                      label="Belediye seçin..."
                      value={null}
                      color="#64748B"
                    />
                    {municipalities.map((municipality) => (
                      <Picker.Item
                        key={municipality.value}
                        label={municipality.label}
                        value={municipality.value}
                        color="#0F172A"
                      />
                    ))}
                  </Picker>
                </View>

                {renderRating()}

                <TextInput
                  style={styles.input}
                  placeholder="Şikayetinizi detaylı bir şekilde açıklayın..."
                  placeholderTextColor="#64748B"
                  value={complaint}
                  onChangeText={setComplaint}
                  multiline={true}
                  numberOfLines={6}
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitComplaint}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Şikayet Gönder</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.3,
    textAlign: "center",
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  pickerContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 56,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#0F172A",
    textAlignVertical: "top",
    minHeight: 160,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ratingContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 140,
    justifyContent: "center",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
    color: "#0F172A",
  },
  maxRating: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "normal",
  },
  ratingCount: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "normal",
  },
});
