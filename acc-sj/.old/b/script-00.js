/**
 * Main application entry point
 * This is the main script that initializes and runs the application
 */
import { PubSubManager } from './app-controller.js';

// Global app instance
let appController = null;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM loaded, initializing application...');
        
        // Create and initialize app controller
        appController = new PubSubManager();
        await appController.initialize();
        
        // Make app controller globally available for debugging
        window.appController = appController;
        
        // Expose refresh function globally
        window.refreshApp = () => appController.refresh();
        
        console.log('Application ready!');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Gagal memuat aplikasi. Silakan refresh halaman.');
    }
});

/**
 * Handle page visibility changes to refresh data when page becomes visible
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && appController) {
        console.log('Page became visible, refreshing data...');
        appController.refresh();
    }
});

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

/**
 * Global unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});