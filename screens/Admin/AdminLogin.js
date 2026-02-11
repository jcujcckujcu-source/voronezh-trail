import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || !secretCode) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (secretCode !== 'ADMIN2024') {
      Alert.alert('Ошибка', 'Неверный секретный код');
      return;
    }

    setLoading(true);
    
    setTimeout(async () => {
      if (email === 'admin@voronezh.ru' && password === 'Admin123!') {
        await AsyncStorage.setItem('adminToken', 'dummy-jwt-token');
        await AsyncStorage.setItem('adminEmail', email);
        navigation.navigate('AdminDashboard');
      } else {
        Alert.alert('Ошибка', 'Неверные учетные данные');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Администратор Воронежской тропы</Text>
      <Text style={styles.subtitle}>Панель управления контентом</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email администратора"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Секретный код доступа"
          value={secretCode}
          onChangeText={setSecretCode}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#95a5a6' }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Войти в панель управления</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#7f8c8d',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AdminLogin;
