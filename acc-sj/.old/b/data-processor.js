/**
 * Data processing module
 */
import { Utils } from './utils.js';

export class DataProcessor {
    /**
     * Process SJ data and create summary
     * @param {Array} sjData - Raw SJ data
     * @param {Object} userMap - User mapping object
     * @returns {Object} Processed data with summary and grouped data
     */
    static processSjData(sjData, userMap) {
        const groupedData = Utils.groupBy(sjData, 'id_sj');
        const summaryData = {};
        const allSjData = {};
        
        for (const idSj in groupedData) {
            if (Object.hasOwnProperty.call(groupedData, idSj)) {
                const items = groupedData[idSj];
                const count = items.length;
                const firstIdMkt = items[0].id_mkt;
                
                // Find minimum timestamp and add marketing name
                const minTimestamp = Utils.findMinTimestamp(items);
                items.forEach(item => {
                    item.mkt_name = userMap[item.id_mkt] || item.id_mkt;
                });

                const formattedTime = Utils.formatTime(minTimestamp);
                const mktName = userMap[firstIdMkt] || firstIdMkt;

                allSjData[idSj] = items;
                
                summaryData[idSj] = {
                    id_sj: idSj,
                    count: count,
                    mkt_name: mktName,
                    stamp_sj_min: formattedTime
                };
            }
        }

        // Convert to array and sort by time
        const summaryArray = Object.values(summaryData);
        summaryArray.sort((a, b) => {
            if (a.stamp_sj_min < b.stamp_sj_min) return -1;
            if (a.stamp_sj_min > b.stamp_sj_min) return 1;
            return 0;
        });

        return {
            summaryArray,
            allSjData
        };
    }

    /**
     * Create user mapping from user data
     * @param {Object} userData - Raw user data from Firebase
     * @returns {Object} User mapping object
     */
    static createUserMap(userData) {
        const userMap = {};
        for (const key in userData) {
            if (Object.hasOwnProperty.call(userData, key)) {
                const user = userData[key];
                userMap[user.id_mkt] = user.mkt;
            }
        }
        return userMap;
    }
}