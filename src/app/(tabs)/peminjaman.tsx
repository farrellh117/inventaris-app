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
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);
      
      if (Platform.OS === 'android') {
        setShowPicker(false);
        if (pickerMode === 'date') {
          setTimeout(() => {
            setPickerMode('time');
            setShowPicker(true);
          }, 100);
        }
      }
    } else {
      setShowPicker(Platform.OS === 'ios');
    }
  };

  const showDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
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
      // 1. Simpan ke tabel Peminjaman (Sekarang menyertakan catatan_peminjaman)
      const { error: loanError } = await supabase.from("peminjaman").insert([
        {
          user_id: user?.id,
          aset_id: scannedAset.aset_id,
          tanggal_rencana_kembali: date.toISOString(), 
          status_peminjaman: "dipinjam",
          catatan_peminjaman: catatan, // Menyimpan catatan ke kolom baru
        },
      ]);
      if (loanError) throw loanError;

      // 2. Simpan ke Riwayat Aktivitas
      await supabase.from("riwayat").insert([
        {
          user_id: user?.id,
          jenis_aktivitas: "Peminjaman",
          keterangan: `Aset: ${scannedAset.nama_barang}. Keperluan: ${catatan || '-'}`,
        }
      ]);

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
            <Text style={styles.subtitle}>Atur waktu pengembalian dengan teliti</Text>
          </View>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {!scannedAset ? (
            <TouchableOpacity style={styles.scanButton} onPress={() => setIsScanning(true)}>
              <View style={styles.scanIconCircle}>
                <Ionicons name="qr-code-outline" size={40} color="#007AFF" />
              </View>
              <Text style={styles.scanBtnText}>Scan Barcode Barang</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.loanInfoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                <Text style={styles.cardTitle}>Aset Terpilih</Text>
              </View>
              <Text style={styles.asetName}>{scannedAset.nama_barang}</Text>
              <Text style={styles.asetKode}>{scannedAset.kode_barcode}</Text>
              <View style={styles.divider} />
              <Text style={styles.statusInfo}>Status: Siap untuk dipinjam</Text>
              <TouchableOpacity onPress={() => setScannedAset(null)}>
                <Text style={styles.resetText}>Batal / Scan Ulang</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.label}>Waktu Rencana Kembali</Text>
            <TouchableOpacity style={styles.dateInput} onPress={showDatePicker}>
              <Ionicons name="time-outline" size={20} color="#007AFF" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.dateValue}>
                  {date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
                <Text style={styles.timeValue}>
                  Pukul {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode={pickerMode}
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={[styles.label, { marginTop: 20 }]}>Catatan Keperluan</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Contoh: Digunakan untuk rapat di aula..."
              multiline
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
  loanInfoCard: { backgroundColor: "#E3F2FD", padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: "#007AFF" },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { marginLeft: 8, fontWeight: 'bold', color: '#007AFF' },
  asetName: { fontSize: 18, fontWeight: 'bold' },
  asetKode: { fontSize: 14, color: '#666', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#BBDEFB', marginVertical: 10 },
  statusInfo: { fontSize: 13, color: '#444', fontStyle: 'italic' },
  resetText: { color: '#FF3B30', marginTop: 15, fontWeight: '600', textAlign: 'right' },
  formCard: { backgroundColor: "white", padding: 20, borderRadius: 20, elevation: 2 },
  label: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
  dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  dateValue: { fontSize: 15, color: '#333' },
  timeValue: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  textArea: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#EEE', textAlignVertical: 'top', height: 80 },
  submitBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 25 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});