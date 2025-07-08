const urls = {
  jenis: 'https://cdn.weva.my.id/apix/dtJ',
  warna: 'https://cdn.weva.my.id/apix/dtW',
  satuan: 'https://cdn.weva.my.id/apix/dtS',
  kain: 'https://cdn.weva.my.id/apix/dtK',
  rak: 'https://cdn.weva.my.id/apix/data/dtRak',
  kol: 'https://cdn.weva.my.id/apix/data/dtKol'
};

const globalKeys = {
  jenis: 'dataJenis',
  warna: 'dataWarna',
  satuan: 'dataSatuan',
  kain: 'dataKain',
  rak: 'dataRak',
  kol: 'dataKol'
};

const hash = (data) => CryptoJS.SHA256(JSON.stringify(data)).toString();

export class app {
  constructor() {
    ['jenis', 'warna', 'satuan', 'kain', 'rak', 'kol'].forEach(key => this.loadData(key));
  }

  async loadData(key) {
    const globalKey = globalKeys[key];
    const url = urls[key];

    // 1. Cek variabel global
    if (window[globalKey]) return this.tampilkanA(`[✔] ${key} dari global`);

    // 2. Cek IndexedDB
    const cached = await localforage.getItem(key);
    if (cached?.data) {
      window[globalKey] = cached.data;
      this.tampilkanA(`[✔] ${key} dari IndexedDB`);
      // Tidak langsung sync, sync hanya lewat tombol
      return;
    }

    // 3. Ambil dari remote pakai pR
    this.fetchAndStoreViaPR(key, url);
  }

  fetchAndStoreViaPR(key, url) {
    const globalKey = globalKeys[key];

    pR(url, {}, async (err, res) => {
      if (err) {
        console.error(`[✘] Gagal ambil ${key} via pR:`, err);
        return;
      }

      let data = res?.data || [];
      // Mapping khusus untuk rak dan kol
      if (key === 'rak') data = data.map(x => ({ kd_rak: x.i, rak: x.v }));
      if (key === 'kol') data = data.map(x => ({ kd_kol: x.i, kol: x.v }));
      const h = hash(data);
      const item = { data, hash: h, lastSync: new Date().toISOString() };

      window[globalKey] = data;
      await localforage.setItem(key, item);
      this.tampilkanA(`[✔] ${key} diambil via pR & disimpan`);
    });
  }

  tambahData(keydata, val) {
    // Mapping endpoint dan skema ID untuk tiap tipe data
    const config = {
      jenis:  { api: 'insJn', id: 'kd_jns' },
      warna:  { api: 'insWr', id: 'kd_wrn' },
      satuan: { api: 'insSt', id: 'kd_stn' },
      kain:   { api: 'insKn', id: 'id_kain' },
      rak:    { api: 'insRk', id: 'kd_rak' },
      kol:    { api: 'insKl', id: 'kd_kol' }
    };
    const conf = config[keydata];
    if (!conf) return;
    pR(`https://cdn.weva.my.id/apix/${conf.api}`, { q: val }, async (e, d) => {
      if (e || !d || !d.data || !d.data.insertedId) return;
      const newVal = { [conf.id]: d.data.insertedId, ...val };

      // 1. Tambah ke variabel global
      const globalKey = globalKeys[keydata];
      if (!window[globalKey]) window[globalKey] = [];
      window[globalKey].push(newVal);

      // 2. Tambah ke IndexedDB/localforage
      let cached = await localforage.getItem(keydata);
      if (!cached) cached = { data: [], hash: '', lastSync: '' };
      cached.data.push(newVal);
      cached.hash = hash(cached.data);
      cached.lastSync = new Date().toISOString();
      await localforage.setItem(keydata, cached);

      // 3. Trigger custom event agar view.js bisa re-render otomatis
      const event = new CustomEvent('data-synced', { detail: { key: keydata, globalKey } });
      window.dispatchEvent(event);

      // Debug log
      console.log('[TambahData]', newVal);
    });
  }

  // Fungsi sync yang bisa dipanggil dari UI
  async syncDataByKey(key) {
    const url = urls[key];
    const globalKey = globalKeys[key];
    const cached = await localforage.getItem(key);
    await this.syncData(key, cached); // pastikan syncData selesai sebelum lanjut
    // Setelah sync, ambil ulang data dari IndexedDB dan update global
    const refreshed = await localforage.getItem(key);
    if (refreshed && refreshed.data) {
      window[globalKey] = refreshed.data;
      // Trigger custom event agar view.js bisa re-render otomatis
      const event = new CustomEvent('data-synced', { detail: { key, globalKey } });
      window.dispatchEvent(event);
    }
  }

  syncData(key, localItem) {
    const url = urls[key];
    const globalKey = globalKeys[key];

    // Sync hanya lewat pR
    pR(url, {}, async (err, res) => {
      if (err) {
        console.warn(`[!] Gagal sync ${key}:`, err);
        return;
      }

      let remoteData = res?.data || [];
      if (key === 'rak') remoteData = remoteData.map(x => ({ kd_rak: x.i, rak: x.v }));
      if (key === 'kol') remoteData = remoteData.map(x => ({ kd_kol: x.i, kol: x.v }));
      const remoteHash = hash(remoteData);

      // Selalu timpa data lokal dengan data remote hasil fetch
      await localforage.setItem(key, {
        data: remoteData,
        hash: remoteHash,
        lastSync: new Date().toISOString()
      });
      window[globalKey] = remoteData;
      this.tampilkanA(`[↻] ${key} diperbarui (selalu replace dari server)`);
    });
  }

  tampilkanA(a) {
    console.log(a);
    document.getElementById("app").innerHTML += `<div class="text-sm text-gray-800">${a}</div>`;
  }
}
