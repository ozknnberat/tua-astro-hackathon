# 🚀 TUA ASTRO HACKATHON - Cloud Tech

## Proje Hakkında

Ay'a İlk Temas - Dijital Eğitim ve Hikayecilik Aracı

Karabük Üniversitesi Bulut Bilişim öğrencileri olarak geliştirdiğimiz bu proje, uzay meraklısı çocuklar için sınırları ortadan kaldıran, oyunlaştırılmış bir simülasyon deneyimi sunmaktadır.

## 🎮 Özellikler

- 3D Güneş Sistemi Simülasyonu - Three.js ile gerçek zamanlı 3D güneş sistemi
- FPS Kamera Kontrolü - Fare ve scroll ile serbest kamera gezintisi
- Gezegen Etkileşimleri - Gezegenlere tıklama ve bilgi alma
- Dünya → Ay Yolculuğu - 3 farklı uzay aracı seçeneği ile Ay'a yolculuk
- Bilgi Kartları - Yolculuk süresince 10 uzay bilgisi
- Doğru/Yanlış Quiz - Öğrenilen bilgilerin test edilmesi
- Ay Yüzeyi Keşfi - FPS modunda 60 saniyelik Ay gezintisi
- Türk Bayrağı Dikme - Görev tamamlandığında bayrak animasyonu

## 🛠 Teknolojiler

- HTML5 / CSS3 - Modern web standartları
- JavaScript (ES6+) - OOP yapısı ile modüler kod
- Three.js - 3D grafik render engine
- WebGL - Hardware-accelerated 3D graphics
- Pointer Lock API - FPS kamera kontrolü

## 📁 Proje Yapısı

tua-astro-hackathon/
├── index.html # Ana sayfa
├── css/
│ └── style.css # Tüm stiller
├── js/
│ ├── main.js # Website mantığı & oyun yönetimi
│ ├── solarSystem.js # 3D Güneş Sistemi
│ ├── mission.js # Görev yöneticisi & quiz
│ └── moonExplorer.js # Ay yüzeyi FPS keşfi
└── README.md

## 🚀 Kurulum & Çalıştırma

1. Repoyu klonlayın:
```bash
git clone https://github.com/ozknnberat7/tua-astro-hackathon.git

2. Proje dizinine gidin:
cd tua-astro-hackathon

3. Bir local server başlatın (CORS gereksinimleri nedeniyle):
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# VS Code Live Server eklentisi ile de açabilirsiniz

4. Tarayıcınızda açın: http://localhost:8000

Kullanım: 
Ana Sayfa: TUA Astro Hackathon hakkında bilgi
Oyunlar butonuna tıklayın
Güneş Sisteminde gezinin (sağ tık + sürükle ile kamerayı döndürün)
Dünya'ya tıklayın (diğer gezegenler kilitli)
Görev bildirimini kabul edin
Uzay aracınızı seçin ve yolculuğa başlayın
Bilgi kartlarını okuyun
Quiz'i tamamlayın (yanlış cevaplarda tekrar deneyin)
Bayrak dikme animasyonunu izleyin
Gezintiye Çık ile Ay yüzeyini keşfedin (60 sn)

👨‍💻 Takım: Cloud Tech
Karabük Üniversitesi - Bulut Bilişim Bölümü tarafından,
TUA Astro Hackathon 2025 için geliştirilmiştir.

📄 Lisans: MIT License

Not: Bu projeyi çalıştırmak için dosyaları yukarıdaki yapıya göre oluşturun ve bir local web server üzerinden açın. Three.js CDN'den yüklenir, ekstra bağımlılık gerekmez.