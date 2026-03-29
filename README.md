# 🚀 TUA ASTRO HACKATHON 2026 - Cloud Tech

  

## 🌌 Proje Hakkında: Ay'a İlk Temas

  

**Dijital Eğitim ve Hikayecilik Aracı**

  

Karabük Üniversitesi Bulut Bilişim öğrencileri olarak geliştirdiğimiz bu proje, uzay meraklısı çocuklar için sınırları ortadan kaldıran, oyunlaştırılmış bir 3D uzay simülasyonudur. Geleceğin uzay kâşiflerini yetiştirmek amacıyla tasarlanan bu deneyim, kullanıcıları Güneş Sistemi'nin derinliklerinden Ay yüzeyindeki ilk adımlara kadar uzanan eğitici bir yolculuğa çıkarır.

  

## 🎮 Öne Çıkan Gelişmiş Özellikler

  

-  **Gerçekçi 3D Güneş Sistemi Simülasyonu:** Three.js ile tasarlanmış, detaylı yıldız tarlası (starfield), parlayan Güneş (core glow & corona) ve yörünge mekanikleri.

-  **Akıcı ve Modern Kullanıcı Arayüzü (UI):** Özel tasarlanmış ön yükleyici (preloader), kilitli gezegen uyarıları ve dinamik görev bildirim sistemi.

-  **Uzay Aracı Seçimi:** Ay yolculuğu için farklı hız, güvenlik ve konfor istatistiklerine sahip araçlar (Kartal-1, Yıldız-X, Hilal-7).

-  **Oyunlaştırılmış Öğrenme Deneyimi:** - Dünya'dan Ay'a yolculuk sırasında sunulan eğitici uzay bilgi kartları.

- Öğrenilenleri pekiştiren interaktif Doğru/Yanlış Quiz sistemi.

-  **Ay Yüzeyi Keşfi (FPS Modu):** Görev başarıldıktan sonra Ay yüzeyinde "Pointer Lock API" ile 60 saniyelik serbest yürüyüş ve keşif imkanı.

-  **Gurur Verici Kapanış:** Başarılı Ay görevi sonrası astronot animasyonu ve Türk Bayrağı dikme seremonisi.

  

## 🛠 Teknolojiler ve Mimari

  

Proje, herhangi bir dış bağımlılık (paket yöneticisi) gerektirmeden, doğrudan tarayıcı üzerinde yüksek performanslı çalışacak şekilde optimize edilmiştir.

  

-  **Frontend:** HTML5, CSS3 (Modern Flexbox/Grid yapısı)

-  **Mantık & Kontrol:** JavaScript (ES6+), Modüler OOP Mimarisi

-  **3D Render Motoru:** Three.js (CDN üzerinden), WebGL

-  **Kamera Kontrolü:** Pointer Lock API (FPS Modu)

🚀 Kurulum & Çalıştırma

Proje güvenlik önlemleri (CORS politikaları) nedeniyle yerel bir sunucu (local server) üzerinden çalıştırılmalıdır.

  

1. Depoyu klonlayın:

  

Bash

git clone [https://github.com/ozknnberat/tua-astro-hackathon.git](https://github.com/ozknnberat/tua-astro-hackathon.git)

2. Proje dizinine gidin:

  

Bash

cd tua-astro-hackathon

3. Yerel bir sunucu başlatın:

  

Bash

npx serve .



Bash

4. Gerekli klasörleri (dizinleri) oluşturun
mkdir css
mkdir js


5. CSS dosyasını css klasörüne taşıyın
mv style.css css/



6. Tüm JavaScript dosyalarını js klasörüne taşıyın
mv *.js js/

  
7. Tarayıcınızda görüntüleyin: http://192.168.56.1:3000/ adresine giderek simülasyonu başlatın.

  

👨‍🚀 Kullanım Rehberi

Ana sayfadaki etkinlikler bölümünden Güneş Sistemi Simülasyonu'nu seçin.

  

3D sahnede fare ile kamerayı yönlendirin ve Dünya'ya tıklayın.

  

Gelen görev bildirimini kabul ederek uzay aracınızı seçin.

  

Yolculuk sırasında ekrana gelen uzay bilgilerini okuyun ve ardından gelen mini-testi başarıyla tamamlayın.

  

Görev sonunda bayrak dikme animasyonunu izleyin ve "Gezintiye Çık" butonuna tıklayarak Ay yüzeyini FPS modunda (W, A, S, D tuşları ile) keşfedin.

  

👥 Takım: Cloud Tech

Bu proje Karabük Üniversitesi - Bulut Bilişim Bölümü öğrencileri tarafından, TUA Astro Hackathon 2026 için gururla geliştirilmiştir.

  

📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır.

## 📁 Proje Klasör Yapısı

  

```text

tua-astro-hackathon/

├── index.html # Ana sayfa ve oyun UI katmanı

├── css/

│ └── style.css # Modern ve duyarlı tasarımlar

├── js/

│ ├── main.js # Temel website mantığı ve DOM yönetimi

│ ├── solarSystem.js # 3D Güneş Sistemi ve Three.js render mantığı

│ ├── mission.js # Görev akışı, quiz sistemi ve uzay aracı seçimi

│ └── moonExplorer.js # Ay yüzeyi FPS keşif mekanikleri

└── README.md
