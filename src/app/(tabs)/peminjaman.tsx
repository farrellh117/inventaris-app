import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Peminjaman() {
  const [borrower, setBorrower] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Peminjaman</Text>
          <Text style={styles.subtitle}>Scan barcode untuk memulai</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.scanButton}>
          <View style={styles.scanIconCircle}><Ionicons name="barcode-outline" size={40} color="#007AFF" /></View>
          <Text style={styles.scanBtnText}>Klik untuk Scan</Text>
        </TouchableOpacity>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nama Peminjam</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap"
              value={borrower}
              onChangeText={setBorrower}
            />
          </View>
          <Text style={styles.label}>Keperluan / Catatan</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { height: 80}]}
              placeholder="Contoh: Sidang proposal"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitText}>Konfirmasi Pinjam</Text>
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
    elevation: 2
  },
  label: {
    fontWeight: "600",
    marginBottom: 8
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
    paddingVertical: 12
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center"
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold"
  },
});