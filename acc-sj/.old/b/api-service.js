/**
 * API service module
 */
export class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Make API request using postToAPI function
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @param {Function} successCallback - Success callback
     * @param {Function} errorCallback - Error callback
     */
    request(endpoint, data, successCallback, errorCallback) {
        const fullUrl = `${this.baseUrl}${endpoint}`;
        
        if (typeof window.postToAPI === 'function') {
            window.postToAPI(fullUrl, data, successCallback, errorCallback);
        } else {
            console.error('postToAPI function not available');
            if (errorCallback) {
                errorCallback(new Error('postToAPI function not available'));
            }
        }
    }

    /**
     * Get SJ data from API
     * @param {Function} successCallback - Success callback
     * @param {Function} errorCallback - Error callback
     */
    getSjData(successCallback, errorCallback) {
        this.request('/data-sj-awal', { id_sj: true }, successCallback, errorCallback);
    }
}