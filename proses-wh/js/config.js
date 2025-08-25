// Firebase Configuration and Database Setup
export class FirebaseConfig {
  static async initialize() {
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

    const app = initializeApp({
      databaseURL: 'https://stock-wv-default-rtdb.asia-southeast1.firebasedatabase.app',
    });
    const db = getDatabase(app);

    const app2 = initializeApp(
      {
        databaseURL: 'https://stk-wv-default-rtdb.asia-southeast1.firebasedatabase.app',
      },
      'app2'
    );
    const db2 = getDatabase(app2);

    // Expose to global scope for compatibility
    Object.assign(window, {
      db,
      db2,
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
    });

    return { db, db2 };
  }
}