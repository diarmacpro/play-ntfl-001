/**
 * Configuration module for the application
 * Centralized configuration management for all application settings
 */
export const CONFIG = {
    // Firebase configuration
    FIREBASE: {
        DATABASES: {
            STOCK_WV: 'https://stock-wv-default-rtdb.asia-southeast1.firebasedatabase.app',
            MAIN_STOCK_WV: 'https://main-stock-wv-default-rtdb.asia-southeast1.firebasedatabase.app',
            STK_WV: 'https://stk-wv-default-rtdb.asia-southeast1.firebasedatabase.app'
        },
        PATHS: {
            USER: 'user',
            SJ_DATA: 'sj-data',
            INVENTORY: 'inventory'
        },
        TIMEOUT: 10000 // 10 seconds
    },

    // API configuration
    API: {
        BASE_URL: 'https://app.weva.my.id/api',
        ENDPOINTS: {
            DATA_SJ_AWAL: '/data-sj-awal',
            USER_DATA: '/user-data',
            INVENTORY: '/inventory',
            REPORTS: '/reports'
        },
        TIMEOUT: 15000, // 15 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },

    // Ably PubSub configuration
    ABLY: {
        API_KEY: "fGNEag.D9-iTQ:-QxlogxXs4VFnIWJEy0CbHlXKJZ7QcmNOku6rDoUUto",
        CHANNELS: {
            MAIN: 'my-app-channel',
            NOTIFICATIONS: 'notifications-channel',
            UPDATES: 'updates-channel'
        },
        MESSAGE_TYPES: {
            CHAT_MESSAGE: 'chat-message',
            STATUS_UPDATE: 'status-update',
            DATA_REFRESH: 'data-refresh',
            USER_ACTION: 'user-action'
        }
    },

    // UI configuration
    UI: {
        SELECTORS: {
            LOADING_MESSAGE: '#loadingMessage',
            NO_DATA_MESSAGE: '#noDataMessage',
            SUMMARY_LIST: '#summaryList',
            DETAIL_CONTENT: '#detailContent',
            SIDEBAR: 'aside',
            MAIN_CONTENT: 'main'
        },
        CLASSES: {
            HIDDEN: 'hidden',
            LOADING: 'loading',
            ERROR: 'error',
            SUCCESS: 'success',
            ACTIVE: 'active',
            SELECTED: 'selected'
        },
        ANIMATIONS: {
            FADE_DURATION: 300,
            SLIDE_DURATION: 250,
            BOUNCE_DURATION: 400
        },
        BREAKPOINTS: {
            MOBILE: 768,
            TABLET: 1024,
            DESKTOP: 1280
        }
    },

    // Application settings
    APP: {
        NAME: 'Proses WH',
        VERSION: '1.0.0',
        DEBUG: true,
        AUTO_REFRESH: true,
        REFRESH_INTERVAL: 30000, // 30 seconds
        MAX_ITEMS_PER_PAGE: 50,
        DEFAULT_LOCALE: 'id-ID',
        DATE_FORMAT: 'DD/MM/YYYY HH:mm',
        TIME_FORMAT: 'HH:mm'
    },

    // Error messages
    MESSAGES: {
        ERRORS: {
            NETWORK: 'Koneksi jaringan bermasalah. Silakan coba lagi.',
            FIREBASE_INIT: 'Gagal menginisialisasi Firebase.',
            API_TIMEOUT: 'Permintaan API timeout. Silakan coba lagi.',
            DATA_NOT_FOUND: 'Data tidak ditemukan.',
            INVALID_DATA: 'Format data tidak valid.',
            PERMISSION_DENIED: 'Akses ditolak.',
            UNKNOWN: 'Terjadi kesalahan yang tidak diketahui.'
        },
        SUCCESS: {
            DATA_LOADED: 'Data berhasil dimuat.',
            OPERATION_COMPLETE: 'Operasi berhasil diselesaikan.',
            SYNC_COMPLETE: 'Sinkronisasi data selesai.'
        },
        INFO: {
            LOADING: 'Memuat data...',
            NO_DATA: 'Tidak ada data yang ditemukan.',
            SELECT_ITEM: 'Silakan pilih salah satu item dari daftar.',
            REFRESHING: 'Memperbarui data...'
        }
    },

    // Performance settings
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300,
        THROTTLE_DELAY: 100,
        LAZY_LOAD_THRESHOLD: 10,
        CACHE_DURATION: 300000, // 5 minutes
        MAX_CONCURRENT_REQUESTS: 5
    },

    // Security settings
    SECURITY: {
        SANITIZE_HTML: true,
        VALIDATE_INPUT: true,
        ESCAPE_OUTPUT: true,
        ALLOWED_DOMAINS: [
            'app.weva.my.id',
            'firebasedatabase.app',
            'googleapis.com'
        ]
    },

    // Feature flags
    FEATURES: {
        REAL_TIME_UPDATES: true,
        OFFLINE_SUPPORT: false,
        ANALYTICS: false,
        NOTIFICATIONS: true,
        DARK_MODE: false,
        EXPORT_DATA: true,
        PRINT_SUPPORT: true
    },

    // Storage configuration
    STORAGE: {
        PREFIX: 'proses_wh_',
        KEYS: {
            USER_PREFERENCES: 'user_preferences',
            CACHED_DATA: 'cached_data',
            LAST_SYNC: 'last_sync',
            THEME: 'theme'
        },
        EXPIRY: {
            SHORT: 3600000, // 1 hour
            MEDIUM: 86400000, // 24 hours
            LONG: 604800000 // 7 days
        }
    },

    // Validation rules
    VALIDATION: {
        ID_SJ: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 20,
            PATTERN: /^[A-Z0-9-]+$/
        },
        QTY: {
            MIN: 0,
            MAX: 999999
        },
        SKU: {
            MIN_LENGTH: 1,
            MAX_LENGTH: 50
        }
    },

    // Development settings
    DEV: {
        LOG_LEVEL: 'debug', // debug, info, warn, error
        MOCK_DATA: false,
        SIMULATE_DELAY: false,
        DELAY_MS: 1000
    }
};

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
    development: {
        ...CONFIG,
        APP: {
            ...CONFIG.APP,
            DEBUG: true
        },
        DEV: {
            ...CONFIG.DEV,
            LOG_LEVEL: 'debug',
            MOCK_DATA: true
        }
    },
    production: {
        ...CONFIG,
        APP: {
            ...CONFIG.APP,
            DEBUG: false
        },
        DEV: {
            ...CONFIG.DEV,
            LOG_LEVEL: 'error',
            MOCK_DATA: false
        }
    }
};

/**
 * Get configuration based on environment
 * @param {string} env - Environment name (development, production)
 * @returns {Object} Environment-specific configuration
 */
export function getConfig(env = 'development') {
    return ENV_CONFIG[env] || ENV_CONFIG.development;
}

/**
 * Validate configuration
 * @param {Object} config - Configuration object to validate
 * @returns {boolean} True if valid
 */
export function validateConfig(config) {
    const required = [
        'FIREBASE.DATABASES.STOCK_WV',
        'FIREBASE.DATABASES.MAIN_STOCK_WV',
        'FIREBASE.DATABASES.STK_WV',
        'API.BASE_URL',
        'ABLY.API_KEY'
    ];

    return required.every(path => {
        const value = path.split('.').reduce((obj, key) => obj?.[key], config);
        return value !== undefined && value !== null && value !== '';
    });
}

/**
 * Deep merge configuration objects
 * @param {Object} target - Target configuration
 * @param {Object} source - Source configuration to merge
 * @returns {Object} Merged configuration
 */
export function mergeConfig(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = mergeConfig(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    
    return result;
}