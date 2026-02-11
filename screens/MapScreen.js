import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MapScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Заглушка карты */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️</Text>
        <Text style={styles.mapTitle}>Карта маршрутов Воронежа</Text>
        <Text style={styles.mapDescription}>
          Здесь будет интерактивная карта с отображением исторических маршрутов
        </Text>
        
        {/* Кнопки действий */}
        <View style={styles.mapActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.actionText}>Мое местоположение</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ecc71' }]}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.actionText}>Найти маршрут</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Список маршрутов */}
      <View style={styles.routesList}>
        <Text style={styles.sectionTitle}>Доступные маршруты</Text>
        
        {[
          { name: 'Центральный маршрут', distance: '2.5 км', stops: 8 },
          { name: 'Парковая зона', distance: '3.8 км', stops: 6 },
          { name: 'Исторические памятники', distance: '4.2 км', stops: 12 },
          { name: 'Архитектура', distance: '3.1 км', stops: 10 },
        ].map((route, index) => (
          <TouchableOpacity key={index} style={styles.routeItem}>
            <View style={styles.routeIcon}>
              <Ionicons name="trail-sign" size={24} color="#3498db" />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{route.name}</Text>
              <View style={styles.routeDetails}>
                <Text style={styles.routeDetail}>📏 {route.distance}</Text>
                <Text style={styles.routeDetail}>📍 {route.stops} точек</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Кнопка администратора */}
      <TouchableOpacity 
        style={styles.adminButton}
        onPress={() => navigation.navigate('Админ')}
      >
        <Ionicons name="map" size={20} color="#fff" />
        <Text style={styles.adminButtonText}>Управление картой (админ)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapPlaceholder: {
    backgroundColor: '#2c3e50',
    padding: 25,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  mapText: {
    fontSize: 60,
    marginBottom: 15,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  mapDescription: {
    fontSize: 16,
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  mapActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  routesList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  routeItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  routeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ebf5fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  routeDetails: {
    flexDirection: 'row',
  },
  routeDetail: {
    fontSize: 13,
    color: '#7f8c8d',
    marginRight: 15,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9b59b6',
    marginHorizontal: 20,
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

export default MapScreen;
