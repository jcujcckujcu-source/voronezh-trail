import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_KEYS = {
  LAST_LOCATION: '@voronezh_trail_last_location',
  LOCATION_HISTORY: '@voronezh_trail_location_history',
  GEO_PERMISSION: '@voronezh_trail_geo_permission'
};

/**
 * Запрос разрешения на геолокацию
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    const result = {
      granted: status === 'granted',
      status: status,
      canAskAgain: true,
      timestamp: new Date().toISOString()
    };
    
    // Сохраняем статус разрешения
    await AsyncStorage.setItem(STORAGE_KEYS.GEO_PERMISSION, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return { granted: false, status: 'error', error: error.message };
  }
};

/**
 * Получить текущее местоположение с высокой точностью
 */
export const getCurrentLocation = async (options = {}) => {
  try {
    const defaultOptions = {
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000, // 10 секунд
      maximumAge: 30000, // 30 секунд
      enableHighAccuracy: true
    };
    
    const location = await Location.getCurrentPositionAsync({
      ...defaultOptions,
      ...options
    });
    
    // Сохраняем последнее местоположение
    await saveLastLocation(location.coords);
    
    // Добавляем в историю
    await addToLocationHistory(location.coords);
    
    return {
      success: true,
      coords: location.coords,
      timestamp: location.timestamp,
      accuracy: location.coords.accuracy || 0
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    
    // Пробуем получить последнее сохраненное местоположение
    const lastLocation = await getLastLocation();
    if (lastLocation) {
      return {
        success: false,
        coords: lastLocation,
        timestamp: Date.now(),
        accuracy: lastLocation.accuracy || 100,
        fromCache: true,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: error.message,
      coords: null
    };
  }
};

/**
 * Начать отслеживание местоположения
 */
export const startLocationTracking = async (callback, options = {}) => {
  try {
    const permission = await requestLocationPermission();
    if (!permission.granted) {
      Alert.alert('Разрешение отклонено', 'Для отслеживания местоположения нужно разрешение');
      return null;
    }
    
    const defaultOptions = {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 10, // Обновлять каждые 10 метров
      timeInterval: 5000, // Или каждые 5 секунд
      mayShowUserSettingsDialog: true
    };
    
    const subscription = await Location.watchPositionAsync(
      { ...defaultOptions, ...options },
      (location) => {
        // Сохраняем последнее местоположение
        saveLastLocation(location.coords);
        
        // Вызываем колбэк с обновленным местоположением
        if (callback) {
          callback({
            coords: location.coords,
            timestamp: location.timestamp,
            accuracy: location.coords.accuracy || 0
          });
        }
      }
    );
    
    return subscription;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return null;
  }
};

/**
 * Рассчитать расстояние между двумя точками (в метрах)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Радиус Земли в метрах
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Расстояние в метрах
  
  return {
    meters: distance,
    kilometers: distance / 1000,
    formatted: distance < 1000 
      ? \\ м\
      : \\ км\
  };
};

/**
 * Найти ближайшую точку к текущему местоположению
 */
export const findNearestPoint = (userCoords, points) => {
  if (!userCoords || !points || points.length === 0) {
    return null;
  }
  
  let minDistance = Infinity;
  let nearestPoint = null;
  
  points.forEach(point => {
    if (point.coordinates && point.coordinates.latitude && point.coordinates.longitude) {
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        point.coordinates.latitude,
        point.coordinates.longitude
      );
      
      if (distance.meters < minDistance) {
        minDistance = distance.meters;
        nearestPoint = {
          ...point,
          distance: distance
        };
      }
    }
  });
  
  return nearestPoint;
};

/**
 * Получить направление (компас) между двумя точками
 */
export const getBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  
  const bearing = (θ * 180 / Math.PI + 360) % 360;
  
  // Преобразуем в направление по сторонам света
  const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
  const index = Math.round(bearing / 45) % 8;
  
  return {
    degrees: Math.round(bearing),
    direction: directions[index],
    arrow: getDirectionArrow(bearing)
  };
};

const getDirectionArrow = (bearing) => {
  if (bearing >= 337.5 || bearing < 22.5) return '↑'; // Север
  if (bearing >= 22.5 && bearing < 67.5) return '↗'; // Северо-восток
  if (bearing >= 67.5 && bearing < 112.5) return '→'; // Восток
  if (bearing >= 112.5 && bearing < 157.5) return '↘'; // Юго-восток
  if (bearing >= 157.5 && bearing < 202.5) return '↓'; // Юг
  if (bearing >= 202.5 && bearing < 247.5) return '↙'; // Юго-запад
  if (bearing >= 247.5 && bearing < 292.5) return '←'; // Запад
  return '↖'; // Северо-запад
};

/**
 * Проверить, находится ли пользователь рядом с точкой (в радиусе X метров)
 */
export const isNearPoint = (userCoords, pointCoords, radiusMeters = 50) => {
  if (!userCoords || !pointCoords) return false;
  
  const distance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    pointCoords.latitude,
    pointCoords.longitude
  );
  
  return distance.meters <= radiusMeters;
};

/**
 * Сохранить последнее местоположение
 */
const saveLastLocation = async (coords) => {
  try {
    const locationData = {
      ...coords,
      timestamp: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(locationData));
  } catch (error) {
    console.error('Error saving last location:', error);
  }
};

/**
 * Получить последнее сохраненное местоположение
 */
export const getLastLocation = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting last location:', error);
    return null;
  }
};

/**
 * Добавить в историю местоположений
 */
const addToLocationHistory = async (coords) => {
  try {
    const history = await getLocationHistory();
    
    const newEntry = {
      ...coords,
      timestamp: new Date().toISOString()
    };
    
    // Ограничиваем историю 100 записями
    history.unshift(newEntry);
    if (history.length > 100) {
      history.pop();
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding to location history:', error);
  }
};

/**
 * Получить историю местоположений
 */
export const getLocationHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_HISTORY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting location history:', error);
    return [];
  }
};

/**
 * Получить статистику по местоположению
 */
export const getLocationStats = async () => {
  try {
    const history = await getLocationHistory();
    const lastLocation = await getLastLocation();
    
    return {
      totalLocations: history.length,
      lastUpdate: lastLocation?.timestamp,
      history: history.slice(0, 10) // Последние 10 записей
    };
  } catch (error) {
    console.error('Error getting location stats:', error);
    return { totalLocations: 0, lastUpdate: null, history: [] };
  }
};
