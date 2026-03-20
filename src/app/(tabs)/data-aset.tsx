import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const DUMMY_ASSETS = [
  { id: '1', nama: 'MacBook Pro M2', kode: 'AST-001', status: 'Tersedia', lokasi: 'Ruang IT', foto: 'https://via.placeholder.com/100' },
  { id: '2', nama: 'Proyektor Epson', kode: 'AST-002', status: 'Dipinjam', lokasi: 'Meeting Room A', foto: 'https://via.placeholder.com/100' },
  { id: '3', nama: 'Kursi Kerja Ergo', kode: 'AST-003', status: 'Tersedia', lokasi: 'Lantai 2', foto: 'https://via.placeholder.com/100' },
];

export default function DataAset() {
  const [search, setSearch] = useState("");

  const renderAssetItem = ({ item }: any) => (
    <TouchableOpacity style={styles.assetCard} activeOpacity={0.7}>
      <Image source={{ uri: item.foto }} style={styles.assetImage} />
      <View style={styles.assetInfo}>
        <View style={styles.assetHeader}>
          <Text style={styles.assetName} numberOfLines={1}>{item.nama}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Tersedia' ? '#E8F5E9' : '#FFF3E0' }]}>
            <Text style={[styles.statusText, { color: item.status === 'Tersedia' ? '#2E7D32' : '#EF6C00' }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.assetKode}>{item.kode}</Text>
        <View style={styles.locationContainer}><Ionicons name="location-outline" size={14} color="#666" /><Text style={styles.locationText}>{item.lokasi}</Text></View>
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
            <TextInput style={styles.searchInput} placeholder="Cari aset..." value={search} onChangeText={setSearch} />
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={DUMMY_ASSETS.filter(a => a.nama.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={(item) => item.id}
        renderItem={renderAssetItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab}><Ionicons name="add" size={30} color="#fff" /></TouchableOpacity>
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
    minHeight: 90,
    justifyContent: 'center'
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14
  },
  listContent: {
    padding: 20,
    paddingBottom: 100
  },
  assetCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2
  },
  assetImage: {
    width: 60,
    height: 60,
    borderRadius: 10
  },
  assetInfo: {
    flex: 1,
    marginLeft: 15
  },
  assetHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  assetName: {
    fontSize: 16,
    fontWeight: "bold"
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold"
  },
  assetKode: {
    fontSize: 12,
    color: "#007AFF",
    marginVertical: 2
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4
  },
  fab: {
    position: "absolute",
    right: 20, bottom: 20,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5
  },
});