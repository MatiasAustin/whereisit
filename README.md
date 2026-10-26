# WhereIsIt — 3D Printed Premium Stuff & Bespoke Design Studio

Website premium & platform e-commerce studio untuk brand **WhereIsIt**, produsen objek 3D printed berdesain tinggi, fungsional, dan berkarakter editorial mewah.

## Fitur & Struktur Halaman

1. **Navigasi Studio**
   - Brand typography modern editorial `whereisit`.
   - Navigasi cepat ke Catalog, Custom Design, Custom Character, Studio Philosophy, Delivery & Payment.
   - Live Shopping Bag Drawer dengan counter item real-time.
   - Akses discreet Admin Dashboard.

2. **Hero Section (Mengacu pada Gambar 1)**
   - Tipografi editorial raksasa `whereisit` dengan subtitle `3D design & objects studio`.
   - Narasi brand yang menegaskan nilai materialitas, kehangatan, dan durabilitas.
   - Objek hero 3D sculptural ikonik di tengah dengan bayangan realistis.
   - Dua kartu pintasan visual di sisi kanan: `Ready to buy →` dan `Custom order →`.

3. **01 / About us & Filosofi Desain (Mengacu pada Gambar 1 & Gambar 2)**
   - Menampilkan visual suasana showroom flagship WhereIsIt (warna dusty slate blue, arch display, pencahayaan hangat, dan rak karakter).
   - Narasi pendekatan studio: desain berbasis kebutuhan dan konteks penggunaan manusia, bukan sekadar mencetak file kiriman.
   - Detail spesifikasi mikrolayer 0.12mm dan proses finishing satin halus.

4. **Koleksi Produk / Fresh Collection (Area Kontras Gelap - Gambar 1)**
   - Latar belakang kontras *midnight slate noir* (`#11161B`).
   - Filter kategori: Small Furniture, Desk Objects, Home & Decor, Character & Collectibles.
   - Kartu produk presisi tinggi dengan badge (`popular`, `profitably`, `premium`, `signature`, `limited`).
   - Multi-angle thumbnail preview dots dan pill tags (`4.8 ★`, `ergonomic`, `minimal`).
   - Switcher mata uang (USD & IDR).
   - Tombol `Buy now` & modal detail produk lengkap.

5. **Custom Your Design (Jalur Konsultasi)**
   - Alur 4 tahap: *Needs & Context Brief* → *Parametric 3D Design* → *Material & Tactile Curation* → *Hand-Finished Craft*.
   - Formulir konsultasi interaktif yang tersimpan ke backend.

6. **Custom Character (Photo-to-3D Keepsake)**
   - Transformasi foto potret menjadi karakter 3D mini yang menggemaskan (seperti layar pada Gambar 2).
   - Pilihan gaya: Chibi Petite, Minimalist Monolith, Comic Stylized, Mascot Persona.
   - Formulir konsultasi personal dengan opsi plat nama kuningan berukir (brass plaque).

7. **Studio Craftsmanship & Packaging**
   - Penjelasan teknis: kepadatan layer 0.08mm, infill gyroid parametrik penahan beban, wet-sanding satin, dan bio-polimer ramah lingkungan.
   - Garansi pengiriman 100% dengan bantalan busa peredam guncangan custom.

8. **Keranjang Belanja & Fondasi Checkout**
   - Drawer geser dengan kontrol kuantitas, hapus item, dan subtotal.
   - Modal checkout dengan formulir alamat, pilihan kurir (JNE, SiCepat Cargo, Paxel), dan metode pembayaran (QRIS, VA, Kartu).
   - Menyimpan pesanan secara persisten ke database backend.

9. **Shopify-like Admin Dashboard (`/admin`)**
   - Ringkasan statistik katalog (jumlah produk, nilai aset katalog, total pesanan, total konsultasi).
   - Manajemen katalog: Tambah, edit, hapus produk dengan foto multi-angle, stok, varian warna, spesifikasi material dan dimensi.
   - Manajemen proposal Custom Design dan Custom Character dengan pengubah status (NEW, 3D_MODELING, QUOTED, IN_PRODUCTION, COMPLETED).
   - Manajemen pesanan checkout.
   - Penyimpanan data persisten melalui file storage backend (`/data/*.json`).

## Menjalankan Aplikasi

```bash
# Menjalankan server development
npm run dev

# Membangun untuk produksi
npm run build
npm start
```
Akses website di `http://localhost:3000` dan Admin Dashboard di `http://localhost:3000/admin`.
