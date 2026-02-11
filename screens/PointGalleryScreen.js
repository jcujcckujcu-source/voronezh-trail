import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import trailPoints from '../data/trailPoints';
import { 
  getPhotosForPoint, 
  deletePhoto, 
  likePhoto, 
  addCommentToPhoto,
  takePhoto,
  pickPhoto,
  saveUserPhoto,
  sharePhoto,
  saveToDeviceGallery,
} from '../utils/photoUtils';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const IMAGE_SIZE = (width - 40) / COLUMN_COUNT - 10;

const PointGalleryScreen = ({ route, navigation }) => {
  const { pointId } = route.params || {};
  const point = trailPoints.find(p => p.id === pointId) || trailPoints[0];
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadPhotos();
  }, [pointId]);

  const loadPhotos = async () => {
    setLoading(true);
    const pointPhotos = await getPhotosForPoint(pointId);
    setPhotos(pointPhotos);
    setLoading(false);
  };

  const handleTakePhoto = async () => {
    setUploading(true);
    try {
      const photo = await takePhoto();
      if (photo) {
        const savedPhoto = await saveUserPhoto(pointId, photo);
        if (savedPhoto) {
          await loadPhotos();
          Alert.alert('Успешно!', 'Фото сохранено в галерею точки');
          
          Alert.alert(
            'Сохранить в галерею?',
            'Хотите сохранить фото в галерею вашего устройства?',
            [
              { text: 'Позже', style: 'cancel' },
              { 
                text: 'Сохранить', 
                onPress: async () => {
                  const saved = await saveToDeviceGallery(photo.uri);
                  if (saved) {
                    Alert.alert('Успешно', 'Фото сохранено в галерею устройства');
                  }
                }
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    } finally {
      setUploading(false);
    }
  };

  const handlePickPhoto = async () => {
    setUploading(true);
    try {
      const photo = await pickPhoto();
      if (photo) {
        const savedPhoto = await saveUserPhoto(pointId, photo);
        if (savedPhoto) {
          await loadPhotos();
          Alert.alert('Успешно!', 'Фото добавлено в галерею точки');
        }
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать фото');
    } finally {
      setUploading(false);
    }
  };

  const handleLikePhoto = async (photoId) => {
    const newLikes = await likePhoto(photoId);
    await loadPhotos();
    
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto({...selectedPhoto, likes: newLikes});
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPhoto) return;
    
    const comment = await addCommentToPhoto(selectedPhoto.id, commentText);
    if (comment) {
      await loadPhotos();
      setCommentText('');
      
      const updatedPhoto = photos.find(p => p.id === selectedPhoto.id);
      if (updatedPhoto) {
        setSelectedPhoto(updatedPhoto);
      }
    }
  };

  const handleDeletePhoto = async (photoId) => {
    Alert.alert(
      'Удалить фото?',
      'Вы уверены, что хотите удалить это фото?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            const deleted = await deletePhoto(photoId);
            if (deleted) {
              await loadPhotos();
              if (selectedPhoto?.id === photoId) {
                setSelectedPhoto(null);
                setModalVisible(false);
              }
            }
          },
        },
      ]
    );
  };

  const handleSharePhoto = async (photoUri) => {
    const shared = await sharePhoto(photoUri);
    if (!shared) {
      Alert.alert('Ошибка', 'Не удалось поделиться фото');
    }
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const renderPhotoGrid = () => {
    return (
      <View style={styles.gridContainer}>
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoContainer}
            onPress={() => openPhotoModal(photo)}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: photo.uri }} 
              style={styles.photo} 
              resizeMode="cover"
            />
            <View style={styles.photoOverlay}>
              <View style={styles.photoStats}>
                <FontAwesome5 name="heart" size={12} color="white" />
                <Text style={styles.statText}>{photo.likes || 0}</Text>
                <FontAwesome5 name="comment" size={12} color="white" style={styles.statIcon} />
                <Text style={styles.statText}>{photo.comments?.length || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPhotoList = () => {
    return (
      <View style={styles.listContainer}>
        {photos.map((photo) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.listItem}
            onPress={() => openPhotoModal(photo)}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: photo.uri }} 
              style={styles.listPhoto} 
              resizeMode="cover"
            />
            <View style={styles.listInfo}>
              <Text style={styles.listDate}>
                {new Date(photo.createdAt).toLocaleDateString('ru-RU')}
              </Text>
              <View style={styles.listStats}>
                <View style={styles.statItem}>
                  <FontAwesome5 name="heart" size={14} color="#FF6B6B" />
                  <Text style={styles.listStatText}>{photo.likes || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <FontAwesome5 name="comment" size={14} color="#4ECDC4" />
                  <Text style={styles.listStatText}>{photo.comments?.length || 0}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Загрузка галереи...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Фото: {point.title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <FontAwesome5 
              name={viewMode === 'grid' ? 'th-list' : 'th-large'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.uploadButtons}>
        <TouchableOpacity
          style={[styles.uploadButton, styles.cameraButton]}
          onPress={handleTakePhoto}
          disabled={uploading}
        >
          <FontAwesome5 name="camera" size={20} color="white" />
          <Text style={styles.uploadButtonText}>Сделать фото</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.uploadButton, styles.galleryButton]}
          onPress={handlePickPhoto}
          disabled={uploading}
        >
          <FontAwesome5 name="images" size={20} color="white" />
          <Text style={styles.uploadButtonText}>Из галереи</Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.uploadingText}>Загрузка...</Text>
        </View>
      )}

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {photos.length} фото{photos.length % 10 === 1 ? '' : 
           photos.length % 10 >= 2 && photos.length % 10 <= 4 ? 'а' : 'ов'}
        </Text>
      </View>

      <ScrollView style={styles.galleryContainer}>
        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="images" size={64} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Нет фотографий</Text>
            <Text style={styles.emptyText}>
              Сделайте первое фото этой точки!
            </Text>
          </View>
        ) : viewMode === 'grid' ? renderPhotoGrid() : renderPhotoList()}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedPhoto && (
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalBackground}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <FontAwesome5 name="times" size={24} color="white" />
                </TouchableOpacity>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => handleSharePhoto(selectedPhoto.uri)}
                  >
                    <FontAwesome5 name="share-alt" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => handleDeletePhoto(selectedPhoto.id)}
                  >
                    <FontAwesome5 name="trash" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <Image 
                source={{ uri: selectedPhoto.uri }} 
                style={styles.modalPhoto} 
                resizeMode="contain"
              />

              <View style={styles.photoInfo}>
                <View style={styles.photoStatsRow}>
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => handleLikePhoto(selectedPhoto.id)}
                  >
                    <FontAwesome5 
                      name="heart" 
                      size={24} 
                      color="#FF6B6B" 
                      solid={selectedPhoto.likes > 0}
                    />
                    <Text style={styles.likeCount}>{selectedPhoto.likes || 0}</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.dateInfo}>
                    <Text style={styles.photoDate}>
                      {new Date(selectedPhoto.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.commentsContainer}>
                  <Text style={styles.commentsTitle}>Комментарии:</Text>
                  
                  {selectedPhoto.comments?.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <Text style={styles.commentAuthor}>{comment.author}:</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.date).toLocaleDateString('ru-RU')}
                      </Text>
                    </View>
                  ))}
                  
                  {(!selectedPhoto.comments || selectedPhoto.comments.length === 0) && (
                    <Text style={styles.noComments}>Пока нет комментариев</Text>
                  )}
                </ScrollView>

                <View style={styles.addCommentContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Добавить комментарий..."
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={200}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      { opacity: commentText.trim() ? 1 : 0.5 }
                    ]}
                    onPress={handleAddComment}
                    disabled={!commentText.trim()}
                  >
                    <FontAwesome5 name="paper-plane" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  viewModeButton: {
    padding: 8,
  },
  uploadButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  cameraButton: {
    backgroundColor: '#2E8B57',
  },
  galleryButton: {
    backgroundColor: '#4682B4',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  counterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  galleryContainer: {
    flex: 1,
    padding: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
  },
  photoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 3,
    marginRight: 10,
  },
  statIcon: {
    marginLeft: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  listDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  listStatText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    marginHorizontal: 20,
    marginVertical: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    overflow: 'hidden',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalActions: {
    flexDirection: 'row',
  },
  modalActionButton: {
    padding: 5,
    marginLeft: 15,
  },
  modalPhoto: {
    flex: 1,
    width: '100%',
  },
  photoInfo: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  photoStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  photoDate: {
    fontSize: 12,
    color: '#666',
  },
  commentsContainer: {
    maxHeight: 150,
    marginBottom: 15,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  commentItem: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  noComments: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#2E8B57',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default PointGalleryScreen;
