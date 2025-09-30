# Alur dan Peran Variabel `tempData` pada Modul `proses-wh`

## Deskripsi
Variabel `tempData` merupakan variabel global yang digunakan dalam file `proses-wh/index.html` untuk menyimpan data sementara terkait detail Surat Jalan (SJ) yang sedang aktif atau dipilih oleh pengguna. Variabel ini berperan penting dalam proses pengambilan, penyimpanan, dan manipulasi data detail SJ yang akan ditampilkan atau diproses lebih lanjut di antarmuka pengguna.

## Tindakan

1. **Inisialisasi**
   - `tempData` diinisialisasi sebagai objek kosong saat script dijalankan.
   - Pada proses reload data, `tempData` di-reset menjadi objek kosong untuk memastikan data lama tidak tercampur dengan data baru.

2. **Pengisian Data**
   - Saat pengguna memilih atau mengaktifkan salah satu SJ, fungsi `activateCard(idSj)` akan dipanggil.
   - Fungsi ini mengambil data detail SJ berdasarkan `idSj` menggunakan fungsi `cariByIdSj(idSj)` dan hasilnya disimpan ke dalam `tempData`.

3. **Penggunaan Data**
   - Data yang tersimpan di `tempData` digunakan untuk menampilkan detail SJ pada antarmuka, serta dapat digunakan untuk proses lain seperti menampilkan pilihan stok alternatif.

## Potongan Kode & Penjelasan

### Inisialisasi dan Reset
```javascript
var tempData = {};
...
function loadAllData() {
  ...
  tempData = {};
  ...
}
```
**Penjelasan:**  
`tempData` diinisialisasi sebagai objek kosong. Setiap kali data utama di-reload, `tempData` juga di-reset agar tidak membawa data lama.

---

### Pengisian Data Saat SJ Diaktifkan
```javascript
function activateCard(idSj) {
  ...
  tempData = cariByIdSj(idSj);
  console.log(tempData);
  ...
}
```
**Penjelasan:**  
Ketika pengguna memilih SJ tertentu, fungsi ini akan mengambil data detail SJ tersebut dan menyimpannya ke dalam `tempData`. Data ini kemudian dapat digunakan untuk proses rendering detail atau proses lain yang membutuhkan data SJ aktif.

---

### Penggunaan Data pada Proses Lain
```javascript
function tampilkanPilihanStockLain(id) {
  getDtStock(id, (r) => {
    console.log([tempData, r]);
    ...
  });
}
```
**Penjelasan:**  
`tempData` juga dapat digunakan sebagai referensi saat menampilkan data lain yang berkaitan, misalnya saat menampilkan pilihan stok alternatif.

---

## Kesimpulan

Variabel `tempData` berfungsi sebagai penampung data sementara yang sangat penting dalam alur kerja modul `proses-wh`. Dengan mekanisme inisialisasi, pengisian, dan penggunaan yang jelas, `tempData` memastikan data detail SJ yang sedang aktif dapat diakses dan dimanipulasi dengan mudah serta terhindar dari data usang. Pengelolaan variabel ini mendukung pengalaman pengguna yang dinamis dan responsif pada aplikasi.
