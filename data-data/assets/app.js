const urls = {
  jenis: 'https://cdn.weva.my.id/apix/dtJ',
  warna: 'https://cdn.weva.my.id/apix/dtW',
  satuan: 'https://cdn.weva.my.id/apix/dtS',
  kain: 'https://cdn.weva.my.id/apix/dtK'
};

const globalKeys = {
  jenis: 'dataJenis',
  warna: 'dataWarna',
  satuan: 'dataSatuan',
  kain: 'dataKain'
};

const hash = (data) => CryptoJS.SHA256(JSON.stringify(data)).toString();

export class app {
  constructor() {
    ['jenis', 'warna', 'satuan', 'kain'].forEach(key => this.loadData(key));
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
      this.syncData(key, cached); // lanjut cek hash
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

      const data = res?.data || [];
      const h = hash(data);
      const item = { data, hash: h, lastSync: new Date().toISOString() };

      window[globalKey] = data;
      await localforage.setItem(key, item);
      this.tampilkanA(`[✔] ${key} diambil via pR & disimpan`);
    });
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

      const remoteData = res?.data || [];
      const remoteHash = hash(remoteData);

      if (remoteHash !== localItem.hash) {
        await localforage.setItem(key, {
          data: remoteData,
          hash: remoteHash,
          lastSync: new Date().toISOString()
        });
        window[globalKey] = remoteData;
        this.tampilkanA(`[↻] ${key} diperbarui (hash mismatch)`);
      } else {
        this.tampilkanA(`[=] ${key} sinkron`);
      }
    });
  }

  tampilkanA(a) {
    console.log(a);
    document.getElementById("app").innerHTML += `<div class="text-sm text-gray-800">${a}</div>`;
  }
}
