# Laporan Perubahan Fitur Modal "Tambah Items Baru"

## Kronologi / Case
Pada tanggal 15 September 2025, ditemukan kebutuhan untuk meningkatkan validasi pada modal "Tambah Items Baru" di aplikasi gudang. Permintaan: jika jumlah stok (E + G) pada suatu item adalah 0 atau null, maka item tersebut tidak dapat dipilih dan harus ditandai secara visual serta diberikan peringatan kepada pengguna.

## Tindakan
### Kode yang Diubah
File yang dimodifikasi: `proses-wh/script.js`

- Pada bagian render daftar item, badge "Sisa" diubah agar:
  - Jika stok (E + G) = 0 atau null, badge berubah warna menjadi merah dan muncul label "Kosong".
  - Jika badge merah, klik pada item akan menampilkan pop up alert bertuliskan "Stock Kosong" dan tidak memanggil handler pemilihan item.
  - Jika stok tersedia, klik tetap berfungsi seperti biasa.

#### Penjelasan Kode
- Penambahan logika pada pembuatan elemen HTML untuk badge stok agar dinamis sesuai kondisi stok.
- Penambahan event listener pada setiap item untuk memunculkan pop up alert jika stok kosong.
- Pop up alert bersifat nested dan dapat ditutup oleh pengguna.

### Potongan Kode
```javascript
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

## Hasil
- Validasi stok kosong berjalan sesuai permintaan: item dengan stok 0/null tidak dapat dipilih dan muncul pop up peringatan.
- Badge "Sisa" berubah warna menjadi merah dan diberi label "Kosong" untuk menandai item yang tidak memiliki stok.
- User experience menjadi lebih baik dan meminimalisir kesalahan input pada proses penambahan item baru.

---
Laporan ini dibuat sebagai dokumentasi profesional atas perubahan fitur validasi stok pada aplikasi gudang, untuk kebutuhan audit dan pengembangan selanjutnya.
