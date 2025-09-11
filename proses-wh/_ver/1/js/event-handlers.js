// Event Handlers and DOM Interactions
import { renderFiltered } from './ui-manager.js';
import { loadDataSJ } from './data-loader.js';

export function initializeEventListeners() {
  // Event input search
  $('#cariDataSj').on('input', function () {
    renderFiltered($(this).val());
  });

  // Event change tanggal
  $('#tanggalInput').on('change', function () {
    const selectedDate = $(this).val();
    const params = new URLSearchParams(window.location.search);
    params.set('tgl', selectedDate);
    window.history.replaceState({}, '', `?${params.toString()}`);
    loadDataSJ(selectedDate);
  });

  // Modal close events
  $('#close-layer-2, #close-btn-layer-2').on('click', function() {
    $('#layer-2-modal').addClass('hidden');
  });

  // Click outside modal to close
  $('#layer-2-modal').on('click', function(e) {
    if (e.target === this) {
      $(this).addClass('hidden');
    }
  });
}

// Global functions that need to be accessible from HTML
window.reloadFetch = function() {
  import('./data-loader.js').then(({ reloadFetch }) => {
    reloadFetch();
  });
};

window.renderDashboard = function() {
  // Implementation for dashboard rendering
  console.log('Dashboard rendering...');
};

window.renderAktivitasTerbaru = function() {
  // Implementation for recent activities
  console.log('Recent activities rendering...');
};

window.modalStockLainya = function(action) {
  // Implementation for stock modal
  console.log('Stock modal:', action);
  $('#layer-2-modal').removeClass('hidden');
};

window.activateCard = function(idSj) {
  import('./ui-manager.js').then(({ activateCard }) => {
    activateCard(idSj);
  });
};