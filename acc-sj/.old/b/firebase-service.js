/**
 * Firebase service module
 */
export class FirebaseService {
    constructor() {
        this.services = {};
        this.initialized = false;
    }

    /**
     * Initialize Firebase services
     * @param {Object} databases - Database configuration
     */
    async initialize(databases) {
        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
            const { getDatabase } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js');

            // Initialize multiple Firebase apps
            const app0 = initializeApp({ databaseURL: databases.STOCK_WV }, 'app0');
            const app1 = initializeApp({ databaseURL: databases.MAIN_STOCK_WV }, 'app1');
            const app2 = initializeApp({ databaseURL: databases.STK_WV }, 'app2');

            // Get database instances
            const db0 = getDatabase(app0);
            const db1 = getDatabase(app1);
            const db2 = getDatabase(app2);

            // Create Fbs service instances
            this.services = {
                fbsSvc0: new window.Fbs(db0),
                fbsSvc1: new window.Fbs(db1),
                fbsSvc2: new window.Fbs(db2)
            };

            this.initialized = true;
            console.log('Firebase services initialized successfully');
        } catch (error) {
            console.error('Error initializing Firebase services:', error);
            throw error;
        }
    }

    /**
     * Get Firebase service by name
     * @param {string} serviceName - Service name (fbsSvc0, fbsSvc1, fbsSvc2)
     * @returns {Object} Firebase service instance
     */
    getService(serviceName) {
        if (!this.initialized) {
            throw new Error('Firebase services not initialized');
        }
        return this.services[serviceName];
    }

    /**
     * Get user data from Firebase
     * @param {Function} callback - Success callback
     * @param {Function} errorCallback - Error callback
     */
    getUserData(callback, errorCallback) {
        const fbsSvc2 = this.getService('fbsSvc2');
        fbsSvc2.gDt('user', '', callback, errorCallback);
    }
}