import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebaseConfig"; // Yolun doğruluğundan emin ol

export default function LoginEkrani() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const router = useRouter();

  const girisYap = async () => {
    if (!email || !sifre) {
      Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setYukleniyor(true);
    try {
      // Firebase ile giriş yap
      await signInWithEmailAndPassword(auth, email.trim(), sifre);

      // Başarılı olursa profil sekmesine yönlendir
      router.replace("/(tabs)/profil");
    } catch (error) {
      console.error("Giriş Hatası:", error);
      Alert.alert("Hata", "E-posta veya şifre yanlış!");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>Gönen Fit</Text>

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#aaa"
        value={sifre}
        onChangeText={setSifre}
        secureTextEntry
      />

      {yukleniyor ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.buton} onPress={girisYap}>
          <Text style={styles.butonMetin}>Giriş Yap</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  baslik: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  butonMetin: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
