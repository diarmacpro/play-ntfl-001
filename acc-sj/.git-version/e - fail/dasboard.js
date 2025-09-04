/**
 * Dashboard Controller
 * Manages the main dashboard functionality with professional UI/UX
 */

class DashboardController {
  constructor() {
    this.userData = null;
    this.dashboardData = null;
    this.elements = this.initializeElements();
    this.state = {
      isLoading: false,
      lastRefresh: null
    };
    
    this.init();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    return {
      userDisplayName: document.getElementById('userDisplayName'),
      welcomeUsername: document.getElementById('welcomeUsername'),
      currentDate: document.getElementById('currentDate'),
      totalSJ: document.getElementById('totalSJ'),
      todayProcess: document.getElementById('todayProcess'),
      returnItems: document.getElementById('returnItems'),
      recentActivity: document.getElementById('recentActivity'),
      dataSummary: document.getElementById('dataSummary'),
      refreshData: document.getElementById('refreshData'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      offButton: document.getElementById('offButton')
    };
  }

  /**
   * Initialize dashboard
   */
  async init() {
    // Check authentication first
    if (!initAuth()) {
      return;
    }

    this.loadUserData();
    this.setupEventListeners();
    this.updateDateTime();
    this.startDateTimeUpdater();
    
    // Load dashboard data
    await this.loadDashboardData();
    
    // Add welcome animation
    this.playWelcomeAnimation();
  }

  /**
   * Load and display user data
   */
  loadUserData() {
    this.userData = getCurrentUserData();
    const username = getCurrentUsername();
    const displayName = getUserDisplayName();
    const initials = getUserInitials();
    const avatarColor = getUserAvatarColor();
    const statusBadge = getUserStatusBadge();
    
    if (this.userData && username) {
      // Display user name in navigation
      this.elements.userDisplayName.textContent = displayName;
      
      // Display welcome message
      this.elements.welcomeUsername.textContent = displayName;
      
      // Update user avatar
      this.updateUserAvatar(initials, avatarColor);
      
      // Update user status badge
      this.updateUserStatusBadge(statusBadge);
    } else {
      // Fallback if user data is not available
      this.elements.userDisplayName.textContent = displayName;
      this.elements.welcomeUsername.textContent = displayName;
    }
  }

  /**
   * Update user avatar in navigation
   */
  updateUserAvatar(initials, colorClass) {
    const avatarElement = document.querySelector('.user-avatar');
    if (avatarElement) {
      avatarElement.className = `w-8 h-8 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center user-avatar`;
      avatarElement.innerHTML = `<span class="text-white text-sm font-semibold">${initials}</span>`;
    }
  }

  /**
   * Update user status badge
   */
  updateUserStatusBadge(badge) {
    const statusElement = document.querySelector('.user-status');
    if (statusElement) {
      statusElement.className = `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color} user-status`;
      statusElement.textContent = badge.text;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Refresh data button
    this.elements.refreshData.addEventListener('click', () => {
      this.refreshDashboardData();
    });

    // Auto-refresh every 5 minutes
    setInterval(() => {
      this.refreshDashboardData(true);
    }, 5 * 60 * 1000);
  }

  /**
   * Update current date and time
   */
  updateDateTime() {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    this.elements.currentDate.textContent = now.toLocaleDateString('id-ID', options);
  }

  /**
   * Start date/time updater
   */
  startDateTimeUpdater() {
    // Update every minute
    setInterval(() => {
      this.updateDateTime();
    }, 60000);
  }

  /**
   * Load dashboard data
   */
  async loadDashboardData() {
    try {
      // Show skeleton loaders for better UX
      this.showSkeletonLoaders();
      
      // Simulate API call for dashboard data
      await this.simulateDataLoad();
      
      this.updateDashboardStats();
      this.updateRecentActivity();
      this.updateDataSummary();
      
      this.state.lastRefresh = new Date();
      
      // Show success notification
      if (window.notificationManager) {
        window.notificationManager.success('Dashboard berhasil dimuat', {
          title: 'Data Terbaru',
          duration: 3000
        });
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showErrorStates();
      
      if (window.notificationManager) {
        window.notificationManager.error('Gagal memuat data dashboard', {
          title: 'Kesalahan Sistem',
          actionText: 'Coba Lagi',
          action: () => this.loadDashboardData()
        });
      }
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Show skeleton loaders
   */
  showSkeletonLoaders() {
    if (window.loadingManager) {
      // Show skeleton for recent activity
      window.loadingManager.showCardSkeleton(this.elements.recentActivity, 4);
      
      // Show skeleton for data summary
      window.loadingManager.showTableSkeleton(this.elements.dataSummary, 5, 8);
    }
  }

  /**
   * Show error states
   */
  showErrorStates() {
    if (window.loadingManager) {
      // Show error state for recent activity
      window.loadingManager.showErrorState(
        this.elements.recentActivity,
        'Tidak dapat memuat aktivitas terbaru',
        'window.dashboardController.loadDashboardData()'
      );
      
      // Show error state for data summary
      window.loadingManager.showErrorState(
        this.elements.dataSummary,
        'Tidak dapat memuat ringkasan data',
        'window.dashboardController.loadDashboardData()'
      );
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboardData(isAutoRefresh = false) {
    if (this.state.isLoading) return;
    
    try {
      if (!isAutoRefresh) {
        // Add visual feedback for manual refresh
        this.elements.refreshData.classList.add('animate-spin');
        
        if (window.notificationManager) {
          window.notificationManager.info('Memperbarui data...', {
            duration: 2000
          });
        }
      }
      
      await this.loadDashboardData();
      
      if (!isAutoRefresh) {
        if (window.notificationManager) {
          window.notificationManager.success('Data berhasil diperbarui', {
            title: 'Refresh Berhasil'
          });
        }
      }
      
    } catch (error) {
      if (window.notificationManager) {
        window.notificationManager.error('Gagal memperbarui data', {
          title: 'Kesalahan Refresh'
        });
      }
    } finally {
      this.elements.refreshData.classList.remove('animate-spin');
    }
  }

  /**
   * Simulate data loading (replace with actual API calls)
   */
  async simulateDataLoad() {
    // Simulate realistic network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    // Generate realistic mock data based on current time
    const now = new Date();
    const hour = now.getHours();
    
    // More realistic data based on time of day
    const baseActivity = hour >= 8 && hour <= 17 ? 1.5 : 0.3; // Higher during work hours
    
    this.dashboardData = {
      stats: {
        totalSJ: Math.floor((Math.random() * 80 + 120) * baseActivity),
        todayProcess: Math.floor((Math.random() * 15 + 8) * baseActivity),
        returnItems: Math.floor((Math.random() * 5 + 1) * baseActivity),
        pendingItems: Math.floor((Math.random() * 12 + 3) * baseActivity)
      },
      recentActivity: this.generateMockActivity(),
      summary: this.generateMockSummary(),
      performance: this.generatePerformanceData()
    };
  }

  /**
   * Generate performance data
   */
  generatePerformanceData() {
    return {
      efficiency: Math.floor(Math.random() * 20) + 80, // 80-100%
      avgProcessTime: Math.floor(Math.random() * 10) + 15, // 15-25 minutes
      errorRate: (Math.random() * 2).toFixed(1) // 0-2%
    };
  }

  /**
   * Generate mock activity data
   */
  generateMockActivity() {
    const now = new Date();
    const activities = [];
    
    // Generate time-based activities
    for (let i = 0; i < 6; i++) {
      const timeAgo = new Date(now.getTime() - (Math.random() * 4 * 60 * 60 * 1000)); // Last 4 hours
      const timeDiff = this.getTimeDifference(timeAgo);
      
      const activityTypes = [
        { type: 'create', message: 'Surat jalan baru dibuat', icon: 'plus-circle', color: 'blue' },
        { type: 'update', message: 'Data ekspedisi diperbarui', icon: 'pencil-square', color: 'green' },
        { type: 'return', message: 'Item return diproses', icon: 'arrow-return-left', color: 'orange' },
        { type: 'complete', message: 'Pengiriman selesai', icon: 'check-circle', color: 'green' },
        { type: 'scan', message: 'Barcode discan', icon: 'upc-scan', color: 'purple' },
        { type: 'export', message: 'Laporan diekspor', icon: 'download', color: 'indigo' }
      ];
      
      const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      activities.push({
        ...randomActivity,
        time: timeDiff,
        timestamp: timeAgo
      });
    }
    
    // Sort by timestamp (newest first)
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
  }

  /**
   * Get human-readable time difference
   */
  getTimeDifference(pastDate) {
    const now = new Date();
    const diffMs = now - pastDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    
    return pastDate.toLocaleDateString('id-ID');
  }

  /**
   * Generate mock activity data (legacy - keeping for compatibility)
   */
  generateMockActivityLegacy() {
    const activities = [
      { type: 'create', message: 'Surat jalan baru dibuat', time: '10 menit yang lalu', icon: 'plus-circle', color: 'blue' },
      { type: 'update', message: 'Data ekspedisi diperbarui', time: '25 menit yang lalu', icon: 'pencil-square', color: 'green' },
      { type: 'return', message: 'Item return diproses', time: '1 jam yang lalu', icon: 'arrow-return-left', color: 'orange' },
      { type: 'complete', message: 'Pengiriman selesai', time: '2 jam yang lalu', icon: 'check-circle', color: 'green' }
    ];
    
    return activities.slice(0, Math.floor(Math.random() * 4) + 2);
  }

  /**
   * Generate mock summary data
   */
  generateMockSummary() {
    const summary = [];
    const recordCount = Math.floor(Math.random() * 8) + 5; // 5-12 records
    
    for (let i = 0; i < recordCount; i++) {
      const hour = Math.floor(Math.random() * 10) + 8; // 8-17
      const minute = Math.floor(Math.random() * 60);
      const sjNumber = 1000 + Math.floor(Math.random() * 9000);
      const mktNumber = 100 + Math.floor(Math.random() * 900);
      
      summary.push({
        c: Math.floor(Math.random() * 10) + 1,
        stamp: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        id_sj: `SJ${sjNumber}`,
        id_mkt: `MKT${mktNumber}`,
        rtr: Math.floor(Math.random() * 3),
        onOff: Math.floor(Math.random() * 2),
        ekspedisi: ['JNE', 'TIKI', 'POS Indonesia', 'J&T Express', 'SiCepat', 'AnterAja'][Math.floor(Math.random() * 6)]
      });
    }
    
    // Sort by timestamp
    return summary.sort((a, b) => a.stamp.localeCompare(b.stamp));
  }

  /**
   * Update dashboard statistics
   */
  updateDashboardStats() {
    if (!this.dashboardData) return;
    
    const { stats } = this.dashboardData;
    
    // Animate number updates
    this.animateNumber(this.elements.totalSJ, stats.totalSJ);
    this.animateNumber(this.elements.todayProcess, stats.todayProcess);
    this.animateNumber(this.elements.returnItems, stats.returnItems);
    
    // Update pending items if element exists
    const pendingElement = document.getElementById('pendingItems');
    if (pendingElement) {
      this.animateNumber(pendingElement, stats.pendingItems);
    }
    
    // Update performance metrics
    this.updatePerformanceMetrics();
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics() {
    if (!this.dashboardData?.performance) return;
    
    const { performance } = this.dashboardData;
    
    // Update efficiency
    const efficiencyElement = document.getElementById('efficiency');
    if (efficiencyElement) {
      this.animateNumber(efficiencyElement, performance.efficiency, '%');
    }
    
    // Update average process time
    const avgTimeElement = document.getElementById('avgProcessTime');
    if (avgTimeElement) {
      this.animateNumber(avgTimeElement, performance.avgProcessTime, ' min');
    }
    
    // Update error rate
    const errorRateElement = document.getElementById('errorRate');
    if (errorRateElement) {
      errorRateElement.textContent = performance.errorRate + '%';
    }
  }

  /**
   * Animate number changes
   */
  animateNumber(element, targetValue, suffix = '') {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
      element.textContent = currentValue.toLocaleString('id-ID') + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Update recent activity section
   */
  updateRecentActivity() {
    if (!this.dashboardData) return;
    
    const { recentActivity } = this.dashboardData;
    
    if (recentActivity.length === 0) {
      this.elements.recentActivity.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="bi bi-clock-history text-3xl mb-3"></i>
          <p class="font-medium">Belum ada aktivitas</p>
          <p class="text-sm">Aktivitas akan muncul setelah ada operasi</p>
        </div>
      `;
      return;
    }
    
    const activityHTML = recentActivity.map(activity => `
      <div class="flex items-center space-x-4 p-4 hover:bg-gradient-to-r hover:from-${activity.color}-50 hover:to-${activity.color}-100 rounded-xl transition-all duration-200 border border-transparent hover:border-${activity.color}-200 group cursor-pointer">
        <div class="w-12 h-12 bg-gradient-to-r from-${activity.color}-500 to-${activity.color}-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
          <i class="bi bi-${activity.icon} text-white"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-gray-800 group-hover:text-${activity.color}-800 transition-colors">${activity.message}</p>
          <p class="text-xs text-gray-500 flex items-center mt-1">
            <i class="bi bi-clock mr-1"></i>
            ${activity.time}
          </p>
        </div>
        <div class="text-gray-400 group-hover:text-${activity.color}-600 transition-colors">
          <i class="bi bi-chevron-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </div>
    `).join('');
    
    this.elements.recentActivity.innerHTML = activityHTML;
  }

  /**
   * Update data summary section
   */
  updateDataSummary() {
    if (!this.dashboardData) return;
    
    const { summary } = this.dashboardData;
    
    if (summary.length === 0) {
      this.elements.dataSummary.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <i class="bi bi-inbox text-4xl mb-4"></i>
          <p class="text-lg font-medium">Belum ada data</p>
          <p class="text-sm">Data akan muncul setelah ada aktivitas</p>
        </div>
      `;
      return;
    }
    
    const summaryHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID SJ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ekspedisi</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${summary.map((item, index) => `
              <tr class="hover:bg-blue-50/50 transition-colors duration-200 animate-fade-in" style="animation-delay: ${index * 50}ms">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                    ${item.c}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <i class="bi bi-clock text-gray-400 mr-2"></i>
                    <span class="text-sm text-gray-900 font-mono">${item.stamp || '-'}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <i class="bi bi-file-earmark-text text-blue-500 mr-2"></i>
                    <span class="text-sm font-medium text-gray-900">${item.id_sj || '-'}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <i class="bi bi-shop text-green-500 mr-2"></i>
                    <span class="text-sm text-gray-900">${item.id_mkt || '-'}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${item.rtr > 0 ? 
                    `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <i class="bi bi-exclamation-triangle mr-1"></i>${item.rtr}
                    </span>` : 
                    '<span class="text-gray-400 text-sm">Tidak ada</span>'
                  }
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${item.onOff > 0 ? 
                    '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><i class="bi bi-wifi mr-1"></i>Online</span>' : 
                    '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><i class="bi bi-wifi-off mr-1"></i>Offline</span>'
                  }
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <i class="bi bi-truck text-purple-500 mr-2"></i>
                    <span class="text-sm text-gray-900">${item.ekspedisi || '-'}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button class="text-blue-600 hover:text-blue-800 transition-colors" title="Lihat Detail">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-800 transition-colors" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800 transition-colors" title="Hapus">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
        <div class="flex items-center text-sm text-gray-700">
          <span>Menampilkan <span class="font-medium">${summary.length}</span> dari <span class="font-medium">${summary.length}</span> data</span>
        </div>
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">1</span>
          <button class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
    
    this.elements.dataSummary.innerHTML = summaryHTML;
  }

  /**
   * Show loading state
   */
  showLoading(show) {
    this.state.isLoading = show;
    
    if (show) {
      this.elements.loadingOverlay.classList.remove('hidden');
    } else {
      this.elements.loadingOverlay.classList.add('hidden');
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    if (window.notificationManager) {
      window.notificationManager.show(message, type);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Play welcome animation
   */
  playWelcomeAnimation() {
    // Add staggered animation to dashboard sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
      section.style.animationDelay = `${index * 200}ms`;
      section.classList.add('animate-fade-in');
    });
  }

  /**
   * Get user session info
   */
  getUserSessionInfo() {
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    if (loginTimestamp) {
      const loginTime = new Date(parseInt(loginTimestamp));
      const sessionDuration = Date.now() - parseInt(loginTimestamp);
      const hours = Math.floor(sessionDuration / (1000 * 60 * 60));
      const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        loginTime,
        duration: `${hours}j ${minutes}m`,
        isActive: sessionDuration < 24 * 60 * 60 * 1000 // 24 hours
      };
    }
    return null;
  }
}

/**
 * Dashboard utilities for enhanced functionality
 */
class DashboardUtils {
  /**
   * Format numbers with Indonesian locale
   */
  static formatNumber(number) {
    return new Intl.NumberFormat('id-ID').format(number);
  }

  /**
   * Format date with Indonesian locale
   */
  static formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  /**
   * Format time with Indonesian locale
   */
  static formatTime(date) {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Generate random color for charts/graphs
   */
  static getRandomColor() {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce(func, wait) {
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
}

/**
 * Initialize dashboard when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard controller
  window.dashboardController = new DashboardController();
  
  // Add global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.dashboardController) {
      window.dashboardController.showError('Terjadi kesalahan sistem');
    }
  });
  
  // Handle online/offline status
  window.addEventListener('online', () => {
    if (window.dashboardController) {
      window.dashboardController.showNotification('Koneksi internet tersambung kembali', 'success');
    }
  });
  
  window.addEventListener('offline', () => {
    if (window.dashboardController) {
      window.dashboardController.showNotification('Koneksi internet terputus', 'error');
    }
  });
});

/**
 * Handle page visibility for performance optimization
 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && window.dashboardController) {
    // Refresh data when page becomes visible
    window.dashboardController.refreshDashboardData(true);
  }
});