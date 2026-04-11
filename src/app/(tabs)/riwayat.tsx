import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase/client";

export default function Riwayat() {
  const { user } = useAuth();

  // console.log("DEBUG ROLE USER:", user?.role);
  // console.log("DEBUG ID USER:", user?.id);

  const [activeTab, setActiveTab] = useState<"dipinjam" | "selesai">("dipinjam");
  const [loading, setLoading] = useState(false);
  const [dataRiwayat, setDataRiwayat] = useState<any[]>([]);

  const fetchRiwayat = useCallback(async () => {
    // Pastikan user id ada sebelum memanggil database
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Sesuai dengan CHECK di SQL kamu: dipinjam, dikembalikan, terlambat
      const statusFilter = activeTab === "dipinjam" ? "dipinjam" : "dikembalikan";
      
      let query = supabase
        .from("peminjaman")
        .select(`
          transaksi_id,
          tanggal_peminjaman,
          tanggal_rencana_kembali,
          status_peminjaman,
          aset (
            nama_barang, 
            kode_barcode
          ),
          users!peminjaman_user_id_fkey (
            nama_lengkap
          )
        `)
        .eq("status_peminjaman", statusFilter)
        .order("tanggal_peminjaman", { ascending: false });
        
      // Jika bukan admin, filter hanya data milik user ini
      if (user?.role !== 'admin') {
        query = query.eq("user_id", user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDataRiwayat(data || []);

    } catch (error: any) {
      console.error("Error fetching riwayat:", error.message);
      Alert.alert("Kesalahan Sistem", "Gagal mengambil data riwayat. Pastikan koneksi stabil.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id, user?.role]);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: activeTab === "dipinjam" ? "#FFF3E0" : "#E8F5E9" }]}>
        <Ionicons 
          name={activeTab === "dipinjam" ? "time" : "checkmark-circle"} 
          size={24} 
          color={activeTab === "dipinjam" ? "#EF6C00" : "#2E7D32"} 
        />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.asetName} numberOfLines={1}>
            {item.aset?.nama_barang || "Aset Tidak Terdaftar"}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: activeTab === "dipinjam" ? "#FFF9F0" : "#F2FBF4" }]}>
            <Text style={[styles.statusText, { color: activeTab === "dipinjam" ? "#FF9500" : "#34C759" }]}>
              {item.status_peminjaman?.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {/* Nama Peminjam (Muncul jika login sebagai admin) */}
        {user?.role === 'admin' && item.users && (
          <Text style={styles.borrowerName}>Oleh: {item.users.nama_lengkap}</Text>
        )}
        
        <Text style={styles.kodeText}>{item.aset?.kode_barcode || "-"}</Text>
        
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            {activeTab === "dipinjam" ? "Batas: " : "Pinjam: "}
            <Text style={{ fontWeight: '600', color: '#333' }}>
              {formatDate(activeTab === "dipinjam" ? item.tanggal_rencana_kembali : item.tanggal_peminjaman)}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>
            {user?.role === 'admin' ? "Riwayat Global" : "Riwayat Saya"}
          </Text>
          
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === "dipinjam" && styles.tabActive]}
              onPress={() => setActiveTab("dipinjam")}
            >
              <Text style={[styles.tabText, activeTab === "dipinjam" && styles.tabTextActive]}>Dipinjam</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === "selesai" && styles.tabActive]}
              onPress={() => setActiveTab("selesai")}
            >
              <Text style={[styles.tabText, activeTab === "selesai" && styles.tabTextActive]}>Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={dataRiwayat}
        keyExtractor={(item) => item.transaksi_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading && dataRiwayat.length > 0} onRefresh={fetchRiwayat} colors={["#007AFF"]} />
        }
        ListEmptyComponent={
          loading && dataRiwayat.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{marginTop: 10, color: '#999'}}>Sinkronisasi data...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={70} color="#DDD" />
              <Text style={styles.emptyTitle}>Kosong</Text>
              <Text style={styles.emptySub}>Tidak ditemukan riwayat peminjaman {activeTab}.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  headerSafeArea: { backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#EEE" },
  headerContent: { paddingHorizontal: 20, paddingVertical: 15 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#1A1A1A", marginBottom: 15 },
  tabBar: { flexDirection: "row", backgroundColor: "#F1F3F5", borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#FFF", elevation: 2 },
  tabText: { fontSize: 13, fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#007AFF" },
  listContent: { padding: 20, paddingBottom: 50 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 15, flexDirection: "row", marginBottom: 12, elevation: 1 },
  cardIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 15 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  asetName: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1, marginRight: 10 },
  borrowerName: { fontSize: 12, color: "#007AFF", marginTop: 2, fontWeight: '600' },
  kodeText: { fontSize: 11, color: "#888", marginTop: 4 },
  dateRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  dateText: { fontSize: 12, color: "#666", marginLeft: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: "bold" },
  loadingContainer: { alignItems: "center", marginTop: 50 },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#444", marginTop: 15 },
  emptySub: { fontSize: 14, color: "#999", textAlign: "center", marginTop: 5, paddingHorizontal: 40 },
});