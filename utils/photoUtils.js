import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, StyleSheet } from 'react-native';

const STORAGE_KEYS = {
  USER_PHOTOS: '@voronezh_trail_user_photos',
  PHOTO_ALBUMS: '@voronezh_trail_photo_albums',
};

/**
 * Запрос разрешений на камеру и галерею
 */
export const requestMediaPermissions = async () => {
  try {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return {
      camera: cameraPermission.status === 'granted',
      media: mediaPermission.status === 'granted',
      allGranted: cameraPermission.status === 'granted' && mediaPermission.status === 'granted'
    };
  } catch (error) {
    console.error('Error requesting media permissions:', error);
    return { camera: false, media: false, allGranted: false };
  }
};

/**
 * Сделать фото с камеры
 */
export const takePhoto = async () => {
  try {
    const permission = await requestMediaPermissions();
    if (!permission.camera) {
      Alert.alert('Нет доступа', 'Разрешите доступ к камере в настройках');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
        fileName: 'photo_.jpg',
        date: new Date().toISOString(),
        location: null, // Можно добавить геолокацию позже
      };
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Ошибка', 'Не удалось сделать фото');
    return null;
  }
};

/**
 * Выбрать фото из галереи
 */
export const pickPhoto = async () => {
  try {
    const permission = await requestMediaPermissions();
    if (!permission.media) {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее в настройках');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
        fileName: result.assets[0].fileName || 'photo_.jpg',
        date: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking photo:', error);
    Alert.alert('Ошибка', 'Не удалось выбрать фото');
    return null;
  }
};

/**
 * Сохранить фото в галерею устройства
 */
export const saveToDeviceGallery = async (photoUri) => {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к медиатеке');
      return false;
    }

    const asset = await MediaLibrary.createAssetAsync(photoUri);
    await MediaLibrary.createAlbumAsync('Воронеж исторический', asset, false);
    
    return true;
  } catch (error) {
    console.error('Error saving to gallery:', error);
    return false;
  }
};

/**
 * Сохранить фото пользователя для точки
 */
export const saveUserPhoto = async (pointId, photoData) => {
  try {
    const allPhotos = await getUserPhotos();
    
    const newPhoto = {
      id: Date.now().toString(),
      pointId,
      ...photoData,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      isPublic: true,
    };

    allPhotos.push(newPhoto);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PHOTOS, JSON.stringify(allPhotos));
    
    return newPhoto;
  } catch (error) {
    console.error('Error saving user photo:', error);
    return null;
  }
};

/**
 * Получить все фото пользователя
 */
export const getUserPhotos = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PHOTOS);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting user photos:', error);
    return [];
  }
};

/**
 * Получить фото для конкретной точки
 */
export const getPhotosForPoint = async (pointId) => {
  try {
    const allPhotos = await getUserPhotos();
    return allPhotos.filter(photo => photo.pointId === pointId);
  } catch (error) {
    console.error('Error getting photos for point:', error);
    return [];
  }
};

/**
 * Удалить фото
 */
export const deletePhoto = async (photoId) => {
  try {
    const allPhotos = await getUserPhotos();
    const filteredPhotos = allPhotos.filter(photo => photo.id !== photoId);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PHOTOS, JSON.stringify(filteredPhotos));
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};

/**
 * Поделиться фото
 */
export const sharePhoto = async (photoUri) => {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Ошибка', 'Функция sharing не доступна на этом устройстве');
      return false;
    }

    await Sharing.shareAsync(photoUri, {
      mimeType: 'image/jpeg',
      dialogTitle: 'Поделиться фото',
      UTI: 'image/jpeg'
    });
    
    return true;
  } catch (error) {
    console.error('Error sharing photo:', error);
    return false;
  }
};

/**
 * Лайкнуть фото
 */
export const likePhoto = async (photoId) => {
  try {
    const allPhotos = await getUserPhotos();
    const photoIndex = allPhotos.findIndex(p => p.id === photoId);
    
    if (photoIndex !== -1) {
      allPhotos[photoIndex].likes = (allPhotos[photoIndex].likes || 0) + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PHOTOS, JSON.stringify(allPhotos));
      return allPhotos[photoIndex].likes;
    }
    return 0;
  } catch (error) {
    console.error('Error liking photo:', error);
    return 0;
  }
};

/**
 * Добавить комментарий к фото
 */
export const addCommentToPhoto = async (photoId, commentText, author = 'Вы') => {
  try {
    const allPhotos = await getUserPhotos();
    const photoIndex = allPhotos.findIndex(p => p.id === photoId);
    
    if (photoIndex !== -1) {
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        author,
        date: new Date().toISOString(),
      };
      
      if (!allPhotos[photoIndex].comments) {
        allPhotos[photoIndex].comments = [];
      }
      
      allPhotos[photoIndex].comments.push(newComment);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PHOTOS, JSON.stringify(allPhotos));
      
      return newComment;
    }
    return null;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

/**
 * Создать фотоальбом
 */
export const createPhotoAlbum = async (albumName, coverPhotoId = null) => {
  try {
    const allAlbums = await getPhotoAlbums();
    
    const newAlbum = {
      id: Date.now().toString(),
      name: albumName,
      coverPhotoId,
      photoIds: [],
      createdAt: new Date().toISOString(),
      photoCount: 0,
    };
    
    allAlbums.push(newAlbum);
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTO_ALBUMS, JSON.stringify(allAlbums));
    
    return newAlbum;
  } catch (error) {
    console.error('Error creating album:', error);
    return null;
  }
};

/**
 * Получить все фотоальбомы
 */
export const getPhotoAlbums = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PHOTO_ALBUMS);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting photo albums:', error);
    return [];
  }
};

/**
 * Добавить фото в альбом
 */
export const addPhotoToAlbum = async (albumId, photoId) => {
  try {
    const allAlbums = await getPhotoAlbums();
    const albumIndex = allAlbums.findIndex(a => a.id === albumId);
    
    if (albumIndex !== -1) {
      if (!allAlbums[albumIndex].photoIds.includes(photoId)) {
        allAlbums[albumIndex].photoIds.push(photoId);
        allAlbums[albumIndex].photoCount = allAlbums[albumIndex].photoIds.length;
        await AsyncStorage.setItem(STORAGE_KEYS.PHOTO_ALBUMS, JSON.stringify(allAlbums));
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding photo to album:', error);
    return false;
  }
};

/**
 * Получить статистику по фото
 */
export const getPhotoStats = async () => {
  try {
    const allPhotos = await getUserPhotos();
    const allAlbums = await getPhotoAlbums();
    
    return {
      totalPhotos: allPhotos.length,
      totalAlbums: allAlbums.length,
      totalLikes: allPhotos.reduce((sum, photo) => sum + (photo.likes || 0), 0),
      totalComments: allPhotos.reduce((sum, photo) => sum + (photo.comments?.length || 0), 0),
      pointsWithPhotos: [...new Set(allPhotos.map(p => p.pointId))].length,
      lastPhotoDate: allPhotos.length > 0 
        ? new Date(Math.max(...allPhotos.map(p => new Date(p.createdAt)))) 
        : null,
    };
  } catch (error) {
    console.error('Error getting photo stats:', error);
    return {
      totalPhotos: 0,
      totalAlbums: 0,
      totalLikes: 0,
      totalComments: 0,
      pointsWithPhotos: 0,
      lastPhotoDate: null,
    };
  }
};

/**
 * Экспорт всех фото данных
 */
export const exportPhotoData = async () => {
  try {
    const allPhotos = await getUserPhotos();
    const allAlbums = await getPhotoAlbums();
    
    return {
      photos: allPhotos,
      albums: allAlbums,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
  } catch (error) {
    console.error('Error exporting photo data:', error);
    return null;
  }
};

/**
 * Импорт фото данных
 */
export const importPhotoData = async (data) => {
  try {
    if (data && data.photos && Array.isArray(data.photos)) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PHOTOS, JSON.stringify(data.photos));
    }
    
    if (data && data.albums && Array.isArray(data.albums)) {
      await AsyncStorage.setItem(STORAGE_KEYS.PHOTO_ALBUMS, JSON.stringify(data.albums));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing photo data:', error);
    return false;
  }
};
