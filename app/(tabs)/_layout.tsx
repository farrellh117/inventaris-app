import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { paddingBottom: 5, height: 60 },
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
          title: "Peminjaman",
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons
              name={focused ? "arrow-up-circle" : "arrow-up-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pengembalian"
        options={{
          title: "Pengembalian",
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
    </Tabs>
  );
}