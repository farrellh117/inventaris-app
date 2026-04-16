import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Alert, ActivityIndicator, Platform,
  KeyboardAvoidingView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../context/AuthContext";

export default function Peminjaman() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAset, setScannedAset] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setIsScanning(false);
    setLoading(true);
    try {
      const { data: aset, error } = await supabase
        .from("aset")
        .select("*")
        .eq("kode_barcode", data)
        .single();

      if (error || !aset) {
        Alert.alert("Error", "Barcode tidak dikenali sistem.");
        return;
      }
      if (aset.status_ketersediaan !== "tersedia") {
        Alert.alert("Gagal", "Aset sedang tidak tersedia.");
        return;
      }
      setScannedAset(aset);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPinjam = async () => {
    if (!scannedAset) return Alert.alert("Scan Dulu", "Silakan scan barcode aset.");
    setLoading(true);
    try {
      const { error } = await supabase.from("peminjaman").insert([
        {
          user_id: user?.id,
          aset_id: scannedAset.aset_id,
          tanggal_rencana_kembali: date.toISOString().split('T')[0],
          status_peminjaman: "dipinjam",
        },
      ]);
      if (error) throw error;
      Alert.alert("Berhasil", "Peminjaman tercatat!", [
        { text: "Selesai", onPress: () => {
          setScannedAset(null);
          setCatatan("");
          setDate(new Date());
        }}
      ]);
    } catch (error: any) {
      Alert.alert("Database Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isScanning) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleBarCodeScanned} />
        <TouchableOpacity style={styles.closeBtn} onPress={() => setIsScanning(false)}>
          <Ionicons name="close-circle" size={50} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Peminjaman</Text>
            <Text style={styles.subtitle}>Proses peminjaman aset baru</Text>
          </View>
        </SafeAreaView>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {!scannedAset ? (
            <TouchableOpacity style={styles.scanButton} onPress={() => setIsScanning(true)}>
              <View style={styles.scanIconCircle}>
                <Ionicons name="qr-code-outline" size={40} color="#007AFF" />
              </View>
              <Text style={styles.scanBtnText}>Scan Barcode Barang</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.asetInfoCard}>
              <Text style={styles.infoTitle}>ASET TERPILIH</Text>
              <Text style={styles.infoName}>{scannedAset.nama_barang}</Text>
              <Text style={styles.infoKode}>{scannedAset.kode_barcode}</Text>
              <TouchableOpacity onPress={() => setScannedAset(null)}>
                <Text style={styles.resetBtn}>Batal / Scan Ulang</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.label}>Tanggal Rencana Kembali</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.dateValue}>{date.toLocaleDateString('id-ID')}</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={[styles.label, { marginTop: 20 }]}>Catatan Keperluan</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Contoh: Digunakan untuk praktikum di Lab..."
              multiline
              numberOfLines={4}
              value={catatan}
              onChangeText={setCatatan}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, (!scannedAset || loading) && { opacity: 0.5 }]} 
              onPress={handleConfirmPinjam}
              disabled={!scannedAset || loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>PINJAM SEKARANG</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  headerSafeArea: { backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#EEE" },
  headerContent: { paddingHorizontal: 20, paddingVertical: 15 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { color: "#666", fontSize: 13 },
  scrollContent: { padding: 20 },
  cameraContainer: { flex: 1, backgroundColor: 'black' },
  closeBtn: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  scanButton: { backgroundColor: "#fff", padding: 30, borderRadius: 20, alignItems: "center", borderStyle: 'dashed', borderWidth: 2, borderColor: '#007AFF', marginBottom: 20 },
  scanIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#E8F5FF", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  scanBtnText: { color: '#007AFF', fontWeight: '600' },
  asetInfoCard: { backgroundColor: '#E3F2FD', padding: 20, borderRadius: 15, marginBottom: 20 },
  infoTitle: { fontSize: 10, fontWeight: 'bold', color: '#007AFF', marginBottom: 5 },
  infoName: { fontSize: 18, fontWeight: 'bold' },
  infoKode: { color: '#666', marginBottom: 10 },
  resetBtn: { color: '#FF3B30', fontWeight: '600', fontSize: 12 },
  formCard: { backgroundColor: "white", padding: 20, borderRadius: 20, elevation: 2 },
  label: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
  dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  dateValue: { marginLeft: 10, fontSize: 16 },
  textArea: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#EEE', textAlignVertical: 'top', height: 100 },
  submitBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 25 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});