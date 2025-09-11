// Data Loading Operations
import { data, countSumaryData, fbsSvc, fbsSvcX, ambilDataBarang } from './data-manager.js';
import { showLoading, updateProgress, isLoading } from './loading-manager.js';
import { showAlert } from './ui-manager.js';
import { stm, prosesDataSJ } from './utils.js';

export function reloadFetch() {
  if (isLoading) {
    showAlert('Sedang memuat data, harap tunggu...', 2000);
    return;
  }

  showLoading();
  loadAllData();
}

export function loadAllData() {
  const params = new URLSearchParams(window.location.search);
  const currentDate = params.get('tgl') || stm('t');
  
  // Reset data
  Object.keys(data).forEach(key => delete data[key]);
  Object.assign(countSumaryData, {
    totalData: 0,
    totalOnline: 0,
    totalOffline: 0,
    totalRetur: 0,
    totalEkspedisi: 0,
  });

  // Step 1: Load Marketing Data
  updateProgress('step1', 'loading');
  fbsSvc.gDt('/user', '', (d) => {
    try {
      // Handle null or undefined data
      if (!d) {
        console.warn('Data marketing kosong atau null');
        data.nmMkt = [];
        updateProgress('step1', 'completed');
        loadHelperData();
        return;
      }

      let arr = [];
      if (Array.isArray(d)) {
        arr = d;
      } else if (d && typeof d === 'object') {
        arr = Object.values(d);
      }

      data.nmMkt = arr.map((val) => ({
        usr: val.usr || '',
        mkt: val.mkt || '',
        id_mkt: val.id_mkt || '',
      }));

      updateProgress('step1', 'completed');
      loadHelperData();
    } catch (error) {
      console.error('Error loading marketing data:', error);
      updateProgress('step1', 'error');
      showAlert('Gagal memuat data marketing', 3000);
    }
  });
}

function loadHelperData() {
  updateProgress('step2', 'loading');
  fbsSvcX.gDt('app/data/helper', '', (d) => {
    try {
      // Handle null or undefined data
      if (!d) {
        console.warn('Data helper kosong atau null');
        data.helper = [];
        updateProgress('step2', 'completed');
        loadBarangData();
        return;
      }

      let arr = [];
      if (Array.isArray(d)) {
        arr = d;
      } else if (d && typeof d === 'object') {
        arr = Object.values(d);
      }

      data.helper = arr
        .filter((val) => val.stts !== '' && val.stts !== 0)
        .map((val) => ({
          hlp: val.hlp || '',
          id_hlp: val.id_hlp || '',
        }));

      updateProgress('step2', 'completed');
      loadBarangData();
    } catch (error) {
      console.error('Error loading helper data:', error);
      updateProgress('step2', 'error');
      showAlert('Gagal memuat data helper', 3000);
    }
  });
}

function loadBarangData() {
  updateProgress('step3', 'loading');
  ambilDataBarang((hasil) => {
    try {
      if (hasil && hasil.length > 0) {
        updateProgress('step3', 'completed');
        loadSuratJalanData();
      } else {
        throw new Error('Data barang kosong');
      }
    } catch (error) {
      console.error('Error loading barang data:', error);
      updateProgress('step3', 'error');
      showAlert('Gagal memuat data barang', 3000);
    }
  });
}

function loadSuratJalanData() {
  const params = new URLSearchParams(window.location.search);
  const currentDate = params.get('tgl') || stm('t');
  
  updateProgress('step4', 'loading');
  prosesDataSJ('https://cdn.weva.my.id/apix/dtSj', { tgl: currentDate }, (result) => {
    try {
      data.result = result;
      data.dataside = data.result.summary;
      
      // Import render functions
      import('./ui-manager.js').then(({ renderElemenSummary, renderJumlahDataSummary }) => {
        renderElemenSummary(data.dataside);
        renderJumlahDataSummary();
      });
      
      updateProgress('step4', 'completed');
    } catch (error) {
      console.error('Error loading surat jalan data:', error);
      updateProgress('step4', 'error');
      showAlert('Gagal memuat data surat jalan', 3000);
    }
  });
}

export function loadDataSJ(tgl) {
  prosesDataSJ('https://cdn.weva.my.id/apix/dtSj', { tgl }, (result) => {
    data.result = result;
    data.dataside = data.result.summary;
    
    // Import render functions
    import('./ui-manager.js').then(({ renderElemenSummary, renderJumlahDataSummary }) => {
      renderElemenSummary(data.dataside);
      renderJumlahDataSummary();
    });
  });
}