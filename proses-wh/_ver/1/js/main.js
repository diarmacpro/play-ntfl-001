// Main Application Entry Point
import { initializeFirebaseServices } from './data-manager.js';
import { showLoading } from './loading-manager.js';
import { initializeEventListeners } from './event-handlers.js';
import { stm, gtQrl } from './utils.js';

// Initialize application
$(function () {
  // Ambil param tanggal dari URL
  const params = new URLSearchParams(window.location.search);
  const today = stm('t');
  let initDate = params.get('tgl') || today;

  // Jika URL tidak ada ?tgl=..., set default
  if (!params.has('tgl')) {
    params.set('tgl', today);
    window.history.replaceState({}, '', `?${params.toString()}`);
  }

  // Set nilai awal input tanggal
  $('#tanggalInput').val(initDate);

  // Initialize Firebase services
  const { fbsSvc: fbs, fbsSvcX: fbsX } = initializeFirebaseServices();
  
  // Make services globally available (for compatibility with existing code)
  window.fbsSvc = fbs;
  window.fbsSvcX = fbsX;

  // Initialize all event listeners
  initializeEventListeners();

  // Show loading and start data loading process
  showLoading();
  
  // Import and start data loading
  import('./data-loader.js').then(({ loadAllData }) => {
    loadAllData();
  });
});