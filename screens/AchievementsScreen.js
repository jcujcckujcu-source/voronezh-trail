import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAchievements, getAchievementDetails } from '../utils/progressUtils';

const AchievementsScreen = ({ navigation }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const userAchievements = await getAchievements();
    setAchievements(userAchievements);
    setLoading(false);
  };

  const achievementDetails = getAchievementDetails();

  const renderAchievement = (achievementId, index) => {
    const details = achievementDetails[achievementId];
    const isUnlocked = achievements.includes(achievementId);

    if (!details) return null;

    return (
      <View
        key={achievementId}
        style={[
          styles.achievementCard,
          isUnlocked ? styles.unlockedCard : styles.lockedCard,
        ]}
      >
        <View style={styles.achievementIconContainer}>
          <FontAwesome5
            name={details.icon}
            size={32}
            color={isUnlocked ? details.color : '#CCCCCC'}
          />
          {!isUnlocked && (
            <FontAwesome5
              name="lock"
              size={16}
              color="#999"
              style={styles.lockIcon}
            />
          )}
        </View>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>
            {details.title}
            {isUnlocked && (
              <Text style={styles.unlockedBadge}> ✓</Text>
            )}
          </Text>
          <Text style={styles.achievementDescription}>
            {details.description}
          </Text>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              isUnlocked ? styles.statusUnlocked : styles.statusLocked
            ]}>
              {isUnlocked ? 'Получено' : 'Не получено'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка достижений...</Text>
      </View>
    );
  }

  const unlockedCount = achievements.length;
  const totalCount = Object.keys(achievementDetails).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Достижения</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>
            {unlockedCount}/{totalCount}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <FontAwesome5 name="trophy" size={24} color="#FFD700" />
          <Text style={styles.statNumber}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Получено</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="lock" size={24} color="#999" />
          <Text style={styles.statNumber}>{totalCount - unlockedCount}</Text>
          <Text style={styles.statLabel}>Осталось</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="percent" size={24} color="#2E8B57" />
          <Text style={styles.statNumber}>
            {Math.round((unlockedCount / totalCount) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Прогресс</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Все достижения</Text>
      
      {Object.keys(achievementDetails).map((achievementId, index) =>
        renderAchievement(achievementId, index)
      )}

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadAchievements}
      >
        <FontAwesome5 name="sync-alt" size={16} color="#666" />
        <Text style={styles.refreshButtonText}>Обновить</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#2E8B57',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  headerStatsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 20,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    marginTop: 25,
    marginBottom: 15,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unlockedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementIconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  lockIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  unlockedBadge: {
    color: '#2E8B57',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusUnlocked: {
    backgroundColor: '#E8F5E8',
    color: '#2E8B57',
  },
  statusLocked: {
    backgroundColor: '#F0F0F0',
    color: '#999',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  refreshButtonText: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '600',
  },
});

export default AchievementsScreen;
