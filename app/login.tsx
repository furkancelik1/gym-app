import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [kayitModu, setKayitModu] = useState(false);
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);

  const authIslemi = async () => {
    if (!email || !sifre) {
      Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setIslemYapiliyor(true);
    try {
      if (kayitModu) {
        await createUserWithEmailAndPassword(auth, email, sifre);
        Alert.alert("Aramıza Hoş Geldin!", "Hesabın başarıyla oluşturuldu.");
      } else {
        await signInWithEmailAndPassword(auth, email, sifre);
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      let mesaj = "Bir hata oluştu.";
      if (error.code === "auth/invalid-email")
        mesaj = "Geçersiz bir e-posta adresi girdiniz.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      )
        mesaj = "Kullanıcı bulunamadı veya şifre yanlış.";
      if (error.code === "auth/email-already-in-use")
        mesaj = "Bu e-posta adresi zaten kullanımda.";
      if (error.code === "auth/weak-password")
        mesaj = "Şifreniz çok zayıf (En az 6 karakter olmalı).";
      Alert.alert("Başarısız", mesaj);
    }
    setIslemYapiliyor(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.baslikAlani}>
        <Ionicons name="barbell" size={80} color="#FF3B30" style={{ marginBottom: 10 }} />
        <Text style={styles.baslik}>
          Gönen <Text style={{ color: "#007AFF" }}>Fit</Text>
        </Text>
        <Text style={styles.altBaslik}>Kendinin en iyi versiyonuna ulaş.</Text>
      </View>

      <View style={styles.formKutusu}>
        <TextInput
          style={styles.input}
          placeholder="E-posta Adresin"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifren (En az 6 karakter)"
          placeholderTextColor="#666"
          secureTextEntry
          value={sifre}
          onChangeText={setSifre}
        />
        <TouchableOpacity
          style={styles.anaButon}
          onPress={authIslemi}
          disabled={islemYapiliyor}
        >
          <Text style={styles.anaButonMetni}>
            {islemYapiliyor ? "Lütfen Bekleyin..." : kayitModu ? "Kayıt Ol" : "Giriş Yap"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setKayitModu(!kayitModu)} style={styles.gecisButonu}>
          <Text style={styles.gecisMetni}>
            {kayitModu
              ? "Zaten bir hesabın var mı? Giriş Yap"
              : "Henüz hesabın yok mu? Kayıt Ol"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 20,
  },
  baslikAlani: {
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 20,
    borderRadius: 20,
  },
  baslik: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  altBaslik: { fontSize: 16, color: "#a0a0a0", marginTop: 5 },
  formKutusu: { width: "100%" },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  anaButon: {
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  anaButonMetni: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  gecisButonu: { marginTop: 20, alignItems: "center", padding: 10 },
  gecisMetni: { color: "#a0a0a0", fontSize: 14, textDecorationLine: "underline" },
});
