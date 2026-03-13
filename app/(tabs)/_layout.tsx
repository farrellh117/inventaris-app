import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="index" options={{ title: "Home"}} />
            <Tabs.Screen name="data-aset" options={{ title: "Data Aset"}} />
            <Tabs.Screen name="peminjaman" options={{ title: "Peminjaman"}} />
            <Tabs.Screen name="pengembalian" options={{ title: "Pengembalian"}} />
            <Tabs.Screen name="riwayat" options={{ title: "Riwayat"}} />
        </Tabs>
    );
}