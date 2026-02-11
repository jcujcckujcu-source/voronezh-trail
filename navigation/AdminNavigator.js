import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Импортируем экраны админ-панели
import AdminLogin from '../screens/Admin/AdminLogin';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import RoutesManager from '../screens/Admin/RoutesManager';
import UsersManager from '../screens/Admin/UsersManager';
import ReviewsManager from '../screens/Admin/ReviewsManager';
import ContentManager from '../screens/Admin/ContentManager';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminLogin"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="AdminLogin"
        component={AdminLogin}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Панель управления' }}
      />
      <Stack.Screen
        name="RoutesManager"
        component={RoutesManager}
        options={{ title: 'Управление маршрутами' }}
      />
      <Stack.Screen
        name="UsersManager"
        component={UsersManager}
        options={{ title: 'Управление пользователями' }}
      />
      <Stack.Screen
        name="ReviewsManager"
        component={ReviewsManager}
        options={{ title: 'Модерация отзывов' }}
      />
      <Stack.Screen
        name="ContentManager"
        component={ContentManager}
        options={{ title: 'Управление контентом' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
