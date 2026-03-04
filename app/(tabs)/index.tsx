import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

type Antrenman = {
  id: string;
  baslik: string;
  sure: string;
  seviye: string;
  renk: string;
  ikon: string;
  userId: string;
};

export default function DashboardScreen() {
  const router = useRouter();

  const [kullanici, setKullanici] = useState<User | null>(null);
  const [antrenmanlar, setAntrenmanlar] = useState<Antrenman[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yeniBaslik, setYeniBaslik] = useState("");
  const [ekleniyor, setEkleniyor] = useState(false);

  useEffect(() => {
    const abonelik = onAuthStateChanged(auth, async (mevcutKullanici) => {
      if (mevcutKullanici) {
        setKullanici(mevcutKullanici);
        try {
          const q = query(
            collection(db, "antrenmanlar"),
            where("userId", "==", mevcutKullanici.uid),
          );

          const querySnapshot = await getDocs(q);
          const geciciDizi: Antrenman[] = [];
          querySnapshot.forEach((doc) => {
            geciciDizi.push({ id: doc.id, ...doc.data() } as Antrenman);
          });

          setAntrenmanlar(geciciDizi);
        } catch (hata) {
          console.error("Veri çekilirken hata: ", hata);
        }
      } else {
        router.replace("/");
      }
      setYukleniyor(false);
    });

    return () => abonelik();
  }, []);

  const antrenmanEkle = async () => {
    if (!yeniBaslik) {
      alert("Lütfen antrenman adını girin.");
      return;
    }
    if (!kullanici) {
      alert("Hata: Oturum açılmamış!");
      return;
    }

    setEkleniyor(true);
    try {
      const yeniVeri = {
        baslik: yeniBaslik,
        sure: "Serbest",
        seviye: "Kişisel",
        renk: "#AF52DE",
        ikon: "flash",
        userId: kullanici.uid,
      };

      const docRef = await addDoc(collection(db, "antrenmanlar"), yeniVeri);

      const kucukBaslik = yeniBaslik.toLocaleLowerCase('tr-TR');
      let varsayilanHareketler: { ad: string; setTekrar: string }[] = [];

      if (kucukBaslik.includes("göğüs") || kucukBaslik.includes("gogus")) {
        varsayilanHareketler = [
          { ad: "Bench Press", setTekrar: "4 Set x 10 Tekrar" },
          { ad: "Incline Dumbbell Press", setTekrar: "3 Set x 12 Tekrar" },
          { ad: "Dumbbell Fly", setTekrar: "3 Set x 12 Tekrar" },
          { ad: "Şınav", setTekrar: "3 Set x Maksimum" },
        ];
      } else if (kucukBaslik.includes("sırt") || kucukBaslik.includes("sirt")) {
        varsayilanHareketler = [
          { ad: "Lat Pulldown", setTekrar: "4 Set x 12 Tekrar" },
          { ad: "Barbell Row", setTekrar: "4 Set x 10 Tekrar" },
          { ad: "Seated Cable Row", setTekrar: "3 Set x 12 Tekrar" },
          { ad: "Barfiks", setTekrar: "3 Set x Maksimum" },
        ];
      } else if (kucukBaslik.includes("bacak")) {
        varsayilanHareketler = [
          { ad: "Squat", setTekrar: "4 Set x 10 Tekrar" },
          { ad: "Leg Press", setTekrar: "4 Set x 12 Tekrar" },
          { ad: "Leg Extension", setTekrar: "3 Set x 15 Tekrar" },
          { ad: "Lunge", setTekrar: "3 Set x 12 Tekrar" },
        ];
      } else if (
        kucukBaslik.includes("kol") ||
        kucukBaslik.includes("pazu") ||
        kucukBaslik.includes("triceps")
      ) {
        varsayilanHareketler = [
          { ad: "Biceps Curl (Pazu)", setTekrar: "4 Set x 12 Tekrar" },
          { ad: "Hammer Curl", setTekrar: "3 Set x 12 Tekrar" },
          { ad: "Triceps Pushdown (Arka Kol)", setTekrar: "4 Set x 12 Tekrar" },
        ];
      }

      for (const hareket of varsayilanHareketler) {
        await addDoc(collection(db, "egzersizler"), {
          antrenmanId: docRef.id,
          ad: hareket.ad,
          setTekrar: hareket.setTekrar,
        });
      }

      setAntrenmanlar([...antrenmanlar, { id: docRef.id, ...yeniVeri }]);
      setYeniBaslik("");

      if (varsayilanHareketler.length > 0) {
        alert(
          `Harika! "${yeniBaslik}" eklendi ve içine ${varsayilanHareketler.length} adet temel hareket senin için otomatik yerleştirildi!`,
        );
      }
    } catch (error: any) {
      alert("Firebase Hatası: " + error.message);
    }
    setEkleniyor(false);
  };

  if (yukleniyor) {
    return (
      <View style={[styles.container, styles.merkezle]}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.yukleniyorMetni}>
          Senin Antrenmanların Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollIci}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.baslikKismi}>
          <Text style={styles.selamlama}>Merhaba Şampiyon,</Text>
          <Text style={styles.anaBaslik}>Antrenman Programın</Text>
        </View>

        <View style={styles.formKutusu}>
          <TextInput
            style={styles.input}
            placeholder="Yeni Antrenman (Örn: Göğüs Günü)"
            placeholderTextColor="#666"
            value={yeniBaslik}
            onChangeText={setYeniBaslik}
          />
          <TouchableOpacity
            style={styles.ekleButonu}
            onPress={antrenmanEkle}
            disabled={ekleniyor}
            activeOpacity={0.7}
          >
            {ekleniyor ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="add" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {antrenmanlar.length === 0 ? (
          <View style={styles.bosDurum}>
            <Ionicons name="document-text-outline" size={50} color="#333" />
            <Text style={styles.bosMetin}>
              Henüz sana ait bir antrenman yok. Yukarıdan ilk programını
              oluştur!
            </Text>
          </View>
        ) : (
          antrenmanlar.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.kart}
              onPress={() =>
                router.push({
                  pathname: "/antrenman/[id]",
                  params: { id: item.id, baslik: item.baslik, sure: item.sure },
                })
              }
            >
              <View
                style={[
                  styles.ikonKutusu,
                  { backgroundColor: item.renk || "#333" },
                ]}
              >
                <Ionicons
                  name={(item.ikon || "barbell") as any}
                  size={28}
                  color="#fff"
                />
              </View>

              <View style={styles.kartBilgi}>
                <Text style={styles.kartBaslik}>{item.baslik}</Text>
                <Text style={styles.kartDetay}>
                  {item.sure} • {item.seviye}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  merkezle: { justifyContent: "center", alignItems: "center" },
  yukleniyorMetni: { color: "#fff", marginTop: 15, fontSize: 16 },
  scrollIci: { padding: 20, paddingBottom: 60 },
  baslikKismi: { marginBottom: 20, marginTop: 40 },
  selamlama: { fontSize: 18, color: "#a0a0a0", marginBottom: 5 },
  anaBaslik: { fontSize: 28, fontWeight: "bold", color: "#fff" },

  formKutusu: { flexDirection: "row", marginBottom: 30 },
  input: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 16,
    marginRight: 10,
  },
  ekleButonu: {
    backgroundColor: "#FF3B30",
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  bosDurum: { alignItems: "center", marginTop: 40 },
  bosMetin: {
    color: "#888",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
    paddingHorizontal: 20,
  },

  kart: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  ikonKutusu: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  kartBilgi: { flex: 1 },
  kartBaslik: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  kartDetay: { fontSize: 14, color: "#888" },
});
