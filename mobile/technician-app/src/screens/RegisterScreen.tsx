import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { authApi } from '../api';

export default function RegisterScreen({ onRegisterSuccess, onLoginLink }: { onRegisterSuccess: () => void, onLoginLink: () => void }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!phone || !name || !password || !confirmPassword) {
      setErrorMsg('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    console.log('Starting registration...', { phone, name, email, serviceArea });
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await authApi.register({
        phone,
        name,
        password,
        email: email || undefined,
        service_area: serviceArea || undefined,
      });
      console.log('Registration success:', result);
      Alert.alert(
        '가입 신청 완료',
        '관리자 승인 후 로그인 가능합니다.\n승인까지 잠시만 기다려주세요.',
        [{ text: '확인', onPress: onLoginLink }]
      );
    } catch (error: any) {
      console.log('Registration error:', error);
      console.log('Error response:', error.response?.data);
      const message = error.response?.data?.error || error.message || '가입 실패';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Smart A/S</Text>
      <Text style={styles.subtitle}>기사 가입</Text>

      <View style={styles.form}>
        <Text style={styles.label}>연락처 *</Text>
        <TextInput
          style={styles.input}
          placeholder="01012345678"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          autoComplete="tel"
        />

        <Text style={styles.label}>이름 *</Text>
        <TextInput
          style={styles.input}
          placeholder="홍길동"
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />

        <Text style={styles.label}>비밀번호 *</Text>
        <TextInput
          style={styles.input}
          placeholder="6자 이상"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoComplete="password-new"
        />

        <Text style={styles.label}>비밀번호 확인 *</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호 다시 입력"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoComplete="password-new"
        />

        <Text style={styles.label}>이메일 (선택)</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
        />

        <Text style={styles.label}>서비스 지역 (선택)</Text>
        <TextInput
          style={styles.input}
          placeholder="서울, 경기 등"
          value={serviceArea}
          onChangeText={setServiceArea}
        />

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>가입 신청</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={onLoginLink}>
          <Text style={styles.linkText}>이미 가입하셨나요? <Text style={styles.linkHighlight}>로그인</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#007AFF' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 32 },
  form: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  errorBox: { backgroundColor: '#FFE5E5', padding: 12, borderRadius: 8 },
  errorText: { color: '#D00', fontSize: 14, textAlign: 'center' },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#666' },
  linkHighlight: { color: '#007AFF', fontWeight: '600' },
});
