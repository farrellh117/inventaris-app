import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Data Dummy Riwayat (Timeline)
const DUMMY_HISTORY = [
  {
    id: "1",
    type: "Kembali",
    aset: "MacBook Pro M2",
    user: "Budi Sudarsono",
    waktu: "10:45",
    tanggal: "Hari Ini",
    kondisi: "Bagus",
    icon: "arrow-down-circle",
    color: "#34C759",
  },
  {
    id: "2",
    type: "Pinjam",
    aset: "Proyektor Epson",
    user: "Siti Aminah",
    waktu: "08:20",
    tanggal: "Hari Ini",
    kondisi: null,
    icon: "arrow-up-circle",
    color: "#007AFF",
  },
  {
    id: "3",
    type: "Kembali",
    aset: "iPad Air 5",
    user: "Andi Wijaya",
    waktu: "16:00",
    tanggal: "Kemarin",
    kondisi: "Lecet Sedikit",
    icon: "arrow-down-circle",
    color: "#34C759",
  },
  {
    id: "4",
    type: "Pinjam",
    aset: "MacBook Pro M2",
    user: "Budi Sudarsono",
    waktu: "09:00",
    tanggal: "Kemarin",
    icon: "arrow-up-circle",
    color: "#007AFF",
  },
];

export default function Riwayat() {
  const renderTimelineItem = ({ item, index }: { item: typeof DUMMY_HISTORY[0]; index: number }) => (
    <View style={styles.timelineRow}>
      {/* Kolom Kiri: Garis & Ikon */}
      <View style={styles.timelineLeft}>
        <View style={[styles.iconCircle, { backgroundColor: item.color + "15" }]}>
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        </View>
        {index !== DUMMY_HISTORY.length - 1 && <View style={styles.verticalLine} />}
      </View>

      {/* Kolom Kanan: Detail Konten */}
      <View style={styles.timelineContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.typeText, { color: item.color }]}>{item.type.toUpperCase()}</Text>
          <Text style={styles.timeText}>{item.waktu} • {item.tanggal}</Text>
        </View>
        
        <Text style={styles.asetText}>{item.aset}</Text>
        
        <View style={styles.userDetail}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.userName}>{item.user}</Text>
        </View>

        {item.kondisi && (
          <View style={styles.conditionBox}>
            <Text style={styles.conditionLabel}>Kondisi: </Text>
            <Text style={styles.conditionValue}>{item.kondisi}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER (Konsisten dengan halaman lain) */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Riwayat & Status</Text>
          <Text style={styles.subtitle}>Log aktivitas peminjaman aset</Text>
        </View>
      </SafeAreaView>

      {/* LIST TIMELINE */}
      <FlatList
        data={DUMMY_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={renderTimelineItem}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>Belum ada riwayat</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerSafeArea: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 90,
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
  },
  listPadding: {
    padding: 20,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 100,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 15,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#EAEAEA",
    marginVertical: -5,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    color: "#999",
  },
  asetText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userName: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
  },
  conditionBox: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#34C759",
  },
  conditionLabel: {
    fontSize: 11,
    color: "#888",
  },
  conditionValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#444",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: "#999",
  },
});