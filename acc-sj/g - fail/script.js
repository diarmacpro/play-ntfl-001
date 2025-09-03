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

        summary.push({
            c: count,
            stamp,
            id_sj,
            id_mkt,
            rtr,
            onOff,
            ekspedisi
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
 * Reload Timer Controller
 * Manages automatic reload with countdown display and coordination with refresh actions
 */
class ReloadTimerController {
  constructor() {
    this.countdownSeconds = 60;
    this.currentSeconds = this.countdownSeconds;
    this.intervalId = null;
    this.button = document.getElementById('reloadButton');
    this.refreshButton = document.getElementById('refreshButton');
    this.isRefreshing = false;
    this.refreshObserver = null;
    this.activityTimeout = null;
    this.isTimerActive = false;
    this.lastUpdateTime = Date.now();
    this.isManualReloadInProgress = false;
    
    this.init();
  }

  init() {
    if (!this.button) {
      console.warn('Reload button not found');
      return;
    }
    
    this.setupButton();
    this.startTimer();
    this.setupEventListeners();
    this.setupRefreshButtonObserver();
  }

  setupButton() {
    // Update button structure to include timer display
    this.button.innerHTML = `
      <span class="flex items-center justify-center space-x-2 min-w-[70px]">
        <span id="timerText" class="text-sm font-bold tabular-nums">10</span>
        <i id="reloadIcon" class="bi bi-arrow-clockwise text-base transition-transform duration-300"></i>
      </span>
    `;
    
    this.updateButtonStyle('normal');
    this.button.title = 'Reload data (Auto reload dalam 10 detik)';
  }

  /**
   * Update button styling based on state
   */
  updateButtonStyle(state) {
    const baseClasses = `
      flex items-center justify-center px-4 py-2.5 min-w-[85px] h-11
      text-white rounded-xl font-medium text-sm
      focus:outline-none focus:ring-2 focus:ring-offset-2
      transition-all duration-300 ease-in-out
      shadow-lg hover:shadow-xl
      transform active:scale-95
      border backdrop-blur-sm
      disabled:cursor-not-allowed disabled:transform-none
    `.replace(/\s+/g, ' ').trim();

    switch (state) {
      case 'normal':
        this.button.className = `${baseClasses}
          bg-gradient-to-r from-blue-500 to-blue-600 
          hover:from-blue-600 hover:to-blue-700 
          focus:ring-blue-500 border-blue-400/20
          hover:-translate-y-0.5
        `.replace(/\s+/g, ' ').trim();
        break;
      case 'warning':
        this.button.className = `${baseClasses}
          bg-gradient-to-r from-amber-500 to-orange-500 
          hover:from-amber-600 hover:to-orange-600 
          focus:ring-amber-500 border-amber-400/20
          hover:-translate-y-0.5
        `.replace(/\s+/g, ' ').trim();
        break;
      case 'urgent':
        this.button.className = `${baseClasses}
          bg-gradient-to-r from-red-500 to-red-600 
          hover:from-red-600 hover:to-red-700 
          focus:ring-red-500 border-red-400/20
          animate-pulse hover:-translate-y-0.5
        `.replace(/\s+/g, ' ').trim();
        break;
      case 'loading':
        this.button.className = `${baseClasses}
          bg-gradient-to-r from-green-500 to-emerald-600 
          focus:ring-green-500 border-green-400/20
          cursor-wait
        `.replace(/\s+/g, ' ').trim();
        break;
      case 'disabled':
        this.button.className = `${baseClasses}
          bg-gradient-to-r from-gray-400 to-gray-500 
          focus:ring-gray-400 border-gray-300/20
          opacity-60
        `.replace(/\s+/g, ' ').trim();
        break;
    }
  }

  /**
   * Setup refresh button observer to coordinate actions
   */
  setupRefreshButtonObserver() {
    // Try to find refresh button with multiple selectors
    if (!this.refreshButton) {
      this.refreshButton = document.querySelector('#refreshButton') ||
                          document.querySelector('[id*="refresh"]') ||
                          document.querySelector('[class*="refresh"]') ||
                          document.querySelector('button[onclick*="refresh"]');
    }

    if (this.refreshButton) {
      // Create mutation observer to watch for refresh button state changes
      this.refreshObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'disabled' || mutation.attributeName === 'class')) {
            this.handleRefreshButtonStateChange();
          }
        });
      });

      this.refreshObserver.observe(this.refreshButton, {
        attributes: true,
        attributeFilter: ['disabled', 'class']
      });

      // Listen for click events on refresh button
      this.refreshButton.addEventListener('click', () => {
        this.handleRefreshButtonClick();
      });
    }

    // Listen for custom refresh events
    document.addEventListener('dataRefreshStart', () => {
      this.handleRefreshStart();
    });

    document.addEventListener('dataRefreshComplete', () => {
      this.handleRefreshComplete();
    });
  }

  /**
   * Handle refresh button click
   */
  handleRefreshButtonClick() {
    console.log('Refresh button clicked - coordinating with reload timer');
    this.performReload('refresh');
  }

  /**
   * Handle refresh button state changes
   */
  handleRefreshButtonStateChange() {
    if (this.refreshButton.disabled || 
        this.refreshButton.classList.contains('loading') ||
        this.refreshButton.classList.contains('disabled') ||
        this.refreshButton.textContent.includes('...') ||
        this.refreshButton.querySelector('.animate-spin')) {
      this.handleRefreshStart();
    } else if (!this.isRefreshing) {
      // Only handle completion if we were previously refreshing
      this.handleRefreshComplete();
    }
  }

  /**
   * Handle refresh start from any source
   */
  handleRefreshStart() {
    if (this.isRefreshing) return;
    
    console.log('Data refresh started - pausing reload timer');
    this.isRefreshing = true;
    this.pauseTimer();
    this.showLoadingState();
  }

  /**
   * Handle refresh complete from any source
   */
  handleRefreshComplete() {
    if (!this.isRefreshing) return;
    
    console.log('Data refresh completed - resetting reload timer');
    this.isRefreshing = false;
    this.resetTimer();
    this.showSuccessState();
  }

  /**
   * Show loading state (same for both manual reload and refresh)
   */
  showLoadingState() {
    this.updateButtonStyle('disabled');
    this.button.disabled = true;
    
    const timerText = document.getElementById('timerText');
    const icon = document.getElementById('reloadIcon');
    
    if (timerText && icon) {
      timerText.innerHTML = '<span class="animate-pulse text-green-300">•••</span>';
      icon.className = 'bi bi-arrow-clockwise text-base animate-spin';
    }
    
    this.button.title = 'Memperbarui data...';
  }

  /**
   * Show success state briefly (same for both manual reload and refresh)
   */
  showSuccessState() {
    const timerText = document.getElementById('timerText');
    const icon = document.getElementById('reloadIcon');
    
    if (timerText && icon) {
      // Show success state briefly
      timerText.innerHTML = '<span class="text-green-400 font-bold">✓</span>';
      icon.className = 'bi bi-check-circle-fill text-base text-green-400';
      this.updateButtonStyle('normal');
      this.button.disabled = false;
      this.button.title = 'Data berhasil diperbarui!';
      
      // Reset to normal after 2 seconds
      setTimeout(() => {
        if (icon) {
          icon.className = 'bi bi-arrow-clockwise text-base transition-transform duration-300';
        }
        this.updateDisplay();
      }, 2000);
    }
  }

  /**
   * Pause timer without clearing
   */
  pauseTimer() {
    this.isTimerActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setupEventListeners() {
    // Manual reload on click
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.isRefreshing && !this.button.disabled) {
        this.performManualReload();
      }
    });

    // Reset timer on page visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Hanya lanjutkan timer jika sedang tidak refresh dan timer tidak aktif
        if (!this.isRefreshing && !this.isTimerActive) {
          this.resumeTimer();
        }
      }
    });

    // Reset timer on page focus
    window.addEventListener('focus', () => {
      // Hanya lanjutkan timer jika sedang tidak refresh dan timer tidak aktif
      if (!this.isRefreshing && !this.isTimerActive) {
        this.resumeTimer();
      }
    });

    // Listen for user activity to reset timer (with debouncing)
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, this.debounce(() => {
        // Hanya reset jika timer hampir habis dan user benar-benar berinteraksi
        if (!this.isRefreshing && this.isTimerActive && this.currentSeconds <= 3) {
          this.resetTimer();
        }
      }, 3000), { passive: true });
    });
  }

  /**
   * Debounce function to limit event frequency
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  startTimer() {
    if (this.isRefreshing) {
      return;
    }
    
    this.clearTimer();
    this.isTimerActive = true;
    this.lastUpdateTime = Date.now();
    
    this.intervalId = setInterval(() => {
      if (this.isRefreshing) {
        return;
      }
      
      // Pastikan interval berjalan dengan benar (cegah double execution)
      const now = Date.now();
      if (now - this.lastUpdateTime < 900) { // Minimal 900ms gap
        return;
      }
      this.lastUpdateTime = now;
      
      this.currentSeconds--;
      this.updateDisplay();
      
      if (this.currentSeconds <= 0) {
        this.performAutoReload();
      }
    }, 1000);
  }

  /**
   * Resume timer without resetting the countdown
   */
  resumeTimer() {
    if (this.isRefreshing || this.isTimerActive) {
      return;
    }
    
    console.log(`Resuming timer at ${this.currentSeconds} seconds`);
    this.isTimerActive = true;
    this.lastUpdateTime = Date.now();
    
    this.intervalId = setInterval(() => {
      if (this.isRefreshing) {
        return;
      }
      
      // Pastikan interval berjalan dengan benar
      const now = Date.now();
      if (now - this.lastUpdateTime < 900) {
        return;
      }
      this.lastUpdateTime = now;
      
      this.currentSeconds--;
      this.updateDisplay();
      
      if (this.currentSeconds <= 0) {
        this.performAutoReload();
      }
    }, 1000);
  }

  updateDisplay() {
    if (this.isRefreshing) {
      return;
    }
    
    const timerText = document.getElementById('timerText');
    const icon = document.getElementById('reloadIcon');
    
    if (timerText) {
      timerText.textContent = this.currentSeconds;
      
      // Update button style and icon based on remaining time
      if (this.currentSeconds <= 3) {
        this.updateButtonStyle('urgent');
        if (icon) {
          icon.className = 'bi bi-exclamation-triangle text-base animate-bounce';
        }
        this.button.title = `SEGERA! Auto reload dalam ${this.currentSeconds} detik`;
      } else if (this.currentSeconds <= 5) {
        this.updateButtonStyle('warning');
        if (icon) {
          icon.className = 'bi bi-clock text-base';
        }
        this.button.title = `Auto reload dalam ${this.currentSeconds} detik`;
      } else {
        this.updateButtonStyle('normal');
        if (icon) {
          icon.className = 'bi bi-arrow-clockwise text-base transition-transform duration-300';
        }
        this.button.title = `Reload data (Auto reload dalam ${this.currentSeconds} detik)`;
      }
    }
  }

  resetTimer() {
    if (this.isRefreshing) {
      return;
    }
    
    console.log('Timer reset triggered');
    this.clearTimer();
    this.currentSeconds = this.countdownSeconds;
    this.startTimer();
    
    // Emit reset event for other components
    this.emitTimerEvent('reset');
  }

  clearTimer() {
    this.isTimerActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Emit timer-related events
   */
  emitTimerEvent(type, data = {}) {
    const event = new CustomEvent(`reloadTimer${type.charAt(0).toUpperCase() + type.slice(1)}`, {
      detail: { 
        currentSeconds: this.currentSeconds,
        isRefreshing: this.isRefreshing,
        ...data 
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Perform manual reload (when user clicks button)
   */
  performManualReload() {
    // Prevent double execution
    if (this.isManualReloadInProgress || this.isRefreshing) {
      console.log('Manual reload already in progress, skipping');
      return;
    }
    
    this.isManualReloadInProgress = true;
    this.clearTimer();
    console.log('Manual reload triggered');
    
    // Use enhanced API call to prevent duplicates
    this.performReload('manual').finally(() => {
      this.isManualReloadInProgress = false;
    });
  }

  /**
   * Perform automatic reload (when timer reaches 0)
   */
  performAutoReload() {
    // Prevent double execution
    if (this.isRefreshing) {
      console.log('Auto reload skipped - refresh already in progress');
      return;
    }
    
    this.clearTimer();
    console.log('Auto reload triggered');
    this.performReload('auto');
  }

  /**
   * Perform reload operation
   */
  async performReload(source = 'manual') {
    if (this.isRefreshing) {
      console.log('Reload skipped - already refreshing');
      return Promise.resolve();
    }
    
    this.isRefreshing = true;
    this.clearTimer();
    this.emitTimerEvent('start', { source });
    
    // Show loading state (same visual feedback for all sources)
    this.showLoadingState();
    
    // Add visual feedback for manual vs auto reload
    if (source === 'manual' || source === 'refresh') {
      this.button.classList.add('ring-2', 'ring-blue-300');
      setTimeout(() => {
        this.button.classList.remove('ring-2', 'ring-blue-300');
      }, 1000);
    }
    
    // Perform data refresh
    return this.refreshData();
  }

  /**
   * Refresh data without page reload
   */
  async refreshData() {
    try {
      // Show progress indicator
      this.updateRefreshProgress('Memuat data...');
      
      // Notify other components that refresh is starting
      window.refreshCoordinator.notifyRefreshStart();
      
      // Use enhanced API call to prevent duplicates
      const callId = 'main_data_refresh';
      
      if (window.apiCallManager.isCallActive(callId)) {
        console.log('Data refresh already in progress, waiting for completion');
        return;
      }
      
      window.apiCallManager.startCall(callId);
      
      // Call the main data loading function
      if (typeof window.loadData === 'function') {
        console.log('Calling window.loadData()');
        await window.loadData();
      } else if (typeof loadData === 'function') {
        console.log('Calling loadData()');
        await loadData();
      } else if (typeof fetchAndRender === 'function') {
        console.log('Calling fetchAndRender()');
        await fetchAndRender();
      } else if (typeof window.fetchAndRender === 'function') {
        console.log('Calling window.fetchAndRender()');
        await window.fetchAndRender();
      } else if (typeof refreshData === 'function') {
        console.log('Calling refreshData()');
        await refreshData();
      } else if (typeof window.refreshData === 'function') {
        console.log('Calling window.refreshData()');
        await window.refreshData();
      } else {
        console.log('No data loading function found, triggering custom refresh event');
        
        const refreshEvent = new CustomEvent('dataRefresh', {
          detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(refreshEvent);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      window.apiCallManager.completeCall(callId);
      
      // Show success feedback briefly
      this.showRefreshSuccess();
      
    } catch (error) {
      console.error('Data refresh error:', error);
      window.apiCallManager.completeCall(callId);
      
      // Show error feedback
      this.showRefreshError();
    } finally {
      // Always complete the refresh process
      setTimeout(() => {
        this.completeRefresh();
      }, 1500);
    }
  }

  /**
   * Update refresh progress
   */
  updateRefreshProgress(message) {
    this.button.title = message;
    
    // Update progress indicator if available
    const timerText = document.getElementById('timerText');
    if (timerText) {
      const dots = ['•', '••', '•••'];
      let dotIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (!this.isRefreshing) {
          clearInterval(progressInterval);
          return;
        }
        timerText.innerHTML = `<span class="animate-pulse text-green-300">${dots[dotIndex]}</span>`;
        dotIndex = (dotIndex + 1) % dots.length;
      }, 500);
    }
  }

  /**
   * Complete refresh process
   */
  completeRefresh() {
    this.isRefreshing = false;
    this.button.disabled = false;
    this.resetTimer();
    this.emitTimerEvent('complete');
    
    // Notify other components that refresh is complete
    window.refreshCoordinator.notifyRefreshComplete();
  }

  /**
   * Show refresh success feedback
   */
  showRefreshSuccess() {
    // Use the same success state as other operations
    this.showSuccessState();
  }

  /**
   * Show refresh error feedback
   */
  showRefreshError() {
    const timerText = document.getElementById('timerText');
    const icon = document.getElementById('reloadIcon');
    
    if (timerText && icon) {
      // Show error state
      timerText.innerHTML = '<span class="text-red-300 font-bold">!</span>';
      icon.className = 'bi bi-exclamation-triangle text-base text-red-400';
      this.updateButtonStyle('urgent');
      this.button.title = 'Gagal memperbarui data. Klik untuk coba lagi.';
    }
  }

  destroy() {
    this.clearTimer();
    if (this.refreshObserver) {
      this.refreshObserver.disconnect();
    }
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }
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

/**
 * Initialize reload timer when DOM is ready
 */
function initializeReloadTimer() {
  // Destroy existing timer if any
  if (window.reloadTimerController) {
    window.reloadTimerController.destroy();
  }
  
  // Initialize timer controller
  window.reloadTimerController = new ReloadTimerController();
}

/**
 * Utility functions for coordinating refresh actions
 */
window.refreshCoordinator = {
  isRefreshActive: false,
  activeRefreshes: new Set(),
  
  /**
   * Notify that refresh has started
   */
  notifyRefreshStart(source = 'unknown') {
    if (this.isRefreshActive) {
      console.log(`Refresh already active, ignoring start notification from ${source}`);
      return false;
    }
    
    this.isRefreshActive = true;
    this.activeRefreshes.add(source);
    console.log(`Refresh started from: ${source}`);
    document.dispatchEvent(new CustomEvent('dataRefreshStart', { detail: { source } }));
    return true;
  },
  
  /**
   * Notify that refresh has completed
   */
  notifyRefreshComplete(source = 'unknown') {
    this.activeRefreshes.delete(source);
    
    // Only mark as complete if no other refreshes are active
    if (this.activeRefreshes.size === 0) {
      this.isRefreshActive = false;
      console.log(`All refreshes completed`);
      document.dispatchEvent(new CustomEvent('dataRefreshComplete', { detail: { source } }));
    } else {
      console.log(`Refresh completed from ${source}, but other refreshes still active:`, Array.from(this.activeRefreshes));
    }
  },
  
  /**
   * Reset reload timer manually
   */
  resetReloadTimer() {
    if (window.reloadTimerController && !this.isRefreshActive) {
      window.reloadTimerController.resetTimer();
    }
  },

  /**
   * Check if refresh is currently in progress
   */
  isRefreshing() {
    return this.isRefreshActive;
  },
  
  /**
   * Force complete all refreshes (emergency reset)
   */
  forceCompleteAll() {
    console.log('Force completing all refreshes');
    this.activeRefreshes.clear();
    this.isRefreshActive = false;
    document.dispatchEvent(new CustomEvent('dataRefreshComplete', { detail: { source: 'force' } }));
  }
};

// Initialize user display and reload timer when page loads
document.addEventListener('DOMContentLoaded', () => {
  displayCurrentUser();
  initializeReloadTimer();
  
  // Setup enhanced button handling after a short delay
  setTimeout(() => {
    setupEnhancedButtons();
  }, 500);
});

/**
 * Cleanup timer on page unload
 */
window.addEventListener('beforeunload', () => {
  if (window.reloadTimerController) {
    window.reloadTimerController.destroy();
  }
  
  // Clear all API call states
  if (window.apiCallManager) {
    window.apiCallManager.activeCalls.clear();
  }
  
  // Clear all button debounce states
  if (window.buttonDebouncer) {
    window.buttonDebouncer.clearAll();
  }
});

/**
 * Enhanced coordination for existing refresh buttons
 * Call this function to integrate with existing refresh functionality
 */
function integrateWithExistingRefresh() {
  // Find and enhance existing refresh buttons
  const refreshButtons = document.querySelectorAll('[id*="refresh"], [class*="refresh"], button[onclick*="refresh"]');
  
  refreshButtons.forEach(button => {
    // Use enhanced button controller for existing refresh buttons
    const buttonId = button.id || `refresh_${Math.random().toString(36).substr(2, 9)}`;
    if (!button.id) button.id = buttonId;
    
    // Only enhance if not already enhanced
    if (!button.hasAttribute('data-enhanced')) {
      window.buttonController.setupButton(buttonId, async function(event) {
        // Notify reload timer that refresh is starting
        window.refreshCoordinator.notifyRefreshStart();
        
        try {
          // Call original function if it exists
          const originalOnclick = this.getAttribute('data-original-onclick');
          if (originalOnclick) {
            // Execute original onclick safely
            const func = new Function('event', originalOnclick);
            const result = func.call(this, event);
            
            if (result && typeof result.then === 'function') {
              await result;
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            // Fallback to general data loading
            if (typeof window.loadData === 'function') {
              await window.loadData();
            } else {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        } finally {
          window.refreshCoordinator.notifyRefreshComplete();
        }
      }, {
        debounceTime: 1500,
        showLoading: true,
        apiCallId: `refresh_${buttonId}`
      });
      
      // Store original onclick as data attribute
      if (button.onclick) {
        button.setAttribute('data-original-onclick', button.onclick.toString());
      }
      
      button.setAttribute('data-enhanced', 'true');
    }
  });
}

// Auto-integrate with existing refresh buttons after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    integrateWithExistingRefresh();
  }, 1000);
});

/**
 * Button Click Debouncer
 * Prevents double execution of button clicks
 */
class ButtonClickDebouncer {
  constructor() {
    this.clickStates = new Map();
    this.defaultDebounceTime = 1000; // 1 second
  }

  /**
   * Check if button can be clicked (not in debounce period)
   */
  canClick(buttonId, debounceTime = this.defaultDebounceTime) {
    const now = Date.now();
    const lastClick = this.clickStates.get(buttonId);
    
    if (!lastClick || (now - lastClick) >= debounceTime) {
      this.clickStates.set(buttonId, now);
      return true;
    }
    
    console.log(`Button ${buttonId} is in debounce period, ignoring click`);
    return false;
  }

  /**
   * Reset debounce state for a button
   */
  reset(buttonId) {
    this.clickStates.delete(buttonId);
  }

  /**
   * Clear all debounce states
   */
  clearAll() {
    this.clickStates.clear();
  }
}

/**
 * API Call Manager
 * Manages API calls to prevent duplicate requests
 */
class APICallManager {
  constructor() {
    this.activeCalls = new Set();
    this.callResults = new Map();
  }

  /**
   * Check if an API call is currently active
   */
  isCallActive(callId) {
    return this.activeCalls.has(callId);
  }

  /**
   * Start tracking an API call
   */
  startCall(callId) {
    if (this.activeCalls.has(callId)) {
      console.log(`API call ${callId} is already active, skipping duplicate`);
      return false;
    }
    
    this.activeCalls.add(callId);
    console.log(`Started API call: ${callId}`);
    return true;
  }

  /**
   * Complete an API call
   */
  completeCall(callId, result = null) {
    this.activeCalls.delete(callId);
    if (result) {
      this.callResults.set(callId, { result, timestamp: Date.now() });
    }
    console.log(`Completed API call: ${callId}`);
  }

  /**
   * Get cached result if available and fresh
   */
  getCachedResult(callId, maxAge = 5000) {
    const cached = this.callResults.get(callId);
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.result;
    }
    return null;
  }
}

/**
 * Enhanced Button Controller
 * Manages button states and prevents double execution
 */
class EnhancedButtonController {
  constructor() {
    this.debouncer = new ButtonClickDebouncer();
    this.apiManager = new APICallManager();
    this.buttonStates = new Map();
  }

  /**
   * Setup a button with enhanced click handling
   */
  setupButton(buttonId, clickHandler, options = {}) {
    const button = document.getElementById(buttonId);
    if (!button) {
      console.warn(`Button ${buttonId} not found`);
      return;
    }

    const config = {
      debounceTime: options.debounceTime || 1000,
      showLoading: options.showLoading !== false,
      apiCallId: options.apiCallId || buttonId,
      ...options
    };

    // Store original onclick if exists
    const originalOnclick = button.onclick;
    
    // Replace with enhanced click handler
    button.onclick = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Check debounce
      if (!this.debouncer.canClick(buttonId, config.debounceTime)) {
        return;
      }

      // Check if API call is already active
      if (this.apiManager.isCallActive(config.apiCallId)) {
        console.log(`API call ${config.apiCallId} already in progress, skipping`);
        return;
      }

      // Set button loading state
      if (config.showLoading) {
        this.setButtonLoading(button, true);
      }

      try {
        // Start API call tracking
        if (!this.apiManager.startCall(config.apiCallId)) {
          return; // Call already active
        }

        // Call the handler
        let result;
        if (originalOnclick && !clickHandler) {
          result = await originalOnclick.call(button, event);
        } else if (clickHandler) {
          result = await clickHandler.call(button, event);
        }

        // Complete API call tracking
        this.apiManager.completeCall(config.apiCallId, result);
        
        // Show success feedback if configured
        if (config.showSuccess) {
          this.showButtonSuccess(button);
        }

      } catch (error) {
        console.error(`Error in button ${buttonId} handler:`, error);
        this.apiManager.completeCall(config.apiCallId);
        
        // Show error feedback
        if (config.showError !== false) {
          this.showButtonError(button);
        }
      } finally {
        // Reset button state
        if (config.showLoading) {
          setTimeout(() => {
            this.setButtonLoading(button, false);
          }, config.loadingMinTime || 500);
        }
      }
    };

    console.log(`Enhanced button setup complete for: ${buttonId}`);
  }

  /**
   * Set button loading state
   */
  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.classList.add('opacity-75', 'cursor-not-allowed');
      
      // Add loading indicator if not present
      const existingIcon = button.querySelector('i');
      if (existingIcon && !existingIcon.classList.contains('animate-spin')) {
        existingIcon.classList.add('animate-spin');
      }
    } else {
      button.disabled = false;
      button.classList.remove('opacity-75', 'cursor-not-allowed');
      
      // Remove loading indicator
      const existingIcon = button.querySelector('i');
      if (existingIcon) {
        existingIcon.classList.remove('animate-spin');
      }
    }
  }

  /**
   * Show button success state
   */
  showButtonSuccess(button) {
    const originalClasses = button.className;
    button.classList.add('bg-green-500', 'hover:bg-green-600');
    
    setTimeout(() => {
      button.className = originalClasses;
    }, 2000);
  }

  /**
   * Show button error state
   */
  showButtonError(button) {
    const originalClasses = button.className;
    button.classList.add('bg-red-500', 'hover:bg-red-600', 'animate-pulse');
    
    setTimeout(() => {
      button.className = originalClasses;
    }, 3000);
  }
}

// Initialize global instances
window.buttonController = new EnhancedButtonController();
window.buttonDebouncer = new ButtonClickDebouncer();
window.apiCallManager = new APICallManager();

/**
 * Enhanced postToAPI with duplicate call prevention
 */
function postToAPIEnhanced(url, body, successCallback, errorCallback, options = {}) {
  const callId = options.callId || `${url}_${JSON.stringify(body)}`;
  
  // Check if call is already active
  if (window.apiCallManager.isCallActive(callId)) {
    console.log(`API call ${callId} already in progress, skipping duplicate`);
    return Promise.resolve();
  }

  // Check for cached result if enabled
  if (options.useCache) {
    const cached = window.apiCallManager.getCachedResult(callId, options.cacheMaxAge);
    if (cached) {
      console.log(`Using cached result for ${callId}`);
      if (successCallback) successCallback(cached);
      return Promise.resolve(cached);
    }
  }

  // Start call tracking
  if (!window.apiCallManager.startCall(callId)) {
    return Promise.resolve();
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Complete call tracking with result
    window.apiCallManager.completeCall(callId, data);
    
    // Call success callback
    if (successCallback && typeof successCallback === 'function') {
      successCallback(data);
    }
    return data;
  })
  .catch(error => {
    // Complete call tracking without result
    window.apiCallManager.completeCall(callId);
    
    console.error('API call error:', error);
    if (errorCallback && typeof errorCallback === 'function') {
      errorCallback(error);
    }
    throw error;
  });
}

/**
 * Setup enhanced button handling for specific buttons
 */
function setupEnhancedButtons() {
  // Setup reload button with enhanced handling
  const reloadButton = document.getElementById('reloadButton');
  if (reloadButton) {
    window.buttonController.setupButton('reloadButton', null, {
      debounceTime: 1500,
      showLoading: true,
      showSuccess: true,
      apiCallId: 'reload_data',
      loadingMinTime: 800
    });
  }

  // Setup accSuratJalanBtn with enhanced handling
  const accSuratJalanBtn = document.getElementById('accSuratJalanBtn');
  if (accSuratJalanBtn) {
    window.buttonController.setupButton('accSuratJalanBtn', null, {
      debounceTime: 1200,
      showLoading: true,
      showSuccess: true,
      apiCallId: 'acc_surat_jalan',
      loadingMinTime: 600
    });
  }

  // Setup any other buttons that might cause double execution
  const otherButtons = document.querySelectorAll('button[onclick], input[type="button"][onclick]');
  otherButtons.forEach(button => {
    const buttonId = button.id || `btn_${Math.random().toString(36).substr(2, 9)}`;
    if (!button.id) button.id = buttonId;
    
    // Only enhance if not already enhanced
    if (!button.hasAttribute('data-enhanced')) {
      window.buttonController.setupButton(buttonId, null, {
        debounceTime: 1000,
        showLoading: false,
        apiCallId: buttonId
      });
      button.setAttribute('data-enhanced', 'true');
    }
  });
}

/**
 * Utility function to manually prevent double execution for any function
 */
function preventDoubleExecution(func, debounceTime = 1000) {
  let isExecuting = false;
  let lastExecution = 0;
  
  return async function(...args) {
    const now = Date.now();
    
    // Check if function is currently executing
    if (isExecuting) {
      console.log('Function already executing, skipping');
      return;
    }
    
    // Check debounce time
    if (now - lastExecution < debounceTime) {
      console.log('Function in debounce period, skipping');
      return;
    }
    
    isExecuting = true;
    lastExecution = now;
    
    try {
      return await func.apply(this, args);
    } finally {
      isExecuting = false;
    }
  };
}