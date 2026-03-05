import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function ProfilScreen() {
  const kullanici = auth.currentUser;
  const router = useRouter();

  const [isim, setIsim] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [guncelleniyor, setGuncelleniyor] = useState(false);

  useEffect(() => {
    const profilGetir = async () => {
      // 1. Kullanıcı oturum açmamışsa bekleme, direkt kapat
      if (!auth.currentUser) {
        console.log("Kullanıcı oturumu bulunamadı.");
        setYukleniyor(false);
        return;
      }

      try {
        console.log("Veri çekiliyor: ", auth.currentUser.uid);
        const docRef = doc(db, "hedefler", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setIsim(docSnap.data().displayName || "");
        } else {
          console.log("Kullanıcı dökümanı henüz yok.");
        }
      } catch (error) {
        // Hatanın ne olduğunu konsolda kırmızı yazıyla göreceğiz
        console.error("Firebase Veri Çekme Hatası:", error);
      } finally {
        // HATA ALSA DA ALMASA DA ÇARK DÖNMEYİ BIRAKSIN
        setYukleniyor(false);
      }
    };

    profilGetir();
  }, []);

  const profilGuncelle = async () => {
    if (!isim.trim()) {
      Alert.alert("Hata", "Lütfen bir isim girin.");
      return;
    }
    if (!kullanici) return;
    setGuncelleniyor(true);
    try {
      await setDoc(
        doc(db, "hedefler", kullanici.uid),
        { displayName: isim, userId: kullanici.uid },
        { merge: true },
      );
      Alert.alert(
        "Başarılı",
        "Profilin güncellendi! Artık sıralamada bu isimle görüneceksin.",
      );
    } catch {
      Alert.alert("Hata", "Güncellenemedi.");
    }
    setGuncelleniyor(false);
  };

  const cikisYap = () => {
    Alert.alert("Çıkış", "Oturumu kapatmak istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: () => {
          signOut(auth);
          router.replace("/login");
        },
      },
    ]);
  };

  if (yukleniyor)
    return (
      <View style={styles.merkezle}>
        <ActivityIndicator color="#007AFF" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.profilBaslik}>
        <View style={styles.avatarDaire}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.eposta}>{kullanici?.email}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Görünür İsim (Liderlik Tablosu İçin)</Text>
        <TextInput
          style={styles.input}
          value={isim}
          onChangeText={setIsim}
          placeholder="Adın veya Lakabın"
          placeholderTextColor="#444"
        />
        <TouchableOpacity
          style={styles.buton}
          onPress={profilGuncelle}
          disabled={guncelleniyor}
        >
          <Text style={styles.butonMetni}>
            {guncelleniyor ? "Kaydediliyor..." : "Profilini Kaydet"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cikisButon} onPress={cikisYap}>
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.cikisMetni}>Oturumu Kapat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 25,
    paddingTop: 80,
  },
  merkezle: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  profilBaslik: { alignItems: "center", marginBottom: 40 },
  avatarDaire: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  eposta: { color: "#8e8e93", fontSize: 16 },
  form: {
    backgroundColor: "#1c1c1e",
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  label: {
    color: "#8e8e93",
    fontSize: 13,
    marginBottom: 10,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#2c2c2e",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    fontSize: 18,
  },
  buton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  butonMetni: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cikisButon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  cikisMetni: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
