import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../context/AuthContext";

export default function Pengembalian() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State untuk data yang ditemukan
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [condition, setCondition] = useState("baik"); // Harus lowercase sesuai CHECK di SQL
  const [notes, setNotes] = useState("");

  const conditions = [
    { label: "Baik", value: "baik" },
    { label: "Rusak", value: "rusak" },
    { label: "Hilang", value: "hilang" }
  ];

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setIsScanning(false);
    setLoading(true);

    try {
      // 1. Cari aset berdasarkan barcode
      const { data: aset, error: asetErr } = await supabase
        .from("aset")
        .select("aset_id, nama_barang, kode_barcode")
        .eq("kode_barcode", data)
        .single();

      if (asetErr || !aset) {
        Alert.alert("Error", "Aset tidak ditemukan.");
        return;
      }

      // 2. Cari transaksi peminjaman yang belum dikembalikan (status 'dipinjam')
      const { data: loan, error: loanErr } = await supabase
        .from("peminjaman")
        .select(`
          transaksi_id,
          tanggal_peminjaman,
          user_id,
          users (nama_lengkap)
        `)
        .eq("aset_id", aset.aset_id)
        .eq("status_peminjaman", "dipinjam")
        .single();

      if (loanErr || !loan) {
        Alert.alert("Info", "Aset ini tidak sedang dalam status dipinjam.");
        return;
      }

      setActiveLoan({ ...loan, ...aset });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!activeLoan) return;

    setLoading(true);
    try {
      // Masukkan data ke tabel pengembalian
      const { error } = await supabase.from("pengembalian").insert([
        {
          transaksi_id: activeLoan.transaksi_id,
          aset_id: activeLoan.aset_id,
          user_id: user?.id, // Admin/User yang memproses
          kondisi_kembali: condition,
          catatan_admin: notes
        }
      ]);

      if (error) throw error;

      Alert.alert("Berhasil", "Aset telah dikembalikan ke inventaris.", [
        { text: "OK", onPress: () => {
          setActiveLoan(null);
          setNotes("");
          setCondition("baik");
        }}
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isScanning) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={() => setIsScanning(false)}>
          <Ionicons name="close-circle" size={60} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Pengembalian</Text>
          <Text style={styles.subtitle}>Proses pengembalian aset</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!activeLoan ? (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setIsScanning(true)}
          >
            <View style={styles.scanIconCircle}>
              <Ionicons name="qr-code-outline" size={40} color="#007AFF" />
            </View>
            <Text style={styles.scanBtnText}>Scan Barcode Barang</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loanInfoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.cardTitle}>Data Peminjaman Ditemukan</Text>
            </View>
            <Text style={styles.asetName}>{activeLoan.nama_barang}</Text>
            <Text style={styles.asetKode}>{activeLoan.kode_barcode}</Text>
            <View style={styles.divider} />
            <Text style={styles.borrowerName}>Peminjam: {activeLoan.users?.nama_lengkap}</Text>
            <TouchableOpacity onPress={() => setActiveLoan(null)}>
              <Text style={styles.resetText}>Batal / Scan Ulang</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.label}>Kondisi Barang saat Kembali</Text>
          <View style={styles.conditionContainer}>
            {conditions.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.conditionChip,
                  condition === item.value && styles.conditionChipActive
                ]}
                onPress={() => setCondition(item.value)}
              >
                <Text style={[
                  styles.conditionText,
                  condition === item.value && styles.conditionTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Catatan Kondisi (Opsional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Lecet sedikit di bagian bodi"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, (!activeLoan || loading) && { opacity: 0.5 }]} 
            onPress={handleConfirmReturn}
            disabled={!activeLoan || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Konfirmasi Pengembalian</Text>}
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
    paddingVertical: 15
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: 13,
    color: "#666"
  },
  scrollContent: {
    padding: 20
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  closeBtn: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center'
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
  loanInfoCard: {
    backgroundColor: "#E8F5E9",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#34C759"
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  asetName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  asetKode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  divider: {
    height: 1,
    backgroundColor: '#C8E6C9',
    marginVertical: 10
  },
  borrowerName: {
    fontSize: 13,
    color: '#444',
    fontStyle: 'italic'
  },
  resetText: {
    color: '#FF3B30',
    marginTop: 15,
    fontWeight: '600',
    textAlign: 'right'
  },
  formCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 2
  },
  label: {
    fontWeight: "600",
    marginBottom: 12
  },
  conditionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  conditionChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
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
    textAlignVertical: 'top',
    minHeight: 80
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 18, borderRadius: 12,
    alignItems: "center"
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
});