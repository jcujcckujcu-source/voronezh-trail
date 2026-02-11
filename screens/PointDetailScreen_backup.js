import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import trailPoints from '../data/trailPoints';
import { markPointAsVisited } from '../utils/progressUtils';

const { width } = Dimensions.get('window');

const PointDetailScreen = ({ route, navigation }) => {
  const { pointId } = route.params || {};
  const point = trailPoints.find(p => p.id === pointId) || trailPoints[0];

  // Автоматически отмечаем точку как посещённую при открытии
  useEffect(() => {
    const markVisited = async () => {
      await markPointAsVisited(pointId);
    };
    markVisited();
  }, [pointId]);

  return (
    <ScrollView style={styles.container}>
      {/* Заголовок */}
      <View style={[styles.header, { backgroundColor: point.color }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{point.title}</Text>
        <View style={styles.eraBadge}>
          <Text style={styles.eraText}>{point.era}</Text>
        </View>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        {/* Описание */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{point.description}</Text>
        </View>

        {/* Факты */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Интересные факты</Text>
          {point.details.facts.map((fact, index) => (
            <View key={index} style={styles.factItem}>
              <FontAwesome5 name="star" size={16} color="#FFD700" style={styles.factIcon} />
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>

        {/* Медиа контент */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Медиа контент</Text>
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaButton}>
              <FontAwesome5 name="images" size={24} color="#4B0082" />
              <Text style={styles.mediaText}>Фото ({point.details.images.length})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaButton}>
              <FontAwesome5 name="video" size={24} color="#B22222" />
              <Text style={styles.mediaText}>Видео ({point.details.videos.length})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mediaButton}
              onPress={() => navigation.navigate('AR')}
            >
              <FontAwesome5 name="cube" size={24} color="#2E8B57" />
              <Text style={styles.mediaText}>3D-модель</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Кнопка AR просмотра */}
        <TouchableOpacity 
          style={[styles.arButton, { backgroundColor: point.color }]}
          onPress={() => navigation.navigate('AR', { pointId: point.id })}
        >
          <FontAwesome5 name="vr-cardboard" size={24} color="white" />
          <Text style={styles.arButtonText}>Посмотреть в AR</Text>
        </TouchableOpacity>

        {/* QR кнопка */}
        <TouchableOpacity 
          style={styles.qrButton}
          onPress={() => navigation.navigate('Scan')}
        >
          <FontAwesome5 name="qrcode" size={20} color="#2E8B57" />
          <Text style={styles.qrButtonText}>Сканировать следующую точку</Text>
        </TouchableOpacity>

        {/* Кнопка достижений */}
        <TouchableOpacity 
          style={styles.achievementsButton}
          onPress={() => navigation.navigate('Achievements')}
        >
          <FontAwesome5 name="trophy" size={20} color="#FFD700" />
          <Text style={styles.achievementsButtonText}>Мои достижения</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  eraBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  eraText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
    minHeight: 500,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  factIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  factText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    width: (width - 60) / 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mediaText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  arButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F0F8F0',
    borderWidth: 2,
    borderColor: '#2E8B57',
    borderStyle: 'dashed',
    marginBottom: 15,
  },
  qrButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  achievementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  achievementsButtonText: {
    color: '#B8860B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default PointDetailScreen;
