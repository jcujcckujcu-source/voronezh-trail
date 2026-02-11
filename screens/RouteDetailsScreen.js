import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RouteDetailsScreen = ({ route, navigation }) => {
  const routeData = {
    id: route.params?.routeId || 1,
    name: 'Исторический центр Воронежа',
    category: 'История',
    description: 'Погрузитесь в богатую историю центра Воронежа. Этот маршрут проведет вас по самым значимым историческим местам города, от основания крепости до современности.',
    length: '2.5 км',
    time: '1.5-2 часа',
    difficulty: 'Легкая',
    points: 12,
    rating: 4.8,
    reviews: 156,
  };

  const pointsOfInterest = [
    { id: 1, name: 'Петровский сквер', time: '15 мин', description: 'Место основания Воронежа' },
    { id: 2, name: 'Благовещенский собор', time: '25 мин', description: 'Кафедральный собор' },
    { id: 3, name: 'Памятник Петру I', time: '35 мин', description: 'Памятник основателю флота' },
    { id: 4, name: 'Кольцовский сквер', time: '45 мин', description: 'Парк с фонтанами' },
    { id: 5, name: 'Дом-музей Дурова', time: '55 мин', description: 'Музей известного дрессировщика' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Заголовок маршрута */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Маршрут #{routeData.id}</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Информация о маршруте */}
      <View style={styles.routeInfo}>
        <View style={styles.routeHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{routeData.category}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#f39c12" />
            <Text style={styles.ratingText}>{routeData.rating} ({routeData.reviews})</Text>
          </View>
        </View>

        <Text style={styles.routeName}>{routeData.name}</Text>
        <Text style={styles.routeDescription}>{routeData.description}</Text>

        {/* Детали маршрута */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="walk" size={28} color="#3498db" />
            <Text style={styles.detailValue}>{routeData.length}</Text>
            <Text style={styles.detailLabel}>Дистанция</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={28} color="#2ecc71" />
            <Text style={styles.detailValue}>{routeData.time}</Text>
            <Text style={styles.detailLabel}>Время</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer" size={28} color="#f39c12" />
            <Text style={styles.detailValue}>{routeData.difficulty}</Text>
            <Text style={styles.detailLabel}>Сложность</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={28} color="#9b59b6" />
            <Text style={styles.detailValue}>{routeData.points}</Text>
            <Text style={styles.detailLabel}>Точек</Text>
          </View>
        </View>

        {/* Кнопки действий */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.startButton}>
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Начать маршрут</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
            <Ionicons name="bookmark" size={24} color="#3498db" />
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Точки интереса */}
      <View style={styles.pointsSection}>
        <Text style={styles.sectionTitle}>Точки интереса</Text>
        <Text style={styles.sectionSubtitle}>Основные остановки на маршруте</Text>

        {pointsOfInterest.map((point, index) => (
          <View key={point.id} style={styles.pointItem}>
            <View style={styles.pointNumber}>
              <Text style={styles.pointNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.pointInfo}>
              <Text style={styles.pointName}>{point.name}</Text>
              <View style={styles.pointDetails}>
                <Text style={styles.pointTime}>⏱️ {point.time}</Text>
                <Text style={styles.pointDescription}>{point.description}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.pointButton}>
              <Ionicons name="information-circle" size={22} color="#3498db" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Карта (заглушка) */}
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Карта маршрута</Text>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>Интерактивная карта маршрута</Text>
          <TouchableOpacity style={styles.mapButton}>
            <Text style={styles.mapButtonText}>Открыть карту</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Отзывы */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Отзывы</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Смотреть все</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerAvatar}>
              <Text style={styles.reviewerInitial}>А</Text>
            </View>
            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerName}>Анна С.</Text>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={16} color="#f39c12" />
                ))}
              </View>
            </View>
            <Text style={styles.reviewDate}>2 дня назад</Text>
          </View>
          <Text style={styles.reviewText}>
            Отличный маршрут! Узнала много нового о родном городе. Особенно понравился рассказ о Петровских временах.
          </Text>
        </View>
      </View>

      {/* Админ-кнопка */}
      <TouchableOpacity 
        style={styles.adminButton}
        onPress={() => navigation.navigate('Админ')}
      >
        <Ionicons name="create" size={22} color="#fff" />
        <Text style={styles.adminButtonText}>Редактировать маршрут (админ)</Text>
      </TouchableOpacity>
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
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  shareButton: {
    padding: 5,
  },
  routeInfo: {
    backgroundColor: '#fff',
    padding: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryBadge: {
    backgroundColor: '#ebf5fb',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 5,
  },
  routeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  routeDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5d6d7e',
    marginBottom: 25,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  detailItem: {
    alignItems: 'center',
    width: '23%',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  saveButton: {
    flex: 0.3,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsSection: {
    padding: 25,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pointNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pointNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  pointDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 15,
  },
  pointDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  pointButton: {
    padding: 10,
  },
  mapSection: {
    padding: 25,
  },
  mapPlaceholder: {
    backgroundColor: '#2c3e50',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
  },
  mapIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  mapText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  mapButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsSection: {
    padding: 25,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  reviewerInitial: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 14,
    color: '#95a5a6',
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5d6d7e',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9b59b6',
    marginHorizontal: 25,
    padding: 18,
    borderRadius: 12,
    marginBottom: 30,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default RouteDetailsScreen;
