import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Print from 'expo-print';
import { useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase/client";
// Library Kamera Baru
import { decode } from 'base64-arraybuffer';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
// Jika versi terbaru, gunakan ini:

const { width } = Dimensions.get("window");

export default function TambahAset() {
  const router = useRouter();
  const { user } = useAuth();

  // State Utama
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // State Kamera & Scanner
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);

  const [form, setForm] = useState({
    nama_barang: "",
    kode_barcode: "", // Otomatis
    merek: "",
    tipe: "",
    kategori_id: "",
    kondisi: "baik",
    keterangan: "",
  });

  useEffect(() => {
    fetchCategories();
    generateAutoCode();
  }, []);

  // 1. GENERATE KODE OTOMATIS
  const generateAutoCode = () => {
    const now = new Date();
    const timePart = `${now.getHours()}${now.getMinutes()}`;
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const newCode = `INV-${timePart}-${randomPart}`;
    setForm(prev => ({ ...prev, kode_barcode: newCode }));
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("kategori").select("*");
    if (!error && data) setCategories(data);
  };

  // 2. LOGIKA SCANNER
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setForm(prev => ({ ...prev, kode_barcode: data }));
    setShowScanner(false);
    Alert.alert("Scan Berhasil", `Kode "${data}" telah dimasukkan.`);
  };

  // 3. LOGIKA CETAK QR & PDF
  const generatePDF = async (nama: string, kode: string, mode: 'print' | 'share') => {
    const html = `
      <html>
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px;">
          <div style="border: 4px solid #000; padding: 40px; text-align: center; border-radius: 20px; width: 400px;">
            <h1 style="font-family: Arial; font-size: 40px; margin-bottom: 10px;">${nama}</h1>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${kode}" style="width: 300px; height: 300px;" />
            <p style="font-family: monospace; font-size: 25px; margin-top: 20px; font-weight: bold;">ID: ${kode}</p>
          </div>
        </body>
      </html>
    `;

    try {
      if (mode === 'print') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal membuat dokumen label.");
    }
  };

  // 4. LOGIKA UPLOAD GAMBAR
  const handleImageAction = () => {
    Alert.alert("Foto Aset", "Pilih sumber gambar:", [
      { text: "Kamera", onPress: takePhoto },
      { text: "Galeri", onPress: pickImage },
      { text: "Batal", style: "cancel" },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Izin Kamera Diperlukan");
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const uploadImageToSupabase = async (uri: string) => {
    try {
    // 1. Ambil ekstensi file
    const fileName = uri.split('/').pop() || 'temp_file';
    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    
    // 2. Tentukan path di bucket (folder barang/)
    const path = `barang/${Date.now()}.${fileExt}`;

    // 3. Baca file sebagai string Base64 (Cara paling stabil di Expo)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 4. Upload ke Supabase menggunakan ArrayBuffer
    // Ini jauh lebih aman daripada mengirimkan format Blob/File langsung
    const { data, error } = await supabase.storage
      .from('inventory') // Pastikan nama bucket sesuai
      .upload(path, decode(base64), {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        upsert: true
      });

    if (error) throw error;

    // 5. Ambil URL Publik untuk disimpan ke database
    const { data: urlData } = supabase.storage
      .from('inventory')
      .getPublicUrl(path);

    return urlData.publicUrl;
    } catch (error) {
    console.error('Upload Process Error:', error);
    throw error;
    }
  };

  // 5. SIMPAN DATA
  const handleSave = async () => {
    if (!form.nama_barang || !form.kode_barcode || !form.kategori_id) {
      Alert.alert("Perhatian", "Mohon isi Nama, Kode, dan Kategori!");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = null;
      if (imageUri) finalImageUrl = await uploadImageToSupabase(imageUri);

      const { error } = await supabase.from("aset").insert([
        {
          nama_barang: form.nama_barang,
          kode_barcode: form.kode_barcode,
          merek: form.merek,
          tipe: form.tipe,
          kategori_id: parseInt(form.kategori_id),
          kondisi: form.kondisi,
          keterangan: form.keterangan,
          created_by: user?.id,
          status_ketersediaan: "tersedia",
          image_url: finalImageUrl,
        },
      ]);

      if (error) throw error;

      Alert.alert(
        "Berhasil Disimpan",
        "Apakah Anda ingin mencetak label QR sekarang?",
        [
          { text: "Cetak Label", onPress: () => generatePDF(form.nama_barang, form.kode_barcode, 'print') },
          { text: "Selesai", onPress: () => router.back() },
        ]
      );
    } catch (err: any) {
      Alert.alert("Gagal Menyimpan", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tampilan Scanner Fullscreen
  if (showScanner) {
    if (!permission?.granted) {
      return (
        <SafeAreaView style={styles.center}>
          <Text style={{marginBottom: 20}}>Izin Kamera diperlukan untuk scan barcode</Text>
          <TouchableOpacity style={styles.btnSave} onPress={requestPermission}>
            <Text style={styles.btnSaveText}>Berikan Izin</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr", "code128", "ean13"] }}
        />
        <View style={styles.scannerOverlay}>
          <TouchableOpacity style={styles.btnCloseScanner} onPress={() => setShowScanner(false)}>
            <Ionicons name="close-circle" size={60} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Aset Baru</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* FOTO */}
        <Text style={styles.label}>Foto Barang</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={handleImageAction}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={{alignItems: 'center'}}>
              <Ionicons name="camera-outline" size={40} color="#999" />
              <Text style={{color: '#999'}}>Ambil Foto Aset</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* NAMA */}
        <Text style={styles.label}>Nama Barang *</Text>
        <TextInput 
          style={styles.input} 
          value={form.nama_barang} 
          onChangeText={(txt) => setForm({ ...form, nama_barang: txt })} 
        />

        {/* KODE ASET */}
        <Text style={styles.label}>Kode Aset (ID Unik) *</Text>
        <View style={styles.inputWithIcon}>
          <TextInput 
            style={{ flex: 1, fontSize: 16 }} 
            value={form.kode_barcode} 
            onChangeText={(txt) => setForm({ ...form, kode_barcode: txt })} 
          />
          <TouchableOpacity onPress={() => setShowScanner(true)}>
            <Ionicons name="scan-circle" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* MEREK & TIPE */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Merek</Text>
            <TextInput style={styles.input} value={form.merek} onChangeText={(txt) => setForm({ ...form, merek: txt })} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Tipe</Text>
            <TextInput style={styles.input} value={form.tipe} onChangeText={(txt) => setForm({ ...form, tipe: txt })} />
          </View>
        </View>

        {/* KATEGORI */}
        <Text style={styles.label}>Kategori *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.kategori_id}
            onValueChange={(val) => setForm({ ...form, kategori_id: val })}
          >
            <Picker.Item label="-- Pilih Kategori --" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat.kategori_id} label={cat.nama_kategori} value={cat.kategori_id.toString()} />
            ))}
          </Picker>
        </View>

        {/* KONDISI */}
        <Text style={styles.label}>Kondisi</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.kondisi}
            onValueChange={(val) => setForm({ ...form, kondisi: val })}
          >
            <Picker.Item label="Baik" value="baik" />
            <Picker.Item label="Rusak Ringan" value="rusak_ringan" />
            <Picker.Item label="Rusak Berat" value="rusak_berat" />
          </Picker>
        </View>

        {/* TOMBOL SIMPAN */}
        <TouchableOpacity 
          style={[styles.btnSave, loading && { backgroundColor: "#A2CFFE" }]} 
          onPress={handleSave} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>Simpan Aset</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  label: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 8, marginTop: 15 },
  imagePicker: { width: "100%", height: 180, backgroundColor: "#F8F9FA", borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#DDD", borderStyle: "dashed", overflow: 'hidden' },
  previewImage: { width: "100%", height: "100%", resizeMode: 'cover' },
  input: { backgroundColor: "#F8F9FA", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, fontSize: 16 },
  inputWithIcon: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, paddingHorizontal: 12, height: 55 },
  row: { flexDirection: "row" },
  pickerContainer: { backgroundColor: "#F8F9FA", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, overflow: "hidden" },
  btnSave: { backgroundColor: "#007AFF", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 30, marginBottom: 20 },
  btnSaveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  scannerOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  btnCloseScanner: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 40 },
});