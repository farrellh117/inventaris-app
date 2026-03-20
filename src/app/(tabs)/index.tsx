import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user } = useAuth();

  const stats = [
    { label: "Total Aset", value: "125", icon: "cube", color: "#007AFF" },
    { label: "Dipinjam", value: "12", icon: "arrow-up-circle", color: "#FF9500" },
    { label: "Tersedia", value: "113", icon: "checkmark-circle", color: "#34C759" },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Selamat Datang,</Text>
            <Text style={styles.userName}>
              {user?.email?.split('@')[0] || "Admin"}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={48} color={"#007AFF"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          {stats.map((item, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.iconCircle, { backgroundColor: "#EBF5FF" }]}>
              <Ionicons name="scan" size={28} color={"#007AFF"} />
            </View>
            <Text style={styles.actionText}>Scan Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.iconCircle, { backgroundColor: "#F0FFF4" }]}>
              <Ionicons name="add" size={28} color={"#34C759"} />
            </View>
            <Text style={styles.actionText}>Tambah Aset</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
        <View style={styles.recentList}>
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={40} color={"#CCC"} />
            <Text style={styles.emptyText}>Belum ada aktivitas terbaru</Text>
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
    minHeight: 90,
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
    shadowRadius: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4
  },
  statLabel: {
    fontSize: 11,
    color: "#888" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25
  },
  actionButton: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2 },
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
    padding: 30,
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyState: {
    alignItems: "center"
  },
  emptyText: {
    color: "#999",
    marginTop: 10,
    fontSize: 14
  },
});