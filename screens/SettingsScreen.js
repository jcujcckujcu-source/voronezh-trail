import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  getCacheStats, 
  clearAllCache, 
  clearOldCache,
  setOfflineMode,
  isOfflineModeEnabled,
  preloadAllData,
  checkInternetConnection
} from '../utils/offlineUtils';
import trailPoints from '../data/trailPoints';
import timelineData from '../data/timelineData';
import { getProgress } from '../utils/progressUtils';

const SettingsScreen = ({ navigation }) => {
  const [offlineMode, setOfflineModeState] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [internetStatus, setInternetStatus] = useState(null);

  useEffect(() => {
    loadSettings();
    checkConnection();
  }, []);

  const loadSettings = async () => {
    const [offlineEnabled, stats] = await Promise.all([
      isOfflineModeEnabled(),
      getCacheStats()
    ]);
    
    setOfflineModeState(offlineEnabled);
    setCacheStats(stats);
  };

  const checkConnection = async () => {
    const status = await checkInternetConnection();
    setInternetStatus(status);
  };

  const handleOfflineModeToggle = async (value) => {
    setOfflineModeState(value);
    await setOfflineMode(value);
    
    Alert.alert(
      value ? 'Офлайн-режим включен' : 'Офлайн-режим выключен',
      value 
        ? 'Приложение будет использовать только кешированные данные'
        : 'Приложение будет загружать свежие данные из интернета'
    );
  };

  const handlePreloadData = async () => {
    setLoading(true);
    
    const connection = await checkInternetConnection();
    if (!connection.isConnected) {
      Alert.alert('Нет интернета', 'Для загрузки данных нужно подключение к интернета');
      setLoading(false);
      return;
    }
    
    const progress = await getProgress(trailPoints.length);
    
    const result = await preloadAllData(trailPoints, timelineData, progress);
    
    if (result.success) {
      Alert.alert('Успех!', result.message);
      await loadSettings();
    } else {
      Alert.alert('Ошибка', result.message);
    }
    
    setLoading(false);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Очистить кеш?',
      'Все кешированные данные будут удалены. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            await clearAllCache();
            await loadSettings();
          },
        },
      ]
    );
  };

  const handleClearOldCache = async () => {
    setLoading(true);
    const result = await clearOldCache();
    
    if (result.success) {
      Alert.alert('Готово', result.message);
      await loadSettings();
    } else {
      Alert.alert('Ошибка', 'Не удалось очистить старый кеш');
    }
    
    setLoading(false);
  };

  if (!cacheStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Загрузка настроек...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Статус интернета */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Соединение</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <FontAwesome5 
              name={internetStatus?.isConnected ? "wifi" : "wifi-slash"} 
              size={20} 
              color={internetStatus?.isConnected ? "#2E8B57" : "#B22222"} 
            />
            <Text style={styles.statusText}>
              {internetStatus?.isConnected ? 'Онлайн' : 'Офлайн'}
            </Text>
          </View>
          <Text style={styles.statusSubtext}>
            {internetStatus?.isConnected 
              ? 'Есть подключение к интернету' 
              : 'Нет подключения к интернету'}
          </Text>
        </View>
      </View>

      {/* Офлайн-режим */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Офлайн-режим</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <FontAwesome5 name="cloud-download-alt" size={18} color="#666" />
              <Text style={styles.settingTitle}>Офлайн-режим</Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={handleOfflineModeToggle}
              trackColor={{ false: '#E0E0E0', true: '#2E8B57' }}
              thumbColor={offlineMode ? 'white' : 'white'}
            />
          </View>
          <Text style={styles.settingDescription}>
            {offlineMode 
              ? 'Приложение использует только кешированные данные'
              : 'Приложение загружает свежие данные из интернета'}
          </Text>
        </View>
      </View>

      {/* Статистика кеша */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Кеш данных</Text>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#2E8B57" />
            <Text style={styles.statsLabel}>Точки маршрута:</Text>
            <Text style={styles.statsValue}>
              {cacheStats.points.cached ? cacheStats.points.count + ' шт.' : 'Нет в кеше'}
            </Text>
          </View>
          
          <View style={styles.statsRow}>
            <FontAwesome5 name="history" size={16} color="#8B4513" />
            <Text style={styles.statsLabel}>Лента времени:</Text>
            <Text style={styles.statsValue}>
              {cacheStats.timeline.cached ? cacheStats.timeline.count + ' эпох' : 'Нет в кеше'}
            </Text>
          </View>
          
          <View style={styles.statsRow}>
            <FontAwesome5 name="trophy" size={16} color="#FFD700" />
            <Text style={styles.statsLabel}>Прогресс:</Text>
            <Text style={styles.statsValue}>
              {cacheStats.progress.cached ? 'Сохранён' : 'Нет в кеше'}
            </Text>
          </View>
          
          <View style={styles.statsRow}>
            <FontAwesome5 name="database" size={16} color="#4682B4" />
            <Text style={styles.statsLabel}>Общий размер:</Text>
            <Text style={styles.statsValue}>{cacheStats.totalSize}</Text>
          </View>
        </View>
      </View>

      {/* Управление кешем */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Управление кешем</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.preloadButton]}
          onPress={handlePreloadData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome5 name="download" size={18} color="white" />
          )}
          <Text style={styles.actionButtonText}>
            {loading ? 'Загрузка...' : 'Загрузить все данные'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.clearOldButton]}
          onPress={handleClearOldCache}
          disabled={loading}
        >
          <FontAwesome5 name="broom" size={18} color="white" />
          <Text style={styles.actionButtonText}>Очистить старый кеш (30+ дней)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.clearAllButton]}
          onPress={handleClearCache}
        >
          <FontAwesome5 name="trash-alt" size={18} color="white" />
          <Text style={styles.actionButtonText}>Очистить весь кеш</Text>
        </TouchableOpacity>
      </View>

      {/* Информация */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            • Офлайн-режим позволяет использовать приложение без интернета
          </Text>
          <Text style={styles.infoText}>
            • Для работы офлайн нужно сначала загрузить данные при наличии интернета
          </Text>
          <Text style={styles.infoText}>
            • Прогресс автоматически сохраняется и синхронизируется при появлении интернета
          </Text>
          <Text style={styles.infoText}>
            • Рекомендуется периодически обновлять кеш для актуальности данных
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Версия 1.0.0</Text>
        <Text style={styles.footerText}>Воронеж исторический</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#666',
    marginLeft: 30,
  },
  settingCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginRight: 10,
    flex: 1,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  preloadButton: {
    backgroundColor: '#2E8B57',
  },
  clearOldButton: {
    backgroundColor: '#FFA500',
  },
  clearAllButton: {
    backgroundColor: '#B22222',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B0E0E6',
  },
  infoText: {
    fontSize: 14,
    color: '#4682B4',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
});

export default SettingsScreen;
