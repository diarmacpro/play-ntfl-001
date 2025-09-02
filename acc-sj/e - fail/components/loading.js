/**
 * Professional Loading Components
 * Reusable loading states for better UX
 */

class LoadingManager {
  constructor() {
    this.activeLoaders = new Set();
  }

  /**
   * Show skeleton loader for tables
   */
  showTableSkeleton(container, rows = 5, columns = 7) {
    const skeletonHTML = `
      <div class="animate-pulse">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                ${Array(columns).fill(0).map(() => `
                  <th class="px-6 py-3">
                    <div class="h-4 bg-gray-300 rounded w-20"></div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${Array(rows).fill(0).map(() => `
                <tr>
                  ${Array(columns).fill(0).map(() => `
                    <td class="px-6 py-4">
                      <div class="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    container.innerHTML = skeletonHTML;
  }

  /**
   * Show card skeleton loader
   */
  showCardSkeleton(container, count = 4) {
    const skeletonHTML = `
      <div class="space-y-4 animate-pulse">
        ${Array(count).fill(0).map(() => `
          <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-300 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div class="w-4 h-4 bg-gray-300 rounded"></div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = skeletonHTML;
  }

  /**
   * Show stats skeleton loader
   */
  showStatsSkeleton(container) {
    const skeletonHTML = `
      <div class="animate-pulse">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div class="h-8 bg-gray-300 rounded w-16"></div>
          </div>
          <div class="w-12 h-12 bg-gray-300 rounded-xl"></div>
        </div>
      </div>
    `;
    
    container.innerHTML = skeletonHTML;
  }

  /**
   * Show loading spinner
   */
  showSpinner(container, message = 'Memuat...') {
    const spinnerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <i class="bi bi-arrow-clockwise animate-spin text-white text-xl"></i>
        </div>
        <p class="text-gray-600 font-medium">${message}</p>
        <div class="flex space-x-1 mt-3">
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    `;
    
    container.innerHTML = spinnerHTML;
  }

  /**
   * Show empty state
   */
  showEmptyState(container, icon, title, description, actionButton = null) {
    const actionHTML = actionButton ? `
      <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2" onclick="${actionButton.onClick}">
        <i class="bi ${actionButton.icon}"></i>
        <span>${actionButton.text}</span>
      </button>
    ` : '';
    
    const emptyHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="bi ${icon} text-gray-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-800 mb-2">${title}</h3>
        <p class="text-gray-500 text-sm max-w-sm mx-auto">${description}</p>
        ${actionHTML}
      </div>
    `;
    
    container.innerHTML = emptyHTML;
  }

  /**
   * Show error state
   */
  showErrorState(container, message, retryCallback = null) {
    const retryHTML = retryCallback ? `
      <button class="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2" onclick="${retryCallback}">
        <i class="bi bi-arrow-clockwise"></i>
        <span>Coba Lagi</span>
      </button>
    ` : '';
    
    const errorHTML = `
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="bi bi-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-800 mb-2">Terjadi Kesalahan</h3>
        <p class="text-gray-500 text-sm max-w-sm mx-auto">${message}</p>
        ${retryHTML}
      </div>
    `;
    
    container.innerHTML = errorHTML;
  }
}

// Create global loading manager
window.loadingManager = new LoadingManager();