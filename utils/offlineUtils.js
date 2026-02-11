import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

const STORAGE_KEYS = {
  TRAIL_POINTS: '@voronezh_trail_points_cache',
  TIMELINE_DATA: '@voronezh_trail_timeline_cache',
  USER_PROGRESS: '@voronezh_trail_user_progress',
  CACHE_TIMESTAMP: '@voronezh_trail_cache_timestamp',
  OFFLINE_MODE: '@voronezh_trail_offline_mode'
};

/**
 * Проверить подключение к интернету
 */
export const checkInternetConnection = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    return {
      isConnected: netInfo.isConnected,
      isInternetReachable: netInfo.isInternetReachable,
      type: netInfo.type,
      details: netInfo.details
    };
  } catch (error) {
    console.error('Error checking internet connection:', error);
    return { isConnected: false, isInternetReachable: false, type: 'unknown' };
  }
};

/**
 * Кешировать данные точек маршрута
 */
export const cacheTrailPoints = async (pointsData) => {
  try {
    const cacheData = {
      data: pointsData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.TRAIL_POINTS, JSON.stringify(cacheData));
    await AsyncStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, new Date().toISOString());
    
    console.log('Trail points cached successfully');
    return true;
  } catch (error) {
    console.error('Error caching trail points:', error);
    return false;
  }
};

/**
 * Получить кешированные точки маршрута
 */
export const getCachedTrailPoints = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TRAIL_POINTS);
    if (!jsonValue) return null;
    
    const cacheData = JSON.parse(jsonValue);
    
    // Проверяем актуальность кеша (1 неделя)
    const cacheDate = new Date(cacheData.timestamp);
    const now = new Date();
    const daysDiff = (now - cacheDate) / (1000 * 60 * 60 * 24);
    
    return {
      data: cacheData.data,
      timestamp: cacheData.timestamp,
      isStale: daysDiff > 7, // Старый кеш (больше 7 дней)
      daysOld: Math.floor(daysDiff)
    };
  } catch (error) {
    console.error('Error getting cached trail points:', error);
    return null;
  }
};

/**
 * Кешировать данные ленты времени
 */
export const cacheTimelineData = async (timelineData) => {
  try {
    const cacheData = {
      data: timelineData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.TIMELINE_DATA, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.error('Error caching timeline data:', error);
    return false;
  }
};

/**
 * Получить кешированные данные ленты времени
 */
export const getCachedTimelineData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TIMELINE_DATA);
    return jsonValue ? JSON.parse(jsonValue).data : null;
  } catch (error) {
    console.error('Error getting cached timeline data:', error);
    return null;
  }
};

/**
 * Сохранить прогресс пользователя
 */
export const saveUserProgress = async (progressData) => {
  try {
    const progressToSave = {
      ...progressData,
      lastSync: new Date().toISOString(),
      deviceId: 'mobile'
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progressToSave));
    return true;
  } catch (error) {
    console.error('Error saving user progress:', error);
    return false;
  }
};

/**
 * Получить сохраненный прогресс пользователя
 */
export const getUserProgress = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
};

/**
 * Включить/выключить офлайн-режим
 */
export const setOfflineMode = async (enabled) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(enabled));
    return true;
  } catch (error) {
    console.error('Error setting offline mode:', error);
    return false;
  }
};

/**
 * Проверить, включен ли офлайн-режим
 */
export const isOfflineModeEnabled = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
    return jsonValue ? JSON.parse(jsonValue) : false;
  } catch (error) {
    console.error('Error checking offline mode:', error);
    return false;
  }
};

/**
 * Получить статистику кеша
 */
export const getCacheStats = async () => {
  try {
    const [pointsCache, timelineCache, progressCache, offlineMode] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TRAIL_POINTS),
      AsyncStorage.getItem(STORAGE_KEYS.TIMELINE_DATA),
      AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS),
      AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE)
    ]);
    
    const pointsData = pointsCache ? JSON.parse(pointsCache) : null;
    const timelineData = timelineCache ? JSON.parse(timelineCache) : null;
    const progressData = progressCache ? JSON.parse(progressCache) : null;
    
    return {
      points: {
        cached: !!pointsData,
        timestamp: pointsData?.timestamp,
        count: pointsData?.data?.length || 0
      },
      timeline: {
        cached: !!timelineData,
        timestamp: timelineData?.timestamp,
        count: timelineData?.data?.length || 0
      },
      progress: {
        cached: !!progressData,
        lastSync: progressData?.lastSync
      },
      offlineMode: offlineMode ? JSON.parse(offlineMode) : false,
      totalSize: await calculateCacheSize()
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      points: { cached: false, timestamp: null, count: 0 },
      timeline: { cached: false, timestamp: null, count: 0 },
      progress: { cached: false, lastSync: null },
      offlineMode: false,
      totalSize: '0 KB'
    };
  }
};

/**
 * Рассчитать размер кеша
 */
const calculateCacheSize = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.includes('@voronezh_trail'));
    
    let totalBytes = 0;
    
    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalBytes += new Blob([value]).size;
      }
    }
    
    // Конвертируем в читаемый формат
    if (totalBytes < 1024) {
      return totalBytes + ' B';
    } else if (totalBytes < 1024 * 1024) {
      return (totalBytes / 1024).toFixed(1) + ' KB';
    } else {
      return (totalBytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return '0 KB';
  }
};

/**
 * Очистить весь кеш
 */
export const clearAllCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.includes('@voronezh_trail'));
    
    await AsyncStorage.multiRemove(cacheKeys);
    
    Alert.alert('Кеш очищен', 'Все кешированные данные удалены');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    Alert.alert('Ошибка', 'Не удалось очистить кеш');
    return false;
  }
};

/**
 * Очистить старый кеш (старше 30 дней)
 */
export const clearOldCache = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [pointsCache, timelineCache] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TRAIL_POINTS),
      AsyncStorage.getItem(STORAGE_KEYS.TIMELINE_DATA)
    ]);
    
    let clearedCount = 0;
    
    if (pointsCache) {
      const pointsData = JSON.parse(pointsCache);
      const cacheDate = new Date(pointsData.timestamp);
      
      if (cacheDate < thirtyDaysAgo) {
        await AsyncStorage.removeItem(STORAGE_KEYS.TRAIL_POINTS);
        clearedCount++;
      }
    }
    
    if (timelineCache) {
      const timelineData = JSON.parse(timelineCache);
      const cacheDate = new Date(timelineData.timestamp);
      
      if (cacheDate < thirtyDaysAgo) {
        await AsyncStorage.removeItem(STORAGE_KEYS.TIMELINE_DATA);
        clearedCount++;
      }
    }
    
    return {
      success: true,
      clearedCount: clearedCount,
      message: clearedCount > 0 ? 'Очищен старый кеш' : 'Старый кеш не найден'
    };
  } catch (error) {
    console.error('Error clearing old cache:', error);
    return { success: false, clearedCount: 0, error: error.message };
  }
};

/**
 * Синхронизировать прогресс при появлении интернета
 */
export const syncProgressWhenOnline = async (onlineCallback) => {
  try {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        // Интернет появился - можно синхронизировать
        if (onlineCallback) {
          onlineCallback();
        }
        
        // Отписываемся после первого срабатывания
        unsubscribe();
      }
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up sync listener:', error);
    return () => {};
  }
};

/**
 * Загрузить все начальные данные в кеш
 */
export const preloadAllData = async (pointsData, timelineData, progressData) => {
  try {
    console.log('Начинаем предзагрузку данных...');
    
    const results = await Promise.all([
      cacheTrailPoints(pointsData),
      cacheTimelineData(timelineData),
      saveUserProgress(progressData || { visitedPoints: [], lastSync: new Date().toISOString() })
    ]);
    
    const success = results.every(result => result === true);
    
    if (success) {
      console.log('Все данные успешно закешированы');
      return {
        success: true,
        message: 'Данные загружены в кеш. Теперь можно работать офлайн.',
        stats: await getCacheStats()
      };
    } else {
      return {
        success: false,
        message: 'Не все данные удалось закешировать'
      };
    }
  } catch (error) {
    console.error('Error preloading data:', error);
    return {
      success: false,
      message: 'Ошибка при загрузке данных: ' + error.message
    };
  }
};
