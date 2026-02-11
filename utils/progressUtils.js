// Утилита для управления прогрессом и посещёнными точками
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  VISITED_POINTS: '@trailapp_visited_points',
  TOTAL_PROGRESS: '@trailapp_total_progress',
  ACHIEVEMENTS: '@trailapp_achievements',
};

/**
 * Получить все посещённые точки
 */
export const getVisitedPoints = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.VISITED_POINTS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting visited points:', error);
    return [];
  }
};

/**
 * Добавить точку в список посещённых
 */
export const markPointAsVisited = async (pointId) => {
  try {
    const visitedPoints = await getVisitedPoints();
    
    if (!visitedPoints.includes(pointId)) {
      visitedPoints.push(pointId);
      await AsyncStorage.setItem(STORAGE_KEYS.VISITED_POINTS, JSON.stringify(visitedPoints));
      
      // Обновляем общий прогресс
      await updateTotalProgress(visitedPoints.length);
      
      // Проверяем достижения
      await checkAchievements(visitedPoints.length, pointId);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error marking point as visited:', error);
    return false;
  }
};

/**
 * Обновить общий прогресс
 */
const updateTotalProgress = async (visitedCount) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_PROGRESS, visitedCount.toString());
  } catch (error) {
    console.error('Error updating total progress:', error);
  }
};

/**
 * Получить текущий прогресс
 */
export const getProgress = async (totalPoints) => {
  try {
    const visitedPoints = await getVisitedPoints();
    const visitedCount = visitedPoints.length;
    const percentage = totalPoints > 0 ? Math.round((visitedCount / totalPoints) * 100) : 0;
    
    return {
      visitedPoints,
      visitedCount,
      totalPoints,
      percentage,
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    return {
      visitedPoints: [],
      visitedCount: 0,
      totalPoints: totalPoints || 0,
      percentage: 0,
    };
  }
};

/**
 * Проверка достижений
 */
const checkAchievements = async (visitedCount, pointId) => {
  try {
    const achievements = await getAchievements();
    const newAchievements = [];
    
    // Достижение: Первая точка
    if (visitedCount === 1 && !achievements.includes('first_point')) {
      newAchievements.push('first_point');
    }
    
    // Достижение: Половина пути
    if (visitedCount === 3 && !achievements.includes('half_way')) { // 3 из 5 = половина
      newAchievements.push('half_way');
    }
    
    // Достижение: Все точки
    if (visitedCount === 5 && !achievements.includes('all_points')) {
      newAchievements.push('all_points');
    }
    
    // Достижение: Конкретная точка
    if (pointId === 1 && !achievements.includes('ancient_settlement')) {
      newAchievements.push('ancient_settlement');
    }
    
    if (pointId === 5 && !achievements.includes('church_complex')) {
      newAchievements.push('church_complex');
    }
    
    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements];
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));
      return newAchievements;
    }
    
    return [];
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

/**
 * Получить все достижения
 */
export const getAchievements = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
};

/**
 * Получить описание достижений
 */
export const getAchievementDetails = () => {
  return {
    first_point: {
      title: 'Первопроходец',
      description: 'Посетил первую точку тропы',
      icon: 'flag',
      color: '#FFD700',
    },
    half_way: {
      title: 'Полпути',
      description: 'Посетил половину точек тропы',
      icon: 'compass',
      color: '#2E8B57',
    },
    all_points: {
      title: 'Историк-исследователь',
      description: 'Посетил все точки исторической тропы',
      icon: 'trophy',
      color: '#B22222',
    },
    ancient_settlement: {
      title: 'Археолог',
      description: 'Исследовал древнее поселение',
      icon: 'search',
      color: '#8B4513',
    },
    church_complex: {
      title: 'Церковный историк',
      description: 'Исследовал церковный комплекс',
      icon: 'church',
      color: '#4B0082',
    },
  };
};

/**
 * Сбросить весь прогресс (для тестирования)
 */
export const resetProgress = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.VISITED_POINTS);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOTAL_PROGRESS);
    await AsyncStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
};

// Импортируем XP систему
import { addXPForPointVisit, addXPForAchievement } from './xpUtils';

/**
 * Обновленная функция для отметки посещения точки с XP
 */
export const markPointAsVisitedWithXP = async (pointId) => {
  try {
    const visitedPoints = await getVisitedPoints();

    if (!visitedPoints.includes(pointId)) {
      visitedPoints.push(pointId);
      await AsyncStorage.setItem(STORAGE_KEYS.VISITED_POINTS, JSON.stringify(visitedPoints));

      // Обновляем общий прогресс
      await updateTotalProgress(visitedPoints.length);

      // Проверяем достижения
      const newAchievements = await checkAchievements(visitedPoints.length, pointId);
      
      // Добавляем XP за посещение точки
      const point = await getPointById(pointId); // Нужно добавить эту функцию
      if (point) {
        await addXPForPointVisit(pointId, point.title);
      }
      
      // Добавляем XP за достижения
      if (newAchievements.length > 0) {
        for (const achievementId of newAchievements) {
          const achievementDetails = getAchievementDetails()[achievementId];
          if (achievementDetails) {
            await addXPForAchievement(achievementId, achievementDetails.title);
          }
        }
      }

      return { success: true, isNewVisit: true, newAchievements };
    }
    return { success: true, isNewVisit: false, newAchievements: [] };
  } catch (error) {
    console.error('Error marking point as visited:', error);
    return { success: false, error: error.message };
  }
};
