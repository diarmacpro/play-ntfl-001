// Data Management Module

// Global data storage
export const data = {};
export const tempData = {};

export const countSumaryData = {
  totalData: 0,
  totalOnline: 0,
  totalOffline: 0,
  totalRetur: 0,
  totalEkspedisi: 0,
};

// Firebase service instances
export let fbsSvc, fbsSvcX;

// Initialize Firebase services
export function initializeFirebaseServices() {
  fbsSvc = new Fbs(window.db);
  fbsSvcX = new Fbs(window.db2);
  return { fbsSvc, fbsSvcX };
}

// Data fetching functions
export function cariById(id) {
  return data.nmMkt?.find((item) => item.id_mkt === String(id)) || null;
}

export function nmHlp(id) {
  return data.helper?.find((item) => item.id_hlp === id) || null;
}

export function cariByIdSj(idSj) {
  const targetId = Number(idSj);
  return data.result?.raw?.filter((item) => Number(item.id_sj) === targetId) || [];
}

export function ambilDataBarang(cb) {
  fbsSvcX.gDt('kain', '', (d) => {
    // Handle null or undefined data
    if (!d) {
      console.warn('Data barang kosong atau null');
      if (typeof cb === 'function') {
        cb([]);
      }
      return;
    }

    let hasil = Object.values(d)
      .flat()
      .map((item) => ({
        c_e: item.c_e,
        c_g: item.c_g,
        c_h: item.c_h,
        e: item.e,
        g: item.g,
        ik: item.ik,
        k: item.k,
        kd_jns: item.kd_jns,
        kd_wrn: item.kd_wrn,
        s: item.s,
      }));

    data['kain'] = hasil;

    if (typeof cb === 'function') {
      cb(hasil);
    }
  });
}

export function getDtStock(id, callback) {
  fbsSvcX.gDt(`layer2/${id}`, '', (d) => {
    // Handle null or undefined data
    if (!d) {
      console.warn('Data stock kosong atau null');
      if (typeof callback === 'function') {
        callback([]);
      }
      return;
    }

    let filtered = Array.isArray(d) ? d.filter((item) => item.stts !== 'h') : [];
    data['layer2'] = filtered;
    if (typeof callback === 'function') {
      callback(filtered);
    }
  });
}

export function filterSummary(keyword) {
  keyword = String(keyword || '').toLowerCase().trim();
  const allData = Object.values(data.dataside || {});

  const hasil = !keyword
    ? allData
    : allData.filter(
        (item) =>
          String(item.id_sj).toLowerCase().includes(keyword) ||
          String(item.id_mkt).toLowerCase().includes(keyword) ||
          String(item.jml_item).toLowerCase().includes(keyword) ||
          String(item.mkt || '').toLowerCase().includes(keyword) ||
          String(item.stamp || '').toLowerCase().includes(keyword)
      );

  data['hasil_filter'] = hasil;
  return hasil;
}