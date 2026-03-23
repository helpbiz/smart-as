import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';

export default function PrivacyPolicyScreen({ onClose }: { onClose: () => void }) {
  const handleLink = () => {
    Linking.openURL('https://foryouelec.co.kr/privacy');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>개인정보처리방침</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. 개인정보의 수집 및 이용</Text>
        <Text style={styles.text}>
          주식회사 포유일렉트릭(이하 '회사')는 고객님의 동의 하에 다음과 같은 목적으로 개인정보를 수집합니다.
          {'\n\n'}
          ① 서비스 제공 및 계약 이행{'\n'}
          - 연락처, 이름, 주소, 증상 설명, 사진 등 A/S 서비스 제공에 필요한 정보{'\n\n'}
          ② 서비스 개선 및 맞춤 서비스 제공{'\n'}
          - 서비스 이용 패턴 분석, 고객 편의 증진{'\n\n'}
          ③ 고객 고충 처리{'\n'}
          - AS 요청 처리, 민원 해결
        </Text>

        <Text style={styles.sectionTitle}>2. 수집하는 개인정보 항목</Text>
        <Text style={styles.text}>
          ① 회원가입 시{'\n'}
          - 필수: 연락처(전화번호), 비밀번호, 이름{'\n\n'}
          ② A/S 접수 시{'\n'}
          - 필수: 연락처, 이름, 주소, 제품명, 구매일{'\n'}
          - 선택: 사진, 위치정보, 증상 설명{'\n\n'}
          ③ 서비스 이용 과정에서 자동 수집{'\n'}
          - IP 주소, 쿠키, 서비스 이용 기록, 접속 로그
        </Text>

        <Text style={styles.sectionTitle}>3. 개인정보의 보유 및 이용기간</Text>
        <Text style={styles.text}>
          회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
          {'\n\n'}
          ① 계약 또는 청약철회 등에 관한 기록: 5년{'\n'}
          ② 대금결제 및 재화등 공급에 관한 기록: 5년{'\n'}
          ③ 소비자의 불만 또는 분쟁처리에 관한 기록: 3년{'\n'}
          ④ 로그인 기록: 3개월
        </Text>

        <Text style={styles.sectionTitle}>4. 개인정보의 파기</Text>
        <Text style={styles.text}>
          개인정보의 수집 및 이용 목적 달성 후 지체 없이 파기합니다. 단, 관계법령에 의해 보존해야 하는 경우 해당 법령에서 정한 기간 동안 보관합니다.{'\n\n'}
          파기 방법:{'\n'}
          - 전자적 파일: 복구할 수 없는 기술적 방법 사용{'\n'}
          - 종이 문서: 분쇄 또는 소각
        </Text>

        <Text style={styles.sectionTitle}>5. 개인정보 제공</Text>
        <Text style={styles.text}>
          회원은 동의를 거부할 권리가 있으며, 동의를 거부할 경우 A/S 서비스 이용이 제한될 수 있습니다.{'\n\n'}
          별도 공유 없이 내부 시스템에서만 서비스 제공 목적으로 사용됩니다.
        </Text>

        <Text style={styles.sectionTitle}>6. 개인정보 보호책임자</Text>
        <Text style={styles.text}>
          성명: 포유일렉트릭 개인정보 보호책임자{'\n'}
          연락처: 02-XXXX-XXXX{'\n'}
          이메일: privacy@foryouelec.co.kr
        </Text>

        <Text style={styles.sectionTitle}>7. 동의 철회</Text>
        <Text style={styles.text}>
          고객님은 개인정보 수집 및 이용에 대한 동의를 철회할 수 있습니다. 동의 철회를 원하는 경우 고객센터로 문의해주세요.
        </Text>

        <Text style={styles.sectionTitle}>8. 개정 공지</Text>
        <Text style={styles.text}>
          이 정책은 법령 변경 또는 회사의 정책 변경에 따라 수정될 수 있으며, 중요한 변경 시 공지하겠습니다.{'\n\n'}
          공고일: 2024년 1월 1일{'\n'}
          시행일: 2024년 1월 1일
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.confirmBtn} onPress={onClose}>
        <Text style={styles.confirmText}>확인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  confirmBtn: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
