// Утилиты для работы с QR-кодами

/**
 * Генерация данных для QR-кода точки тропы
 * @param {number} pointId - ID точки
 * @returns {string} - Строка для кодирования в QR
 */
export const generateQRData = (pointId) => {
  return 	railapp:point:;
};

/**
 * Парсинг данных из QR-кода
 * @param {string} qrData - Данные из QR-кода
 * @returns {object|null} - Объект с типом и ID или null при ошибке
 */
export const parseQRData = (qrData) => {
  try {
    // Формат: trailapp:point:1
    const parts = qrData.split(':');
    
    if (parts.length !== 3 || parts[0] !== 'trailapp') {
      return null;
    }

    const type = parts[1]; // 'point'
    const id = parseInt(parts[2]);

    if (isNaN(id)) {
      return null;
    }

    return { type, id };
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
};

/**
 * Валидация QR-кода для точки тропы
 * @param {number} pointId - ID точки из QR
 * @param {Array} points - Массив точек тропы
 * @returns {boolean} - true если точка существует
 */
export const validateQRPoint = (pointId, points) => {
  return points.some(point => point.id === pointId);
};

/**
 * Генерация тестовых QR-кодов для всех точек
 * @param {Array} points - Массив точек тропы
 * @returns {Array} - Массив объектов с данными для QR
 */
export const generateTestQRCodes = (points) => {
  return points.map(point => ({
    pointId: point.id,
    title: point.title,
    qrData: generateQRData(point.id),
    description: QR-код для точки: ,
  }));
};
