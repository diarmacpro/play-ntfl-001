# Laporan Perubahan Sistem

## 1. Laporan Perubahan: Ukuran Pop-up Tambah Stock Baru

### Case
Ukuran pop-up "Tambah Stock Baru" pada keadaan kosong terlalu sempit. Saat user melakukan pencarian barang, layout pop-up tiba-tiba melebar secara vertikal, sehingga perubahan mendadak ini dapat mengurangi kenyamanan pengguna.

### Tindakan
Dilakukan penyesuaian pada ukuran pop-up agar lebar vertikal tetap statis. Caranya dengan menambahkan class `h-[400px]` pada elemen list-stock di dalam script.js:

```html
<div class="list-stock h-[400px] max-h-[400px] overflow-y-auto space-y-2">
  <!-- ... -->
</div>
```

Penambahan ini juga diterapkan pada manipulasi DOM di script agar pop-up selalu memiliki tinggi yang konsisten, baik sebelum maupun sesudah pencarian.

### Hasil
- Saat pop-up "Tambah Stock Baru" dipanggil, tampilannya langsung memiliki lebar vertikal yang sesuai dan tetap.
- Tidak ada perubahan layout mendadak saat user mulai melakukan pencarian barang.
- UX menjadi lebih stabil dan nyaman.

Laporan ini relevan dengan kode yang telah diterapkan dan meningkatkan kenyamanan tampilan pop-up pada proses penambahan stock baru.

---

## 2. Laporan Perubahan: Section Stock List Modal

### Case
Pada section:
```html
<!-- Stock List -->
<div class="list-stock h-[400px] max-h-[400px] overflow-y-auto space-y-2">
  <div class="text-center py-8 text-gray-500">
    <i class="bi bi-search text-4xl mb-2"></i>
    <p>Gunakan pencarian untuk menemukan stock</p>
  </div>
</div>
```

Dibutuhkan agar saat user belum melakukan pencarian atau kolom pencarian kosong, muncul icon dan keterangan agar section tidak tampak kosong.

### Tindakan
Menambahkan kode berikut pada script:

```javascript
stockList.innerHTML = `
  <div class="text-center py-8 text-gray-500">
    <i class="bi bi-search text-4xl mb-2"></i>
    <p>Gunakan pencarian untuk menemukan stock</p>
  </div>
`;
```

Kode ini dijalankan saat kolom pencarian kosong atau belum ada input dari user.

### Hasil
- Section list-stock otomatis menampilkan icon dan keterangan saat belum ada pencarian atau kolom pencarian kosong.
- Tampilan pop-up modal menjadi lebih informatif dan tidak tampak kosong.
- Keterangan/icon akan hilang saat user mulai melakukan pencarian.

Perubahan ini relevan dengan konteks sesi obrolan saat ini dan meningkatkan UX pada fitur pencarian stock.

---

## 3. Laporan Perubahan: Tombol "Tambah Stock Baru"

### Case
- Tombol "Tambah" harus disabled secara default, hanya aktif saat user memilih data summary dan detail SJ tersedia.
- Tombol harus kembali disabled saat dashboard aktif (renderDashboard dipanggil).
- Section stock list pada modal harus selalu informatif, tidak kosong.

### Tindakan

#### a. Disabled Default pada Tombol "Tambah"
Potongan kode di index.html:

```html
<button
  id="tambah-stock-btn"
  onclick="modalStockLainya('tambah')"
  class="w-auto px-3 h-10 flex items-center gap-2 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 text-sm"
  disabled
>
  <i class="bi bi-plus-circle text-base"></i>
  <span>Tambah</span>
</button>
```

**Penjelasan:** Tombol diberi atribut disabled dan style abu-abu agar tidak bisa diklik sebelum ada aksi user.

#### b. Enable/Disable Tombol Berdasarkan Detail SJ
Potongan kode di script.js (fungsi renderDetailByIdSj):

```javascript
const tambahBtn = document.getElementById('tambah-stock-btn');
if (tambahBtn) {
  tambahBtn.disabled = false;
  tambahBtn.classList.remove('text-gray-400', 'cursor-not-allowed', 'opacity-60');
  tambahBtn.classList.add('text-gray-600', 'hover:bg-green-100', 'hover:text-green-600', 'active:scale-95', 'shadow');
}
if (!dataDetail || dataDetail.length === 0) {
  // ...
  if (tambahBtn) {
    tambahBtn.disabled = true;
    tambahBtn.classList.remove('text-gray-600', 'hover:bg-green-100', 'hover:text-green-600', 'active:scale-95', 'shadow');
    tambahBtn.classList.add('text-gray-400', 'cursor-not-allowed', 'opacity-60');
  }
}
```

**Penjelasan:** Tombol diaktifkan jika detail SJ ada, dan dinonaktifkan jika tidak ada detail.

#### c. Disabled Kembali Saat Dashboard Aktif
Potongan kode di script.js (fungsi renderDashboard):

```javascript
const tambahBtn = document.getElementById('tambah-stock-btn');
if (tambahBtn) {
  tambahBtn.disabled = true;
  tambahBtn.classList.remove('text-gray-600', 'hover:bg-green-100', 'hover:text-green-600', 'active:scale-95', 'shadow');
  tambahBtn.classList.add('text-gray-400', 'cursor-not-allowed', 'opacity-60');
}
```

**Penjelasan:** Setiap dashboard aktif, tombol "Tambah" otomatis dinonaktifkan.

#### d. Section Stock List Selalu Informatif
Potongan kode di script.js (fungsi generateTambahStockContent):

```javascript
if (searchTerms.length === 0) {
  stockList.innerHTML = `
    <div class="text-center py-8 text-gray-500">
      <i class="bi bi-search text-4xl mb-2"></i>
      <p>Gunakan pencarian untuk menemukan stock</p>
    </div>
  `;
  return;
}
if (filteredData.length === 0) {
  stockList.innerHTML = `
    <div class="text-center py-8 text-gray-500">
      <i class="bi bi-emoji-frown text-4xl mb-2"></i>
      <p>Stock tidak ditemukan</p>
    </div>
  `;
} else {
  renderDataKain(filteredData);
}
```

**Penjelasan:** Section list-stock selalu menampilkan pesan/icon jika pencarian kosong atau tidak ditemukan.

### Hasil
- Tombol "Tambah" tidak bisa diklik sebelum user memilih data summary dan detail SJ tersedia.
- Tombol otomatis aktif saat detail SJ muncul, dan kembali nonaktif saat dashboard aktif.
- Section stock list pada modal selalu informatif, tidak pernah kosong.
- UX lebih jelas, mencegah user melakukan aksi yang tidak valid.

Laporan ini dapat digunakan sebagai dokumentasi perubahan fitur dan referensi pengembangan selanjutnya.

---

## 4. Laporan Perubahan: Interaksi Item List "Tambah Stock Baru" & Layer 2 UI

### Case
Sebelumnya, saat user klik item pada list hasil pencarian "Tambah Stock Baru", hanya muncul console log data sumber. Dibutuhkan agar klik pada item langsung meload data detail ke pop-up layer 2 (UI) sesuai id_kain.

### Tindakan

#### a. Kode Perubahan
Pada fungsi `renderDataKain(data)` di script.js, event listener pada setiap `.item-kain` diubah:

```javascript
itemKainEls.forEach((el, idx) => {
  el.addEventListener('click', function() {
    // Panggil openLayer2Handler dengan id_kain dari item
    if (typeof openLayer2Handler === 'function') {
      // Simulasikan event jQuery dengan data-id-kain
      el.setAttribute('data-id-kain', top100[idx].ik);
      openLayer2Handler.call(el);
    }
  });
});
```

**Penjelasan:**
- Setiap elemen `.item-kain` diberi atribut `data-id-kain` sesuai properti `ik` dari data sumber.
- Saat diklik, fungsi `openLayer2Handler` dipanggil dengan konteks elemen tersebut, sehingga layer 2 modal terbuka dan data detail ditampilkan sesuai id_kain.

#### b. Fungsi Handler Layer 2

```javascript
function openLayer2Handler() {
  const idKain = $(this).data('id-kain');
  $('#layer-2-modal').removeClass('hidden');
  tampilkanPilihanStockLain(idKain);
}
```

**Penjelasan:** Handler mengambil id_kain dari elemen yang diklik, membuka modal layer 2, dan memanggil fungsi untuk menampilkan data detail stock lain sesuai id_kain.

### Hasil
- Klik pada item list "Tambah Stock Baru" langsung membuka pop-up layer 2 dan menampilkan data detail sesuai id_kain.
- UX lebih interaktif dan responsif, user dapat langsung melihat detail stock lain tanpa proses manual.
- Kode lebih modular dan mudah dikembangkan untuk fitur lanjutan.

### Professional Point
- Perubahan ini meningkatkan efisiensi interaksi user pada proses penambahan stock baru.
- Implementasi event listener dan handler modular memudahkan maintainability dan pengembangan selanjutnya.
- Dokumentasi kode dan laporan perubahan ini dapat digunakan sebagai referensi tim pengembang.

Laporan ini relevan untuk dokumentasi pengembangan dan review fitur UI pada proses tambah stock baru.

---

## 5. Laporan Implementasi Tombol "Kembali" pada Modal Tambah Stock Baru

### Tujuan & Case
- Memudahkan user untuk kembali ke tampilan list hasil pencarian setelah melihat detail di layer 2 modal.
- Menghindari kebingungan user yang ingin kembali ke hasil pencarian tanpa harus mengulang proses pencarian.

### Tindakan & Implementasi

#### a. Penambahan Tombol "Kembali" di Area Input Pencarian
Potongan kode template pada fungsi `generateTambahStockContent` di script.js:

```html
<div class="relative flex items-center gap-2">
  <input 
    type="text" 
    id="searchStock" 
    placeholder="Cari berdasarkan nama kain atau kode..."
    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
  <button id="back-btn-layer-2" class="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm">Kembali</button>
  <i class="bi bi-search absolute right-3 top-3 text-gray-400"></i>
</div>
```

**Penjelasan:** Tombol "Kembali" diletakkan di samping input pencarian agar mudah diakses user.

#### b. Event Handler Tombol "Kembali"
Potongan kode event handler:

```javascript
if (backBtn) {
  backBtn.addEventListener('click', function() {
    // Ambil keywords dari kolom pencarian
    const keywords = searchInput.value;
    const searchTerms = keywords.toLowerCase().split(' ').filter(term => term.trim() !== '');
    let filteredData = [];
    if (searchTerms.length === 0) {
      filteredData = data.kain;
    } else {
      filteredData = data.kain.filter(item => {
        const itemText = item.k.toLowerCase();
        return searchTerms.every(term => itemText.includes(term));
      });
    }
    // Render hasil pencarian kembali
    renderDataKain(filteredData);
    // Tutup layer 2 modal agar user kembali ke list
    $('#layer-2-modal').addClass('hidden');
  });
}
```

**Penjelasan:**
- Tombol "Kembali" mengambil kata kunci dari input pencarian.
- Melakukan filter data kain sesuai kata kunci.
- Merender ulang hasil pencarian di list.
- Menutup layer 2 modal agar user langsung kembali ke tampilan list hasil pencarian.

### Hasil & Dampak
- User dapat dengan mudah kembali ke tampilan list hasil pencarian tanpa kehilangan kata kunci atau hasil pencarian sebelumnya.
- Layer 2 modal tertutup secara otomatis, sehingga navigasi lebih intuitif dan user experience meningkat.
- Fitur ini mengurangi kebingungan dan mempercepat workflow user dalam proses penambahan stock baru.

### Point Penting untuk Atasan
- **UX Improvement:** Navigasi antar detail dan list pencarian menjadi seamless.
- **Efisiensi:** User tidak perlu mengulang pencarian, cukup klik "Kembali".
- **Maintainability:** Kode modular dan mudah dikembangkan untuk kebutuhan serupa di masa depan.
- **Dokumentasi:** Potongan kode dan penjelasan sudah disertakan untuk memudahkan review dan pengembangan tim.

Laporan ini dapat digunakan sebagai referensi pengembangan, dokumentasi, dan presentasi kepada atasan terkait fitur tombol "Kembali" pada modal tambah stock baru.