import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import timelineData from '../data/timelineData';
import trailPoints from '../data/trailPoints';
import { getVisitedPoints } from '../utils/progressUtils';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;
const SPACING = 20;

const TimelineScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visitedPoints, setVisitedPoints] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // Загружаем посещённые точки
  React.useEffect(() => {
    loadVisitedPoints();
  }, []);

  const loadVisitedPoints = async () => {
    const points = await getVisitedPoints();
    setVisitedPoints(points);
  };

  // Получаем связанные точки для эпохи
  const getRelatedPoints = (eraPoints) => {
    return trailPoints.filter(point => eraPoints.includes(point.id));
  };

  // Проверяем, все ли точки эпохи посещены
  const isEraCompleted = (eraPoints) => {
    if (eraPoints.length === 0) return false;
    return eraPoints.every(pointId => visitedPoints.includes(pointId));
  };

  // Рассчитываем прогресс эпохи
  const getEraProgress = (eraPoints) => {
    if (eraPoints.length === 0) return 0;
    const visited = eraPoints.filter(pointId => visitedPoints.includes(pointId)).length;
    return Math.round((visited / eraPoints.length) * 100);
  };

  // Прокрутка к элементу
  const scrollToIndex = (index) => {
    setActiveIndex(index);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * (ITEM_WIDTH + SPACING),
        animated: true,
      });
    }
  };

  // Переход к точке
  const navigateToPoint = (pointId) => {
    navigation.navigate('PointDetail', { pointId });
  };

  // Рендер элемента эпохи
  const renderTimelineItem = (item, index) => {
    const inputRange = [
      (index - 1) * (ITEM_WIDTH + SPACING),
      index * (ITEM_WIDTH + SPACING),
      (index + 1) * (ITEM_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const relatedPoints = getRelatedPoints(item.points);
    const isCompleted = isEraCompleted(item.points);
    const progress = getEraProgress(item.points);

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.timelineItem,
          {
            width: ITEM_WIDTH,
            transform: [{ scale }],
            opacity,
            borderColor: item.color,
          },
          isCompleted && styles.completedEra,
        ]}
      >
        {/* Верхняя часть - заголовок */}
        <View style={[styles.itemHeader, { backgroundColor: item.color + '20' }]}>
          <View style={styles.yearContainer}>
            <FontAwesome5 name={item.icon} size={24} color={item.color} />
            <Text style={[styles.year, { color: item.color }]}>{item.year}</Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <FontAwesome5 name="check-circle" size={16} color="#2E8B57" />
              <Text style={styles.completedText}>Исследовано</Text>
            </View>
          )}
        </View>

        {/* Основной контент */}
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>

          {/* Прогресс эпохи */}
          {item.points.length > 0 && (
            <View style={styles.eraProgressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Прогресс эпохи:</Text>
                <Text style={styles.progressPercentage}>{progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: progress + '%', backgroundColor: item.color }]} />
              </View>
              <Text style={styles.progressText}>
                {item.points.filter(p => visitedPoints.includes(p)).length} из {item.points.length} точек
              </Text>
            </View>
          )}

          {/* События эпохи */}
          <View style={styles.eventsContainer}>
            <Text style={styles.eventsTitle}>Ключевые события:</Text>
            {item.events.map((event, eventIndex) => (
              <View key={eventIndex} style={styles.eventItem}>
                <FontAwesome5 name="circle" size={8} color={item.color} style={styles.eventIcon} />
                <Text style={styles.eventText}>{event}</Text>
              </View>
            ))}
          </View>

          {/* Связанные точки */}
          {relatedPoints.length > 0 && (
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsTitle}>Точки тропы:</Text>
              {relatedPoints.map(point => (
                <TouchableOpacity
                  key={point.id}
                  style={[
                    styles.pointButton,
                    { borderColor: point.color },
                    visitedPoints.includes(point.id) && styles.visitedPoint,
                  ]}
                  onPress={() => navigateToPoint(point.id)}
                >
                  <View style={[styles.pointIcon, { backgroundColor: point.color }]}>
                    <FontAwesome5 name={point.icon} size={14} color="white" />
                  </View>
                  <Text style={styles.pointText} numberOfLines={1}>
                    {point.title}
                    {visitedPoints.includes(point.id) && ' ✓'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Нижняя часть - кнопка исследования */}
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: item.color }]}
          onPress={() => {
            if (item.points.length > 0) {
              // Переходим к первой точке эпохи
              navigateToPoint(item.points[0]);
            } else {
              // Если точек нет, показываем информацию
              alert('Эпоха "' + item.title + '" пока не имеет точек тропы');
            }
          }}
        >
          <FontAwesome5 name="search" size={16} color="white" />
          <Text style={styles.exploreButtonText}>
            {item.points.length > 0 ? 'Исследовать эпоху' : 'Подробнее об эпохе'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Рендер индикатора
  const renderIndicator = (_, index) => {
    const isActive = index === activeIndex;
    const item = timelineData[index];
    const isCompleted = isEraCompleted(item.points);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.indicator,
          isActive && styles.activeIndicator,
          { borderColor: item.color },
          isCompleted && styles.completedIndicator,
        ]}
        onPress={() => scrollToIndex(index)}
      >
        {isCompleted && (
          <FontAwesome5 name="check" size={10} color="white" style={styles.indicatorCheck} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Историческая лента</Text>
        <View style={styles.headerStats}>
          <FontAwesome5 name="history" size={20} color="#2E8B57" />
        </View>
      </View>

      {/* Основной контент */}
      <View style={styles.timelineContainer}>
        {/* Вертикальная линия времени */}
        <View style={styles.timelineLine} />

        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH + SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (ITEM_WIDTH + SPACING));
            setActiveIndex(index);
          }}
        >
          {timelineData.map((item, index) => renderTimelineItem(item, index))}
        </Animated.ScrollView>

        {/* Индикаторы */}
        <View style={styles.indicatorsContainer}>
          {timelineData.map((_, index) => renderIndicator(_, index))}
        </View>

        {/* Информация о текущей эпохе */}
        <View style={styles.currentEraInfo}>
          <Text style={styles.currentEraTitle}>
            {timelineData[activeIndex]?.year} • {timelineData[activeIndex]?.title}
          </Text>
          <Text style={styles.currentEraDescription} numberOfLines={2}>
            {timelineData[activeIndex]?.description}
          </Text>
        </View>
      </View>

      {/* Панель управления */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => scrollToIndex(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
        >
          <FontAwesome5 name="chevron-left" size={20} color={activeIndex === 0 ? '#CCC' : '#2E8B57'} />
          <Text style={[styles.controlText, activeIndex === 0 && styles.disabledText]}>
            Предыдущая
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.navigate('Home')}
        >
          <FontAwesome5 name="map" size={20} color="#4B0082" />
          <Text style={[styles.controlText, { color: '#4B0082' }]}>
            На карту
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => scrollToIndex(Math.min(timelineData.length - 1, activeIndex + 1))}
          disabled={activeIndex === timelineData.length - 1}
        >
          <FontAwesome5 name="chevron-right" size={20} color={activeIndex === timelineData.length - 1 ? '#CCC' : '#2E8B57'} />
          <Text style={[styles.controlText, activeIndex === timelineData.length - 1 && styles.disabledText]}>
            Следующая
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerStats: {
    padding: 8,
    backgroundColor: '#F0F8F0',
    borderRadius: 10,
  },
  timelineContainer: {
    flex: 1,
    paddingVertical: 30,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#E0E0E0',
    zIndex: 0,
  },
  scrollContent: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2,
    paddingVertical: 20,
  },
  timelineItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    marginRight: SPACING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  completedEra: {
    borderWidth: 3,
    shadowColor: '#2E8B57',
    shadowOpacity: 0.2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  year: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  completedText: {
    color: '#2E8B57',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  itemContent: {
    padding: 20,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  eraProgressContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  eventsContainer: {
    marginBottom: 20,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventIcon: {
    marginTop: 6,
    marginRight: 10,
  },
  eventText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  pointsContainer: {
    marginBottom: 20,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pointButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  visitedPoint: {
    backgroundColor: '#F0FFF0',
    borderWidth: 2,
  },
  pointIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 2,
    marginHorizontal: 6,
  },
  activeIndicator: {
    transform: [{ scale: 1.3 }],
  },
  completedIndicator: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  indicatorCheck: {
    position: 'absolute',
    top: 1,
    left: 1,
  },
  currentEraInfo: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentEraTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  currentEraDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
    minWidth: 80,
  },
  controlText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#2E8B57',
  },
  disabledText: {
    color: '#CCC',
  },
});

export default TimelineScreen;
