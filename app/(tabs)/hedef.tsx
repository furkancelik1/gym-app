import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function HedefScreen() {
  const kullanici = auth.currentUser;
  const [kilo, setKilo] = useState("");
  const [hedefKilo, setHedefKilo] = useState("");
  const [haftalikHedef, setHaftalikHedef] = useState("3");
  const [puan, setPuan] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const verileriGetir = async () => {
      if (!kullanici) return;
      try {
        const docRef = doc(db, "hedefler", kullanici.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setKilo(data.currentKilo || "");
          setHedefKilo(data.targetKilo || "");
          setHaftalikHedef(data.weeklyGoal || "3");
          setPuan(data.toplamPuan || 0);
        }
      } catch (error) {
        console.error(error);
      }
      setYukleniyor(false);
    };
    verileriGetir();
  }, []);

  const seviyeHesapla = (
    p: number,
  ): { ad: string; renk: string; ikon: keyof typeof Ionicons.glyphMap } => {
    if (p < 500)
      return { ad: "Çaylak", renk: "#8e8e93", ikon: "medal-outline" };
    if (p < 1500)
      return { ad: "Savaşçı", renk: "#FFD60A", ikon: "shield-checkmark" };
    return { ad: "Efsane", renk: "#FF3B30", ikon: "trophy" };
  };

  const hedefleriKaydet = async () => {
    if (!kullanici) return;
    try {
      await setDoc(
        doc(db, "hedefler", kullanici.uid),
        {
          currentKilo: kilo,
          targetKilo: hedefKilo,
          weeklyGoal: haftalikHedef,
          toplamPuan: puan,
        },
        { merge: true },
      );
      Alert.alert("Gönen Fit", "Hedeflerin başarıyla güncellendi! 🎯");
    } catch (e) {
      Alert.alert("Hata", "Kaydedilemedi.");
    }
  };

  const mev = seviyeHesapla(puan);

  if (yukleniyor)
    return (
      <View style={styles.merkezle}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollIci}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.anaBaslik}>Hedeflerim</Text>

        {/* PUAN KARTI */}
        <View style={[styles.puanKart, { borderColor: mev.renk }]}>
          <View
            style={[styles.ikonDaire, { backgroundColor: mev.renk + "20" }]}
          >
            <Ionicons name={mev.ikon} size={35} color={mev.renk} />
          </View>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.puanRakam}>{puan} FP</Text>
            <Text style={[styles.unvan, { color: mev.renk }]}>{mev.ad}</Text>
          </View>
        </View>

        {/* KİLO KARTI */}
        <View style={styles.kart}>
          <Text style={styles.kartBaslik}>Kilo Takibi</Text>
          <View style={styles.kiloSatir}>
            <View style={styles.inputAlan}>
              <Text style={styles.label}>Mevcut</Text>
              <TextInput
                style={styles.input}
                value={kilo}
                onChangeText={setKilo}
                keyboardType="numeric"
                placeholder="00"
                placeholderTextColor="#444"
              />
            </View>
            <Ionicons name="arrow-forward" size={20} color="#007AFF" />
            <View style={styles.inputAlan}>
              <Text style={styles.label}>Hedef</Text>
              <TextInput
                style={styles.input}
                value={hedefKilo}
                onChangeText={setHedefKilo}
                keyboardType="numeric"
                placeholder="00"
                placeholderTextColor="#444"
              />
            </View>
          </View>
        </View>

        {/* GÜN SEÇİCİ */}
        <View style={styles.kart}>
          <Text style={styles.kartBaslik}>Haftalık Antrenman Hedefi</Text>
          <View style={styles.gunGrubu}>
            {["1", "2", "3", "4", "5", "6", "7"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setHaftalikHedef(g)}
                style={[
                  styles.gunDaire,
                  haftalikHedef === g && styles.gunAktif,
                ]}
              >
                <Text style={styles.gunYazi}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.anaButon} onPress={hedefleriKaydet}>
          <Text style={styles.butonYazisi}>Değişiklikleri Kaydet</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollIci: { paddingHorizontal: 20, paddingTop: 60, flexGrow: 1 },
  merkezle: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  anaBaslik: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 25,
  },
  puanKart: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  ikonDaire: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  puanRakam: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  unvan: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  kart: {
    backgroundColor: "#1c1c1e",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  kartBaslik: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  kiloSatir: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputAlan: { width: "40%" },
  label: { color: "#8e8e93", fontSize: 12, marginBottom: 5 },
  input: {
    backgroundColor: "#2c2c2e",
    color: "#fff",
    padding: 15,
    borderRadius: 15,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  gunGrubu: { flexDirection: "row", justifyContent: "space-between" },
  gunDaire: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2c2c2e",
    justifyContent: "center",
    alignItems: "center",
  },
  gunAktif: { backgroundColor: "#007AFF" },
  gunYazi: { color: "#fff", fontWeight: "bold" },
  anaButon: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  butonYazisi: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
