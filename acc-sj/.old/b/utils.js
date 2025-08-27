/**
 * Utility functions module
 */
export class Utils {
    /**
     * Group array of objects by a specific key
     * @param {Array} arr - Array to group
     * @param {string} key - Key to group by
     * @returns {Object} Grouped object
     */
    static groupBy(arr, key) {
        return arr.reduce((acc, obj) => {
            const value = obj[key];
            (acc[value] = acc[value] || []).push(obj);
            return acc;
        }, {});
    }

    /**
     * Format time string to HH:MM format
     * @param {string} timeString - Full time string
     * @returns {string} Formatted time
     */
    static formatTime(timeString) {
        if (!timeString) return null;
        return timeString.substring(0, 5);
    }

    /**
     * Find minimum timestamp from array of items
     * @param {Array} items - Array of items with stamp_sj property
     * @returns {string} Minimum timestamp
     */
    static findMinTimestamp(items) {
        let minTimestamp = null;
        items.forEach(item => {
            const itemFullTime = item.stamp_sj.split(' ')[1];
            if (!minTimestamp || itemFullTime < minTimestamp) {
                minTimestamp = itemFullTime;
            }
        });
        return minTimestamp;
    }

    /**
     * Show/hide DOM elements
     * @param {string} selector - CSS selector
     * @param {boolean} show - Whether to show or hide
     */
    static toggleElement(selector, show) {
        const element = document.querySelector(selector);
        if (element) {
            if (show) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }

    /**
     * Create DOM element from HTML string
     * @param {string} htmlString - HTML string
     * @returns {Element} DOM element
     */
    static createElementFromHTML(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstElementChild;
    }
}