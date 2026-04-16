import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase/client";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";

export default function DataAset() {
  const { user } = useAuth(); 
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("aset")
        .select(`
          *,
          kategori (nama_kategori)
        `)
        .order("nama_barang", { ascending: true });

      if (search) {
        query = query.ilike("nama_barang", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAssets();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchAssets]);

  const renderAssetItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.assetCard}
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: "/detail-aset",
        params: { id: item.aset_id }
      })}
    >
      
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.assetImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={30} color="#007AFF" />
          </View>
        )}
      </View>

      <View style={styles.assetInfo}>
        <View style={styles.assetHeader}>
          <Text style={styles.assetName} numberOfLines={1}>{item.nama_barang}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status_ketersediaan === 'tersedia' ? '#E8F5E9' : '#FFF3E0' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.status_ketersediaan === 'tersedia' ? '#2E7D32' : '#EF6C00' }
            ]}>
              {item.status_ketersediaan?.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.assetKode}>{item.kode_barcode}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="pricetag-outline" size={14} color="#666" />
          <Text style={styles.locationText}>
            {item.kategori?.nama_kategori || "Tanpa Kategori"} • {item.kondisi}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Daftar Aset</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Cari nama barang..." 
              value={search} 
              onChangeText={setSearch} 
            />
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={assets}
        keyExtractor={(item) => item.aset_id.toString()}
        renderItem={renderAssetItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAssets} colors={["#007AFF"]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={50} color="#CCC" />
              <Text style={styles.emptyText}>Aset tidak ditemukan</Text>
            </View>
          ) : null
        }
      />

      {/* Tombol FAB untuk Admin */}
      {user?.role === "admin" && (
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.8}
          onPress={() => router.push("/tambah-aset")}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  headerSafeArea: { backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#EEE" },
  headerContent: { paddingHorizontal: 20, paddingVertical: 15, minHeight: 95 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#1A1A1A", marginBottom: 10 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F3F5", borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  listContent: { padding: 20, paddingBottom: 100 },
  assetCard: { backgroundColor: "#fff", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 12, elevation: 2 },
  
  // Styling Gambar & Placeholder
  imageContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 12, 
    backgroundColor: "#F0F7FF", 
    overflow: 'hidden', // Penting agar gambar tidak keluar dari radius border
    justifyContent: "center", 
    alignItems: "center" 
  },
  assetImage: { 
    width: '100%', 
    height: '100%' 
  },
  imagePlaceholder: { 
    width: '100%', 
    height: '100%', 
    justifyContent: "center", 
    alignItems: "center" 
  },

  assetInfo: { flex: 1, marginLeft: 15 },
  assetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  assetName: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1, marginRight: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: "bold" },
  assetKode: { fontSize: 12, color: "#007AFF", fontWeight: '600', marginVertical: 2 },
  locationContainer: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  locationText: { fontSize: 12, color: "#666", marginLeft: 4 },
  fab: { 
    position: "absolute", 
    right: 20, 
    bottom: 20, 
    backgroundColor: "#007AFF", 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 5 
  },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#999", marginTop: 10, fontSize: 16 }
});