import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import trailPoints from '../data/trailPoints';

const ARScreen = ({ route, navigation }) => {
  const { pointId } = route.params || {};
  const point = trailPoints.find(p => p.id === pointId) || trailPoints[0];
  const [permission, requestPermission] = useCameraPermissions();
  const [arMode, setArMode] = useState('scanning'); // scanning, placing, viewing
  const [modelPlaced, setModelPlaced] = useState(false);
  const [scale] = useState(new Animated.Value(1));
  const [rotation] = useState(new Animated.Value(0));
  
  const modelAnimations = {
    scale: scale,
    rotate: rotation.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    }),
  };

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
    
    // Автоматический переход к размещению модели
    const timer = setTimeout(() => {
      if (arMode === 'scanning') {
        setArMode('placing');
      }
    }, 3000);
    
    // Анимация модели
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 360,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => clearTimeout(timer);
  }, [permission, arMode]);

  const placeModel = () => {
    setArMode('viewing');
    setModelPlaced(true);
    
    // Анимация появления
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const takePhoto = () => {
    Alert.alert(
      'Скриншот сохранён!',
      'AR-сцена сохранена в галерею вашего устройства.',
      [{ text: 'OK' }]
    );
  };

  if (!permission || !permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <FontAwesome5 name="camera" size={64} color="#666" />
        <Text style={styles.permissionTitle}>Доступ к камере</Text>
        <Text style={styles.permissionText}>
          Для AR-режима нужен доступ к камере
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Разрешить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Камера */}
      <CameraView
        style={styles.camera}
        facing="back"
      >
        {/* AR Overlay */}
        <View style={styles.arOverlay}>
          {/* Индикатор сканирования */}
          {arMode === 'scanning' && (
            <View style={styles.scanningOverlay}>
              <View style={styles.scanningAnimation}>
                <FontAwesome5 name="search" size={64} color="#2E8B57" />
                <View style={styles.pulseCircle} />
              </View>
              <Text style={styles.scanningTitle}>Сканирую поверхность...</Text>
              <Text style={styles.scanningText}>
                Медленно двигайте камеру вокруг
              </Text>
            </View>
          )}

          {/* Режим размещения */}
          {arMode === 'placing' && (
            <View style={styles.placingOverlay}>
              <View style={styles.target}>
                <View style={styles.targetCircle} />
                <View style={[styles.targetLine, styles.targetLineHorizontal]} />
                <View style={[styles.targetLine, styles.targetLineVertical]} />
              </View>
              <Text style={styles.placingTitle}>Наведите на поверхность</Text>
              <Text style={styles.placingText}>
                Коснитесь экрана, чтобы разместить модель
              </Text>
              
              <TouchableOpacity
                style={styles.placeButton}
                onPress={placeModel}
              >
                <FontAwesome5 name="cube" size={20} color="white" />
                <Text style={styles.placeButtonText}>Разместить модель</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3D модель (имитация) */}
          {arMode === 'viewing' && modelPlaced && (
            <Animated.View
              style={[
                styles.modelContainer,
                {
                  transform: [
                    { scale: modelAnimations.scale },
                    { rotate: modelAnimations.rotate },
                  ],
                },
              ]}
            >
              {/* Имитация 3D модели */}
              <View style={[styles.model, { backgroundColor: point.color }]}>
                <View style={styles.modelFace} />
                <View style={styles.modelFace} />
                <View style={styles.modelFace} />
                <View style={styles.modelFace} />
                <View style={styles.modelFace} />
                <View style={styles.modelFace} />
                
                {/* Иконка модели */}
                <View style={styles.modelIcon}>
                  <FontAwesome5 name={point.icon} size={30} color="white" />
                </View>
              </View>
              
              {/* Информация о модели */}
              <View style={styles.modelInfo}>
                <Text style={styles.modelTitle}>{point.title}</Text>
                <Text style={styles.modelDescription}>
                  {point.era} • 3D реконструкция
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </CameraView>

      {/* Панель управления */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="times" size={20} color="white" />
          <Text style={styles.controlText}>Закрыть</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.mainControl]}
          onPress={() => navigation.navigate('PointDetail', { pointId: point.id })}
        >
          <FontAwesome5 name="info-circle" size={24} color="white" />
          <Text style={styles.controlText}>Инфо</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={takePhoto}
        >
          <FontAwesome5 name="camera" size={20} color="white" />
          <Text style={styles.controlText}>Фото</Text>
        </TouchableOpacity>
      </View>

      {/* Инструкция */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>AR-режим активирован</Text>
        <View style={styles.instructionRow}>
          <FontAwesome5 name="hand-point-up" size={16} color="#FFD700" />
          <Text style={styles.instructionText}>
            {arMode === 'scanning' && 'Сканирую поверхность...'}
            {arMode === 'placing' && 'Коснитесь экрана для размещения'}
            {arMode === 'viewing' && 'Модель размещена. Осматривайте!'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanningOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  scanningAnimation: {
    position: 'relative',
    marginBottom: 30,
  },
  pulseCircle: {
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
    borderWidth: 4,
    borderColor: '#2E8B57',
    borderRadius: 100,
    opacity: 0.5,
  },
  scanningTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scanningText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  placingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  target: {
    width: 200,
    height: 200,
    position: 'relative',
    marginBottom: 30,
  },
  targetCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderColor: '#2E8B57',
    borderRadius: 100,
    borderStyle: 'dashed',
  },
  targetLine: {
    position: 'absolute',
    backgroundColor: '#2E8B57',
  },
  targetLineHorizontal: {
    top: '50%',
    left: 20,
    right: 20,
    height: 2,
    marginTop: -1,
  },
  targetLineVertical: {
    left: '50%',
    top: 20,
    bottom: 20,
    width: 2,
    marginLeft: -1,
  },
  placingTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  placeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E8B57',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  placeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modelContainer: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.5 - 75,
    alignItems: 'center',
  },
  model: {
    width: 150,
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modelFace: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modelIcon: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modelDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainControl: {
    backgroundColor: 'rgba(46, 139, 87, 0.8)',
    paddingHorizontal: 25,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  instructions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});

export default ARScreen;
