# Laporan Fitur Tambah Data

## Ringkasan Fitur
Fitur "Tambah Data" pada aplikasi ini memungkinkan pengguna menambah entri baru ke data master (jenis, warna, satuan, kain, rak, kolom) secara langsung dari UI. Proses penambahan data dilakukan secara real-time, yaitu:
- Data baru langsung ditambahkan ke variabel global (misal: `window.dataJenis`, `window.dataWarna`, dst).
- Data juga langsung disimpan ke IndexedDB (menggunakan library `localforage`) tanpa reload seluruh data.
- Insert ke server dapat dilakukan (atau disimulasikan) setelah data lokal diperbarui.

## Alur & Kode Terkait

### 1. Modal Tambah Data
Saat tombol "Tambah Data" diklik, fungsi `showTambahDataModal(keys, keyType)` akan:
- Membuka modal form input.
- Membuat field input sesuai tipe data.
- Menangani submit form.

### 2. Submit Form & Update Data
Pada event submit form:
```javascript
form.onsubmit = function(ev) {
  ev.preventDefault();
  const formData = {};
  inputKeys.forEach(k => {
    formData[k] = form.elements[k].value;
  });
  window.app.tambahData(keyType, formData);
  // Tidak ada id/kd di data yang dikirim/log
  console.log('[Tambah Data] Data baru tanpa id/kd:', JSON.parse(JSON.stringify(formData)), 'Tipe:', keyType);
  closeModal();
  // Optional: trigger re-render or callback
};
```
- Data dari form dikumpulkan ke `formData`.
- Fungsi `window.app.tambahData` dipanggil untuk menambah data ke variabel global.

### 3. Update Variabel Global & IndexedDB
Pada proses tambah data (lihat juga pada inline edit):
- Data baru langsung didorong ke array global (`window[globalKey]`).
- Data di IndexedDB diperbarui dengan `localforage.setItem(key, { data: dataArr, ... })`.
- Tidak perlu reload seluruh data, hanya update array dan IndexedDB.

### 4. Insert ke Server
Pada kode inline edit dan sync, terdapat contoh:
```javascript
// Simulasi simpan ke server
console.log('direncanakan akan disimpan pada server');
```
- Untuk insert ke server, bisa ditambahkan AJAX/fetch/axios setelah update lokal.

## Keunggulan
- **Realtime:** Data langsung muncul di UI setelah submit.
- **Persisten:** Data tetap tersimpan di IndexedDB meski browser di-refresh.
- **Tanpa Reload:** Tidak perlu reload seluruh data, cukup update array dan IndexedDB.
- **Siap Sinkronisasi:** Insert ke server bisa dilakukan async tanpa mengganggu UI.

---

**Catatan:**
- Kode terkait utama: fungsi `showTambahDataModal`, event `form.onsubmit`, update array global, update IndexedDB, dan (opsional) insert ke server.
- Untuk implementasi insert ke server, tambahkan kode AJAX di bagian setelah update IndexedDB.
