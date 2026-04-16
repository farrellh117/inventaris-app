import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
import { useFocusEffect } from "@react-navigation/native";

export default function Riwayat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"dipinjam" | "selesai">("dipinjam");
  const [loading, setLoading] = useState(false);
  const [dataRiwayat, setDataRiwayat] = useState<any[]>([]);

  const fetchRiwayat = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("peminjaman")
        .select(`
          transaksi_id,
          tanggal_peminjaman,
          tanggal_rencana_kembali,
          status_peminjaman,
          catatan_peminjaman,
          aset (nama_barang, kode_barcode),
          users!peminjaman_user_id_fkey (nama_lengkap),
          pengembalian (
            kondisi_kembali,
            catatan_pengembalian,
            tanggal_pengembalian
          )
        `)
        .order("tanggal_peminjaman", { ascending: false });

      if (activeTab === "dipinjam") {
        query = query.in("status_peminjaman", ["dipinjam", "terlambat"]);
      } else {
        query = query.eq("status_peminjaman", "dikembalikan");
      }
        
      if (user?.role !== 'admin') {
        query = query.eq("user_id", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDataRiwayat(data || []);
    } catch (error: any) {
      console.error("Error fetching riwayat:", error.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id, user?.role]);

  useFocusEffect(
    useCallback(() => {
      fetchRiwayat();
    }, [fetchRiwayat])
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit',
      minute: '2-digit'
    }).replace('.', ':');
  };

  const renderItem = ({ item }: { item: any }) => {
    const isTerlambat = item.status_peminjaman === "terlambat";
    const statusColor = isTerlambat ? "#FF3B30" : (activeTab === "dipinjam" ? "#FF9500" : "#34C759");
    const dataKembali = item.pengembalian?.[0];

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row' }}>
          <View style={[styles.cardIcon, { backgroundColor: isTerlambat ? "#FFEBEB" : (activeTab === "dipinjam" ? "#FFF3E0" : "#E8F5E9") }]}>
            <Ionicons 
              name={isTerlambat ? "alert-circle" : (activeTab === "dipinjam" ? "time" : "checkmark-circle")} 
              size={24} 
              color={isTerlambat ? "#FF3B30" : (activeTab === "dipinjam" ? "#EF6C00" : "#2E7D32")} 
            />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.asetName} numberOfLines={1}>
                {item.aset?.nama_barang || "Aset Tidak Terdaftar"}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: isTerlambat ? "#FFF0F0" : (activeTab === "dipinjam" ? "#FFF9F0" : "#F2FBF4") }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status_peminjaman?.toUpperCase()}
                </Text>
              </View>
            </View>
            
            {user?.role === 'admin' && item.users && (
              <Text style={styles.borrowerName}>Peminjam: {item.users.nama_lengkap}</Text>
            )}
            
            <Text style={styles.kodeText}>{item.aset?.kode_barcode || "-"}</Text>
            
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.dateText}>
                {activeTab === "dipinjam" ? "Batas: " : "Kembali: "}
                <Text style={{ fontWeight: '600', color: '#333' }}>
                  {formatDate(activeTab === "dipinjam" ? item.tanggal_rencana_kembali : dataKembali?.tanggal_pengembalian)}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* CATATAN KEPERLUAN PINJAM */}
        {item.catatan_peminjaman && (
          <View style={styles.detailBox}>
            <View style={styles.divider} />
            <Text style={styles.catatanText}>
              <Text style={{ fontWeight: 'bold' }}>Keperluan: </Text>
              {item.catatan_peminjaman}
            </Text>
          </View>
        )}

        {/* CATATAN PENGEMBALIAN */}
        {activeTab === "selesai" && dataKembali && (
          <View style={styles.detailBox}>
            {!item.catatan_peminjaman && <View style={styles.divider} />}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.detailLabel}>Kondisi kembali:</Text>
              <Text style={[styles.kondisiText, { color: dataKembali.kondisi_kembali === 'baik' ? '#2E7D32' : '#FF3B30' }]}>
                {dataKembali.kondisi_kembali.toUpperCase()}
              </Text>
            </View>
            {dataKembali.catatan_pengembalian && (
              <Text style={styles.catatanAdmin}>
                <Text style={{ fontWeight: 'bold' }}>Catatan Pengembalian: </Text>
                {dataKembali.catatan_pengembalian}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

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
          <RefreshControl refreshing={loading} onRefresh={fetchRiwayat} colors={["#007AFF"]} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={70} color="#DDD" />
              <Text style={styles.emptyTitle}>Kosong</Text>
              <Text style={styles.emptySub}>Tidak ada riwayat.</Text>
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
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 15, marginBottom: 12, elevation: 1 },
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
  detailBox: { marginTop: 12, backgroundColor: '#F9F9F9', padding: 10, borderRadius: 8 },
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 8 },
  detailLabel: { fontSize: 12, color: '#666' },
  kondisiText: { fontSize: 12, fontWeight: 'bold' },
  catatanText: { fontSize: 12, color: '#444' },
  catatanAdmin: { fontSize: 12, color: '#444', marginTop: 5, fontStyle: 'italic' },
});