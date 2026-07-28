import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Share } from 'react-native';
import HADITHS from '../data/hadiths';

// Günün hadisini belirle (yılın gününe göre)
function getDailyHadith() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % HADITHS.length;
  return HADITHS[index];
}

export default function DailyHadith() {
  const hadith = getDailyHadith();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📖 Günün Hadisi\n\n"${hadith.text}"\n\n— ${hadith.source}\n\n🕌 Namaz Vakti Mümin Kardeş`,
      });
    } catch (error) {
      console.warn('Paylaşım hatası:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>📖 Günün Hadisi</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Paylaş ↗</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.hadithCard}>
        <View style={styles.quoteMarkContainer}>
          <Text style={styles.quoteMark}>"</Text>
        </View>
        <Text style={styles.hadithText}>{hadith.text}</Text>
        <View style={styles.sourceContainer}>
          <View style={styles.sourceDivider} />
          <Text style={styles.sourceText}>{hadith.source}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    color: '#CBD5E1',
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  shareButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  shareButtonText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  hadithCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  quoteMarkContainer: {
    position: 'absolute',
    top: 8,
    right: 16,
    opacity: 0.15,
  },
  quoteMark: {
    fontSize: 60,
    color: '#F59E0B',
    fontFamily: 'Nunito_700Bold',
    lineHeight: 60,
  },
  hadithText: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 26,
    fontStyle: 'italic',
    fontFamily: 'Nunito_400Regular',
  },
  sourceContainer: {
    marginTop: 14,
    alignItems: 'flex-start',
  },
  sourceDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 8,
    borderRadius: 1,
  },
  sourceText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Nunito_400Regular',
  },
});
