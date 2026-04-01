import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../context/AuthContext";

export default function Riwayat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"dipinjam" | "selesai">("dipinjam");
  const [loading, setLoading] = useState(true);
  const [dataRiwayat, setDataRiwayat] = useState<any[]>([]);

  const fetchRiwayat = async () => {
    setLoading(true);
    try {
      const statusFilter = activeTab === "dipinjam" ? "dipinjam" : "dikembalikan";
      
      const { data, error } = await supabase
        .from("peminjaman")
        .select(`
          transaksi_id,
          tanggal_peminjaman,
          tanggal_rencana_kembali,
          status_peminjaman,
          aset (
            nama_barang,
            kode_barcode
          )
        `)
        .eq("user_id", user?.id)
        .eq("status_peminjaman", statusFilter)
        .order("tanggal_peminjaman", { ascending: false });

      if (error) throw error;
      setDataRiwayat(data || []);
    } catch (error) {
      console.error("Error fetching riwayat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [activeTab]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={[styles.cardIcon, { backgroundColor: activeTab === "dipinjam" ? "#FFF3E0" : "#E8F5E9" }]}>
        <Ionicons 
          name={activeTab === "dipinjam" ? "time" : "checkmark-circle"} 
          size={24} 
          color={activeTab === "dipinjam" ? "#EF6C00" : "#2E7D32"} 
        />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.asetName} numberOfLines={1}>{item.aset?.nama_barang || "Aset Tidak Diketahui"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: activeTab === "dipinjam" ? "#FFF9F0" : "#F2FBF4" }]}>
            <Text style={[styles.statusText, { color: activeTab === "dipinjam" ? "#FF9500" : "#34C759" }]}>
              {activeTab === "dipinjam" ? "Aktif" : "Selesai"}
            </Text>
          </View>
        </View>
        <Text style={styles.kodeText}>{item.aset?.kode_barcode}</Text>
        
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            {activeTab === "dipinjam" ? "Batas Kembali: " : "Dipinjam: "}
            <Text style={{ fontWeight: '600' }}>{activeTab === "dipinjam" ? item.tanggal_rencana_kembali : item.tanggal_peminjaman}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER - Konsisten dengan halaman lain */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Riwayat Saya</Text>
          
          {/* TAB NAVIGATION - Style diperhalus */}
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === "dipinjam" && styles.tabActive]}
              onPress={() => setActiveTab("dipinjam")}
            >
              <Text style={[styles.tabText, activeTab === "dipinjam" && styles.tabTextActive]}>Sedang Dipinjam</Text>
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

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={dataRiwayat}
          keyExtractor={(item) => item.transaksi_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={60} color="#CCC" />
              <Text style={styles.emptyTitle}>Tidak ada data</Text>
              <Text style={styles.emptySub}>Belum ada riwayat {activeTab} untuk akunmu.</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchRiwayat}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 110, // Sedikit lebih tinggi untuk menampung title + tabs
    justifyContent: 'center'
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F1F3F5",
    borderRadius: 12,
    padding: 4
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10
  },
  tabActive: {
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666"
  },
  tabTextActive: {
    color: "#007AFF",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  asetName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 10
  },
  kodeText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: '500',
    marginBottom: 6
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold"
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginTop: 15
  },
  emptySub: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 5
  },
});