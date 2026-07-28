import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, Modal, TextInput, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Linking, KeyboardAvoidingView } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_300Light } from '@expo-google-fonts/nunito';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';



// Google AdMob Reklam Modülü (Expo Go çökmesini önlemek için korumalı import)
let BannerAd = null;
let BannerAdSize = null;
let TestIds = null;
let AppOpenAd = null;
let AdEventType = null;
let mobileAds = null;
let isAdmobAvailable = false;

try {
  const AdMob = require('react-native-google-mobile-ads');
  BannerAd = AdMob.BannerAd;
  BannerAdSize = AdMob.BannerAdSize;
  TestIds = AdMob.TestIds;
  AppOpenAd = AdMob.AppOpenAd;
  AdEventType = AdMob.AdEventType;
  mobileAds = AdMob.default;
  isAdmobAvailable = true;
} catch (e) {
  console.log('AdMob native modülü yüklenemedi (Expo Go modunda veya build eksik).');
}


// Bildirim gelince nasıl davranacağını ayarla (uygulama açıkken de göster)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PRAYER_NAMES_TR = {
  Fajr: "İmsak",
  Sunrise: "Güneş",
  Dhuhr: "Öğle",
  Asr: "İkindi",
  Maghrib: "Akşam",
  Isha: "Yatsı"
};

// Vakitlerin sırasını tutmak için
const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

// Türkiye ve dünya şehirleri listesi
const CITIES = [
  // Türkiye — name: API için ASCII, displayName: ekranda gösterilen Türkçe
  { name: 'Adana', displayName: 'Adana', country: 'Turkey' },
  { name: 'Adiyaman', displayName: 'Adıyaman', country: 'Turkey' },
  { name: 'Afyonkarahisar', displayName: 'Afyonkarahisar', country: 'Turkey' },
  { name: 'Agri', displayName: 'Ağrı', country: 'Turkey' },
  { name: 'Aksaray', displayName: 'Aksaray', country: 'Turkey' },
  { name: 'Amasya', displayName: 'Amasya', country: 'Turkey' },
  { name: 'Ankara', displayName: 'Ankara', country: 'Turkey' },
  { name: 'Antalya', displayName: 'Antalya', country: 'Turkey' },
  { name: 'Ardahan', displayName: 'Ardahan', country: 'Turkey' },
  { name: 'Artvin', displayName: 'Artvin', country: 'Turkey' },
  { name: 'Aydin', displayName: 'Aydın', country: 'Turkey' },
  { name: 'Balikesir', displayName: 'Balıkesir', country: 'Turkey' },
  { name: 'Bartin', displayName: 'Bartın', country: 'Turkey' },
  { name: 'Batman', displayName: 'Batman', country: 'Turkey' },
  { name: 'Bayburt', displayName: 'Bayburt', country: 'Turkey' },
  { name: 'Bilecik', displayName: 'Bilecik', country: 'Turkey' },
  { name: 'Bingol', displayName: 'Bingöl', country: 'Turkey' },
  { name: 'Bitlis', displayName: 'Bitlis', country: 'Turkey' },
  { name: 'Bolu', displayName: 'Bolu', country: 'Turkey' },
  { name: 'Burdur', displayName: 'Burdur', country: 'Turkey' },
  { name: 'Bursa', displayName: 'Bursa', country: 'Turkey' },
  { name: 'Canakkale', displayName: 'Çanakkale', country: 'Turkey' },
  { name: 'Cankiri', displayName: 'Çankırı', country: 'Turkey' },
  { name: 'Corum', displayName: 'Çorum', country: 'Turkey' },
  { name: 'Denizli', displayName: 'Denizli', country: 'Turkey' },
  { name: 'Diyarbakir', displayName: 'Diyarbakır', country: 'Turkey' },
  { name: 'Duzce', displayName: 'Düzce', country: 'Turkey' },
  { name: 'Edirne', displayName: 'Edirne', country: 'Turkey' },
  { name: 'Elazig', displayName: 'Elazığ', country: 'Turkey' },
  { name: 'Erzincan', displayName: 'Erzincan', country: 'Turkey' },
  { name: 'Erzurum', displayName: 'Erzurum', country: 'Turkey' },
  { name: 'Eskisehir', displayName: 'Eskişehir', country: 'Turkey' },
  { name: 'Gaziantep', displayName: 'Gaziantep', country: 'Turkey' },
  { name: 'Giresun', displayName: 'Giresun', country: 'Turkey' },
  { name: 'Gumushane', displayName: 'Gümüşhane', country: 'Turkey' },
  { name: 'Hakkari', displayName: 'Hakkari', country: 'Turkey' },
  { name: 'Hatay', displayName: 'Hatay', country: 'Turkey' },
  { name: 'Igdir', displayName: 'Iğdır', country: 'Turkey' },
  { name: 'Isparta', displayName: 'Isparta', country: 'Turkey' },
  { name: 'Istanbul', displayName: 'İstanbul', country: 'Turkey' },
  { name: 'Izmir', displayName: 'İzmir', country: 'Turkey' },
  { name: 'Kahramanmaras', displayName: 'Kahramanmaraş', country: 'Turkey' },
  { name: 'Karabuk', displayName: 'Karabük', country: 'Turkey' },
  { name: 'Karaman', displayName: 'Karaman', country: 'Turkey' },
  { name: 'Kars', displayName: 'Kars', country: 'Turkey' },
  { name: 'Kastamonu', displayName: 'Kastamonu', country: 'Turkey' },
  { name: 'Kayseri', displayName: 'Kayseri', country: 'Turkey' },
  { name: 'Kilis', displayName: 'Kilis', country: 'Turkey' },
  { name: 'Kirikkale', displayName: 'Kırıkkale', country: 'Turkey' },
  { name: 'Kirklareli', displayName: 'Kırklareli', country: 'Turkey' },
  { name: 'Kirsehir', displayName: 'Kırşehir', country: 'Turkey' },
  { name: 'Kocaeli', displayName: 'Kocaeli', country: 'Turkey' },
  { name: 'Konya', displayName: 'Konya', country: 'Turkey' },
  { name: 'Kutahya', displayName: 'Kütahya', country: 'Turkey' },
  { name: 'Malatya', displayName: 'Malatya', country: 'Turkey' },
  { name: 'Manisa', displayName: 'Manisa', country: 'Turkey' },
  { name: 'Mardin', displayName: 'Mardin', country: 'Turkey' },
  { name: 'Mersin', displayName: 'Mersin', country: 'Turkey' },
  { name: 'Mugla', displayName: 'Muğla', country: 'Turkey' },
  { name: 'Mus', displayName: 'Muş', country: 'Turkey' },
  { name: 'Nevsehir', displayName: 'Nevşehir', country: 'Turkey' },
  { name: 'Nigde', displayName: 'Niğde', country: 'Turkey' },
  { name: 'Ordu', displayName: 'Ordu', country: 'Turkey' },
  { name: 'Osmaniye', displayName: 'Osmaniye', country: 'Turkey' },
  { name: 'Rize', displayName: 'Rize', country: 'Turkey' },
  { name: 'Sakarya', displayName: 'Sakarya', country: 'Turkey' },
  { name: 'Samsun', displayName: 'Samsun', country: 'Turkey' },
  { name: 'Sanliurfa', displayName: 'Şanlıurfa', country: 'Turkey' },
  { name: 'Siirt', displayName: 'Siirt', country: 'Turkey' },
  { name: 'Sinop', displayName: 'Sinop', country: 'Turkey' },
  { name: 'Sirnak', displayName: 'Şırnak', country: 'Turkey' },
  { name: 'Sivas', displayName: 'Sivas', country: 'Turkey' },
  { name: 'Tekirdag', displayName: 'Tekirdağ', country: 'Turkey' },
  { name: 'Tokat', displayName: 'Tokat', country: 'Turkey' },
  { name: 'Trabzon', displayName: 'Trabzon', country: 'Turkey' },
  { name: 'Tunceli', displayName: 'Tunceli', country: 'Turkey' },
  { name: 'Usak', displayName: 'Uşak', country: 'Turkey' },
  { name: 'Van', displayName: 'Van', country: 'Turkey' },
  { name: 'Yalova', displayName: 'Yalova', country: 'Turkey' },
  { name: 'Yozgat', displayName: 'Yozgat', country: 'Turkey' },
  { name: 'Zonguldak', displayName: 'Zonguldak', country: 'Turkey' },
  // Dünya şehirleri
  { name: 'Mecca', displayName: 'Mekke', country: 'Saudi Arabia' },
  { name: 'Medina', displayName: 'Medine', country: 'Saudi Arabia' },
  { name: 'Riyadh', displayName: 'Riyad', country: 'Saudi Arabia' },
  { name: 'Dubai', displayName: 'Dubai', country: 'United Arab Emirates' },
  { name: 'London', displayName: 'Londra', country: 'United Kingdom' },
  { name: 'Berlin', displayName: 'Berlin', country: 'Germany' },
  { name: 'Paris', displayName: 'Paris', country: 'France' },
  { name: 'Amsterdam', displayName: 'Amsterdam', country: 'Netherlands' },
  { name: 'New York', displayName: 'New York', country: 'United States' },
  { name: 'Los Angeles', displayName: 'Los Angeles', country: 'United States' },
  { name: 'Toronto', displayName: 'Toronto', country: 'Canada' },
  { name: 'Cairo', displayName: 'Kahire', country: 'Egypt' },
  { name: 'Tehran', displayName: 'Tahran', country: 'Iran' },
  { name: 'Karachi', displayName: 'Karaçi', country: 'Pakistan' },
  { name: 'Dhaka', displayName: 'Dakka', country: 'Bangladesh' },
  { name: 'Kuala Lumpur', displayName: 'Kuala Lumpur', country: 'Malaysia' },
  { name: 'Jakarta', displayName: 'Cakarta', country: 'Indonesia' },
  { name: 'Stockholm', displayName: 'Stokholm', country: 'Sweden' },
];

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [city, setCity] = useState('Istanbul');
  const [country, setCountry] = useState('Turkey');
  const [prayerTimes, setPrayerTimes] = useState(null);
  
  const [nextPrayer, setNextPrayer] = useState({ name: '', time: '' });
  const [isCityLoaded, setIsCityLoaded] = useState(false);

  // iOS App Tracking Transparency (ATT) & AdMob Başlatma
  useEffect(() => {
    const requestAdTracking = async () => {
      try {
        // İzin iste (iOS için zorunlu modalı açar)
        const { status } = await requestTrackingPermissionsAsync();
        if (status === 'granted') {
          console.log('Reklam takip izni verildi.');
        } else {
          console.log('Reklam takip izni reddedildi veya desteklenmiyor.');
        }
      } catch (e) {
        console.warn('ATT İzin isteme hatası:', e);
      }

      // AdMob SDK'sını başlat
      if (isAdmobAvailable && mobileAds) {
        try {
          await mobileAds().initialize();
          console.log('Google Mobile Ads SDK başarıyla başlatıldı.');
        } catch (adError) {
          console.warn('AdMob SDK başlatma hatası:', adError);
        }
      }
    };

    requestAdTracking();
  }, []);

  // iOS Global Audio Mode Yapılandırması (Sessiz mod ve arka plan desteği)
  useEffect(() => {
    const initAudioMode = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldPlayInBackground: true,
          allowsRecordingIOS: false,
        });
        console.log('Global Audio Mode başarıyla yapılandırıldı.');
      } catch (e) {
        console.warn('Global Audio Mode hatası:', e);
      }
    };
    initAudioMode();
  }, []);

  // Uygulama Açılış Reklamı (App Open Ad) Entegrasyonu
  useEffect(() => {
    if (!isAdmobAvailable || !AppOpenAd || !AdEventType || !TestIds) return;

    try {
      const adUnitId = __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-5110586926092452/1164858105';
      const appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true
      });

      const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('App Open reklamı yüklendi, gösteriliyor...');
        appOpenAd.show();
      });

      const unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('App Open reklam yükleme hatası:', error);
      });

      appOpenAd.load();

      return () => {
        unsubscribeLoaded();
        unsubscribeError();
      };
    } catch (e) {
      console.warn("App Open Ad tetikleme hatası:", e);
    }
  }, []);
  const [remainingTimeStr, setRemainingTimeStr] = useState('00:00:00');

  const [loading, setLoading] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityDisplay, setCityDisplay] = useState('İstanbul');
  const lastPlayedPrayer = useRef(null);
  const searchInputRef = useRef(null);
  const player = useAudioPlayer(require('./assets/ezan.mp3'), 200);

  // AsyncStorage'dan kaydedilmiş şehri yükle
  useEffect(() => {
    const loadSavedCity = async () => {
      try {
        const saved = await AsyncStorage.getItem('selectedCity');
        if (saved) {
          const { name, country: c, displayName: dn } = JSON.parse(saved);
          setCity(name);
          setCountry(c);
          setCityDisplay(dn || name);
        }
      } catch (e) { 
        console.warn('Kaydedilmiş şehir okunamadı', e); 
      } finally {
        setIsCityLoaded(true);
      }
    };
    loadSavedCity();
  }, []);

  // Şehir seç ve kaydet
  const selectCity = async (cityObj) => {
    setCity(cityObj.name);
    setCountry(cityObj.country);
    setCityDisplay(cityObj.displayName || cityObj.name);
    setShowCityModal(false);
    setCitySearch('');
    await AsyncStorage.setItem('selectedCity', JSON.stringify(cityObj));
  };

  const filteredCities = CITIES.filter(c =>
    (c.displayName || c.name).toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  // API'den Namaz Vakitlerini Çek (Diyanet Metodu: 13)
  useEffect(() => {
    if (!isCityLoaded) return; // Şehir bilgisi AsyncStorage'dan yüklenene kadar bekle

    let active = true;

    const fetchPrayerTimes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=13`);
        const json = await response.json();
        
        if (active && json.code === 200) {
          const timings = json.data.timings;
          // Sadece ihtiyacımız olan vakitleri filtrele
          const filteredTimes = {
            Fajr: timings.Fajr,
            Sunrise: timings.Sunrise,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha,
          };
          setPrayerTimes(filteredTimes);
        }
      } catch (error) {
        if (active) {
          console.error("Vakitler çekilemedi:", error);
        }
      }
      if (active) {
        setLoading(false);
      }
    };

    fetchPrayerTimes();

    return () => {
      active = false;
    };
  }, [city, country, isCityLoaded]);

  // Bildirim izni al ve Android kanalını kur
  useEffect(() => {
    const setupNotifications = async () => {
      // Android ve iOS için Push Bildirim izinlerini al ve Token'ı çek
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log('Push Notification Token:', token);
        // NOT: Bu token'ı daha sonra kendi sunucunuza (veritabanınıza) kaydederek 
        // kullanıcılara uzaktan push bildirim gönderebilirsiniz.
      }
    };
    setupNotifications();
  }, []);

  // Push Bildirim Kayıt ve Yetkilendirme Yardımcı Fonksiyonu
  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('ezan-channel', {
        name: 'Ezan Bildirimleri',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'ezan.mp3',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Push bildirim izni verilmedi!');
        return null;
      }

      try {
        // Expo Push Token al
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: 'namaz-vakti-mumin-kardes' // veya Expo Dashboard proje ID'niz
        })).data;
      } catch (e) {
        console.warn('Expo Push Token alınırken hata oluştu:', e);
      }
    } else {
      console.log('Fiziksel cihaz kullanılmadığı için Push Token üretilemedi.');
    }

    return token;
  };

  // Namaz vakitleri gelince bildirimleri planla
  useEffect(() => {
    if (!prayerTimes) return;
    schedulePrayerNotifications(prayerTimes);
  }, [prayerTimes]);

  // Her namaz vakti için zamanlanmış yerel bildirim planla
  const schedulePrayerNotifications = async (times) => {
    // Mevcut tüm bildirimleri iptal et (eskiyi temizle)
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();

    for (const key of PRAYER_KEYS) {
      const [hours, minutes] = times[key].split(':').map(Number);

      // Bugünkü vakit için Date objesi
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      // Vakit geçtiyse yarına planla
      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🕌 ${PRAYER_NAMES_TR[key]} Vakti`,
          body: 'Namaz vakti girdi. Hayırlı olsun.',
          // Not: Özel ezan sesi native build'de çalışır.
          // Expo Go'da sistem sesi kullanılır; gerçek ezan için eas build gerekir.
          sound: true,
          ...(Platform.OS === 'android' && { channelId: 'ezan-channel' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: prayerDate,
        },
      });
    }
  };

  // Otomatik Ezan: Her saniye vakitleri kontrol et
  useEffect(() => {
    if (!prayerTimes) return;

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      calculateNextPrayerAndRemaining(now, prayerTimes);

      // Şu anki saat HH:MM olarak al (saniyeleri yoksay)
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hh}:${mm}`;

      // Her vakti kontrol et
      PRAYER_KEYS.forEach((key) => {
        if (
          prayerTimes[key] === currentHHMM &&  // Vakit geldi mi?
          now.getSeconds() === 0 &&              // Tam dakika başında mı?
          lastPlayedPrayer.current !== `${key}-${currentHHMM}`  // Daha önce çalmadı mı?
        ) {
          lastPlayedPrayer.current = `${key}-${currentHHMM}`;
          playAdhan();
          console.log(`⏰ Otomatik ezan: ${PRAYER_NAMES_TR[key]} vakti`);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerTimes]);

  const calculateNextPrayerAndRemaining = (now, times) => {
    let nextKey = null;
    let nextTimeDate = null;
    
    // Şu anki vakti string olarak al (Örn: "14:30:00")
    const currentTimeStr = now.toTimeString().split(' ')[0];

    // Vakitleri dolaş ve sıradaki vakti bul
    for (let i = 0; i < PRAYER_KEYS.length; i++) {
      const key = PRAYER_KEYS[i];
      const timeStr = times[key] + ":00";
      
      if (currentTimeStr < timeStr) {
        nextKey = key;
        
        // Sıradaki vaktin Date objesini oluştur
        const [hours, minutes] = times[key].split(':');
        nextTimeDate = new Date(now);
        nextTimeDate.setHours(parseInt(hours, 10));
        nextTimeDate.setMinutes(parseInt(minutes, 10));
        nextTimeDate.setSeconds(0);
        break;
      }
    }

    // Eğer tüm vakitler geçtiyse, bir sonraki vakit YARININ İmsak (Fajr) vaktidir
    if (!nextKey) {
      nextKey = "Fajr";
      const [hours, minutes] = times["Fajr"].split(':');
      nextTimeDate = new Date(now);
      nextTimeDate.setDate(nextTimeDate.getDate() + 1); // Yarın
      nextTimeDate.setHours(parseInt(hours, 10));
      nextTimeDate.setMinutes(parseInt(minutes, 10));
      nextTimeDate.setSeconds(0);
    }

    setNextPrayer({ name: nextKey, time: times[nextKey] });

    // Kalan süreyi hesapla
    const diffMs = nextTimeDate - now;
    if (diffMs > 0) {
      const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
      const diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000);
      const diffSecs = Math.floor((((diffMs % 86400000) % 3600000) % 60000) / 1000);
      
      setRemainingTimeStr(
        `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`
      );
    }
  };

  async function playAdhan() {
    try {
      // iOS sessiz modunda dahi ses çalabilmek için audio session'u ayarla
      await setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldPlayInBackground: true,
        allowsRecordingIOS: false,
      });

      if (player) {
        // Eğer ses zaten çalıyorsa durdurup baştan başlat
        if (player.playing) {
          player.pause();
        }
        player.seekTo(0);
        player.play();
        console.log('Ezan başarıyla tetiklendi.');
      } else {
        console.warn('Ses oynatıcı hazır değil.');
      }
    } catch (error) {
      console.error('Ses hatası:', JSON.stringify(error));
    }
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={{ color: '#94A3B8', marginTop: 10, fontFamily: 'System' }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={false} />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Başlık ve Tarih */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>Namaz Vakti Mümin Kardeş</Text>
          <Text style={styles.dateText}>
            {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <TouchableOpacity style={styles.cityBadge} onPress={() => setShowCityModal(true)}>
            <Text style={styles.cityText}>📍 {cityDisplay}  ✎</Text>
          </TouchableOpacity>
        </View>

        {/* Geri Sayım Kartı */}
        <View style={styles.countdownCard}>
          <Text style={styles.nextPrayerLabel}>SONRAKİ VAKİT · {PRAYER_NAMES_TR[nextPrayer.name]}</Text>
          <Text style={styles.countdownTime}>{remainingTimeStr}</Text>
          <Text style={styles.remainingText}>Kaldı</Text>
          <TouchableOpacity style={styles.playButton} onPress={playAdhan}>
            <Text style={styles.playButtonText}>Ezanı Dinle</Text>
          </TouchableOpacity>
        </View>

        {/* Vakitler Listesi */}
        <View style={styles.timesContainer}>
          {prayerTimes && Object.entries(prayerTimes).map(([key, time]) => (
            <View key={key} style={[styles.timeRow, nextPrayer.name === key && styles.activeTimeRow]}>
              <Text style={[styles.timeName, nextPrayer.name === key && styles.activeTimeText]}>
                {PRAYER_NAMES_TR[key]}
              </Text>
              <Text style={[styles.timeValue, nextPrayer.name === key && styles.activeTimeText]}>
                {time}
              </Text>
            </View>
          ))}
        </View>

        {/* Gizlilik Politikası Bağlantısı (App Store Review için) */}
        <TouchableOpacity 
          style={styles.privacyLinkContainer}
          onPress={() => Linking.openURL('https://sites.google.com/view/namaz-vakti-mumin-kardes/ana-sayfa')}
        >
          <Text style={styles.privacyLinkText}>Gizlilik Politikası</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Google AdMob Banner Alanı */}
      {isAdmobAvailable && BannerAd && TestIds && BannerAdSize ? (
        <View style={{ alignItems: 'center', backgroundColor: '#1E293B' }}>
          <BannerAd
            unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-5110586926092452/2477939771'}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      ) : (
        <View style={styles.adBannerMock}>
          <Text style={styles.adBannerText}>GOOGLE REKLAM ALANI (MOCK)</Text>
        </View>
      )}

      {/* Şehir Seçici Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
        onShow={() => {
          // Modal açıldıktan hemen sonra klavyeyi otomatik odakla
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 100);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📍 Şehir Seç</Text>
              <TouchableOpacity onPress={() => { setShowCityModal(false); setCitySearch(''); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Şehir ara..."
              placeholderTextColor="#64748B"
              value={citySearch}
              onChangeText={setCitySearch}
            />
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => `${item.name}-${item.country}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    item.name === city && styles.cityItemActive
                  ]}
                  onPress={() => selectCity(item)}
                >
                  <Text style={[styles.cityItemName, item.name === city && styles.cityItemNameActive]}>
                    {item.displayName || item.name}
                  </Text>
                  <Text style={styles.cityItemCountry}>{item.country}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>Aradığınız şehir bulunamadı.</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </KeyboardAvoidingView>
        </View>
      </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  header: {
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F59E0B',
    letterSpacing: 0.5,
    fontFamily: 'Nunito_700Bold',
  },
  dateText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 5,
    fontFamily: 'Nunito_400Regular',
  },
  cityBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  cityText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  specialDayCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  specialDayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 10,
  },
  specialDayText: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
  },
  countdownCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  nextPrayerLabel: {
    fontSize: 13,
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: 10,
    fontFamily: 'Nunito_600SemiBold',
  },
  countdownTime: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: 'Nunito_300Light',
    fontVariant: ['tabular-nums'],
  },
  remainingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 15,
    fontFamily: 'Nunito_400Regular',
  },
  playButton: {
    backgroundColor: '#10B981', 
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  timesContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  activeTimeRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderBottomWidth: 0,
  },
  timeName: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '500',
    fontFamily: 'Nunito_600SemiBold',
  },
  timeValue: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  activeTimeText: {
    color: '#10B981', 
    fontWeight: 'bold',
  },
  // Modal stilleri
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
    maxHeight: '80%',
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
    fontFamily: 'Nunito_400Regular',
  },
  searchInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
    fontFamily: 'Nunito_400Regular',
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  cityItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  cityItemName: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '500',
    fontFamily: 'Nunito_600SemiBold',
  },
  cityItemNameActive: {
    color: '#10B981',
    fontWeight: 'bold',
    fontFamily: 'Nunito_700Bold',
  },
  cityItemCountry: {
    fontSize: 13,
    color: '#64748B',
  },
  adBannerMock: {
    backgroundColor: '#1E293B',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  adBannerText: {
    color: '#64748B',
    fontSize: 12,
    letterSpacing: 1.5,
    fontFamily: 'Nunito_700Bold',
  },
  privacyLinkContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  privacyLinkText: {
    color: '#64748B',
    fontSize: 13,
    textDecorationLine: 'underline',
    fontFamily: 'Nunito_400Regular',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    color: '#64748B',
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
});
