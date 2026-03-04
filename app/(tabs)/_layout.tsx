// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons"; // Expo'da ikonlar hazır yüklü gelir!
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF3B30", // Aktif sekmenin rengi (Kırmızı)
        tabBarInactiveTintColor: "#888888", // Pasif sekmenin rengi (Gri)
        tabBarStyle: {
          backgroundColor: "#1e1e1e", // Alt menünün karanlık arka planı
          borderTopWidth: 0, // Üstteki ince çizgiyi kaldırır
        },
        headerStyle: {
          backgroundColor: "#121212", // Üstteki başlık barının arka planı
        },
        headerTintColor: "#fff", // Üst başlık yazısının rengi
        headerTitleAlign: "center", // Başlığı ortala
      }}
    >
      {/* 1. Sekme: Ana Sayfa */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. Sekme: Profil */}
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={24} color={color} />
          ),
        }}
      />

      {/* 3. Sekme: Hedeflerim */}
      <Tabs.Screen
        name="hedef"
        options={{
          title: "Hedeflerim",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" size={24} color={color} />
          ),
        }}
      />

      {/* 4. Sekme: Liderlik */}
      <Tabs.Screen
        name="liderlik"
        options={{
          title: "Liderlik",
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
