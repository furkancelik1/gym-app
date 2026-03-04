import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function AntrenmanDetay() {
  const { id, baslik } = useLocalSearchParams();
  const router = useRouter();

  const [egzersizler, setEgzersizler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [ekleniyor, setEkleniyor] = useState(false);

  const [menuAcik, setMenuAcik] = useState(false);
  const [eklemeModaliAcik, setEklemeModaliAcik] = useState(false);
  const [hareketAdi, setHareketAdi] = useState("");
  const [setTekrar, setSetTekrar] = useState("");

  const [isimModaliAcik, setIsimModaliAcik] = useState(false);
  const [yeniIsim, setYeniIsim] = useState("");

  const [silmeOnayModali, setSilmeOnayModali] = useState(false);

  const [saniye, setSaniye] = useState(0);
  const [kronometreAktif, setKronometreAktif] = useState(false);

  useEffect(() => {
    const egzersizleriCek = async () => {
      try {
        const q = query(
          collection(db, "egzersizler"),
          where("antrenmanId", "==", id),
        );
        const querySnapshot = await getDocs(q);
        const geciciDizi: any[] = [];
        querySnapshot.forEach((doc) => {
          geciciDizi.push({ id: doc.id, ...doc.data() });
        });
        setEgzersizler(geciciDizi);
        setYukleniyor(false);
      } catch (hata) {
        console.error("Egzersizler çekilirken hata: ", hata);
        setYukleniyor(false);
      }
    };
    if (id) egzersizleriCek();
  }, [id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (kronometreAktif) {
      interval = setInterval(() => {
        setSaniye((s) => s + 1);
      }, 1000);
    } else if (!kronometreAktif && saniye !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [kronometreAktif, saniye]);

  const zamaniFormatla = (toplamSaniye: number) => {
    const dk = Math.floor(toplamSaniye / 60);
    const sn = toplamSaniye % 60;
    return `${dk.toString().padStart(2, "0")}:${sn.toString().padStart(2, "0")}`;
  };

  const egzersizEkle = async () => {
    if (!hareketAdi || !setTekrar) {
      Alert.alert("Hata", "Lütfen hareket adı ve set bilgisini doldurun.");
      return;
    }
    setEkleniyor(true);
    try {
      const yeniEgzersiz = { antrenmanId: id, ad: hareketAdi, setTekrar };
      const docRef = await addDoc(collection(db, "egzersizler"), yeniEgzersiz);
      setEgzersizler([...egzersizler, { id: docRef.id, ...yeniEgzersiz }]);
      setHareketAdi("");
      setSetTekrar("");
      setEklemeModaliAcik(false);
    } catch (error: any) {
      Alert.alert("Hata", "Hata oluştu: " + error.message);
    }
    setEkleniyor(false);
  };

  const egzersizSil = async (hareketId: string, hareketAd: string) => {
    Alert.alert(
      "Hareketi Sil",
      `"${hareketAd}" hareketini silmek istediğine emin misin?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "egzersizler", hareketId));
              setEgzersizler(egzersizler.filter((item) => item.id !== hareketId));
            } catch {
              Alert.alert("Hata", "Silinirken bir hata oluştu!");
            }
          },
        },
      ],
    );
  };

  const kronometreyiSifirla = () => {
    setKronometreAktif(false);
    setSaniye(0);
  };

  const antrenmaniGercektenSil = async () => {
    try {
      await deleteDoc(doc(db, "antrenmanlar", id as string));
      setSilmeOnayModali(false);
      router.replace("/(tabs)");
    } catch (e) {
      console.error("Silme hatası:", e);
    }
  };

  const isimGuncelle = async () => {
    if (!yeniIsim.trim()) return;
    try {
      await updateDoc(doc(db, "antrenmanlar", id as string), { baslik: yeniIsim });
      setIsimModaliAcik(false);
      setMenuAcik(false);
      Alert.alert("Başarılı", "Antrenman ismi güncellendi.");
    } catch {
      Alert.alert("Hata", "Güncellenemedi.");
    }
  };

  const antrenmaniTamamla = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "hedefler", auth.currentUser.uid);
      await updateDoc(userRef, {
        toplamPuan: increment(50),
      });
      Alert.alert("Tebrikler!", "Antrenman bitti ve +50 Fit Puan kazandın! 🏆");
      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setMenuAcik(true)}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Seçenekler Menüsü */}
      <Modal visible={menuAcik} transparent animationType="fade" onRequestClose={() => setMenuAcik(false)}>
        <Pressable style={styles.modalArkaPlan} onPress={() => setMenuAcik(false)}>
          <View style={styles.menuIcerik}>
            <Text style={styles.menuBaslik}>Antrenman Ayarları</Text>
            <TouchableOpacity
              style={styles.menuButon}
              onPress={() => {
                setMenuAcik(false);
                setEklemeModaliAcik(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
              <Text style={styles.menuYazisi}>Yeni Hareket Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButon}
              onPress={() => {
                setMenuAcik(false);
                setIsimModaliAcik(true);
              }}
            >
              <Ionicons name="pencil-outline" size={22} color="#fff" />
              <Text style={styles.menuYazisi}>İsim Değiştir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButon}
              onPress={() => {
                setMenuAcik(false);
                setSilmeOnayModali(true);
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text style={[styles.menuYazisi, { color: "#FF3B30" }]}>Antrenmanı Sil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuButon, { borderBottomWidth: 0 }]}
              onPress={() => setMenuAcik(false)}
            >
              <Ionicons name="close-outline" size={22} color="#FF3B30" />
              <Text style={[styles.menuYazisi, { color: "#FF3B30" }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Hareket Ekleme Formu */}
      <Modal visible={eklemeModaliAcik} transparent animationType="slide" onRequestClose={() => setEklemeModaliAcik(false)}>
        <View style={styles.modalArkaPlan}>
          <View style={styles.eklemeFormu}>
            <Text style={styles.formBaslik}>Yeni Hareket Bilgileri</Text>
            <TextInput
              style={styles.input}
              placeholder="Hareket Adı (Örn: Barfiks)"
              placeholderTextColor="#666"
              value={hareketAdi}
              onChangeText={setHareketAdi}
            />
            <TextInput
              style={styles.input}
              placeholder="Set x Tekrar (Örn: 3x12)"
              placeholderTextColor="#666"
              value={setTekrar}
              onChangeText={setSetTekrar}
            />
            <TouchableOpacity style={styles.kaydetButonu} onPress={egzersizEkle} disabled={ekleniyor}>
              <Text style={styles.kaydetMetni}>
                {ekleniyor ? "Ekleniyor..." : "Listeye Ekle"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEklemeModaliAcik(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: "#FF3B30", textAlign: "center" }}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* İsim Değiştirme Formu */}
      <Modal visible={isimModaliAcik} transparent animationType="slide" onRequestClose={() => setIsimModaliAcik(false)}>
        <View style={styles.modalArkaPlan}>
          <View style={styles.eklemeFormu}>
            <Text style={styles.formBaslik}>Antrenman İsmini Değiştir</Text>
            <TextInput
              style={styles.input}
              placeholder="Yeni isim girin..."
              placeholderTextColor="#666"
              value={yeniIsim}
              onChangeText={setYeniIsim}
            />
            <TouchableOpacity style={styles.kaydetButonu} onPress={isimGuncelle}>
              <Text style={styles.kaydetMetni}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsimModaliAcik(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: "#FF3B30", textAlign: "center" }}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Silme Onay Modali */}
      <Modal visible={silmeOnayModali} transparent animationType="fade" onRequestClose={() => setSilmeOnayModali(false)}>
        <View style={styles.modalArkaPlan}>
          <View style={styles.eklemeFormu}>
            <Ionicons
              name="warning"
              size={50}
              color="#FF3B30"
              style={{ alignSelf: "center", marginBottom: 15 }}
            />
            <Text style={styles.formBaslik}>Emin misin?</Text>
            <Text style={{ color: "#8e8e93", textAlign: "center", marginBottom: 25 }}>
              Bu antrenman kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </Text>
            <TouchableOpacity
              style={[styles.kaydetButonu, { backgroundColor: "#FF3B30" }]}
              onPress={antrenmaniGercektenSil}
            >
              <Text style={styles.kaydetMetni}>Evet, Sil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSilmeOnayModali(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: "#fff", textAlign: "center" }}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.ustBar}>
        <TouchableOpacity style={styles.geriKismi} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FF3B30" />
          <Text style={styles.geriMetni}>Geri</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.anaBaslik}>{baslik}</Text>

      {/* Kronometre */}
      <View style={styles.kronometreKutusu}>
        <View style={styles.kronometreSol}>
          <Ionicons
            name="timer-outline"
            size={32}
            color={kronometreAktif ? "#34C759" : "#FF3B30"}
          />
          <Text style={styles.kronometreZaman}>{zamaniFormatla(saniye)}</Text>
        </View>
        <View style={styles.kronometreSag}>
          <TouchableOpacity
            style={[styles.kronometreButon, { backgroundColor: kronometreAktif ? "#FF9500" : "#34C759" }]}
            onPress={() => setKronometreAktif(!kronometreAktif)}
          >
            <Ionicons name={kronometreAktif ? "pause" : "play"} size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.kronometreButon, { backgroundColor: "#333" }]}
            onPress={kronometreyiSifirla}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {yukleniyor ? (
        <View style={styles.merkezle}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.yukleniyorMetni}>Hareketler Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView style={styles.liste} showsVerticalScrollIndicator={false}>
          {egzersizler.length === 0 ? (
            <Text style={styles.bosListeMetni}>
              Bu antrenmana henüz hareket eklenmemiş.
            </Text>
          ) : (
            egzersizler.map((hareket, index) => (
              <View key={hareket.id} style={styles.egzersizKart}>
                <View style={styles.kartYaziKismi}>
                  <Text style={styles.egzersizAd}>
                    {index + 1}. {hareket.ad}
                  </Text>
                  <Text style={styles.egzersizSet}>{hareket.setTekrar}</Text>
                </View>
                <TouchableOpacity onPress={() => egzersizSil(hareket.id, hareket.ad)}>
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.tamamlaButonu} onPress={antrenmaniTamamla}>
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
        <Text style={styles.tamamlaMetni}>Antrenmanı Tamamla (+50 Puan)</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
    paddingTop: 50,
  },
  merkezle: { flex: 1, justifyContent: "center", alignItems: "center" },
  yukleniyorMetni: { color: "#fff", marginTop: 10 },
  bosListeMetni: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  ustBar: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  geriKismi: { flexDirection: "row", alignItems: "center" },
  geriMetni: { color: "#FF3B30", fontSize: 16, marginLeft: 5, fontWeight: "bold" },
  anaBaslik: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 15 },

  kronometreKutusu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  kronometreSol: { flexDirection: "row", alignItems: "center", gap: 10 },
  kronometreZaman: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  kronometreSag: { flexDirection: "row", gap: 10 },
  kronometreButon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  liste: { flex: 1, marginBottom: 10 },
  egzersizKart: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kartYaziKismi: { flex: 1 },
  egzersizAd: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  egzersizSet: { color: "#a0a0a0", fontSize: 14 },

  tamamlaButonu: {
    flexDirection: "row",
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  tamamlaMetni: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  modalArkaPlan: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcerik: {
    width: "80%",
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2c2c2e",
  },
  menuBaslik: {
    color: "#8e8e93",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    textTransform: "uppercase",
  },
  menuButon: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2c2c2e",
  },
  menuYazisi: { color: "#fff", fontSize: 16, marginLeft: 10, fontWeight: "500" },

  eklemeFormu: {
    width: "85%",
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#2c2c2e",
  },
  formBaslik: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
  },
  kaydetButonu: {
    backgroundColor: "#FF3B30",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  kaydetMetni: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
