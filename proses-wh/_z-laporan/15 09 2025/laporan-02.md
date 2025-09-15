# Laporan Perubahan Fitur Tombol "Kembali" pada Modal Layer 2

## Kronologi / Case
Pada tanggal 15 September 2025, dilakukan perbaikan pada interaksi tombol "Kembali" (`back-btn-layer-2`) di modal layer 2 aplikasi gudang. Permintaan perubahan bertujuan agar tombol ini hanya tampil pada waktu yang tepat dan tersembunyi saat tidak diperlukan, sehingga alur pengguna menjadi lebih logis dan intuitif.

## Tindakan
### 1. Default Class Hidden
- Tombol "Kembali" diberikan class `hidden` secara default pada HTML:
  ```html
  <button id="back-btn-layer-2" class="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm hidden">Kembali</button>
  ```
- Tujuannya agar tombol tidak langsung tampil sebelum layer/modal kedua aktif.

### 2. Tampilkan Tombol Setelah Layer 2 Tampil
- Setelah layer/modal kedua tampil, class `hidden` dihapus dari tombol menggunakan JavaScript:
  ```javascript
  const backBtn = document.getElementById('back-btn-layer-2');
  if (backBtn) backBtn.classList.remove('hidden');
  ```
- Hal ini memastikan tombol hanya muncul saat layer/modal kedua aktif.

### 3. Tampilkan Tombol Saat Item-Kain Diklik
- Ketika item-kain diklik dan stok tersedia, tombol "Kembali" otomatis tampil:
  ```javascript
  el.addEventListener('click', function() {
    // ...cek stok...
    if (backBtn) backBtn.classList.remove('hidden');
    // ...lanjut handler...
  });
  ```
- Ini membuat tombol "Kembali" relevan dengan aksi pengguna.

### 4. Sembunyikan Tombol Setelah Diklik
- Setelah tombol "Kembali" diklik, class `hidden` ditambahkan kembali agar tombol tersembunyi:
  ```javascript
  backBtn.addEventListener('click', function() {
    backBtn.classList.add('hidden');
  });
  ```
- Tombol tidak mengganggu tampilan setelah pengguna kembali ke layer sebelumnya.

## Hasil
- Tombol "Kembali" hanya tampil saat layer/modal kedua aktif atau item-kain diklik dan stok tersedia.
- Tombol otomatis tersembunyi setelah diklik, menjaga alur UI tetap bersih dan logis.
- Perubahan ini meningkatkan user experience dan mencegah kebingungan pengguna.

---
Laporan ini dibuat sebagai dokumentasi profesional atas perubahan fitur tombol "Kembali" pada modal layer 2 aplikasi gudang, untuk kebutuhan audit dan pengembangan selanjutnya.
