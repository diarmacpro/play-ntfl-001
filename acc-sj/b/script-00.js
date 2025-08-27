// script-0.js

let fbsSvc0, fbsSvc1, fbsSvc2;
let allSjData = {}; // penyimpan semua data SJ

// Utility: groupBy
function groupBy(arr, key) {
    return arr.reduce((acc, obj) => {
        const value = obj[key];
        (acc[value] = acc[value] || []).push(obj);
        return acc;
    }, {});
}

// Render Summary List
function renderSummaryList(data) {
    const summaryList = document.getElementById('summaryList');
    const loadingMessage = document.getElementById('loadingMessage');
    const noDataMessage = document.getElementById('noDataMessage');

    loadingMessage.classList.add('hidden');

    if (data.length === 0) {
        noDataMessage.classList.remove('hidden');
        return;
    }

    noDataMessage.classList.add('hidden');
    summaryList.innerHTML = '';

    data.forEach(item => {
        const listItem = document.createElement('div');
        listItem.innerHTML = `
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

        const container = listItem.firstElementChild;

        // klik list kecuali tombol
        container.addEventListener('click', e => {
            if (!e.target.closest('button')) {
                showDetail(item.id_sj);
            }
        });

        summaryList.appendChild(container);
    });
}

// Render Detail
function showDetail(idSj) {
    console.log(`Fungsi showDetail dipanggil untuk ID SJ: ${idSj}`);

    const detailContent = document.getElementById('detailContent');
    const selectedSj = allSjData[idSj];

    if (selectedSj && selectedSj.length > 0) {
        const firstItem = selectedSj[0];
        const detailsHtml = `
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
                    <p class="text-lg font-bold text-gray-800">${selectedSj.length}</p>
                </div>
            </div>
            
            <h3 class="text-xl font-semibold mt-4 mb-2 border-t pt-4">Daftar Item</h3>
            <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${selectedSj.map(item => `
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
        detailContent.innerHTML = detailsHtml;
        console.log("Detail Data:", selectedSj);
    } else {
        detailContent.innerHTML = `<p class="text-red-500">Detail untuk SJ ${idSj} tidak ditemukan.</p>`;
    }
}

// Load Data dari Firebase + API
function fetchAndRenderRawData() {
    let userMap = {};

    fbsSvc2.gDt('user', '', (userData) => {
        for (const key in userData) {
            if (Object.hasOwnProperty.call(userData, key)) {
                const user = userData[key];
                userMap[user.id_mkt] = user.mkt;
            }
        }

        gtResponseApi('https://app.weva.my.id/api/data-sj-awal', { id_sj: true }, (d) => {
            if (!d || !d.data || d.data.length === 0) {
                console.log('Tidak ada data yang ditemukan.');
                renderSummaryList([]);
                return;
            }

            const groupedData = groupBy(d.data, 'id_sj');
            const summaryData = {};

            allSjData = {};

            for (const idSj in groupedData) {
                if (Object.hasOwnProperty.call(groupedData, idSj)) {
                    const items = groupedData[idSj];
                    const count = items.length;
                    const firstIdMkt = items[0].id_mkt;

                    let minTimestamp = null;
                    items.forEach(item => {
                        const itemFullTime = item.stamp_sj.split(' ')[1];
                        if (!minTimestamp || itemFullTime < minTimestamp) {
                            minTimestamp = itemFullTime;
                        }
                        item.mkt_name = userMap[item.id_mkt] || item.id_mkt;
                    });

                    const formattedTime = minTimestamp ? minTimestamp.substring(0, 5) : null;
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

            const summaryArray = Object.values(summaryData);

            summaryArray.sort((a, b) => {
                if (a.stamp_sj_min < b.stamp_sj_min) return -1;
                if (a.stamp_sj_min > b.stamp_sj_min) return 1;
                return 0;
            });

            renderSummaryList(summaryArray);

        }, (error) => {
            console.error('Error saat mengambil data SJ:', error);
            document.getElementById('loadingMessage').classList.add('hidden');
            alert('Gagal mengambil data dari API.');
        });
    }, (error) => {
        console.error('Error saat mengambil data user:', error);
        document.getElementById('loadingMessage').classList.add('hidden');
        alert('Gagal mengambil data user.');
    });
}

// Init
$(function () {
    fbsSvc0 = new Fbs(db0);
    fbsSvc1 = new Fbs(db1);
    fbsSvc2 = new Fbs(db2);

    fetchAndRenderRawData();
});

// Ekspor ke global supaya bisa dipakai langsung dari HTML/console
window.showDetail = showDetail;
window.renderSummaryList = renderSummaryList;
window.fetchAndRenderRawData = fetchAndRenderRawData;
