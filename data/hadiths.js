// Günün Hadisi — 60 adet seçilmiş hadis-i şerif (Türkçe)
// Her gün, yılın gününe göre bir hadis gösterilir.

const HADITHS = [
  {
    text: "Ameller niyetlere göredir. Herkesin niyet ettiği ne ise eline geçecek olan odur.",
    source: "Buhârî, Bedʾü'l-Vahy 1; Müslim, İmâre 155"
  },
  {
    text: "Müslüman, elinden ve dilinden Müslümanların güvende olduğu kimsedir.",
    source: "Buhârî, Îmân 4; Müslim, Îmân 64"
  },
  {
    text: "Kolaylaştırınız, zorlaştırmayınız. Müjdeleyiniz, nefret ettirmeyiniz.",
    source: "Buhârî, İlim 11; Müslim, Cihâd 6"
  },
  {
    text: "Sizden biriniz kendisi için istediğini din kardeşi için de istemedikçe gerçek anlamda iman etmiş olmaz.",
    source: "Buhârî, Îmân 7; Müslim, Îmân 71"
  },
  {
    text: "Allah'a ve ahiret gününe iman eden kimse, komşusuna eziyet etmesin.",
    source: "Buhârî, Edeb 31; Müslim, Îmân 74"
  },
  {
    text: "İnsanlara merhamet etmeyene Allah da merhamet etmez.",
    source: "Buhârî, Edeb 18; Müslim, Fedâil 66"
  },
  {
    text: "Güzel söz sadakadır.",
    source: "Buhârî, Cihâd 128; Müslim, Zekât 56"
  },
  {
    text: "Temizlik imanın yarısıdır.",
    source: "Müslim, Tahâret 1"
  },
  {
    text: "Kuvvetli kimse güreşte başkasını yenen değildir. Asıl kuvvetli kişi, öfkelendiği zaman nefsine hâkim olabilen kimsedir.",
    source: "Buhârî, Edeb 76; Müslim, Birr 107"
  },
  {
    text: "Kim Allah'a ve ahiret gününe inanıyorsa ya hayır söylesin ya da sussun.",
    source: "Buhârî, Edeb 31; Müslim, Îmân 74"
  },
  {
    text: "Dünya ahiretin tarlasıdır.",
    source: "Deylemî, Müsnedü'l-Firdevs"
  },
  {
    text: "İlim Çin'de de olsa gidip alınız.",
    source: "Beyhakî, Şuabü'l-Îmân"
  },
  {
    text: "Cennet annelerin ayakları altındadır.",
    source: "Nesâî, Cihâd 6"
  },
  {
    text: "İnsanların en hayırlısı, insanlara en faydalı olandır.",
    source: "Taberânî, el-Mu'cemü'l-Evsat"
  },
  {
    text: "Bir kimse Allah için tevazu gösterirse, Allah onu yüceltir.",
    source: "Müslim, Birr 69"
  },
  {
    text: "Mümin, bir delikten iki kere ısırılmaz.",
    source: "Buhârî, Edeb 83; Müslim, Zühd 63"
  },
  {
    text: "Her bidat dalâlettir. Her dalâlet de ateştedir.",
    source: "Müslim, Cumʿa 43"
  },
  {
    text: "Sabır, ışıktır.",
    source: "Müslim, Tahâret 1"
  },
  {
    text: "Oruç kalkandır.",
    source: "Buhârî, Savm 2; Müslim, Sıyâm 162"
  },
  {
    text: "En hayırlınız Kur'ân'ı öğrenen ve öğretendir.",
    source: "Buhârî, Fedâilü'l-Kur'ân 21"
  },
  {
    text: "Kardeşinin yüzüne gülümsemen sadakadır.",
    source: "Tirmizî, Birr 36"
  },
  {
    text: "Hiçbiriniz bir başkasının satışı üzerine satış yapmasın.",
    source: "Buhârî, Büyû' 58; Müslim, Büyû' 7"
  },
  {
    text: "Allah Teâlâ yumuşak davranmayı sever ve yumuşaklığa, sertliğe ve başka hiçbir şeye vermediğini verir.",
    source: "Müslim, Birr 77"
  },
  {
    text: "Kim bir ağaç dikerse, o ağaçtan yenilen her meyve onun için sadaka olur.",
    source: "Müslim, Müsâkât 7"
  },
  {
    text: "Kıyamet gününde insanların bana en yakın olanı, bana en çok salâvat getirendir.",
    source: "Tirmizî, Vitir 21"
  },
  {
    text: "Yoldan eziyet veren şeyleri kaldırmak imandan bir şubedir.",
    source: "Müslim, Îmân 58"
  },
  {
    text: "Zulüm kıyamet gününde karanlıklardır.",
    source: "Buhârî, Mezâlim 8; Müslim, Birr 56"
  },
  {
    text: "Bir saat düşünmek, bir sene ibadetten hayırlıdır.",
    source: "Deylemî, Müsnedü'l-Firdevs"
  },
  {
    text: "İki nimet vardır ki insanların çoğu bunlarda aldanmıştır: Sağlık ve boş vakit.",
    source: "Buhârî, Rikâk 1"
  },
  {
    text: "Utanmak imandandır.",
    source: "Buhârî, Îmân 16; Müslim, Îmân 57"
  },
  {
    text: "Acele şeytandandır, teenni (sabırlı davranmak) Allah'tandır.",
    source: "Tirmizî, Birr 66"
  },
  {
    text: "Duâ ibadetin özüdür.",
    source: "Tirmizî, Daavât 1"
  },
  {
    text: "Cimrilikten sakınınız. Çünkü cimrilik, sizden öncekileri helâk etmiştir.",
    source: "Müslim, Birr 56"
  },
  {
    text: "Haset etmeyiniz. Birbirinize buğz etmeyiniz. Birbirinize sırt çevirmeyiniz. Ey Allah'ın kulları, kardeş olunuz!",
    source: "Müslim, Birr 28"
  },
  {
    text: "Misvak kullanınız. Çünkü misvak, ağzı temizler, Rabbı razı eder.",
    source: "Nesâî, Tahâret 5"
  },
  {
    text: "Rabbimin bana öğrettiği edepten güzel edep olur mu?",
    source: "Süyûtî, el-Câmiü's-Sağîr"
  },
  {
    text: "Hikmetin başı Allah korkusudur.",
    source: "Beyhakî, Şuabü'l-Îmân"
  },
  {
    text: "Allah sizin suretlerinize ve mallarınıza bakmaz. Fakat sizin kalplerinize ve amellerinize bakar.",
    source: "Müslim, Birr 33"
  },
  {
    text: "Her kim bir kötülük görürse onu eliyle değiştirsin. Buna gücü yetmezse diliyle, buna da gücü yetmezse kalbiyle buğz etsin.",
    source: "Müslim, Îmân 78"
  },
  {
    text: "Danışılan kimse güvenilir kimsedir.",
    source: "Tirmizî, Edeb 57"
  },
  {
    text: "Kanaat tükenmez bir hazinedir.",
    source: "Taberânî, el-Mu'cemü'l-Kebîr"
  },
  {
    text: "İki günü birbirine eşit olan aldanmıştır.",
    source: "Deylemî, Müsnedü'l-Firdevs"
  },
  {
    text: "Tefekkür gibi ibadet, teenni gibi ölçülülük, güzel ahlâk gibi asâlet yoktur.",
    source: "Taberânî, el-Mu'cemü'l-Kebîr"
  },
  {
    text: "Mümin mümine ayna gibidir.",
    source: "Ebû Dâvûd, Edeb 49"
  },
  {
    text: "İnsan sevdiğiyle beraberdir.",
    source: "Buhârî, Edeb 96; Müslim, Birr 165"
  },
  {
    text: "Komşusu aç iken tok yatan bizden değildir.",
    source: "Taberânî, el-Mu'cemü'l-Kebîr"
  },
  {
    text: "Şüphesiz Allah, işini sağlam ve güzel yapanı sever.",
    source: "Taberânî, el-Mu'cemü'l-Evsat"
  },
  {
    text: "Hayâ ve iman bir arada bulunur. Biri gittiğinde diğeri de gider.",
    source: "Hâkim, Müstedrek"
  },
  {
    text: "İnsanların en kötüsü, insanların yüzüne karşı iki yüzlü davranan kimsedir.",
    source: "Buhârî, Edeb 52; Müslim, Birr 98"
  },
  {
    text: "Kim haksız yere bir karış toprağı alırsa, kıyamet gününde o toprak yedi kat yerden boynuna dolanır.",
    source: "Buhârî, Mezâlim 13; Müslim, Müsâkât 139"
  },
  {
    text: "Kulun en kötü hâli, cimri ve korkak olmasıdır.",
    source: "Ebû Dâvûd, Cihâd 22"
  },
  {
    text: "Din nasihatten ibarettir.",
    source: "Müslim, Îmân 95"
  },
  {
    text: "Her sarhoşluk veren şey haramdır.",
    source: "Buhârî, Eşribe 4; Müslim, Eşribe 73"
  },
  {
    text: "Güçlü mümin, zayıf müminden daha hayırlı ve Allah'a daha sevimlidir.",
    source: "Müslim, Kader 34"
  },
  {
    text: "Namaz müminin miracıdır.",
    source: "Süyûtî, el-Câmiü's-Sağîr"
  },
  {
    text: "Allah'ım! Âcizlikten, tembellikten, korkaklıktan, cimrilikten ve yaşlılığın verdiği halsizlikten sana sığınırım.",
    source: "Buhârî, Daavât 38; Müslim, Zikir 76"
  },
  {
    text: "Küçüklerimize merhamet etmeyen, büyüklerimize saygı göstermeyen bizden değildir.",
    source: "Tirmizî, Birr 15"
  },
  {
    text: "Mü'minin kalbi iki parmak arasındadır. Allah onu dilediği gibi çevirir.",
    source: "Müslim, Kader 17"
  },
  {
    text: "Müslüman, Müslümanın kardeşidir. Ona zulmetmez, onu (düşmanına) teslim etmez.",
    source: "Buhârî, Mezâlim 3; Müslim, Birr 58"
  },
  {
    text: "Dünyada sanki bir garip ya da bir yolcu gibi ol.",
    source: "Buhârî, Rikâk 3"
  },
];

export default HADITHS;
