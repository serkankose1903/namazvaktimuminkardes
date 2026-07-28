import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Animated, Platform, Dimensions } from 'react-native';
import { Magnetometer } from 'expo-sensors';

// Kabe koordinatları (Mekke)
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Şehir koordinatları haritası
const CITY_COORDS = {
  'Adana': { lat: 37.0000, lng: 35.3213 },
  'Adiyaman': { lat: 37.7648, lng: 38.2786 },
  'Afyonkarahisar': { lat: 38.7507, lng: 30.5567 },
  'Agri': { lat: 39.7191, lng: 43.0503 },
  'Aksaray': { lat: 38.3687, lng: 34.0370 },
  'Amasya': { lat: 40.6499, lng: 35.8353 },
  'Ankara': { lat: 39.9208, lng: 32.8541 },
  'Antalya': { lat: 36.8969, lng: 30.7133 },
  'Ardahan': { lat: 41.1105, lng: 42.7022 },
  'Artvin': { lat: 41.1828, lng: 41.8183 },
  'Aydin': { lat: 37.8560, lng: 27.8416 },
  'Balikesir': { lat: 39.6484, lng: 27.8826 },
  'Bartin': { lat: 41.6344, lng: 32.3375 },
  'Batman': { lat: 37.8812, lng: 41.1351 },
  'Bayburt': { lat: 40.2552, lng: 40.2249 },
  'Bilecik': { lat: 40.0567, lng: 30.0665 },
  'Bingol': { lat: 38.8854, lng: 40.4966 },
  'Bitlis': { lat: 38.3938, lng: 42.1232 },
  'Bolu': { lat: 40.7360, lng: 31.6061 },
  'Burdur': { lat: 37.7203, lng: 30.2908 },
  'Bursa': { lat: 40.1826, lng: 29.0665 },
  'Canakkale': { lat: 40.1553, lng: 26.4142 },
  'Cankiri': { lat: 40.6013, lng: 33.6134 },
  'Corum': { lat: 40.5506, lng: 34.9556 },
  'Denizli': { lat: 37.7765, lng: 29.0864 },
  'Diyarbakir': { lat: 37.9144, lng: 40.2306 },
  'Duzce': { lat: 40.8438, lng: 31.1565 },
  'Edirne': { lat: 41.6818, lng: 26.5623 },
  'Elazig': { lat: 38.6810, lng: 39.2264 },
  'Erzincan': { lat: 39.7500, lng: 39.5000 },
  'Erzurum': { lat: 39.9000, lng: 41.2700 },
  'Eskisehir': { lat: 39.7767, lng: 30.5206 },
  'Gaziantep': { lat: 37.0662, lng: 37.3833 },
  'Giresun': { lat: 40.9128, lng: 38.3895 },
  'Gumushane': { lat: 40.4386, lng: 39.5086 },
  'Hakkari': { lat: 37.5833, lng: 43.7333 },
  'Hatay': { lat: 36.4018, lng: 36.3498 },
  'Igdir': { lat: 39.9167, lng: 44.0500 },
  'Isparta': { lat: 37.7648, lng: 30.5566 },
  'Istanbul': { lat: 41.0082, lng: 28.9784 },
  'Izmir': { lat: 38.4237, lng: 27.1428 },
  'Kahramanmaras': { lat: 37.5858, lng: 36.9371 },
  'Karabuk': { lat: 41.2061, lng: 32.6204 },
  'Karaman': { lat: 37.1759, lng: 33.2287 },
  'Kars': { lat: 40.6167, lng: 43.1000 },
  'Kastamonu': { lat: 41.3887, lng: 33.7827 },
  'Kayseri': { lat: 38.7312, lng: 35.4787 },
  'Kilis': { lat: 36.7184, lng: 37.1212 },
  'Kirikkale': { lat: 39.8468, lng: 33.5153 },
  'Kirklareli': { lat: 41.7333, lng: 27.2167 },
  'Kirsehir': { lat: 39.1425, lng: 34.1709 },
  'Kocaeli': { lat: 40.8533, lng: 29.8815 },
  'Konya': { lat: 37.8746, lng: 32.4932 },
  'Kutahya': { lat: 39.4167, lng: 29.9833 },
  'Malatya': { lat: 38.3552, lng: 38.3095 },
  'Manisa': { lat: 38.6191, lng: 27.4289 },
  'Mardin': { lat: 37.3212, lng: 40.7245 },
  'Mersin': { lat: 36.8121, lng: 34.6415 },
  'Mugla': { lat: 37.2153, lng: 28.3636 },
  'Mus': { lat: 38.9462, lng: 41.7539 },
  'Nevsehir': { lat: 38.6939, lng: 34.6857 },
  'Nigde': { lat: 37.9667, lng: 34.6833 },
  'Ordu': { lat: 40.9839, lng: 37.8764 },
  'Osmaniye': { lat: 37.0742, lng: 36.2464 },
  'Rize': { lat: 41.0201, lng: 40.5234 },
  'Sakarya': { lat: 40.6940, lng: 30.4358 },
  'Samsun': { lat: 41.2928, lng: 36.3313 },
  'Sanliurfa': { lat: 37.1591, lng: 38.7969 },
  'Siirt': { lat: 37.9333, lng: 41.9500 },
  'Sinop': { lat: 42.0231, lng: 35.1531 },
  'Sirnak': { lat: 37.4187, lng: 42.4918 },
  'Sivas': { lat: 39.7477, lng: 37.0179 },
  'Tekirdag': { lat: 41.0000, lng: 27.5167 },
  'Tokat': { lat: 40.3167, lng: 36.5500 },
  'Trabzon': { lat: 41.0015, lng: 39.7178 },
  'Tunceli': { lat: 39.1079, lng: 39.5401 },
  'Usak': { lat: 38.6823, lng: 29.4082 },
  'Van': { lat: 38.4891, lng: 43.3800 },
  'Yalova': { lat: 40.6500, lng: 29.2667 },
  'Yozgat': { lat: 39.8181, lng: 34.8147 },
  'Zonguldak': { lat: 41.4564, lng: 31.7987 },
  // Dünya Şehirleri
  'Mecca': { lat: 21.4225, lng: 39.8262 },
  'Medina': { lat: 24.4539, lng: 39.6142 },
  'Riyadh': { lat: 24.7136, lng: 46.6753 },
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Toronto': { lat: 43.6532, lng: -79.3832 },
  'Cairo': { lat: 30.0444, lng: 31.2357 },
  'Tehran': { lat: 35.6892, lng: 51.3890 },
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Dhaka': { lat: 23.8103, lng: 90.4125 },
  'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
  'Jakarta': { lat: -6.2088, lng: 106.8456 },
  'Stockholm': { lat: 59.3293, lng: 18.0686 },
};

// Kıble açısını hesaplama (Great Circle formula)
function calculateQiblaAngle(lat, lng) {
  const phi1 = lat * Math.PI / 180;
  const phi2 = KAABA_LAT * Math.PI / 180;
  const deltaLambda = (KAABA_LNG - lng) * Math.PI / 180;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qibla = Math.atan2(y, x) * 180 / Math.PI;
  // Normalize to 0-360
  qibla = (qibla + 360) % 360;
  return qibla;
}

// Manyetometre verisinden açı hesaplama
function getHeading(magnetometer) {
  let angle = 0;
  if (magnetometer) {
    const { x, y } = magnetometer;
    if (Math.atan2 && x !== undefined && y !== undefined) {
      angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = (angle + 360) % 360;  // 0-360 arasına normalize et
      // Pusula saat yönünde kuzeyden ölçer, magnetometre verisini dönüştür
      angle = (360 - angle) % 360;
    }
  }
  return Math.round(angle);
}

// Pusula yön isimleri
function getDirectionName(degree) {
  const dirs = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
  const idx = Math.round(degree / 45) % 8;
  return dirs[idx];
}

export default function QiblaCompass({ visible, onClose, cityName }) {
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const kaabaaAnim = useRef(new Animated.Value(0)).current;
  const prevHeading = useRef(0);
  const prevQiblaRotation = useRef(0);

  const coords = CITY_COORDS[cityName] || CITY_COORDS['Istanbul'];
  const qiblaAngle = calculateQiblaAngle(coords.lat, coords.lng);
  const heading = getHeading(magnetometerData);
  
  // Kıble yönü göstergesi: pusuladaki hedef açı
  const qiblaRotation = (qiblaAngle - heading + 360) % 360;

  useEffect(() => {
    if (!visible) return;

    let sub = null;

    const startCompass = async () => {
      const available = await Magnetometer.isAvailableAsync();
      setIsAvailable(available);

      if (available) {
        Magnetometer.setUpdateInterval(100);
        sub = Magnetometer.addListener((data) => {
          setMagnetometerData(data);
        });
        setSubscription(sub);
      }
    };

    startCompass();

    return () => {
      if (sub) {
        sub.remove();
      }
      setSubscription(null);
    };
  }, [visible]);

  // Pusula animasyonu
  useEffect(() => {
    // Compass rotation (rotate the compass so North points correctly)
    const targetCompass = -heading;
    
    // En kısa yolu bul (pusula dönerken 359->1 gibi geçişlerde sıçrama olmasın)
    let diff = targetCompass - prevHeading.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const smoothCompass = prevHeading.current + diff;
    prevHeading.current = smoothCompass;

    Animated.spring(rotateAnim, {
      toValue: smoothCompass,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();

    // Kıble ok animasyonu
    const targetQibla = qiblaRotation;
    let qDiff = targetQibla - prevQiblaRotation.current;
    if (qDiff > 180) qDiff -= 360;
    if (qDiff < -180) qDiff += 360;
    const smoothQibla = prevQiblaRotation.current + qDiff;
    prevQiblaRotation.current = smoothQibla;

    Animated.spring(kaabaaAnim, {
      toValue: smoothQibla,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, [heading, qiblaRotation]);

  const compassRotation = rotateAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  const kaabaPointerRotation = kaabaaAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  // Kıbleye ne kadar yakın olduğunu hesapla (renk göstergesi)
  const angleDiff = Math.abs(qiblaRotation > 180 ? 360 - qiblaRotation : qiblaRotation);
  const isAligned = angleDiff < 10;
  const isClose = angleDiff < 30;

  const screenWidth = Dimensions.get('window').width;
  const compassSize = Math.min(screenWidth - 80, 300);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🧭 Kıble Pusulası</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {!isAvailable ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                ⚠️ Bu cihazda manyetometre sensörü bulunamadı.{'\n'}
                Kıble pusulası için manyetometre gereklidir.
              </Text>
            </View>
          ) : (
            <View style={styles.compassWrapper}>
              {/* Durum göstergesi */}
              <View style={[
                styles.statusBadge,
                isAligned ? styles.statusAligned : isClose ? styles.statusClose : styles.statusFar
              ]}>
                <Text style={styles.statusText}>
                  {isAligned ? '✅ Kıble Yönündesiniz!' : isClose ? '↻ Kıbleye Yakınsınız' : `Kıble: ${Math.round(qiblaAngle)}°`}
                </Text>
              </View>

              {/* Derece bilgisi */}
              <Text style={styles.headingText}>
                {heading}° {getDirectionName(heading)}
              </Text>

              {/* Pusula */}
              <View style={[styles.compassContainer, { width: compassSize, height: compassSize }]}>
                {/* Kıble oku (dış katman - sabit çerçeve üzerinde döner) */}
                <Animated.View 
                  style={[
                    styles.kaabaPointer,
                    { 
                      width: compassSize, 
                      height: compassSize,
                      transform: [{ rotate: kaabaPointerRotation }]
                    }
                  ]}
                >
                  <View style={[styles.kaabaArrowContainer, isAligned && styles.kaabaArrowAligned]}>
                    <Text style={styles.kaabaEmoji}>🕋</Text>
                  </View>
                </Animated.View>

                {/* Pusula diski (döner) */}
                <Animated.View 
                  style={[
                    styles.compassDisk,
                    { 
                      width: compassSize - 40, 
                      height: compassSize - 40,
                      borderRadius: (compassSize - 40) / 2,
                      transform: [{ rotate: compassRotation }]
                    }
                  ]}
                >
                  {/* Yön işaretleri */}
                  <Text style={[styles.dirLabel, styles.dirN]}>K</Text>
                  <Text style={[styles.dirLabel, styles.dirE]}>D</Text>
                  <Text style={[styles.dirLabel, styles.dirS]}>G</Text>
                  <Text style={[styles.dirLabel, styles.dirW]}>B</Text>
                  
                  {/* Derece çizgileri */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <View 
                      key={deg}
                      style={[
                        styles.tickMark,
                        { transform: [{ rotate: `${deg}deg` }, { translateY: -(compassSize - 40) / 2 + 15 }] },
                        deg % 90 === 0 && styles.tickMarkMajor,
                      ]}
                    />
                  ))}

                  {/* Merkez noktası */}
                  <View style={styles.centerDot} />
                </Animated.View>

                {/* Sabit üst ok (Kuzey göstergesi - ekranın üstünde sabit) */}
                <View style={styles.fixedNorthIndicator}>
                  <View style={styles.northTriangle} />
                </View>
              </View>

              {/* Bilgi */}
              <Text style={styles.infoText}>
                📍 Kıble açısı: {Math.round(qiblaAngle)}° ({cityName})
              </Text>
              <Text style={styles.disclaimerText}>
                Doğru sonuç için cihazı düz tutun ve metal objelerden uzak durun.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
    fontFamily: 'Nunito_700Bold',
  },
  modalClose: {
    fontSize: 22,
    color: '#94A3B8',
    padding: 4,
  },
  compassWrapper: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  statusAligned: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusClose: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  statusFar: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  statusText: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  headingText: {
    color: '#CBD5E1',
    fontSize: 28,
    fontWeight: '300',
    fontFamily: 'Nunito_300Light',
    marginBottom: 20,
  },
  compassContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compassDisk: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 3,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dirLabel: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Nunito_700Bold',
  },
  dirN: {
    top: 18,
    color: '#EF4444',
  },
  dirE: {
    right: 18,
    color: '#CBD5E1',
  },
  dirS: {
    bottom: 18,
    color: '#CBD5E1',
  },
  dirW: {
    left: 18,
    color: '#CBD5E1',
  },
  tickMark: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: '#475569',
  },
  tickMarkMajor: {
    height: 16,
    width: 3,
    backgroundColor: '#94A3B8',
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  fixedNorthIndicator: {
    position: 'absolute',
    top: -5,
    alignItems: 'center',
  },
  northTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F59E0B',
  },
  kaabaPointer: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  kaabaArrowContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  kaabaArrowAligned: {
    backgroundColor: 'rgba(16, 185, 129, 0.6)',
    borderColor: '#34D399',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  kaabaEmoji: {
    fontSize: 22,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 20,
    fontFamily: 'Nunito_400Regular',
  },
  disclaimerText: {
    color: '#475569',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Nunito_400Regular',
  },
});
