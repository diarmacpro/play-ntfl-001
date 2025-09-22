
# [A] Improve pada UI Pop-up Tambah Item

### Kronologi / Tujuan
- Mengganti header title supaya lebih sesuai, dari "Tambah Stock Baru" menjadi "Tambah Items Baru".
- Menyusun ulang sub list keterangan barang agar lebih rinci tanpa membuat layout overspace.

### Tindakan
- Format awal: `IK: ___ | E: ___ | G: ___ | S: ___` (id_items, jumlah total ecer tersedia, jumlah total grosir tersedia, satuan).
- Format baru: `IK: ___ | E: ___ | G: ___ | S: ___` (id_items, kumulatif total ecer tersedia, kumulatif total grosir tersedia, jumlah total keseluruhan yang tersedia, satuan).
- Pada bagian E dan G, sebelumnya menggunakan sum, diubah menjadi count untuk kumulatif per id barang, serta ditambah field jumlah total (sum dari ecer dan grosir).

### Hasil / Kesimpulan
- Kondisi awal dan lanjutan terpenuhi, rincian lebih detail, layout tetap efisien.

---


# [B] Laporan Perubahan Fitur Modal "Tambah Items Baru"

### Kronologi / Case
Pada tanggal 15 September 2025, ditemukan kebutuhan untuk meningkatkan validasi pada modal "Tambah Items Baru" di aplikasi gudang. Permintaan: jika jumlah stok (E + G) pada suatu item adalah 0 atau null, maka item tersebut tidak dapat dipilih dan harus ditandai secara visual serta diberikan peringatan kepada pengguna.

### Tindakan
- File yang dimodifikasi: `proses-wh/script.js`
- Pada bagian render daftar item, badge "Sisa" diubah agar:
  - Jika stok (E + G) = 0 atau null, badge berubah warna menjadi merah dan muncul label "Kosong".
  - Jika badge merah, klik pada item akan menampilkan pop up alert bertuliskan "Stock Kosong" dan tidak memanggil handler pemilihan item.
  - Jika stok tersedia, klik tetap berfungsi seperti biasa.
- Penambahan logika pada pembuatan elemen HTML untuk badge stok agar dinamis sesuai kondisi stok.
- Penambahan event listener pada setiap item untuk memunculkan pop up alert jika stok kosong.
- Pop up alert bersifat nested dan dapat ditutup oleh pengguna.

#### Potongan Kode
```html
<span class="px-2 py-0.5 rounded-full shadow-sm border font-semibold ${((Number(item.e) + Number(item.g)) === 0 || isNaN(Number(item.e) + Number(item.g))) ? 'bg-red-100 text-red-600 border-red-300' : 'bg-gray-100 text-gray-600 border-gray-300'}">
  Sisa: ${(Number(item.e) + Number(item.g)).toFixed(2)} ${item.s}
  ${((Number(item.e) + Number(item.g)) === 0 || isNaN(Number(item.e) + Number(item.g))) ? '<span class="ml-2 text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded">Kosong</span>' : ''}
</span>
```
```javascript
el.addEventListener('click', function() {
  const sisa = Number(top100[idx].e) + Number(top100[idx].g);
  if (sisa === 0 || isNaN(sisa)) {
    // Show nested alert popup
    // ...kode alert...
    return;
  }
  // Panggil openLayer2Handler jika stok tersedia
});
```

### Hasil / Kesimpulan
- Validasi stok kosong berjalan sesuai permintaan: item dengan stok 0/null tidak dapat dipilih dan muncul pop up peringatan.
- Badge "Sisa" berubah warna menjadi merah dan diberi label "Kosong" untuk menandai item yang tidak memiliki stok.
- User experience menjadi lebih baik dan meminimalisir kesalahan input pada proses penambahan item baru.

---


# [C] Laporan Perubahan Fitur UI Modal & Input

## 1. Menghapus Icon Kaca Pembesar pada Tombol Kembali
### Kronologi / Tujuan
Permintaan untuk menghilangkan icon kaca pembesar pada area tombol kembali agar fungsi klik tidak terganggu dan UI lebih bersih.
### Tindakan (Potongan Kode & Penjelasan)
**Path:** proses-wh/script.js (fungsi generateTambahStockContent)
Potongan kode yang dihapus:
```html
<i class="bi bi-search absolute right-3 top-3 text-gray-400"></i>
```
Penjelasan: Icon ini dihapus dari area tombol kembali agar tidak menutupi area klik dan membuat interaksi tombol lebih maksimal.
### Hasil / Kesimpulan
Tombol kembali kini dapat diklik dengan lebih mudah tanpa gangguan icon, meningkatkan usability.

## 2. Mengubah Posisi Tombol Close pada Pop-up Tambah Items Baru
### Kronologi / Tujuan
Tombol close pada pop-up tambah items baru sebelumnya terlalu menepi, sehingga perlu diposisikan lebih sesuai agar mudah diakses.
### Tindakan (Potongan Kode & Penjelasan)
**Path:** proses-wh/script.js (fungsi generateTambahStockContent dan/atau pop-up terkait)
Perubahan kode:
```html
<!-- Sebelumnya -->
<button id="close-layer-2" class="absolute top-2 right-2 text-gray-600 hover:text-black text-xl" >
<!-- Menjadi -->
<button id="close-layer-2" class="absolute top-6 right-6 text-gray-600 hover:text-black text-xl" >
```
Penjelasan: Tombol close dipindahkan ke posisi top-6 right-6 agar tidak terlalu menepi dan lebih mudah dijangkau.
### Hasil / Kesimpulan
Tombol close pada pop-up kini lebih mudah diakses dan tampilan lebih proporsional.

## 3 & 4. Menghapus Action Buttons pada Pop-up Tambah Items Baru
### Kronologi / Tujuan
Bagian action buttons pada pop-up tambah items baru tidak memiliki fungsi dan menyebabkan layout menjadi overspace.
### Tindakan (Potongan Kode & Penjelasan)
**Path:** proses-wh/script.js (fungsi generateTambahStockContent)
Potongan kode yang dihapus:
```html
<!-- Action Buttons -->
<div class="flex justify-between pt-4 border-t">
  <button class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
    <i class="bi bi-plus-circle mr-2"></i>Stock Baru
  </button>
  <div class="space-x-2">
    <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" id="confirmTambah">
      <i class="bi bi-check-lg mr-2"></i>Tambah Terpilih
    </button>
  </div>
</div>
```
Penjelasan: Seluruh bagian action buttons dihapus agar pop-up lebih ringkas dan tidak ada elemen yang membingungkan pengguna.
### Hasil / Kesimpulan
Pop-up tambah items baru kini lebih bersih dan tidak overspace, hanya menampilkan elemen yang relevan.

## 5. Mengubah Tipe Input Pencarian
### Kronologi / Tujuan
Input pencarian diubah dari tipe text ke search agar muncul simbol clear dan memudahkan pengguna menghapus input.
### Tindakan (Potongan Kode & Penjelasan)
**Path:** proses-wh/script.js (fungsi generateTambahStockContent)
Perubahan kode:
```html
<!-- Sebelumnya -->
<input 
  type="text" 
  id="searchStock" 
  placeholder="Cari berdasarkan nama kain atau kode..."
  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
<!-- Menjadi -->
<input 
  type="search" 
  id="searchStock" 
  placeholder="Cari berdasarkan nama kain atau kode..."
  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
```
Penjelasan: Dengan tipe search, browser akan menampilkan tombol clear pada input sehingga pencarian lebih praktis.
### Hasil / Kesimpulan
Input pencarian kini lebih user-friendly dan efisien untuk digunakan.

---
2. Mengubah Posisi Tombol Close pada Pop-up Tambah Items Baru
Path Referensi: proses-wh/script.js (fungsi generateTambahStockContent dan/atau pop-up terkait)
Tindakan:
Mengubah posisi tombol close dari top-2 right-2 menjadi top-6 right-6 pada elemen:
<button id="close-layer-2" class="absolute top-6 right-6 text-gray-600 hover:text-black text-xl" >


Tujuan: Agar tombol close tidak terlalu menepi dan lebih mudah diakses pengguna.
3. Menghapus Action Buttons pada Pop-up Tambah Items Baru
Path Referensi: proses-wh/script.js (fungsi generateTambahStockContent)
Tindakan:
Menghapus bagian berikut dari template pop-up:
<!-- Action Buttons -->
<div class="flex justify-between pt-4 border-t">
  <button class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
    <i class="bi bi-plus-circle mr-2"></i>Stock Baru
  </button>
  <div class="space-x-2">
    <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" id="confirmTambah">
      <i class="bi bi-check-lg mr-2"></i>Tambah Terpilih
    </button>
  </div>
</div>


Tujuan: Menghilangkan elemen yang tidak memiliki fungsi dan mengurangi overspace pada layout pop-up tambah items baru.
4. Mengubah Tipe Input Pencarian
Path Referensi: proses-wh/script.js (fungsi generateTambahStockContent)
Tindakan:
Mengubah tipe input pencarian dari type="text" menjadi type="search":
<input 
  type="search" 
  id="searchStock" 
  placeholder="Cari berdasarkan nama kain atau kode..."
  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>


Tujuan: Agar muncul simbol clear pada input pencarian, meningkatkan kenyamanan pengguna.

Laporan ini dibuat sebagai dokumentasi profesional atas perubahan fitur pada path proses-wh, khususnya pada fungsi dan tampilan modal tambah items baru, untuk kebutuhan audit dan pengembangan selanjutnya.




— [D]

# [D] Laporan Perubahan Fitur Tombol "Kembali" pada Modal Layer 2

### Kronologi / Case
Pada tanggal 15 September 2025, dilakukan perbaikan pada interaksi tombol "Kembali" (`back-btn-layer-2`) di modal layer 2 aplikasi gudang. Permintaan perubahan bertujuan agar tombol ini hanya tampil pada waktu yang tepat dan tersembunyi saat tidak diperlukan, sehingga alur pengguna menjadi lebih logis dan intuitif.

### Tindakan
1. Default Class Hidden
   - Tombol "Kembali" diberikan class `hidden` secara default pada HTML:
     ```html
     <button id="back-btn-layer-2" class="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm hidden">Kembali</button>
     ```
   - Tujuannya agar tombol tidak langsung tampil sebelum layer/modal kedua aktif.
2. Tampilkan Tombol Setelah Layer 2 Tampil
   - Setelah layer/modal kedua tampil, class `hidden` dihapus dari tombol menggunakan JavaScript:
     ```javascript
     const backBtn = document.getElementById('back-btn-layer-2');
     if (backBtn) backBtn.classList.remove('hidden');
     ```
   - Hal ini memastikan tombol hanya muncul saat layer/modal kedua aktif.
3. Tampilkan Tombol Saat Item-Kain Diklik
   - Ketika item-kain diklik dan stok tersedia, tombol "Kembali" otomatis tampil:
     ```javascript
     el.addEventListener('click', function() {
       // ...cek stok...
       if (backBtn) backBtn.classList.remove('hidden');
       // ...lanjut handler...
     });
     ```
   - Ini membuat tombol "Kembali" relevan dengan aksi pengguna.
4. Sembunyikan Tombol Setelah Diklik
   - Setelah tombol "Kembali" diklik, class `hidden` ditambahkan kembali agar tombol tersembunyi:
     ```javascript
     backBtn.addEventListener('click', function() {
       backBtn.classList.add('hidden');
     });
     ```
   - Tombol tidak mengganggu tampilan setelah pengguna kembali ke layer sebelumnya.

### Hasil / Kesimpulan
- Tombol "Kembali" hanya tampil saat layer/modal kedua aktif atau item-kain diklik dan stok tersedia.
- Tombol otomatis tersembunyi setelah diklik, menjaga alur UI tetap bersih dan logis.
- Perubahan ini meningkatkan user experience dan mencegah kebingungan pengguna.

---



# [E] Laporan Perubahan Fitur Handler Item Layer 2

### Kronologi / Tujuan
Pada tanggal 15 September 2025, dilakukan perubahan pada fungsi handler penambahan item agar dapat menampilkan data detail item dari layer 2 berdasarkan idStock. Tujuan perubahan ini adalah untuk memudahkan proses debugging dan validasi data item yang dipilih pada layer 2.

### Tindakan (Potongan Kode & Penjelasan)
**Path:** proses-wh/script.js (fungsi addItemHandler)

#### Kode Sebelum (Before)
```javascript
function addItemHandler() {
  const idStock = $(this).data('id');
  const idKain = $(this).data('id-kain');
  console.log(idStock, idKain);
}
```

#### Kode Setelah (After)
```javascript
function addItemHandler() {
  const idStock = $(this).data('id');
  // Asumsikan data.layer2 adalah array berisi banyak items dengan properti id_stock
  const item = data.layer2.find(i => i.id_stock == idStock);
  if (item) {
    console.log(item);
  } else {
    console.log('Item dengan id_stock', idStock, 'tidak ditemukan di layer2');
  }
}
```

Penjelasan:
- Kode awal hanya menampilkan idStock dan idKain di console log.
- Kode setelah perubahan mencari item pada data.layer2 yang memiliki properti id_stock sesuai dengan idStock yang dipilih.
- Jika ditemukan, detail item akan ditampilkan di console log untuk keperluan debugging atau validasi.
- Jika tidak ditemukan, akan muncul pesan di console log bahwa item tidak ditemukan.

### Hasil / Kesimpulan
- Proses debugging dan validasi data item pada layer 2 menjadi lebih mudah dan transparan.
- Developer dapat langsung melihat detail data item yang dipilih melalui console log.
- Perubahan ini meningkatkan efisiensi pengembangan dan pengecekan data pada aplikasi.

---
