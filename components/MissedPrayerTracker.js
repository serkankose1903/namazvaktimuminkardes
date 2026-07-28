import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRAYER_TYPES = [
  { key: 'fajr', name: 'Sabah', emoji: '🌅' },
  { key: 'dhuhr', name: 'Öğle', emoji: '☀️' },
  { key: 'asr', name: 'İkindi', emoji: '🌤' },
  { key: 'maghrib', name: 'Akşam', emoji: '🌇' },
  { key: 'isha', name: 'Yatsı', emoji: '🌙' },
  { key: 'witr', name: 'Vitir', emoji: '✨' },
];

const STORAGE_KEY = '@missed_prayers';

export default function MissedPrayerTracker({ visible, onClose }) {
  const [prayers, setPrayers] = useState({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  });
  const [loaded, setLoaded] = useState(false);

  // AsyncStorage'dan yükle
  useEffect(() => {
    const loadPrayers = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setPrayers(JSON.parse(saved));
        }
      } catch (e) {
        console.warn('Kaza namazları yüklenemedi:', e);
      }
      setLoaded(true);
    };
    loadPrayers();
  }, []);

  // Değişiklikleri kaydet
  useEffect(() => {
    if (!loaded) return;
    const savePrayers = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));
      } catch (e) {
        console.warn('Kaza namazları kaydedilemedi:', e);
      }
    };
    savePrayers();
  }, [prayers, loaded]);

  const increment = (key, amount = 1) => {
    setPrayers(prev => ({ ...prev, [key]: prev[key] + amount }));
  };

  const decrement = (key) => {
    setPrayers(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] - 1),
    }));
  };

  const resetAll = () => {
    Alert.alert(
      'Tümünü Sıfırla',
      'Tüm kaza namazı sayaçlarını sıfırlamak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            setPrayers({
              fajr: 0,
              dhuhr: 0,
              asr: 0,
              maghrib: 0,
              isha: 0,
              witr: 0,
            });
          },
        },
      ]
    );
  };

  // Toplam istatistikler
  const totalMissed = Object.values(prayers).reduce((a, b) => a + b, 0);

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
            <Text style={styles.modalTitle}>✅ Kaza Namazı Takip</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Toplam bilgi */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Toplam Kaza</Text>
            <Text style={styles.summaryCount}>{totalMissed}</Text>
            <Text style={styles.summarySubtext}>
              {totalMissed === 0 
                ? 'Harika! Hiç kaza namazınız yok.' 
                : 'Kazâ borçlarınızı takip edin.'}
            </Text>
          </View>

          {/* Namaz listesi */}
          <View style={styles.prayerList}>
            {PRAYER_TYPES.map((prayer) => (
              <View key={prayer.key} style={styles.prayerRow}>
                <View style={styles.prayerInfo}>
                  <Text style={styles.prayerEmoji}>{prayer.emoji}</Text>
                  <Text style={styles.prayerName}>{prayer.name}</Text>
                </View>
                
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterBtn, styles.decrementBtn]}
                    onPress={() => decrement(prayer.key)}
                    disabled={prayers[prayer.key] === 0}
                  >
                    <Text style={[
                      styles.counterBtnText, 
                      prayers[prayer.key] === 0 && styles.counterBtnDisabled
                    ]}>−</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.countDisplay}>
                    <Text style={[
                      styles.countText,
                      prayers[prayer.key] > 0 && styles.countTextActive,
                    ]}>
                      {prayers[prayer.key]}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.counterBtn, styles.incrementBtn]}
                    onPress={() => increment(prayer.key)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickAddBtn}
                    onPress={() => increment(prayer.key, 10)}
                  >
                    <Text style={styles.quickAddText}>+10</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Alt butonlar */}
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.resetAllBtn} onPress={resetAll}>
              <Text style={styles.resetAllText}>🗑 Tümünü Sıfırla</Text>
            </TouchableOpacity>
          </View>

          {/* Bilgi notu */}
          <Text style={styles.infoNote}>
            Kıldığınız kaza namazları için " − " butonuna basarak sayacı azaltın.
          </Text>
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
  summaryCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#94A3B8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'Nunito_600SemiBold',
  },
  summaryCount: {
    fontSize: 48,
    fontWeight: '300',
    color: '#F59E0B',
    fontFamily: 'Nunito_300Light',
    marginVertical: 4,
  },
  summarySubtext: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Nunito_400Regular',
  },
  prayerList: {
    gap: 8,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prayerEmoji: {
    fontSize: 20,
  },
  prayerName: {
    fontSize: 16,
    color: '#CBD5E1',
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decrementBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  incrementBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  counterBtnText: {
    fontSize: 20,
    color: '#CBD5E1',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  counterBtnDisabled: {
    color: '#334155',
  },
  countDisplay: {
    minWidth: 44,
    alignItems: 'center',
  },
  countText: {
    fontSize: 22,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  countTextActive: {
    color: '#F59E0B',
  },
  quickAddBtn: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 2,
  },
  quickAddText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  bottomActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  resetAllBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetAllText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  infoNote: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Nunito_400Regular',
  },
});
