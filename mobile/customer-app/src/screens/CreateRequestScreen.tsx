import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { repairApi } from '../api';

export default function CreateRequestScreen() {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    product_name: '',
    purchase_date: '',
    customer_name: '',
    phone: '',
    address: '',
    symptom_description: '',
  });

  const handleGetLocation = useCallback(() => {
    setLocationLoading(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          setFormData(prev => ({ 
            ...prev, 
            address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
          }));
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const handlePickImage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const input = window.document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (e: any) => {
        const files = Array.from(e.target.files);
        const newUrls = files.map((f: File) => URL.createObjectURL(f));
        setPhotoUrls(prev => [...prev, ...newUrls]);
      };
      input.click();
    }
  }, []);

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(() => {
    if (!formData.product_name || !formData.customer_name || !formData.phone || !formData.address) {
      setErrorMsg('필수 항목을 입력해주세요.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    
    const payload = {
      ...formData,
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
    };
    
    repairApi.create(payload)
      .then(() => {
        setSuccessMsg('A/S 접수가 완료되었습니다!');
        setFormData({
          product_name: '', purchase_date: '', customer_name: '',
          phone: '', address: '', symptom_description: '',
        });
        setPhotoUrls([]);
        setLocation(null);
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.error || '접수 실패');
      })
      .finally(() => setLoading(false));
  }, [formData, location]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>A/S 접수</Text>

      {successMsg ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMsg}</Text>
          <TouchableOpacity onPress={() => setSuccessMsg('')}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity onPress={() => setErrorMsg('')}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>제품명 *</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 삼성 냉장고"
          value={formData.product_name}
          onChangeText={(v) => setFormData({ ...formData, product_name: v })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>구매일 *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={formData.purchase_date}
          onChangeText={(v) => setFormData({ ...formData, purchase_date: v })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>고객명 *</Text>
        <TextInput
          style={styles.input}
          placeholder="이름"
          value={formData.customer_name}
          onChangeText={(v) => setFormData({ ...formData, customer_name: v })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>연락처 *</Text>
        <TextInput
          style={styles.input}
          placeholder="010-xxxx-xxxx"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(v) => setFormData({ ...formData, phone: v })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>주소 *</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="주소"
            value={formData.address}
            onChangeText={(v) => setFormData({ ...formData, address: v })}
          />
          <TouchableOpacity 
            style={[styles.locationBtn, locationLoading && styles.locationBtnDisabled]} 
            onPress={handleGetLocation}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.locationIcon}>📍</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>증상 설명</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="증상을 설명해주세요"
          multiline
          numberOfLines={4}
          value={formData.symptom_description}
          onChangeText={(v) => setFormData({ ...formData, symptom_description: v })}
        />
      </View>

      <TouchableOpacity style={styles.photoBtn} onPress={handlePickImage}>
        <Text>📷 사진 추가 (제품모델명을 사진으로 첨부하세요.)</Text>
      </TouchableOpacity>

      {photoUrls.length > 0 && (
        <View style={styles.photoContainer}>
          <Text style={styles.photoCount}>{photoUrls.length}장의 사진</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {photoUrls.map((uri, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.photoRemove}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Text style={styles.photoRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>접수하기</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 8 },
  locationBtn: { padding: 12, backgroundColor: '#eee', borderRadius: 8, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  locationBtnDisabled: { opacity: 0.6 },
  locationIcon: { fontSize: 18 },
  photoBtn: { padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  photoContainer: { marginBottom: 16 },
  photoCount: { fontSize: 12, color: '#666', marginBottom: 8 },
  photoWrapper: { position: 'relative', marginRight: 8 },
  photoPreview: { width: 80, height: 80, borderRadius: 8 },
  photoRemove: { position: 'absolute', top: -8, right: -8, backgroundColor: '#ff4444', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  photoRemoveText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  successBox: { backgroundColor: '#d4edda', borderColor: '#c3e6cb', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  successText: { color: '#155724', fontSize: 14 },
  errorBox: { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText: { color: '#721c24', fontSize: 14 },
  closeBtn: { fontSize: 16, color: '#333', padding: 4 },
});
