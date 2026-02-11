import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_XP: '@trailapp_user_xp',
  USER_LEVEL: '@trailapp_user_level',
  LEVEL_HISTORY: '@trailapp_level_history',
};

// Конфигурация уровней
const LEVEL_CONFIG = [
  { level: 1, xpRequired: 0, title: 'Новичок', color: '#808080' },
  { level: 2, xpRequired: 100, title: 'Исследователь', color: '#2E8B57' },
  { level: 3, xpRequired: 300, title: 'Знаток', color: '#4682B4' },
  { level: 4, xpRequired: 600, title: 'Эксперт', color: '#8B4513' },
  { level: 5, xpRequired: 1000, title: 'Профессор истории', color: '#FFD700' },
  { level: 6, xpRequired: 1500, title: 'Легенда Воронежа', color: '#B22222' },
  { level: 7, xpRequired: 2100, title: 'Хранитель истории', color: '#4B0082' },
  { level: 8, xpRequired: 2800, title: 'Магистр истории', color: '#FF4500' },
  { level: 9, xpRequired: 3600, title: 'Великий исследователь', color: '#00CED1' },
  { level: 10, xpRequired: 4500, title: 'Император истории', color: '#FF69B4' },
];

/**
 * Получить текущий уровень и XP пользователя
 */
export const getUserStats = async () => {
  try {
    const [xp, level, history] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.USER_XP),
      AsyncStorage.getItem(STORAGE_KEYS.USER_LEVEL),
      AsyncStorage.getItem(STORAGE_KEYS.LEVEL_HISTORY),
    ]);
    
    const currentXP = parseInt(xp || '0', 10);
    const currentLevel = parseInt(level || '1', 10);
    const levelHistory = history ? JSON.parse(history) : [];
    
    const levelInfo = getLevelInfo(currentLevel);
    const nextLevelInfo = getLevelInfo(currentLevel + 1);
    
    return {
      xp: currentXP,
      level: currentLevel,
      levelInfo,
      nextLevelInfo,
      xpToNextLevel: nextLevelInfo ? nextLevelInfo.xpRequired - currentXP : 0,
      progressToNextLevel: nextLevelInfo 
        ? Math.min(100, Math.max(0, ((currentXP - levelInfo.xpRequired) / (nextLevelInfo.xpRequired - levelInfo.xpRequired)) * 100))
        : 100,
      levelHistory,
      maxLevel: LEVEL_CONFIG[LEVEL_CONFIG.length - 1].level,
      isMaxLevel: currentLevel >= LEVEL_CONFIG[LEVEL_CONFIG.length - 1].level,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return getDefaultStats();
  }
};

/**
 * Добавить XP пользователю
 */
export const addXP = async (amount, reason = '', details = {}) => {
  try {
    const stats = await getUserStats();
    let newXP = stats.xp + amount;
    let newLevel = stats.level;
    
    // Проверяем, достигли ли нового уровня
    const nextLevelInfo = getLevelInfo(newLevel + 1);
    let levelsGained = 0;
    const gainedLevels = [];
    
    while (nextLevelInfo && newXP >= nextLevelInfo.xpRequired) {
      newLevel++;
      levelsGained++;
      gainedLevels.push({
        level: newLevel,
        title: nextLevelInfo.title,
        color: nextLevelInfo.color,
        achievedAt: Date.now(),
      });
    }
    
    // Сохраняем новые значения
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER_XP, newXP.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.USER_LEVEL, newLevel.toString()),
    ]);
    
    // Обновляем историю уровней
    if (levelsGained > 0) {
      const history = stats.levelHistory || [];
      history.push(...gainedLevels);
      await AsyncStorage.setItem(STORAGE_KEYS.LEVEL_HISTORY, JSON.stringify(history));
    }
    
    // Логируем событие
    const xpEvent = {
      amount,
      reason,
      details,
      timestamp: Date.now(),
      newXP,
      newLevel,
      levelsGained,
    };
    
    console.log('XP added:', xpEvent);
    
    return {
      success: true,
      ...xpEvent,
      gainedLevels,
      stats: await getUserStats(),
    };
  } catch (error) {
    console.error('Error adding XP:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Получить информацию об уровне
 */
export const getLevelInfo = (level) => {
  return LEVEL_CONFIG.find(l => l.level === level) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
};

/**
 * Награды за действия
 */
export const XP_REWARDS = {
  VISIT_POINT: 50,           // Посещение точки
  TAKE_PHOTO: 25,           // Сделать фото
  ADD_COMMENT: 10,          // Добавить комментарий
  LIKE_PHOTO: 5,            // Поставить лайк
  SCAN_QR: 30,              // Сканировать QR-код
  COMPLETE_TIMELINE: 100,   // Изучить эпоху в ленте времени
  DAILY_VISIT: 20,          // Ежедневное посещение
  ACHIEVEMENT: 200,         // Получение достижения
  SHARE_PHOTO: 15,          // Поделиться фото
  COMPLETE_ALL_POINTS: 500, // Посетить все точки
};

/**
 * Добавить XP за посещение точки
 */
export const addXPForPointVisit = async (pointId, pointTitle) => {
  return await addXP(XP_REWARDS.VISIT_POINT, 'Посещение точки', {
    pointId,
    pointTitle,
    rewardType: 'VISIT_POINT',
  });
};

/**
 * Добавить XP за фото
 */
export const addXPForPhoto = async (pointId, photoId) => {
  return await addXP(XP_REWARDS.TAKE_PHOTO, 'Создание фото', {
    pointId,
    photoId,
    rewardType: 'TAKE_PHOTO',
  });
};

/**
 * Добавить XP за комментарий
 */
export const addXPForComment = async (pointId, commentId) => {
  return await addXP(XP_REWARDS.ADD_COMMENT, 'Добавление комментария', {
    pointId,
    commentId,
    rewardType: 'ADD_COMMENT',
  });
};

/**
 * Добавить XP за достижение
 */
export const addXPForAchievement = async (achievementId, achievementTitle) => {
  return await addXP(XP_REWARDS.ACHIEVEMENT, 'Получение достижения', {
    achievementId,
    achievementTitle,
    rewardType: 'ACHIEVEMENT',
  });
};

/**
 * Получить статистику по XP
 */
export const getXPStats = async () => {
  try {
    const stats = await getUserStats();
    const allTimeXP = stats.xp;
    const currentLevel = stats.level;
    const levelTitle = stats.levelInfo.title;
    
    // Можно добавить больше статистики позже
    return {
      allTimeXP,
      currentLevel,
      levelTitle,
      levelColor: stats.levelInfo.color,
      nextLevel: stats.nextLevelInfo ? stats.nextLevelInfo.level : null,
      xpToNextLevel: stats.xpToNextLevel,
      progressPercentage: stats.progressToNextLevel,
      isMaxLevel: stats.isMaxLevel,
      totalLevels: LEVEL_CONFIG.length,
    };
  } catch (error) {
    console.error('Error getting XP stats:', error);
    return null;
  }
};

/**
 * Сбросить прогресс уровней (для тестирования)
 */
export const resetXPProgress = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_XP),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_LEVEL),
      AsyncStorage.removeItem(STORAGE_KEYS.LEVEL_HISTORY),
    ]);
    return true;
  } catch (error) {
    console.error('Error resetting XP progress:', error);
    return false;
  }
};

/**
 * Получить историю получения XP
 */
export const getXPLog = async (limit = 50) => {
  // Можно реализовать логирование всех событий XP
  // Пока возвращаем пустой массив
  return [];
};

/**
 * Получить дефолтные статистики
 */
const getDefaultStats = () => {
  return {
    xp: 0,
    level: 1,
    levelInfo: getLevelInfo(1),
    nextLevelInfo: getLevelInfo(2),
    xpToNextLevel: 100,
    progressToNextLevel: 0,
    levelHistory: [],
    maxLevel: LEVEL_CONFIG[LEVEL_CONFIG.length - 1].level,
    isMaxLevel: false,
  };
};

/**
 * Рассчитать награду за следующее действие
 */
export const getNextRewardPreview = () => {
  return [
    { action: 'Посетить точку', xp: XP_REWARDS.VISIT_POINT, icon: 'map-marker-alt' },
    { action: 'Сделать фото', xp: XP_REWARDS.TAKE_PHOTO, icon: 'camera' },
    { action: 'Добавить комментарий', xp: XP_REWARDS.ADD_COMMENT, icon: 'comment' },
    { action: 'Сканировать QR', xp: XP_REWARDS.SCAN_QR, icon: 'qrcode' },
    { action: 'Получить достижение', xp: XP_REWARDS.ACHIEVEMENT, icon: 'trophy' },
  ];
};
