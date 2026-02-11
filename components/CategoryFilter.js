import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const categories = [
  { id: 'all', name: 'Все', icon: 'th-large', color: '#2E8B57' },
  { id: 'храмы', name: 'Храмы', icon: 'church', color: '#8B4513' },
  { id: 'парки', name: 'Парки', icon: 'tree', color: '#228B22' },
  { id: 'мосты', name: 'Мосты', icon: 'road', color: '#4682B4' },
  { id: 'скверы', name: 'Скверы', icon: 'leaf', color: '#32CD32' },
  { id: 'памятники', name: 'Памятники', icon: 'monument', color: '#DAA520' },
];

const CategoryFilter = ({ onCategoryChange, activeCategory = 'all' }) => {
  const [scaleAnimations] = useState(
    categories.reduce((acc, cat) => {
      acc[cat.id] = new Animated.Value(1);
      return acc;
    }, {})
  );

  const handleCategoryPress = (categoryId) => {
    // Анимация нажатия
    Animated.sequence([
      Animated.timing(scaleAnimations[categoryId], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[categoryId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Изменение категории
    onCategoryChange(categoryId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const scale = scaleAnimations[category.id];

          return (
            <Animated.View
              key={category.id}
              style={{ transform: [{ scale }] }}
            >
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  isActive && styles.activeCategory,
                  { borderColor: category.color },
                ]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                  <FontAwesome5
                    name={category.icon}
                    size={20}
                    color={isActive ? 'white' : category.color}
                  />
                </View>
                <Text style={[
                  styles.categoryText,
                  isActive && styles.activeText,
                  { color: isActive ? 'white' : category.color }
                ]}>
                  {category.name}
                </Text>
                {isActive && (
                  <View style={[styles.activeIndicator, { backgroundColor: category.color }]} />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: 'white',
    minWidth: 90,
    position: 'relative',
  },
  activeCategory: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default CategoryFilter;
