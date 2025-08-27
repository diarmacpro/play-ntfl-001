/**
 * UI rendering module
 */
import { Utils } from './utils.js';

export class UIRenderer {
    constructor(selectors) {
        this.selectors = selectors;
    }

    /**
     * Show loading state
     */
    showLoading() {
        Utils.toggleElement(this.selectors.LOADING_MESSAGE, true);
        Utils.toggleElement(this.selectors.NO_DATA_MESSAGE, false);
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        Utils.toggleElement(this.selectors.LOADING_MESSAGE, false);
    }

    /**
     * Show no data message
     */
    showNoData() {
        this.hideLoading();
        Utils.toggleElement(this.selectors.NO_DATA_MESSAGE, true);
    }

    /**
     * Render summary list
     * @param {Array} data - Summary data array
     * @param {Function} onItemClick - Click handler for items
     */
    renderSummaryList(data, onItemClick) {
        const summaryList = document.querySelector(this.selectors.SUMMARY_LIST);
        
        this.hideLoading();
        
        if (data.length === 0) {
            this.showNoData();
            return;
        }

        Utils.toggleElement(this.selectors.NO_DATA_MESSAGE, false);
        summaryList.innerHTML = '';
        
        data.forEach(item => {
            const listItemHTML = this.createSummaryItemHTML(item);
            const listElement = Utils.createElementFromHTML(listItemHTML);
            
            // Add click event listener
            listElement.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    onItemClick(item.id_sj);
                }
            });

            summaryList.appendChild(listElement);
        });
    }

    /**
     * Create HTML for summary item
     * @param {Object} item - Summary item data
     * @returns {string} HTML string
     */
    createSummaryItemHTML(item) {
        return `
            <div class="rounded p-0 cursor-pointer bg-white hover:bg-blue-200 transition-none" data-id-sj="${item.id_sj}">
                <div class="flex items-center w-full gap-3">
                    <span class="w-[18%] rounded-lg mr-1 font-medium text-gray-700">${item.stamp_sj_min || '-'}</span>
                    <div class="w-[28%] flex justify-between items-center">
                        <span>${item.id_sj}</span>
                        <span class="font-bold">${item.count}</span>
                    </div>
                    <div class="flex items-center w-[44%]">
                        <span class="ml-1">${item.mkt_name || '-'}</span>
                    </div>
                    <div class="flex items-center gap-1 w-[10%]">
                        <button class="rounded-full w-[32px] h-[32px] bg-blue-600 text-white font-medium py-0 px-0 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                            <i class="bi bi-check-circle-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render detail view
     * @param {string} idSj - SJ ID
     * @param {Array} sjData - SJ data array
     */
    renderDetail(idSj, sjData) {
        const detailContent = document.querySelector(this.selectors.DETAIL_CONTENT);
        
        if (!sjData || sjData.length === 0) {
            detailContent.innerHTML = `<p class="text-red-500">Detail untuk SJ ${idSj} tidak ditemukan.</p>`;
            return;
        }

        const firstItem = sjData[0];
        const detailHTML = this.createDetailHTML(idSj, firstItem, sjData);
        detailContent.innerHTML = detailHTML;
    }

    /**
     * Create HTML for detail view
     * @param {string} idSj - SJ ID
     * @param {Object} firstItem - First item data
     * @param {Array} sjData - All SJ data
     * @returns {string} HTML string
     */
    createDetailHTML(idSj, firstItem, sjData) {
        return `
            <h2 class="text-2xl font-semibold mb-2">${idSj}</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-500">Marketing</p>
                    <p class="text-lg font-bold text-gray-800">${firstItem.mkt_name || '-'}</p>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-500">Waktu Awal</p>
                    <p class="text-lg font-bold text-gray-800">${firstItem.stamp_sj_min || '-'}</p>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-gray-500">Total Item</p>
                    <p class="text-lg font-bold text-gray-800">${sjData.length}</p>
                </div>
            </div>
            
            <h3 class="text-xl font-semibold mt-4 mb-2 border-t pt-4">Daftar Item</h3>
            <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${sjData.map(item => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.sku || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.qty || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.lokasi || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.ket || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}