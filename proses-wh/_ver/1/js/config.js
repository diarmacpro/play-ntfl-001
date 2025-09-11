// Firebase Configuration and Global Setup
// This file ensures Firebase functions are available globally for external libraries

// Firebase configuration objects
export const firebaseConfig1 = {
  databaseURL: 'https://stock-wv-default-rtdb.asia-southeast1.firebasedatabase.app',
};

export const firebaseConfig2 = {
  databaseURL: 'https://stk-wv-default-rtdb.asia-southeast1.firebasedatabase.app',
};

// Initialize Firebase and make functions globally available
export async function initializeFirebase() {
  try {
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
    const {
      getDatabase,
      ref,
      set,
      get,
      update,
      push,
      query,
      remove,
      orderByChild,
      equalTo,
      onValue,
      off,
    } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js');

    // Initialize Firebase apps
    const app = initializeApp(firebaseConfig1);
    const db = getDatabase(app);

    const app2 = initializeApp(firebaseConfig2, 'app2');
    const db2 = getDatabase(app2);

    // Make Firebase functions globally available
    window.ref = ref;
    window.set = set;
    window.get = get;
    window.update = update;
    window.push = push;
    window.query = query;
    window.remove = remove;
    window.orderByChild = orderByChild;
    window.equalTo = equalTo;
    window.onValue = onValue;
    window.off = off;
    window.db = db;
    window.db2 = db2;

    // Also make them available in firebaseRefs object for compatibility
    window.firebaseRefs = {
      ref,
      set,
      get,
      update,
      push,
      query,
      remove,
      orderByChild,
      equalTo,
      onValue,
      off,
      db,
      db2
    };

    console.log('Firebase initialized successfully');
    return { db, db2 };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}

// Global configuration constants
export const APP_CONFIG = {
  loadingTimeout: 30000, // 30 seconds
  alertDuration: 3000, // 3 seconds
  apiEndpoints: {
    suratJalan: 'https://cdn.weva.my.id/apix/dtSj'
  }
};