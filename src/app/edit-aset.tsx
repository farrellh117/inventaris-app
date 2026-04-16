import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Image, Modal,
  KeyboardAvoidingView, Platform 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase/client";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { decode } from 'base64-arraybuffer';
import * as FileSystem from "expo-file-system";
import * as Print from 'expo-print';

export default function EditAset() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama_barang: "",
    kode_barcode: "",
    merek: "",
    tipe: "",
    kategori_id: "",
    kondisi: "",
    keterangan: "",
    image_url: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: catData } = await supabase.from("kategori").select("*");
      if (catData) setCategories(catData);

      const { data: asset, error } = await supabase
        .from("aset")
        .select("*")
        .eq("aset_id", id)
        .single();

      if (error) throw error;
      setForm({
        nama_barang: asset.nama_barang || "",
        kode_barcode: asset.kode_barcode || "",
        merek: asset.merek || "",
        tipe: asset.tipe || "",
        kategori_id: asset.kategori_id?.toString() || "",
        kondisi: asset.kondisi || "baik",
        keterangan: asset.keterangan || "",
        image_url: asset.image_url || ""
      });
      if (asset.image_url) setImageUri(asset.image_url);
    } catch (err) {
      Alert.alert("Error", "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.3, // Turunkan kualitas untuk menghemat memori
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleUpdate = async () => {
    if (saving) return;
    setSaving(true);
    
    try {
      let finalImageUrl = form.image_url;

      // Cek jika imageUri adalah file lokal baru (bukan URL https)
      if (imageUri && imageUri.startsWith('file://')) {
        const fileName = `edit_${Date.now()}.jpg`;
        
        // Optimasi: Baca file dengan opsi yang lebih aman
        const base64 = await FileSystem.readAsStringAsync(imageUri, { 
          encoding: 'base64'
        });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inventory')
          .upload(`barang/${fileName}`, decode(base64), { 
            contentType: 'image/jpeg',
            upsert: true 
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('inventory')
          .getPublicUrl(`barang/${fileName}`);
          
        finalImageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("aset").update({
        nama_barang: form.nama_barang,
        merek: form.merek,
        tipe: form.tipe,
        kategori_id: parseInt(form.kategori_id),
        kondisi: form.kondisi,
        keterangan: form.keterangan,
        image_url: finalImageUrl
      }).eq("aset_id", id);

      if (error) throw error;

      Alert.alert("Sukses", "Data aset berhasil diperbarui", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Gagal Update", err.message || "Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Modal transparent visible={isPrinting}>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Menyiapkan Label...</Text>
            </View>
          </View>
        </Modal>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} disabled={saving}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Aset</Text>
          <TouchableOpacity onPress={handleUpdate} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#007AFF" /> : <Ionicons name="checkmark" size={28} color="#007AFF" />}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={saving}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Ionicons name="camera" size={40} color="#CCC" />
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Nama Barang</Text>
          <TextInput 
            style={styles.input} 
            value={form.nama_barang} 
            onChangeText={(t) => setForm({...form, nama_barang: t})} 
            placeholder="Contoh: Laptop MacBook"
          />

          <Text style={styles.label}>Kategori</Text>
          <View style={styles.pickerBox}>
            <Picker 
              selectedValue={form.kategori_id} 
              onValueChange={(v) => setForm({...form, kategori_id: v})}
              enabled={!saving}
            >
              <Picker.Item label="Pilih Kategori" value="" />
              {categories.map(c => (
                <Picker.Item key={c.kategori_id} label={c.nama_kategori} value={c.kategori_id.toString()} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Kondisi</Text>
          <View style={styles.pickerBox}>
            <Picker 
              selectedValue={form.kondisi} 
              onValueChange={(v) => setForm({...form, kondisi: v})}
              enabled={!saving}
            >
              <Picker.Item label="Baik" value="baik" />
              <Picker.Item label="Rusak" value="rusak" />
              <Picker.Item label="Hilang" value="hilang" />
            </Picker>
          </View>

          <Text style={styles.label}>Keterangan</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            multiline 
            numberOfLines={4}
            value={form.keterangan} 
            onChangeText={(t) => setForm({...form, keterangan: t})} 
            placeholder="Tambahkan catatan tambahan..."
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderColor: "#EEE", alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  label: { fontSize: 14, fontWeight: "600", color: "#666", marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: "#F8F9FA", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#DDD", fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  pickerBox: { backgroundColor: "#F8F9FA", borderRadius: 10, borderWidth: 1, borderColor: "#DDD", overflow: 'hidden' },
  imagePicker: { width: '100%', height: 200, backgroundColor: '#F8F9FA', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  loadingBox: { backgroundColor: '#fff', padding: 30, borderRadius: 15, alignItems: 'center' },
  loadingText: { marginTop: 15, fontWeight: 'bold' }
});