import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Импорты экранов
import HomeScreen from '../screens/HomeScreen';
import PointDetailScreen from '../screens/PointDetailScreen';
import ARScreen from '../screens/ARScreen';
import TimelineScreen from '../screens/TimelineScreen';
import ScanScreen from '../screens/ScanScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import PointGalleryScreen from '../screens/PointGalleryScreen';
import LevelScreen from '../screens/LevelScreen';
import SettingsScreen from '../screens/SettingsScreen'; // НОВЫЙ ИМПОРТ

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2E8B57',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Воронеж исторический' }}
        />
        <Stack.Screen 
          name="PointDetail" 
          component={PointDetailScreen} 
          options={{ title: 'Точка тропы' }}
        />
        <Stack.Screen 
          name="AR" 
          component={ARScreen} 
          options={{ title: 'AR-режим' }}
        />
        <Stack.Screen 
          name="Timeline" 
          component={TimelineScreen} 
          options={{ title: 'Историческая лента' }}
        />
        <Stack.Screen 
          name="Scan" 
          component={ScanScreen} 
          options={{ title: 'Сканирование QR' }}
        />
        <Stack.Screen 
          name="Achievements" 
          component={AchievementsScreen} 
          options={{ title: 'Мои достижения' }}
        />
        <Stack.Screen 
          name="PointGallery" 
          component={PointGalleryScreen} 
          options={{ title: 'Фотогалерея' }}
        />
        <Stack.Screen 
          name="Level" 
          component={LevelScreen} 
          options={{ title: 'Мой уровень' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Настройки' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
