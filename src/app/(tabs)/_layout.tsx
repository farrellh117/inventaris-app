import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { 
          paddingBottom: 5, 
          height: 60,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#EEE"
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="data-aset"
        options={{
          title: "Aset",
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="peminjaman"
        options={{
          title: "Pinjam",
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons
              name={focused ? "arrow-up-circle" : "arrow-up-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* Kamu bisa sembunyikan Tab Pengembalian jika ingin diletakkan di dalam menu lain, 
          tapi sementara kita biarkan ada sesuai kodinganmu */}
      <Tabs.Screen
        name="pengembalian"
        options={{
          title: "Kembali",
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons
              name={focused ? "arrow-down-circle" : "arrow-down-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat",
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      {/* INI YANG BARU: DAFTARKAN PROFILE DISINI */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}