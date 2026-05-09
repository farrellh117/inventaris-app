import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Keluar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER PROFIL */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={60} color="#007AFF" />
            </View>
            <View style={[
              styles.roleBadge, 
              { backgroundColor: user?.role === 'admin' ? '#FF9500' : '#007AFF' }
            ]}>
              <Text style={styles.roleText}>
                {user?.role === 'admin' ? 'ADMIN' : 'MAHASISWA'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.nama_lengkap || "Nama Lengkap"}</Text>
          <Text style={styles.userEmail}>{user?.email || "email@unipa.ac.id"}</Text>
        </View>

        {/* INFO DETAIL SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="at-circle-outline" size={22} color="#666" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>@{user?.username || "username"}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, styles.noBorder]}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#666" />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Status Hak Akses</Text>
                <Text style={styles.infoValue}>
                  {user?.role === 'admin' ? 'Administrator Sistem' : 'Peminjam Aset'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* PENGATURAN SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text style={styles.logoutText}>Keluar Akun</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Inventory Manager v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginVertical: 30,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roleBadge: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  roleText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    marginBottom: 10,
    marginLeft: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  infoTextWrapper: {
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F0",
    padding: 16,
    borderRadius: 16,
    marginTop: 5, // Sedikit dikurangi agar jaraknya pas setelah menu dihapus
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  versionText: {
    textAlign: "center",
    color: "#CCC",
    fontSize: 12,
    marginTop: 40,
  },
});