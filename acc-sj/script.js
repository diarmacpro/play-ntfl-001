function nmMkt(id_mkt) {
  for (const key in listUsr) {
    if (listUsr[key].id_mkt == id_mkt) {
      return listUsr[key].mkt
        .trim()                // hapus spasi depan & belakang
        .replace(/\s+/g, " "); // ubah banyak spasi jadi 1
    }
  }
  return null; // kalau tidak ketemu
}


/**
 * Fungsi reusable untuk mengambil data SJ Awal dari API
 * @param {object} body - body request
 * @returns {Promise<object>} hasil data
 */
async function fetchDataSjAwal(body = { id_sj: true }) {
  return new Promise((resolve, reject) => {
    postToAPI(
      'https://app.weva.my.id/api/data-sj-by-date-post',
      { tgl: '2025-09-08' },
      resolve,
      reject
    );
  });
}
/**
 * Fungsi fleksibel untuk melakukan permintaan POST ke API.
 * @param {string} url - URL endpoint API.
 * @param {object} body - Objek data yang akan dikirim sebagai body JSON.
 * @param {function} successCallback - Fungsi yang akan dipanggil saat permintaan berhasil.
 * Menerima satu argumen: data respons JSON.
 * @param {function} [errorCallback] - Fungsi opsional yang akan dipanggil jika terjadi kesalahan.
 * Menerima satu argumen: objek Error.
 */
function postToAPI(url, body, successCallback, errorCallback) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        // Jika respons tidak OK (misal 404, 500, dll), lempar error
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Panggil successCallback dengan data yang diterima
        if (successCallback && typeof successCallback === 'function') {
            successCallback(data);
        }
    })
    .catch(error => {
        // Panggil errorCallback jika ada dan merupakan sebuah fungsi
        console.error('Terjadi kesalahan:', error);
        if (errorCallback && typeof errorCallback === 'function') {
            errorCallback(error);
        }
    });
}

/**
 * Mengelompokkan array objek berdasarkan kunci tertentu.
 * @param {Array<object>} array - Array objek yang akan dikelompokkan.
 * @param {string} key - Kunci yang akan digunakan untuk pengelompokan (misalnya, 'id_sj').
 * @returns {object} Objek di mana kuncinya adalah nilai dari 'key' dan nilainya adalah array item yang dikelompokkan.
 */
function groupBy(array, key) {
    return array.reduce((result, currentItem) => {
        // Ambil nilai dari kunci yang diberikan
        const keyValue = currentItem[key];
        
        // Buat array baru jika kunci belum ada
        if (!result[keyValue]) {
            result[keyValue] = [];
        }
        
        // Tambahkan item saat ini ke dalam array yang sesuai
        result[keyValue].push(currentItem);
        
        return result;
    }, {}); // Inisialisasi sebagai objek kosong
}

function makeSummary(data) {
    // Group by id_sj
    const grouped = groupBy(data, "id_sj");
    const summary = [];

    for (const idSj in grouped) {
        const items = grouped[idSj];

        // hitung count
        const count = items.length;
        
        // stamp_sj ambil min
        let minStamp = Math.min(...items.map(i => new Date(i.stamp).getTime()));
        let stamp = null;

        if (minStamp && !isNaN(minStamp)) {
            const minStampDate = new Date(minStamp);
            const hhmm = minStampDate.toTimeString().substring(0, 5); // ambil HH:mm
            stamp = hhmm;
        }

        // id_sj ambil unique lalu ambil [0]
        const idSjUnique = [...new Set(items.map(i => i.id_sj))];
        const id_sj = idSjUnique[0] || null;

        // id_mkt ambil unique lalu ambil [0]
        const idMktUnique = [...new Set(items.map(i => i.id_mkt))];
        const id_mkt = idMktUnique[0] || null;

        // rtr → kalau ada selain 0 → 1, else 0 (jumlahkan)
        const rtr = items.reduce((acc, i) => acc + (i.rtr && i.rtr != 0 ? 1 : 0), 0);

        // onOff → kalau ada selain 0 → 1, else 0 (jumlahkan)
        const onOff = items.reduce((acc, i) => acc + (i.onOff && i.onOff != 0 ? 1 : 0), 0);

        // ekspedisi unique join, tapi kalau kosong semua → null
        let ekspedisiVals = [...new Set(items.map(i => i.ekspedisi).filter(v => v && v !== "0" && v !== ""))];
        let ekspedisi = ekspedisiVals.length > 0 ? ekspedisiVals.join(", ") : null;

        const dMgrSum = items.reduce((acc, i) => acc + (i.d_mgr == null ? 0 : 1), 0);
        const d_mgr = dMgrSum > 0 ? 1 : 0;
        
        const dWhSum = items.reduce((acc, i) => acc + (i.d_wh == null ? 0 : 1), 0);
        const d_wh = dWhSum > 0 ? 1 : 0;
        
        const dFinishSum = items.reduce((acc, i) => acc + (i.d_finish == null ? 0 : 1), 0);
        const d_finish = dFinishSum > 0 ? 1 : 0;

        let status = 0;
        if (d_finish !== 0) {
            status = 3;
        } else if (d_wh !== 0) {
            status = 2;
        } else if (d_mgr !== 0) {
            status = 1;
        }

        summary.push({
            c: count,
            stamp,
            id_sj,
            id_mkt,
            rtr,
            onOff,
            ekspedisi,
            d_mgr,
            d_wh,
            d_finish,
            status
        });
    }

    return summary;
}

function formatToTimeHM(dateTimeStr) {
  if (!dateTimeStr) return null; // handle null/empty
  const date = new Date(dateTimeStr.replace(" ", "T")); 
  // replace spasi biar valid ISO string
  if (isNaN(date.getTime())) return null; // handle invalid date

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Display current user information
 */
function displayCurrentUser() {
  const userData = getCurrentUserData();
  const userNameElement = document.getElementById('currentUserName');
  
  if (userData && userNameElement) {
    // Use the user's name from userData, fallback to username
    const displayName = userData.nm || userData.usr || getCurrentUsername();
    userNameElement.textContent = displayName;
  }
}

/**
 * Global data refresh function
 * This should be implemented by the main application
 */
window.loadData = window.loadData || async function() {
  console.log('Default data refresh triggered - looking for refresh functions...');
  
  // Cari dan panggil fungsi refresh yang ada di aplikasi
  const refreshFunctions = [
    'fetchAndRender',
    'refreshData', 
    'loadTableData',
    'updateData',
    'reloadData'
  ];
  
  for (const funcName of refreshFunctions) {
    if (typeof window[funcName] === 'function') {
      console.log(`Found and calling ${funcName}()`);
      try {
        await window[funcName]();
        return; // Berhasil, keluar dari loop
      } catch (error) {
        console.error(`Error calling ${funcName}:`, error);
      }
    }
  }
  
  // Jika tidak ada fungsi yang ditemukan, coba trigger event
  console.log('No refresh function found, triggering refresh event');
  const event = new CustomEvent('forceDataRefresh', { 
    detail: { source: 'autoReload', timestamp: Date.now() } 
  });
  document.dispatchEvent(event);
  
  // Simulasi loading untuk UX yang lebih baik
  await new Promise(resolve => setTimeout(resolve, 1500));
};

/**
 * Setup data refresh event listener
 * Applications can listen to this event to refresh their data
 */
document.addEventListener('dataRefresh', (event) => {
  console.log('Data refresh event triggered at:', new Date(event.detail.timestamp));
  // Applications should implement their own data refresh logic here
});

/**
 * Setup force data refresh event listener
 * This is triggered when auto-reload happens and no specific refresh function is found
 */
document.addEventListener('forceDataRefresh', (event) => {
  console.log('Force data refresh event triggered at:', new Date(event.detail.timestamp));
  console.log('Source:', event.detail.source);
  
  // Coba klik tombol refresh yang ada jika ditemukan
  const refreshButton = document.getElementById('refreshButton') || 
                       document.querySelector('[onclick*="refresh"]') ||
                       document.querySelector('button[class*="refresh"]');
  
  if (refreshButton && !refreshButton.disabled) {
    console.log('Found refresh button, triggering click');
    refreshButton.click();
  } else {
    console.log('No refresh button found or button is disabled');
  }
});

window.refreshCoordinator = {
  /**
   * Notify that refresh has started
   */
  notifyRefreshStart() {
    document.dispatchEvent(new CustomEvent('dataRefreshStart'));
  },
  
  /**
   * Notify that refresh has completed
   */
  notifyRefreshComplete() {
    document.dispatchEvent(new CustomEvent('dataRefreshComplete'));
  }
};

// Initialize user display when page loads
document.addEventListener('DOMContentLoaded', () => {
  displayCurrentUser();
});

/**
 * Enhanced coordination for existing refresh buttons
 * Call this function to integrate with existing refresh functionality
 */
function integrateWithExistingRefresh() {
  // Find and enhance existing refresh buttons
  const refreshButtons = document.querySelectorAll('[id*="refresh"], [class*="refresh"], button[onclick*="refresh"]');
  
  refreshButtons.forEach(button => {
    // Store original onclick if exists
    const originalOnclick = button.onclick;
    
    // Wrap original functionality with coordination
    button.onclick = function(event) {
      // Notify reload timer that refresh is starting
      window.refreshCoordinator.notifyRefreshStart();
      
      // Call original function if it exists
      if (originalOnclick) {
        const result = originalOnclick.call(this, event);
        
        // If original function returns a promise, wait for it
        if (result && typeof result.then === 'function') {
          result.finally(() => {
            window.refreshCoordinator.notifyRefreshComplete();
          });
        } else {
          // For non-promise functions, assume completion after a delay
          setTimeout(() => {
            window.refreshCoordinator.notifyRefreshComplete();
          }, 2000);
        }
        
        return result;
      } else {
        // Jika tidak ada onclick original, coba panggil fungsi refresh umum
        console.log('No original onclick found, attempting to refresh data');
        if (typeof window.loadData === 'function') {
          window.loadData().finally(() => {
            window.refreshCoordinator.notifyRefreshComplete();
          });
        } else {
          setTimeout(() => {
            window.refreshCoordinator.notifyRefreshComplete();
          }, 2000);
        }
      }
        // Jika tidak ada onclick original, coba panggil fungsi refresh umum
        console.log('No original onclick found, attempting to refresh data');
        if (typeof window.loadData === 'function') {
          window.loadData().finally(() => {
            window.refreshCoordinator.notifyRefreshComplete();
          });
        } else {
          setTimeout(() => {
            window.refreshCoordinator.notifyRefreshComplete();
          }, 2000);
        }
    };
  });
}

// Auto-integrate with existing refresh buttons after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    integrateWithExistingRefresh();
  }, 1000);
});