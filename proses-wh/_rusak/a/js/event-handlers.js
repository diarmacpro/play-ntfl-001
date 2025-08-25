// Event Handlers and User Interactions
export class EventHandlers {
  constructor(dataManager, uiComponents) {
    this.dataManager = dataManager;
    this.uiComponents = uiComponents;
  }

  // Initialize all event listeners
  initializeEventListeners() {
    this.initializeDateHandler();
    this.initializeSearchHandler();
    this.initializeModalEvents();
    this.initializeToolbarEvents();
  }

  initializeDateHandler() {
    const dateInput = document.getElementById('tanggalInput');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        const params = new URLSearchParams(window.location.search);
        params.set('tgl', selectedDate);
        window.history.replaceState({}, '', `?${params.toString()}`);
        this.dataManager.loadDataSJ(selectedDate);
      });
    }
  }

  initializeSearchHandler() {
    const searchInput = document.getElementById('cariDataSj');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderFiltered(e.target.value);
      });
    }
  }

  initializeModalEvents() {
    this.uiComponents.initializeModalEvents();
  }

  initializeToolbarEvents() {
    // Toolbar button events can be added here
    // Currently handled by inline onclick attributes
  }

  // Render filtered results
  renderFiltered(keyword) {
    const filtered = this.dataManager.filterSummary(keyword);
    renderElemenSummary(filtered);
    renderJumlahDataSummary();
  }

  // Handle stock modal opening
  handleStockModal(action, id = null) {
    if (action === 'tambah') {
      this.uiComponents.showStockModal(id);
    }
  }
}