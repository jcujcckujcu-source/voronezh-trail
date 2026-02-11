import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RoutesScreen = ({ navigation }) => {
  const allRoutes = [
    { id: 1, name: 'Исторический центр', category: 'История', length: '2.5 км', time: '1.5 ч', rating: 4.8 },
    { id: 2, name: 'Парки и скверы', category: 'Природа', length: '3.8 км', time: '2 ч', rating: 4.6 },
    { id: 3, name: 'Архитектура XX века', category: 'Архитектура', length: '4.2 км', time: '2.5 ч', rating: 4.7 },
    { id: 4, name: 'Военная история', category: 'История', length: '5.0 км', time: '3 ч', rating: 4.9 },
    { id: 5, name: 'Литературный Воронеж', category: 'Культура', length: '2.8 км', time: '1.5 ч', rating: 4.5 },
    { id: 6, name: 'Православные храмы', category: 'Религия', length: '3.5 км', time: '2 ч', rating: 4.7 },
    { id: 7, name: 'Советский авангард', category: 'Архитектура', length: '3.2 км', time: '2 ч', rating: 4.4 },
    { id: 8, name: 'Речные прогулки', category: 'Природа', length: '4.5 км', time: '2.5 ч', rating: 4.8 },
  ];

  const categories = ['Все', 'История', 'Архитектура', 'Природа', 'Культура', 'Религия'];

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Маршруты по Воронежу</Text>
        <Text style={styles.subtitle}>Выберите маршрут для исследования</Text>
      </View>

      {/* Фильтры по категориям */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity key={index} style={styles.categoryButton}>
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Список маршрутов */}
      <ScrollView style={styles.routesContainer}>
        {allRoutes.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={styles.routeCard}
            onPress={() => navigation.navigate('RouteDetails', { routeId: route.id })}
          >
            <View style={styles.routeHeader}>
              <View style={styles.routeCategory}>
                <Text style={styles.routeCategoryText}>{route.category}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#f39c12" />
                <Text style={styles.ratingText}>{route.rating}</Text>
              </View>
            </View>
            
            <Text style={styles.routeName}>{route.name}</Text>
            
            <View style={styles.routeDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="walk" size={18} color="#7f8c8d" />
                <Text style={styles.detailText}>{route.length}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={18} color="#7f8c8d" />
                <Text style={styles.detailText}>{route.time}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="pin" size={18} color="#7f8c8d" />
                <Text style={styles.detailText}>8-12 точек</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Начать маршрут</Text>
              <Ionicons name="play-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Кнопка администратора */}
      <TouchableOpacity 
        style={styles.adminButton}
        onPress={() => navigation.navigate('Админ')}
      >
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.adminButtonText}>Добавить маршрут (админ)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 25,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  categoryButton: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  routesContainer: {
    flex: 1,
    padding: 15,
  },
  routeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeCategory: {
    backgroundColor: '#ebf5fb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  routeCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3498db',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f39c12',
    marginLeft: 5,
  },
  routeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#5d6d7e',
    marginLeft: 8,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    marginHorizontal: 15,
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default RoutesScreen;
