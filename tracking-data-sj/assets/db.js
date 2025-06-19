// IndexedDB helpers
export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('trackingDataSJ', 1);
    request.onupgradeneeded = function(e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('perTanggal')) {
        db.createObjectStore('perTanggal', { keyPath: 'tanggalAcuan' });
      }
    };
    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

export async function getDataByTanggal(tanggalAcuan) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('perTanggal', 'readonly');
    const store = tx.objectStore('perTanggal');
    const req = store.get(tanggalAcuan);
    req.onsuccess = () => resolve(req.result ? req.result.payload : null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDataByTanggal(tanggalAcuan, payload) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('perTanggal', 'readwrite');
    const store = tx.objectStore('perTanggal');
    store.put({ tanggalAcuan, payload });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDataByTanggalWithFilter(tanggalAcuan, filter) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('perTanggal', 'readonly');
    const store = tx.objectStore('perTanggal');
    const req = store.get(tanggalAcuan);
    req.onsuccess = () => {
      if (!req.result || !req.result.payload || !req.result.payload.data) return resolve(null);
      let data = req.result.payload.data;
      if (Array.isArray(data)) {
        const isDelTrue = filter.del === 'true';
        data = data.filter(row => {
          if (filter.id_stock) {
            const arr = filter.id_stock.split(',').map(s => s.trim());
            if (!arr.includes(String(row.id_stock))) return false;
          }
          if (filter.id_sj) {
            const arr = filter.id_sj.split(',').map(s => s.trim());
            if (!arr.includes(String(row.id_sj))) return false;
          }
          if (filter.id_mkt) {
            const arr = filter.id_mkt.split(',').map(s => s.trim());
            if (!arr.includes(String(row.id_mkt))) return false;
          }
          if (filter.bulanTahun) {
            const yyyymm = String(row.stamp).slice(0, 7);
            if (yyyymm !== filter.bulanTahun) return false;
          }
          if (filter.tanggalAcuan) {
            const yyyymmdd = String(row.stamp).slice(0, 10);
            if (yyyymmdd !== filter.tanggalAcuan) return false;
          }
          if (isDelTrue) {
            if (String(row.dlt) !== '1') return false;
          }
          return true;
        });
      }
      resolve({ data });
    };
    req.onerror = () => reject(req.error);
  });
}
