import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import trailPoints from '../data/trailPoints';
import { getProgress, markPointAsVisited } from '../utils/progressUtils';
import CategoryFilter from '../components/CategoryFilter';

const HomeScreen = ({ navigation }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [progress, setProgress] = useState({
    visitedPoints: [],
    visitedCount: 0,
    totalPoints: trailPoints.length,
    percentage: 0,
  });
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestPoint, setNearestPoint] = useState(null);
  const [distanceToNearest, setDistanceToNearest] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const locationPulseAnim = useRef(new Animated.Value(1)).current;
  
  const initialRegion = {
    latitude: 51.6606,
    longitude: 39.2005,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Запуск анимаций
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]).start();

    // Пульсация для непосещённых точек
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Пульсация для местоположения пользователя
    Animated.loop(
      Animated.sequence([
        Animated.timing(locationPulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(locationPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Загружаем прогресс при монтировании
  useEffect(() => {
    loadProgress();
  }, []);

  // Запрашиваем геолокацию
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Обновляем ближайшую точку при изменении местоположения
  useEffect(() => {
    if (userLocation) {
      findNearestPoint();
    }
  }, [userLocation, trailPoints]);

  const loadProgress = async () => {
    const progressData = await getProgress(trailPoints.length);
    setProgress(progressData);
  };

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Разрешение на геолокацию отклонено');
        return;
      }

      // Получаем текущее местоположение
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
      
      setLocationError(null);
      
      // Начинаем отслеживание местоположения
      startLocationWatching();
      
    } catch (error) {
      console.error('Ошибка геолокации:', error);
      setLocationError('Не удалось определить местоположение');
    }
  };

  const startLocationWatching = async () => {
    try {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 50, // Обновлять каждые 50 метров
          timeInterval: 5000, // Или каждые 5 секунд
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          });
        }
      );
    } catch (error) {
      console.error('Ошибка отслеживания местоположения:', error);
    }
  };

  const findNearestPoint = () => {
    if (!userLocation || trailPoints.length === 0) return;

    let minDistance = Infinity;
    let nearest = null;

    trailPoints.forEach(point => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        point.coordinates.latitude,
        point.coordinates.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    setNearestPoint(nearest);
    setDistanceToNearest(minDistance.toFixed(1));
  };

  // Функция расчета расстояния между двумя точками (в км)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Фильтрация точек по категории
  const filteredPoints = activeCategory === 'all' 
    ? trailPoints 
    : trailPoints.filter(point => point.category === activeCategory);

  const handleMarkerPress = (point) => {
    setSelectedPoint(point);
    
    if (selectedPoint && selectedPoint.id === point.id) {
      setSelectedPoint(null);
    }
  };

  const navigateToPoint = async (pointId) => {
    const isNewVisit = await markPointAsVisited(pointId);
    
    if (isNewVisit) {
      await loadProgress();
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    navigation.navigate('PointDetail', { pointId });
    setSelectedPoint(null);
  };

  const isPointVisited = (pointId) => {
    return progress.visitedPoints.includes(pointId);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'храмы': return 'church';
      case 'парки': return 'tree';
      case 'мосты': return 'road';
      case 'скверы': return 'leaf';
      default: return 'map-marker-alt';
    }
  };

  const handleNavigateToNearest = () => {
    if (nearestPoint) {
      navigation.navigate('PointDetail', { pointId: nearestPoint.id });
    }
  };

  const handleCenterOnUser = () => {
    // Эта функция будет работать с ref на MapView
    // Нужно добавить ref в MapView
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Заголовок */}
      <Animated.View 
        style={[
          styles.header,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Воронеж исторический</Text>
          <Text style={styles.headerSubtitle}>
            Интерактивная карта {filteredPoints.length} объектов
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Achievements')}
        >
          <FontAwesome5 name="trophy" size={20} color="#FFD700" />
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{progress.visitedCount}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Карта */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onMapReady={() => setMapReady(true)}
        >
          {/* Местоположение пользователя с кругом точности */}
          {userLocation && (
            <>
              <Circle
                center={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                radius={userLocation.accuracy || 50}
                strokeWidth={1}
                strokeColor="rgba(46, 139, 87, 0.3)"
                fillColor="rgba(46, 139, 87, 0.1)"
              />
            </>
          )}

          {/* Маркеры точек */}
          {filteredPoints.map((point) => {
            const visited = isPointVisited(point.id);
            const scale = visited ? 1 : pulseAnim;
            const isNearest = nearestPoint && nearestPoint.id === point.id;
            
            return (
              <Marker
                key={point.id}
                coordinate={point.coordinates}
                onPress={() => handleMarkerPress(point)}
                tracksViewChanges={false}
              >
                <Animated.View style={{ transform: [{ scale }] }}>
                  <View style={[
                    styles.markerContainer,
                    selectedPoint?.id === point.id && styles.selectedMarker,
                    isNearest && styles.nearestMarker
                  ]}>
                    <View style={[
                      styles.marker, 
                      { backgroundColor: point.color },
                      visited && styles.visitedMarker,
                      isNearest && styles.nearestPointMarker
                    ]}>
                      <FontAwesome5 
                        name={getCategoryIcon(point.category)} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    {visited && (
                      <View style={styles.visitedBadge}>
                        <FontAwesome5 name="check" size={10} color="white" />
                      </View>
                    )}
                    {isNearest && (
                      <View style={styles.nearestBadge}>
                        <FontAwesome5 name="location-arrow" size={8} color="white" />
                      </View>
                    )}
                    {/* Тень маркера */}
                    <View style={styles.markerShadow} />
                  </View>
                </Animated.View>
              </Marker>
            );
          })}
        </MapView>

        {/* Кнопка центрирования на пользователе */}
        {userLocation && (
          <TouchableOpacity
            style={styles.centerButton}
            onPress={handleCenterOnUser}
          >
            <FontAwesome5 name="location-arrow" size={18} color="#2E8B57" />
          </TouchableOpacity>
        )}
      </View>

      {/* Фильтры категорий */}
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Панель ближайшей точки */}
      {nearestPoint && distanceToNearest && (
        <Animated.View 
          style={[
            styles.nearestPanel,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.nearestHeader}>
            <FontAwesome5 name="location-arrow" size={16} color="#2E8B57" />
            <Text style={styles.nearestTitle}>Ближайшая точка:</Text>
          </View>
          <View style={styles.nearestInfo}>
            <Text style={styles.nearestPointName}>{nearestPoint.title}</Text>
            <Text style={styles.nearestDistance}>{distanceToNearest} км</Text>
          </View>
          <TouchableOpacity
            style={styles.nearestButton}
            onPress={handleNavigateToNearest}
          >
            <FontAwesome5 name="directions" size={16} color="white" />
            <Text style={styles.nearestButtonText}>Перейти</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Панель информации о выбранной точке */}
      {selectedPoint && (
        <Animated.View 
          style={[
            styles.infoPanel,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.infoHeader}>
            <View style={[styles.categoryTag, { backgroundColor: selectedPoint.color + '20' }]}>
              <FontAwesome5 
                name={getCategoryIcon(selectedPoint.category)} 
                size={12} 
                color={selectedPoint.color} 
              />
              <Text style={[styles.categoryText, { color: selectedPoint.color }]}>
                {selectedPoint.category}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedPoint(null)}>
              <FontAwesome5 name="times" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.pointTitle}>{selectedPoint.title}</Text>
          <Text style={styles.pointEra}>{selectedPoint.era} • {selectedPoint.address}</Text>
          <Text style={styles.pointDescription} numberOfLines={2}>
            {selectedPoint.description}
          </Text>
          
          <View style={styles.infoFooter}>
            {isPointVisited(selectedPoint.id) ? (
              <View style={styles.visitedStatus}>
                <FontAwesome5 name="check-circle" size={16} color="#2E8B57" />
                <Text style={styles.visitedText}>Посещено</Text>
              </View>
            ) : (
              <Text style={styles.newText}>Новая точка!</Text>
            )}
            
            <TouchableOpacity
              style={[styles.detailButton, { backgroundColor: selectedPoint.color }]}
              onPress={() => navigateToPoint(selectedPoint.id)}
            >
              <Text style={styles.detailButtonText}>
                {isPointVisited(selectedPoint.id) ? 'Смотреть' : 'Исследовать'}
              </Text>
              <FontAwesome5 name="arrow-right" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Панель прогресса */}
      <Animated.View 
        style={[
          styles.progressPanel,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <FontAwesome5 name="flag-checkered" size={16} color="#2E8B57" />
            <Text style={styles.progressTitle}>
              Прогресс: {progress.visitedCount}/{progress.totalPoints}
            </Text>
          </View>
          <Text style={styles.progressPercentage}>{progress.percentage}%</Text>
        </View>
        
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: progress.percentage + '%',
                backgroundColor: progress.percentage === 100 ? '#FFD700' : '#2E8B57'
              }
            ]} 
          />
          {progress.percentage === 100 && (
            <View style={styles.completeStar}>
              <FontAwesome5 name="star" size={12} color="#FFD700" />
            </View>
          )}
        </View>
        
        <View style={styles.progressFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Timeline')}
          >
            <FontAwesome5 name="history" size={16} color="#8B4513" />
            <Text style={styles.actionText}>Лента времени</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Scan')}
          >
            <FontAwesome5 name="qrcode" size={16} color="#2E8B57" />
            <Text style={styles.actionText}>Сканировать QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Achievements')}
          >
            <FontAwesome5 name="trophy" size={16} color="#FFD700" />
            <Text style={styles.actionText}>Достижения</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Level')}
          >
            <FontAwesome5 name="chart-line" size={16} color="#4B0082" />
            <Text style={styles.actionText}>Уровень</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Индикатор загрузки геолокации */}
      {locationError && (
        <View style={styles.locationError}>
          <FontAwesome5 name="exclamation-triangle" size={14} color="#B22222" />
          <Text style={styles.locationErrorText}>{locationError}</Text>
          <TouchableOpacity onPress={requestLocationPermission}>
            <Text style={styles.retryText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  profileButton: {
    padding: 10,
    position: 'relative',
  },
  profileBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#2E8B57',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'white',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  markerContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 2,
  },
  markerShadow: {
    position: 'absolute',
    top: 3,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  selectedMarker: {
    transform: [{ scale: 1.1 }],
  },
  nearestMarker: {
    transform: [{ scale: 1.15 }],
  },
  visitedMarker: {
    borderColor: '#2E8B57',
    borderWidth: 4,
  },
  nearestPointMarker: {
    borderColor: '#FFD700',
    borderWidth: 4,
  },
  visitedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#2E8B57',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 3,
  },
  nearestBadge: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#FFD700',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 3,
  },
  nearestPanel: {
    position: 'absolute',
    top: 130,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nearestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  nearestTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  nearestInfo: {
    flex: 1,
  },
  nearestPointName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  nearestDistance: {
    fontSize: 12,
    color: '#2E8B57',
    fontWeight: '600',
  },
  nearestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E8B57',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  nearestButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  infoPanel: {
    position: 'absolute',
    top: 130,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  pointTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pointEra: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  pointDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  visitedText: {
    color: '#2E8B57',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  newText: {
    color: '#B22222',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  detailButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  progressPanel: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    position: 'relative',
  },
  completeStar: {
    position: 'absolute',
    right: -6,
    top: -1,
    backgroundColor: 'white',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
    flex: 1,
  },
  actionText: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  locationError: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FFF0F0',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  locationErrorText: {
    color: '#B22222',
    fontSize: 12,
    flex: 1,
    marginLeft: 10,
  },
  retryText: {
    color: '#2E8B57',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default HomeScreen;
