import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, Modal, TextInput, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Linking, KeyboardAvoidingView, AppState } from 'react-native';
import { useAudioPlayer, setAudioModeAsync, useAudioPlayerStatus } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_300Light } from '@expo-google-fonts/nunito';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';

// Yeni Özellik Bileşenleri
import QiblaCompass from './components/QiblaCompass';
import DailyHadith from './components/DailyHadith';
import MissedPrayerTracker from './components/MissedPrayerTracker';


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

// Hicri özel günler (Hicri ay-gün eşleşmesi)
const SPECIAL_ISLAMIC_DAYS = [
  { month: 1, day: 1, title: '🎉 Hicri Yılbaşı', desc: 'Hicri yeni yılın ilk günü. Hayırlı olsun!' },
  { month: 1, day: 10, title: '🕌 Aşure Günü', desc: 'Muharrem ayının 10. günü. Oruç tutmak sünnettir.' },
  { month: 3, day: 12, title: '🌙 Mevlid Kandili', desc: 'Peygamber Efendimizin (s.a.v.) doğum günü.' },
  { month: 7, day: 27, title: '✨ Regaip Kandili', desc: 'Üç ayların başlangıcı. Mübarek Regaip gecesi.' },
  { month: 8, day: 15, title: '🌟 Berat Kandili', desc: 'Günahların affedildiği mübarek gece.' },
  { month: 9, day: 1, title: '🌙 Ramazan Başlangıcı', desc: 'Mübarek Ramazan ayının ilk günü. Hayırlı Ramazanlar!' },
  { month: 9, day: 27, title: '💫 Kadir Gecesi', desc: 'Bin aydan hayırlı olan Kadir Gecesi.' },
  { month: 10, day: 1, title: '🎊 Ramazan Bayramı', desc: 'Ramazan Bayramının 1. günü. Bayramınız mübarek olsun!' },
  { month: 10, day: 2, title: '🎊 Ramazan Bayramı', desc: 'Ramazan Bayramının 2. günü.' },
  { month: 10, day: 3, title: '🎊 Ramazan Bayramı', desc: 'Ramazan Bayramının 3. günü.' },
  { month: 12, day: 9, title: '🕋 Arefe Günü', desc: 'Kurban Bayramı arifesi. Arefe günü orucu sünnettir.' },
  { month: 12, day: 10, title: '🐑 Kurban Bayramı', desc: 'Kurban Bayramının 1. günü. Bayramınız mübarek olsun!' },
  { month: 12, day: 11, title: '🐑 Kurban Bayramı', desc: 'Kurban Bayramının 2. günü.' },
  { month: 12, day: 12, title: '🐑 Kurban Bayramı', desc: 'Kurban Bayramının 3. günü.' },
  { month: 12, day: 13, title: '🐑 Kurban Bayramı', desc: 'Kurban Bayramının 4. günü.' },
];

// Hicri ay isimleri
const HIJRI_MONTHS = {
  1: 'Muharrem',
  2: 'Safer',
  3: 'Rebîülevvel',
  4: 'Rebîülâhir',
  5: 'Cemâziyelevvel',
  6: 'Cemâziyelâhir',
  7: 'Recep',
  8: 'Şâban',
  9: 'Ramazan',
  10: 'Şevval',
  11: 'Zilkade',
  12: 'Zilhicce',
};

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

  // Hicri Takvim State
  const [hijriDate, setHijriDate] = useState(null);
  const [specialDay, setSpecialDay] = useState(null);

  // Zikirmatik State
  const [isZikirmatikVisible, setIsZikirmatikVisible] = useState(false);
  const [zikirCount, setZikirCount] = useState(0);
  const [zikirTarget, setZikirTarget] = useState(33);
  const [selectedZikir, setSelectedZikir] = useState('Sübhanallah');

  // Yeni Özellik Modalleri
  const [isQiblaVisible, setIsQiblaVisible] = useState(false);
  const [isMissedPrayerVisible, setIsMissedPrayerVisible] = useState(false);

  // AdMob Başlatma (ATT KALDIRILDI - yalnızca kişiselleştirilmemiş reklamlar)
  useEffect(() => {
    const initAds = async () => {
      if (isAdmobAvailable && mobileAds) {
        try {
          await mobileAds().initialize();
          console.log('Google Mobile Ads SDK başarıyla başlatıldı (kişiselleştirilmemiş).');
        } catch (adError) {
          console.warn('AdMob SDK başlatma hatası:', adError);
        }
      }
    };
    initAds();
  }, []);

  // iOS Global Audio Mode: AVAudioSession kategorisini Playback'e zorunlu kiliti
  // interruptionMode:'doNotMix' iOS'ta category=playback'i native düzeyde zorlar
  // Bu sayede sessiz mod anahtarı ve diğer uygulamalar (AdMob dahil) devre dışı kalır
  useEffect(() => {
    const initAudioMode = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'doNotMix',
          staysActiveInBackground: true,
          allowsRecording: false,
        });
        console.log('Global Audio Mode başarıyla yapılandırıldı (doNotMix + playsInSilentMode).');
      } catch (e) {
        console.warn('Global Audio Mode hatası:', e?.message || e);
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
  const player = useAudioPlayer(require('./assets/ezan.mp3'));
  const playerStatus = useAudioPlayerStatus(player);

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

          // Hicri tarihi al
          if (json.data.date && json.data.date.hijri) {
            const h = json.data.date.hijri;
            setHijriDate({
              day: h.day,
              month: parseInt(h.month.number),
              monthName: HIJRI_MONTHS[parseInt(h.month.number)] || h.month.en,
              year: h.year,
            });

            // Özel gün kontrolü
            const hijriMonth = parseInt(h.month.number);
            const hijriDay = parseInt(h.day);
            const found = SPECIAL_ISLAMIC_DAYS.find(
              (d) => d.month === hijriMonth && d.day === hijriDay
            );
            setSpecialDay(found || null);
          }
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

  // Bildirim tıklama veya uygulama ön plana gelme durumunda ezanı senkronize çalma dinleyicileri
  useEffect(() => {
    // 1. Bildirime tıklandığında tetiklenen dinleyici
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Bildirime tıklandı, ezan kaldığı yerden senkronize ediliyor...');
      playAdhanFromCurrentOffset();
    });

    // 2. Uygulama arka plandan ön plana (aktif duruma) geçtiğinde tetiklenen dinleyici
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('Uygulama aktif oldu, ezan kontrolü yapılıyor...');
        playAdhanFromCurrentOffset();
      }
    };
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      responseSubscription.remove();
      appStateSubscription.remove();
    };
  }, [prayerTimes]);

  // Push Bildirim Kayıt ve Yetkilendirme Yardımcı Fonksiyonu
  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('ezan-channel', {
        name: 'Ezan Bildirimleri',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'ezan_short.wav',
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
          body: 'Namaz vakti geldi. Hayırlı olsun.',
          // Not: Özel ezan sesi native build'de çalışır.
          // Expo Go'da sistem sesi kullanılır; gerçek ezan için eas build gerekir.
          sound: 'ezan_short.wav',
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

  // En yakın vakitten geçen saniyeyi hesaplayıp ezanı o süreden başlatan akıllı fonksiyon
  const playAdhanFromCurrentOffset = () => {
    if (!prayerTimes) return;
    
    const now = new Date();
    let closestKey = null;
    let minDiffMs = Infinity;

    for (const key of PRAYER_KEYS) {
      const [hours, minutes] = prayerTimes[key].split(':').map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);

      const diffMs = now.getTime() - prayerDate.getTime();

      // Son 2.5 dakika (150.000 ms) içerisinde başlamış bir vakit mi?
      if (diffMs >= 0 && diffMs < 150000) {
        if (diffMs < minDiffMs) {
          minDiffMs = diffMs;
          closestKey = key;
        }
      }
    }

    if (closestKey && minDiffMs < 150000) {
      const offsetSeconds = Math.floor(minDiffMs / 1000);
      console.log(`⏰ Kalan Yerden Başlatılıyor: Vakit: ${closestKey}, Ofset: ${offsetSeconds} saniye`);
      
      // Timer'ın ön planda tekrar sıfırdan çalmasını engellemek için kilidi koy
      const currentHHMM = prayerTimes[closestKey];
      lastPlayedPrayer.current = `${closestKey}-${currentHHMM}`;
      
      playAdhan(offsetSeconds);
    }
  };

  async function playAdhan(seekOffset = 0) {
    try {
      // Her çalmadan önce audio session'u yeniden Playback kategorisine al
      // AdMob gibi SDK'lar audio session'u sıfırlayabilir, bu yüzden her seferinde set et
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        staysActiveInBackground: true,
        allowsRecording: false,
      });

      if (player) {
        if (player.playing) {
          player.pause();
        }
        player.seekTo(seekOffset);
        player.play();
        console.log(`Ezan başarıyla tetiklendi (seekOffset: ${seekOffset} sn)`);
      } else {
        console.warn('Ses oynatıcı hazır değil.');
      }
    } catch (error) {
      console.error('Ses hatası:', error?.message || error);
    }
  }

  // Ezanı manuel olarak susturma / durdurma fonksiyonu
  const stopAdhan = () => {
    try {
      if (player) {
        player.pause();
        console.log('Ezan durduruldu.');
      }
    } catch (error) {
      console.error('Ezan durdurma hatası:', error?.message || error);
    }
  };

  // Zikirmatik seçenekleri
  const ZIKIR_OPTIONS = [
    { name: 'Sübhanallah', target: 33 },
    { name: 'Elhamdülillah', target: 33 },
    { name: 'Allahü Ekber', target: 33 },
    { name: 'Lâ ilâhe illallah', target: 100 },
    { name: 'Estağfirullah', target: 100 },
    { name: 'Salavat', target: 100 },
    { name: 'Serbest', target: 0 },
  ];

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>Namaz Vakti</Text>
          <Text style={styles.headerTitle}>Mümin Kardeş</Text>
          <Text style={styles.dateText}>
            {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>

          {/* Hicri Tarih */}
          {hijriDate && (
            <Text style={styles.hijriDateText}>
              {hijriDate.day} {hijriDate.monthName} {hijriDate.year} Hicrî
            </Text>
          )}

          <TouchableOpacity style={styles.cityBadge} onPress={() => setShowCityModal(true)}>
            <Text style={styles.cityText}>📍 {cityDisplay}  ✎</Text>
          </TouchableOpacity>
        </View>

        {/* Özel Gün Kartı */}
        {specialDay && (
          <View style={styles.specialDayCard}>
            <Text style={styles.specialDayTitle}>{specialDay.title}</Text>
            <Text style={styles.specialDayText}>{specialDay.desc}</Text>
          </View>
        )}

        {/* Geri Sayım Kartı */}
        <View style={styles.countdownCard}>
          <Text style={styles.nextPrayerLabel}>SONRAKİ VAKİT · {PRAYER_NAMES_TR[nextPrayer.name]}</Text>
          <Text style={styles.countdownTime}>{remainingTimeStr}</Text>
          <Text style={styles.remainingText}>Kaldı</Text>
          {playerStatus?.playing ? (
            <TouchableOpacity style={[styles.playButton, styles.stopButton]} onPress={stopAdhan}>
              <Text style={styles.playButtonText}>⏹ Ezanı Durdur</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.playButton} onPress={() => playAdhan(0)}>
              <Text style={styles.playButtonText}>🔊 Ezanı Dinle</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.bgAudioHint}>
            Ezan arka planda da çalmaya devam eder
          </Text>
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

        {/* Araçlar Bölümü */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsSectionTitle}>🛠 Araçlar</Text>
          <View style={styles.toolsGrid}>
            {/* Kıble Pusulası */}
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => setIsQiblaVisible(true)}
            >
              <Text style={styles.toolCardEmoji}>🧭</Text>
              <Text style={styles.toolCardTitle}>Kıble{'\n'}Pusulası</Text>
            </TouchableOpacity>

            {/* Zikirmatik */}
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => setIsZikirmatikVisible(true)}
            >
              <Text style={styles.toolCardEmoji}>📿</Text>
              <Text style={styles.toolCardTitle}>Zikirmatik{'\n'}Tesbih</Text>
            </TouchableOpacity>

            {/* Kaza Namazı */}
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => setIsMissedPrayerVisible(true)}
            >
              <Text style={styles.toolCardEmoji}>✅</Text>
              <Text style={styles.toolCardTitle}>Kaza{'\n'}Takip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Günün Hadisi */}
        <DailyHadith />

        {/* Gizlilik Politikası Bağlantısı (App Store Review için) */}
        <TouchableOpacity 
          style={styles.privacyLinkContainer}
          onPress={() => Linking.openURL('https://serkankose1903.github.io/privacy.html')}
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
              keyboardShouldPersistTaps="handled"
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

      {/* Zikirmatik Modal (Geliştirilmiş) */}
      <Modal
        visible={isZikirmatikVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsZikirmatikVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { height: '75%', justifyContent: 'space-between' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📿 Zikirmatik</Text>
              <TouchableOpacity onPress={() => setIsZikirmatikVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Zikir Seçenekleri */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.zikirOptionsScroll}>
              <View style={styles.zikirOptionsRow}>
                {ZIKIR_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.name}
                    style={[
                      styles.zikirOptionBtn,
                      selectedZikir === option.name && styles.zikirOptionBtnActive,
                    ]}
                    onPress={() => {
                      setSelectedZikir(option.name);
                      setZikirTarget(option.target);
                      setZikirCount(0);
                    }}
                  >
                    <Text style={[
                      styles.zikirOptionText,
                      selectedZikir === option.name && styles.zikirOptionTextActive,
                    ]}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.zikirmatikCenter}>
              <Text style={styles.selectedZikirName}>{selectedZikir}</Text>
              <Text style={styles.zikirCountText}>{zikirCount}</Text>
              {zikirTarget > 0 && (
                <View style={styles.zikirProgressContainer}>
                  <View style={styles.zikirProgressBar}>
                    <View 
                      style={[
                        styles.zikirProgressFill, 
                        { width: `${Math.min(100, (zikirCount / zikirTarget) * 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.zikirProgressText}>
                    {zikirCount >= zikirTarget ? '✅ Tamamlandı!' : `${zikirTarget - zikirCount} kaldı`}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.zikirmatikButtons}>
              <TouchableOpacity 
                style={styles.zikirResetBtn}
                onPress={() => setZikirCount(0)}
              >
                <Text style={styles.zikirResetBtnText}>Sıfırla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.zikirTapBtn,
                  zikirTarget > 0 && zikirCount >= zikirTarget && styles.zikirTapBtnComplete,
                ]}
                activeOpacity={0.7}
                onPress={() => setZikirCount(prev => prev + 1)}
              >
                <Text style={styles.zikirTapBtnText}>SAY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Kıble Pusulası Modal */}
      <QiblaCompass 
        visible={isQiblaVisible} 
        onClose={() => setIsQiblaVisible(false)} 
        cityName={city}
      />

      {/* Kaza Namazı Takip Modal */}
      <MissedPrayerTracker 
        visible={isMissedPrayerVisible} 
        onClose={() => setIsMissedPrayerVisible(false)} 
      />

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
  hijriDateText: {
    fontSize: 13,
    color: '#F59E0B',
    marginTop: 3,
    fontFamily: 'Nunito_600SemiBold',
    opacity: 0.8,
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
    fontFamily: 'Nunito_700Bold',
  },
  specialDayText: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Nunito_400Regular',
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
  stopButton: {
    backgroundColor: '#EF4444', 
  },
  playButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  bgAudioHint: {
    color: '#475569',
    fontSize: 11,
    marginTop: 8,
    fontFamily: 'Nunito_400Regular',
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
  // Araçlar Bölümü
  toolsSection: {
    marginTop: 20,
  },
  toolsSectionTitle: {
    fontSize: 17,
    color: '#CBD5E1',
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  toolsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  toolCardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  toolCardTitle: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold',
    lineHeight: 16,
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
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
  },
  // Zikirmatik Stilleri (Geliştirilmiş)
  zikirOptionsScroll: {
    maxHeight: 48,
    marginTop: 14,
  },
  zikirOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  zikirOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  zikirOptionBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  zikirOptionText: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
  },
  zikirOptionTextActive: {
    color: '#F59E0B',
  },
  zikirmatikCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedZikirName: {
    color: '#94A3B8',
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  zikirCountText: {
    fontSize: 72,
    color: '#F59E0B',
    fontFamily: 'Nunito_700Bold',
  },
  zikirProgressContainer: {
    alignItems: 'center',
    marginTop: 14,
    width: '80%',
  },
  zikirProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  zikirProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  zikirProgressText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 6,
    fontFamily: 'Nunito_400Regular',
  },
  zikirmatikButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  zikirResetBtn: {
    backgroundColor: '#334155',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  zikirResetBtnText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
  zikirTapBtn: {
    backgroundColor: '#F59E0B',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  zikirTapBtnComplete: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  zikirTapBtnText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
  },
});
