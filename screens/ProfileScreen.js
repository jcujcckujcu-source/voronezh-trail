import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const userStats = {
    completedRoutes: 5,
    visitedPoints: 42,
    totalDistance: '18.7 км',
    daysActive: 12,
  };

  const achievements = [
    { id: 1, name: 'Первый маршрут', icon: '🏁', description: 'Пройден первый маршрут' },
    { id: 2, name: 'Историк', icon: '📚', description: 'Пройдено 5 исторических точек' },
    { id: 3, name: 'Исследователь', icon: '🧭', description: 'Пройдено 3 разных маршрута' },
    { id: 4, name: 'Активный пользователь', icon: '🔥', description: '7 дней подряд в приложении' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Профиль пользователя */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>П</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>Пользователь</Text>
        <Text style={styles.userEmail}>user@voronezh-trail.ru</Text>
        
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Редактировать профиль</Text>
        </TouchableOpacity>
      </View>

      {/* Статистика */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Моя статистика</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trail-sign" size={28} color="#3498db" />
            <Text style={styles.statNumber}>{userStats.completedRoutes}</Text>
            <Text style={styles.statLabel}>Маршрутов пройдено</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location" size={28} color="#2ecc71" />
            <Text style={styles.statNumber}>{userStats.visitedPoints}</Text>
            <Text style={styles.statLabel}>Точек посещено</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="walk" size={28} color="#9b59b6" />
            <Text style={styles.statNumber}>{userStats.totalDistance}</Text>
            <Text style={styles.statLabel}>Общая дистанция</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={28} color="#f39c12" />
            <Text style={styles.statNumber}>{userStats.daysActive}</Text>
            <Text style={styles.statLabel}>Дней активности</Text>
          </View>
        </View>
      </View>

      {/* Достижения */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Мои достижения</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Настройки */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Настройки</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications" size={22} color="#2c3e50" />
          <Text style={styles.settingText}>Уведомления</Text>
          <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="moon" size={22} color="#2c3e50" />
          <Text style={styles.settingText}>Темная тема</Text>
          <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="language" size={22} color="#2c3e50" />
          <Text style={styles.settingText}>Язык</Text>
          <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="download" size={22} color="#2c3e50" />
          <Text style={styles.settingText}>Оффлайн карты</Text>
          <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
        </TouchableOpacity>
      </View>

      {/* Админ-доступ */}
      <TouchableOpacity 
        style={styles.adminButton}
        onPress={() => navigation.navigate('Админ')}
      >
        <Ionicons name="shield-checkmark" size={24} color="#fff" />
        <View style={styles.adminButtonInfo}>
          <Text style={styles.adminButtonTitle}>Административный доступ</Text>
          <Text style={styles.adminButtonSubtitle}>Управление контентом и пользователями</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Выход */}
      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out" size={22} color="#e74c3c" />
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.version}>Версия 1.0.0</Text>
        <Text style={styles.copyright}>© 2024 Воронежская историческая тропа</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2ecc71',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2c3e50',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#bdc3c7',
    marginBottom: 20,
  },
  profileButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementCard: {
    backgroundColor: '#fff',
    width: 140,
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 15,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  adminButtonInfo: {
    flex: 1,
    marginLeft: 15,
  },
  adminButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  adminButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  version: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 5,
  },
  copyright: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});

export default ProfileScreen;
