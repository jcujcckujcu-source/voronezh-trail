# create-admin-panel.ps1
Write-Host "=== СОЗДАНИЕ АДМИН-ПАНЕЛИ VORONEZH TRAIL ===" -ForegroundColor Cyan

# 1. Проверяем, находимся ли в папке проекта
if (-not (Test-Path ".\package.json")) {
    Write-Host "Ошибка: Запустите скрипт из папки проекта voronezh-trail" -ForegroundColor Red
    exit 1
}

# 2. Создаем папку Admin
$adminPath = ".\screens\Admin"
if (-not (Test-Path $adminPath)) {
    New-Item -ItemType Directory -Path $adminPath -Force
    Write-Host "✓ Создана папка: screens/Admin" -ForegroundColor Green
}

# 3. Создаем AdminLogin.js
$adminLoginCode = @"
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
"@

$adminLoginCode | Out-File -FilePath "$adminPath\AdminLogin.js" -Encoding UTF8
Write-Host "✓ Создан файл: AdminLogin.js" -ForegroundColor Green

# 4. Создаем AdminDashboard.js
$adminDashboardCode = @"
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboard = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalRoutes: 0,
    activeUsers: 0,
    pendingReviews: 0,
    todayVisits: 0
  });
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    loadAdminInfo();
    loadStats();
  }, []);

  const loadAdminInfo = async () => {
    const email = await AsyncStorage.getItem('adminEmail') || 'admin@voronezh.ru';
    setAdminEmail(email);
  };

  const loadStats = async () => {
    // Заглушка данных - замените на API
    setStats({
      totalRoutes: 15,
      activeUsers: 234,
      pendingReviews: 7,
      todayVisits: 89
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход из системы',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.navigate('AdminLogin');
          }
        }
      ]
    );
  };

  const menuItems = [
    { title: 'Маршруты', icon: 'map', count: stats.totalRoutes, color: '#3498db', screen: 'RoutesManager' },
    { title: 'Пользователи', icon: 'people', count: stats.activeUsers, color: '#2ecc71', screen: 'UsersManager' },
    { title: 'Отзывы', icon: 'star', count: stats.pendingReviews, color: '#f39c12', screen: 'ReviewsManager' },
    { title: 'Контент', icon: 'document-text', count: 24, color: '#9b59b6', screen: 'ContentManager' },
    { title: 'Аналитика', icon: 'stats-chart', count: '📊', color: '#1abc9c', screen: 'Analytics' },
    { title: 'Настройки', icon: 'settings', count: '⚙️', color: '#95a5a6', screen: 'Settings' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Добро пожаловать!</Text>
          <Text style={styles.adminEmail}>{adminEmail}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="exit-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Статистика */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Общая статистика</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#3498db' }]}>{stats.totalRoutes}</Text>
            <Text style={styles.statLabel}>Маршрутов</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#2ecc71' }]}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Пользователей</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#f39c12' }]}>{stats.pendingReviews}</Text>
            <Text style={styles.statLabel}>Отзывов</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#e74c3c' }]}>{stats.todayVisits}</Text>
            <Text style={styles.statLabel}>Посещений</Text>
          </View>
        </View>
      </View>

      {/* Меню */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Быстрый доступ</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={28} color="#fff" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuCount}>{item.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Быстрые действия */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={22} color="#3498db" />
            <Text style={styles.actionText}>Добавить маршрут</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications" size={22} color="#f39c12" />
            <Text style={styles.actionText}>Уведомления</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={22} color="#2ecc71" />
            <Text style={styles.actionText}>Экспорт данных</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Административная панель • v1.0</Text>
        <Text style={styles.footerSubtext}>Воронежская историческая тропа</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  adminEmail: {
    color: '#bdc3c7',
    fontSize: 14,
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  menuSection: {
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    backgroundColor: '#fff',
    width: '31%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  menuCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  actionsSection: {
    padding: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  footer: {
    padding: 25,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e6ed',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});

export default AdminDashboard;
"@

$adminDashboardCode | Out-File -FilePath "$adminPath\AdminDashboard.js" -Encoding UTF8
Write-Host "✓ Создан файл: AdminDashboard.js" -ForegroundColor Green

# 5. Создаем остальные файлы
$emptyFiles = @('RoutesManager.js', 'UsersManager.js', 'ReviewsManager.js', 'ContentManager.js')
foreach ($file in $emptyFiles) {
    $fileContent = @"
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const $( $file.Replace('.js', '') ) = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>$( $file.Replace('.js', '') ) - В разработке</Text>
      <Text style={styles.subtext}>Этот раздел находится в разработке</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default $( $file.Replace('.js', '') );
"@
    $fileContent | Out-File -FilePath "$adminPath\$file" -Encoding UTF8
    Write-Host "✓ Создан файл: $file" -ForegroundColor Green
}

# 6. Создаем навигатор
$navPath = ".\navigation"
if (-not (Test-Path $navPath)) {
    New-Item -ItemType Directory -Path $navPath -Force
    Write-Host "✓ Создана папка: navigation" -ForegroundColor Green
}

$adminNavCode = @"
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Импортируем экраны админ-панели
import AdminLogin from '../screens/Admin/AdminLogin';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import RoutesManager from '../screens/Admin/RoutesManager';
import UsersManager from '../screens/Admin/UsersManager';
import ReviewsManager from '../screens/Admin/ReviewsManager';
import ContentManager from '../screens/Admin/ContentManager';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminLogin"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="AdminLogin"
        component={AdminLogin}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Панель управления' }}
      />
      <Stack.Screen
        name="RoutesManager"
        component={RoutesManager}
        options={{ title: 'Управление маршрутами' }}
      />
      <Stack.Screen
        name="UsersManager"
        component={UsersManager}
        options={{ title: 'Управление пользователями' }}
      />
      <Stack.Screen
        name="ReviewsManager"
        component={ReviewsManager}
        options={{ title: 'Модерация отзывов' }}
      />
      <Stack.Screen
        name="ContentManager"
        component={ContentManager}
        options={{ title: 'Управление контентом' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
"@

$adminNavCode | Out-File -FilePath "$navPath\AdminNavigator.js" -Encoding UTF8
Write-Host "✓ Создан файл: AdminNavigator.js" -ForegroundColor Green

Write-Host "`n=== АДМИН-ПАНЕЛЬ УСПЕШНО СОЗДАНА ===" -ForegroundColor Green
Write-Host "`nСледующие шаги:" -ForegroundColor Yellow
Write-Host "1. Установите зависимости:" -ForegroundColor Cyan
Write-Host "   npm install @react-navigation/stack @react-native-async-storage/async-storage @expo/vector-icons" -ForegroundColor White
Write-Host "`n2. Обновите App.js - добавьте:" -ForegroundColor Cyan
Write-Host '   import AdminNavigator from "./navigation/AdminNavigator";' -ForegroundColor White
Write-Host '   // Добавьте AdminNavigator в навигацию' -ForegroundColor White
Write-Host "`n3. Запустите проект:" -ForegroundColor Cyan
Write-Host "   npx expo start" -ForegroundColor White
Write-Host "`n4. Для входа в админку используйте:" -ForegroundColor Cyan
Write-Host "   Email: admin@voronezh.ru" -ForegroundColor White
Write-Host "   Пароль: Admin123!" -ForegroundColor White
Write-Host "   Код: ADMIN2024" -ForegroundColor White
