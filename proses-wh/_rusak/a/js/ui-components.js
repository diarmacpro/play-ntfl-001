// UI Components and Interactions
export class UIComponents {
  constructor() {
    this.alertTimer = null;
    this.alertCountdown = null;
  }

  // Show alert with countdown
  showAlert(message, duration = 3000) {
    const modal = document.getElementById('alertModal');
    const msg = document.getElementById('alertMessage');
    const btnClose = document.getElementById('alertBtn');

    if (!modal || !msg || !btnClose) return;

    // Clear existing timers
    if (this.alertTimer) clearTimeout(this.alertTimer);
    if (this.alertCountdown) clearInterval(this.alertCountdown);

    let timeLeft = Math.ceil(duration / 1000);
    msg.textContent = message;
    btnClose.innerHTML = `<i class="bi bi-x-lg"></i> (${timeLeft})`;

    modal.classList.remove('hidden');
    modal.classList.add('flex', 'opacity-0');

    // Fade-in with shake animation
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      modal.classList.add('shake');
      setTimeout(() => modal.classList.remove('shake'), 300);
    }, 10);

    // Countdown timer
    this.alertCountdown = setInterval(() => {
      timeLeft--;
      btnClose.innerHTML = `<i class="bi bi-x-lg"></i> (${timeLeft})`;
      if (timeLeft <= 0) clearInterval(this.alertCountdown);
    }, 1000);

    // Auto close
    this.alertTimer = setTimeout(() => {
      this.closeAlert();
      clearInterval(this.alertCountdown);
    }, duration);

    // Close button handler
    btnClose.onclick = () => {
      clearTimeout(this.alertTimer);
      clearInterval(this.alertCountdown);
      this.closeAlert();
    };
  }

  closeAlert() {
    const modal = document.getElementById('alertModal');
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }, 300);
  }

  // Modal for stock alternatives
  showStockModal(id) {
    const modal = document.getElementById('layer-2-modal');
    const content = document.querySelector('#modal-content-layer-2 .list-stock');
    
    // Get stock data and populate modal
    if (window.dataManager) {
      window.dataManager.getDtStock(id, (r) => {
        const html = this.generateStockListHTML(r);
        content.innerHTML = html;
        modal.classList.remove('hidden');
      });
    }
  }

  generateStockListHTML(stockData) {
    return stockData.map((item) => {
      const outCount = item.c == 0 ? '' : `
        <span class="px-2 py-0.5 bg-red-100 text-red-700 text-lg font-semibold rounded-full shadow-sm border border-red-300">
          <i class="bi bi-arrow-up"></i> ${item.c}
        </span>`;

      return `
        <div class="item border p-2 mb-2 rounded cursor-pointer hover:bg-gray-100 text-lg flex items-center gap-1 flex-wrap item-stock-alternatif"
            data-id="${item.id_stock}" data-id-kain="${item.id_kain}">
          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full shadow-sm border border-blue-300">
            #${item.id_stock} <b class='text-red-400'>${item.id_rtr == '?' ? '' : 'R'}</b>
          </span>
          ${item.ltrl}
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full shadow-sm border border-gray-300">
            <i class="bi bi-geo-alt-fill"></i> ${item.rkkl}
          </span>
          <span class="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full shadow-sm border border-green-300">
            ${item.q}
          </span>
          ${outCount}
          <span class="px-2 py-0.5 font-medium rounded-full shadow-sm ${
            item.stts === 'g'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : item.stts === 'e'
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }">
            ${item.stts.toUpperCase()}
          </span>
        </div>`;
    }).join('');
  }

  // Initialize modal event listeners
  initializeModalEvents() {
    const modal = document.getElementById('layer-2-modal');
    const closeBtn = document.getElementById('close-layer-2');
    const closeBtnBottom = document.getElementById('close-btn-layer-2');

    [closeBtn, closeBtnBottom].forEach(btn => {
      if (btn) {
        btn.onclick = () => modal.classList.add('hidden');
      }
    });

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    };
  }
}