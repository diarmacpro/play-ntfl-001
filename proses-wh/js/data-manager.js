// Data Management and State
export class DataManager {
  constructor() {
    this.data = {};
    this.tempData = {};
    this.countSumaryData = {
      totalData: 0,
      totalOnline: 0,
      totalOffline: 0,
      totalRetur: 0,
      totalEkspedisi: 0,
    };
    this.fbsSvc = null;
    this.fbsSvcX = null;
  }

  // Initialize Firebase services
  initializeServices(db, db2) {
    this.fbsSvc = new Fbs(db);
    this.fbsSvcX = new Fbs(db2);
    window.fbsSvc = this.fbsSvc;
    window.fbsSvcX = this.fbsSvcX;
  }

  // Cari data marketing by ID
  cariById(id) {
    return this.data.nmMkt?.find((item) => item.id_mkt === String(id)) || null;
  }

  // Cari helper by ID
  nmHlp(id) {
    return this.data.helper?.find((item) => item.id_hlp === id) || null;
  }

  // Filter summary data
  filterSummary(keyword) {
    keyword = String(keyword || '').toLowerCase().trim();
    const allData = Object.values(this.data.dataside || {});
    
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

    this.data['hasil_filter'] = hasil;
    return hasil;
  }

  // Load data SJ sesuai tanggal
  loadDataSJ(tgl) {
    prosesDataSJ('https://cdn.weva.my.id/apix/dtSj', { tgl }, (result) => {
      this.data.result = result;
      this.data.dataside = this.data.result.summary;
      renderElemenSummary(this.data.dataside);
      renderJumlahDataSummary();
    });
  }

  // Cari by ID SJ
  cariByIdSj(idSj) {
    const targetId = Number(idSj);
    return this.data.result?.raw?.filter(
      (item) => Number(item.id_sj) === targetId
    ) || [];
  }

  // Ambil data barang
  ambilDataBarang(cb) {
    this.fbsSvcX.gDt('kain', '', (d) => {
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

      this.data['kain'] = hasil;
      if (typeof cb === 'function') {
        cb(hasil);
      }
    });
  }

  // Get stock data
  getDtStock(id, callback) {
    this.fbsSvcX.gDt(`layer2/${id}`, '', (d) => {
      let filtered = Array.isArray(d)
        ? d.filter((item) => item.stts !== 'h')
        : [];

      this.data['layer2'] = filtered;
      if (typeof callback === 'function') {
        callback(filtered);
      }
    });
  }

  // Load helper data
  loadHelperData() {
    this.fbsSvcX.gDt('app/data/helper', '', (d) => {
      let arr = Array.isArray(d) ? d : Object.values(d || {});
      
      this.data.helper = arr
        .filter((val) => val.stts !== '' && val.stts !== 0)
        .map((val) => ({
          hlp: val.hlp || '',
          id_hlp: val.id_hlp || '',
        }));
    });
  }

  // Load marketing data
  loadMarketingData(callback) {
    this.fbsSvc.gDt('/user', '', (d) => {
      let arr = Array.isArray(d) ? d : Object.values(d || {});
      
      this.data.nmMkt = arr.map((val) => ({
        usr: val.usr || '',
        mkt: val.mkt || '',
        id_mkt: val.id_mkt || '',
      }));

      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  // Expose data globally for compatibility
  exposeGlobalData() {
    window.data = this.data;
    window.tempData = this.tempData;
    window.countSumaryData = this.countSumaryData;
  }
}