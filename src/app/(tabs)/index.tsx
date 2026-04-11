import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/src/lib/supabase/client";
import { useRouter } from "expo-router";

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    dipinjam: 0,
    tersedia: 0
  });

  // Fungsi untuk mengambil statistik nyata dari database
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Ambil Total Aset
      const { count: totalCount } = await supabase
        .from('aset')
        .select('*', { count: 'exact', head: true });

      // 2. Ambil Aset yang sedang Dipinjam
      const { count: borrowedCount } = await supabase
        .from('aset')
        .select('*', { count: 'exact', head: true })
        .eq('status_ketersediaan', 'dipinjam');

      // 3. Hitung Tersedia
      const total = totalCount || 0;
      const dipinjam = borrowedCount || 0;
      
      setStats({
        total: total,
        dipinjam: dipinjam,
        tersedia: total - dipinjam
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statItems = [
    { label: "Total Aset", value: stats.total.toString(), icon: "cube", color: "#007AFF" },
    { label: "Dipinjam", value: stats.dipinjam.toString(), icon: "arrow-up-circle", color: "#FF9500" },
    { label: "Tersedia", value: stats.tersedia.toString(), icon: "checkmark-circle", color: "#34C759" },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Selamat Datang,</Text>
            <Text style={styles.userName}>
              {user?.nama_lengkap || user?.email?.split('@')[0] || "User"}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="person-circle" size={48} color={"#007AFF"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchStats} colors={["#007AFF"]} tintColor="#007AFF" />
        }
      >
        {/* STATS SECTION */}
        <View style={styles.statsContainer}>
          {statItems.map((item, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              {loading ? (
                <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 4 }} />
              ) : (
                <Text style={styles.statValue}>{item.value}</Text>
              )}
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/peminjaman")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#EBF5FF" }]}>
              <Ionicons name="scan" size={28} color={"#007AFF"} />
            </View>
            <Text style={styles.actionText}>Scan Barcode</Text>
          </TouchableOpacity>

          {/* Hanya tampilkan Tambah Aset jika user adalah Admin */}
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/tambah-aset")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#F0FFF4" }]}>
                <Ionicons name="add" size={28} color={"#34C759"} />
              </View>
              <Text style={styles.actionText}>Tambah Aset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* RECENT ACTIVITY */}
        <Text style={styles.sectionTitle}>Info Sistem</Text>
        <View style={styles.recentList}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={"#007AFF"} />
            <Text style={styles.infoText}>
              Gunakan menu Scan Barcode untuk meminjam barang secara otomatis. Pastikan kamera diizinkan.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA"
  },
  headerSafeArea: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#EEE"
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 90
  },
  welcomeText: {
    fontSize: 13,
    color: "#666"
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A"
  },
  profileButton: {
    padding: 2
  },
  scrollContent: {
    padding: 20
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25
  },
  statCard: {
    backgroundColor: "#fff",
    width: "31%",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4
  },
  statLabel: {
    fontSize: 11,
    color: "#888"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: "space-between",
    marginBottom: 25
  },
  actionButton: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  actionText: {
    fontWeight: "600",
    color: "#444",
    fontSize: 14
  },
  recentList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    minHeight: 100
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#666",
    fontSize: 13,
    lineHeight: 18
  },
});