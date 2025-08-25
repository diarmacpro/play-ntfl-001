// Main Application Controller
import { FirebaseConfig } from './config.js';
import { DataManager } from './data-manager.js';
import { UIComponents } from './ui-components.js';
import { EventHandlers } from './event-handlers.js';

class App {
  constructor() {
    this.dataManager = new DataManager();
    this.uiComponents = new UIComponents();
    this.eventHandlers = new EventHandlers(this.dataManager, this.uiComponents);
  }

  async initialize() {
    try {
      // Initialize Firebase
      const { db, db2 } = await FirebaseConfig.initialize();
      this.dataManager.initializeServices(db, db2);
      
      // Expose data globally for compatibility with existing functions
      this.dataManager.exposeGlobalData();
      
      // Initialize URL parameters and date
      this.initializeURLParams();
      
      // Initialize event listeners
      this.eventHandlers.initializeEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Expose global functions for compatibility
      this.exposeGlobalFunctions();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.uiComponents.showAlert('Gagal menginisialisasi aplikasi');
    }
  }

  initializeURLParams() {
    const params = new URLSearchParams(window.location.search);
    const today = stm('t');
    let initDate = params.get('tgl') || today;

    if (!params.has('tgl')) {
      params.set('tgl', today);
      window.history.replaceState({}, '', `?${params.toString()}`);
    }

    const dateInput = document.getElementById('tanggalInput');
    if (dateInput) {
      dateInput.value = initDate;
    }

    this.initialDate = initDate;
  }

  async loadInitialData() {
    // Load helper data
    this.dataManager.loadHelperData();
    
    // Load marketing data and then SJ data
    this.dataManager.loadMarketingData(() => {
      this.dataManager.loadDataSJ(this.initialDate);
      this.dataManager.ambilDataBarang((d) => {
        console.log('Kain data loaded:', this.dataManager.data.kain);
      });
    });
  }

  exposeGlobalFunctions() {
    // Expose functions that are called from HTML onclick attributes
    window.showAlert = (message, duration) => this.uiComponents.showAlert(message, duration);
    window.modalStockLainya = (action, id) => this.eventHandlers.handleStockModal(action, id);
    window.tampilkanPilihanStockLain = (id) => this.uiComponents.showStockModal(id);
    window.dataManager = this.dataManager;
    window.uiComponents = this.uiComponents;
    
    // Expose data manager methods globally for compatibility
    window.cariById = (id) => this.dataManager.cariById(id);
    window.nmHlp = (id) => this.dataManager.nmHlp(id);
    window.filterSummary = (keyword) => this.dataManager.filterSummary(keyword);
    window.renderFiltered = (keyword) => this.eventHandlers.renderFiltered(keyword);
    window.loadDataSJ = (tgl) => this.dataManager.loadDataSJ(tgl);
    window.cariByIdSj = (idSj) => this.dataManager.cariByIdSj(idSj);
    window.ambilDataBarang = (cb) => this.dataManager.ambilDataBarang(cb);
    window.getDtStock = (id, callback) => this.dataManager.getDtStock(id, callback);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize();
});

// Also initialize with jQuery ready for compatibility
$(function() {
  // jQuery initialization code can be added here if needed
  // The main initialization is handled by the DOMContentLoaded event above
});