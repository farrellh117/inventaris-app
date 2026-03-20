import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Pengembalian() {
  const [scannedCode, setScannedCode] = useState("");
  const [condition, setCondition] = useState("Bagus"); // Default kondisi
  const [notes, setNotes] = useState("");

  const conditions = ["Bagus", "Rusak", "Hilang"];

  const handleReturn = () => {
    Alert.alert("Sukses", "Proses pengembalian berhasil disimpan.");
  };

  return (
    <View style={styles.container}>
      {/* HEADER - Konsisten dengan Peminjaman */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Pengembalian</Text>
          <Text style={styles.subtitle}>Scan barcode untuk mengembalikan aset</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SCAN BUTTON - Identik dengan Peminjaman */}
        <TouchableOpacity style={styles.scanButton} activeOpacity={0.7}>
          <View style={styles.scanIconCircle}>
            <Ionicons name="barcode-outline" size={40} color="#007AFF" />
          </View>
          <Text style={styles.scanBtnText}>Klik untuk Scan</Text>
        </TouchableOpacity>

        <View style={styles.formCard}>
          {/* PILIHAN KONDISI - Disesuaikan dengan style input */}
          <Text style={styles.label}>Kondisi Barang saat Kembali</Text>
          <View style={styles.conditionContainer}>
            {conditions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.conditionChip,
                  condition === item && styles.conditionChipActive
                ]}
                onPress={() => setCondition(item)}
              >
                <Text style={[
                  styles.conditionText,
                  condition === item && styles.conditionTextActive
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CATATAN - Identik dengan Peminjaman */}
          <Text style={styles.label}>Catatan Kondisi</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Contoh: Lecet pemakaian normal"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* SUBMIT BUTTON - Identik dengan Peminjaman */}
          <TouchableOpacity style={styles.submitButton} onPress={handleReturn}>
            <Text style={styles.submitText}>Konfirmasi Kembali</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 90,
    justifyContent: 'center'
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A"
  },
  subtitle: {
    fontSize: 13,
    color: "#666"
  },
  scrollContent: {
    padding: 20
  },
  scanButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#007AFF",
    marginBottom: 20
  },
  scanIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  scanBtnText: {
    color: "#007AFF",
    fontWeight: "600"
  },
  formCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  label: {
    fontWeight: "600",
    marginBottom: 12,
    color: "#333"
  },
  conditionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  conditionChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",
    backgroundColor: "#F8F9FA",
    alignItems: "center"
  },
  conditionChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF"
  },
  conditionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666"
  },
  conditionTextActive: {
    color: "#fff"
  },
  inputWrapper: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 20
  },
  input: {
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center"
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
});