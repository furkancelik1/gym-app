import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View
} from "react-native";
import { db } from "../../firebaseConfig";

type Lider = { id: string; userId?: string; toplamPuan?: number; displayName?: string };

export default function LiderlikScreen() {
  const [liderler, setLiderler] = useState<Lider[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const puanlariGetir = async () => {
      try {
        const q = query(
          collection(db, "hedefler"),
          orderBy("toplamPuan", "desc"),
          limit(20),
        );
        const querySnapshot = await getDocs(q);

        const liste: Lider[] = [];
        querySnapshot.forEach((doc) => {
          liste.push({ id: doc.id, ...doc.data() } as Lider);
        });
        setLiderler(liste);
      } catch (error) {
        console.error("Liderlik tablosu hatası:", error);
      }
      setYukleniyor(false);
    };

    puanlariGetir();
  }, []);

  const renderSira = ({ item, index }: { item: Lider; index: number }) => (
    <View style={[styles.listeElemani, index === 0 && styles.birinciAltin]}>
      <View style={styles.solKisim}>
        <Text style={styles.siraNo}>{index + 1}</Text>
        <View style={styles.profilDaire}>
          <Ionicons name="person" size={20} color="#8e8e93" />
        </View>
        <Text style={styles.kullaniciAd}>
          {item.displayName || `Sporcu #${item.userId?.slice(0, 5)}`}
        </Text>
      </View>
      <View style={styles.sagKisim}>
        <Text style={styles.puanYazi}>{item.toplamPuan || 0} FP</Text>
        {index < 3 && (
          <Ionicons
            name="trophy"
            size={18}
            color={
              index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"
            }
          />
        )}
      </View>
    </View>
  );

  if (yukleniyor)
    return (
      <View style={styles.merkezle}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.ustAlan}>
        <Ionicons name="stats-chart" size={40} color="#007AFF" />
        <Text style={styles.anaBaslik}>Liderlik Tablosu</Text>
        <Text style={styles.altBaslik}>Gönen'in En Fitleri</Text>
      </View>

      <FlatList
        data={liderler}
        keyExtractor={(item) => item.id}
        renderItem={renderSira}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", paddingTop: 60 },
  merkezle: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  ustAlan: { alignItems: "center", marginBottom: 30 },
  anaBaslik: { fontSize: 28, fontWeight: "bold", color: "#fff", marginTop: 10 },
  altBaslik: { fontSize: 14, color: "#8e8e93" },
  listeElemani: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
  },
  birinciAltin: { borderWidth: 1, borderColor: "#FFD700" },
  solKisim: { flexDirection: "row", alignItems: "center" },
  siraNo: { color: "#007AFF", fontWeight: "bold", width: 25, fontSize: 16 },
  profilDaire: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#2c2c2e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  kullaniciAd: { color: "#fff", fontWeight: "600" },
  sagKisim: { flexDirection: "row", alignItems: "center" },
  puanYazi: {
    color: "#007AFF",
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 16,
  },
});
