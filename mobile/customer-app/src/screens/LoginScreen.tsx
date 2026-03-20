import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../src/api';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('입력 오류', '연락처와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(phone, password);
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin();
    } catch (error: any) {
      Alert.alert('로그인 실패', error.response?.data?.error || '연락처 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart A/S</Text>
      <Text style={styles.subtitle}>고객용</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="연락처"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>로그인</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#007AFF' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 40 },
  form: { gap: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
