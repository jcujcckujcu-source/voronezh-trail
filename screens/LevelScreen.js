import React, { useState, useEffect } from 'react';
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

const LevelScreen = ({ navigation }) => {
  const [userLevel, setUserLevel] = useState({
    level: 1,
    xp: 150,
    xpRequired: 500,
    nextLevel: 2,
    progress: 30,
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Мой уровень</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.levelCard}>
        <Text style={styles.levelNumber}>Уровень {userLevel.level}</Text>
        <Text style={styles.levelText}>Исследователь Воронежа</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: userLevel.progress + '%' }
              ]} 
            />
          </View>
          <Text style={styles.xpText}>
            {userLevel.xp} / {userLevel.xpRequired} XP
          </Text>
        </View>
      </View>
    </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  levelCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E8B57',
    borderRadius: 10,
  },
  xpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LevelScreen;
