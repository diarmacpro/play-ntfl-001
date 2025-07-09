# Laporan Perubahan UI: Highlight Tombol Aktif (Home/Data)

## Ringkasan
Menambahkan fitur penanda tombol aktif pada halaman data-data (`index.html`). Sekarang, tombol Home atau Data yang sedang aktif akan memiliki tampilan berbeda (warna dan border) sehingga pengguna mudah mengetahui posisi navigasi.

---

## BEFORE

**Kode (sebelum):**
```javascript
// Tidak ada logika penanda tombol aktif
document.getElementById(id).addEventListener('click', (e) => {
  // ...
});
```

**Tampilan (sebelum):**
![BEFORE](placeholder_screenshot_before.png)

---

## AFTER

**Kode (sesudah):**
```javascript
// Tambah fungsi setActiveButton dan panggil saat klik
document.getElementById(id).addEventListener('click', (e) => {
  setActiveButton(id);
  // ...
});
```

**Tampilan (sesudah):**
![AFTER](placeholder_screenshot_after.png)

---

**Catatan:**
- Tombol aktif kini memiliki border biru dan background lebih gelap.
- Placeholder screenshot dapat diganti dengan tangkapan layar UI sebelum/sesudah perubahan.
