import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^01[0-9]{8,9}$/;
    return phoneRegex.test(phoneNumber.replace(/[-\s]/g, ''));
  };

  const handleLogin = async () => {
    setErrorMsg('');
    if (!phone || !password) {
      setErrorMsg('연락처와 비밀번호를 입력해주세요.');
      return;
    }

    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!validatePhone(cleanPhone)) {
      setErrorMsg('올바른 연락처를 입력해주세요. (예: 01012345678)');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(cleanPhone, password);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('token', response.data.token);
        window.localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      onLogin();
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || !error.response) {
        setErrorMsg('서버에 연결할 수 없습니다.');
      } else {
        setErrorMsg(error.response?.data?.error || '로그인 실패');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (!phone || !password || !name) {
      setErrorMsg('연락처, 이름, 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!agreed) {
      setErrorMsg('개인정보 수집·이용에 동의해주세요.');
      return;
    }

    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!validatePhone(cleanPhone)) {
      setErrorMsg('올바른 연락처를 입력해주세요. (예: 01012345678)');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(cleanPhone, name, '', password);
      setErrorMsg('');
      alert('회원가입 성공! 로그인 해주세요.');
      setIsRegisterMode(false);
      setPassword('');
      setAgreed(false);
      setPhone(cleanPhone);
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || !error.response) {
        setErrorMsg('서버에 연결할 수 없습니다.');
      } else {
        setErrorMsg(error.response?.data?.error || '회원가입 실패');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart A/S</Text>
      <Text style={styles.subtitle}>고객용</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, !isRegisterMode && styles.activeTab]}
          onPress={() => {
            setIsRegisterMode(false);
            setAgreed(false);
            setErrorMsg('');
          }}
        >
          <Text style={[styles.tabText, !isRegisterMode && styles.activeTabText]}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, isRegisterMode && styles.activeTab]}
          onPress={() => {
            setIsRegisterMode(true);
          }}
        >
          <Text style={[styles.tabText, isRegisterMode && styles.activeTabText]}>회원가입</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.inputContainer}>
          <Text style={styles.label}>연락처</Text>
          <TextInput
            style={styles.input}
            placeholder="01012345678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={11}
            editable={!loading}
          />
        </View>

        {isRegisterMode && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              placeholder="홍길동"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder={isRegisterMode ? '6자 이상' : '비밀번호'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        {isRegisterMode && (
          <View style={styles.agreementContainer}>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.agreementText}>
                회원가입 시 개인정보 수집·이용에 동의합니다.
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.policyLink}
              onPress={() => setShowPrivacyModal(true)}
            >
              <Text style={styles.policyLinkText}>[개인정보처리방침 보기]</Text>
            </TouchableOpacity>
          </View>
        )}

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button, 
            loading && styles.buttonDisabled,
            isRegisterMode && !agreed && styles.buttonDisabled
          ]}
          onPress={() => {
            if (isRegisterMode) {
              handleRegister();
            } else {
              handleLogin();
            }
          }}
          disabled={loading || (isRegisterMode && !agreed)}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegisterMode ? '회원가입' : '로그인'}
            </Text>
          )}
        </TouchableOpacity>

        {!isRegisterMode ? (
          <TouchableOpacity
            onPress={() => setIsRegisterMode(true)}
            disabled={loading}
          >
            <Text style={styles.linkText}>회원가입 하러가기 →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setIsRegisterMode(false);
              setAgreed(false);
            }}
            disabled={loading}
          >
            <Text style={styles.linkText}>로그인 하러가기 →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <PrivacyPolicyScreen onClose={() => setShowPrivacyModal(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  agreementContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  policyLink: {
    marginTop: 12,
    marginLeft: 36,
  },
  policyLinkText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#D00',
    fontSize: 14,
    textAlign: 'center',
  },
});
