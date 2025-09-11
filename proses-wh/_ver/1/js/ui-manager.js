// UI Management and Rendering
import { data, tempData, filterSummary, cariByIdSj, getDtStock } from './data-manager.js';
import { stQrl } from './utils.js';

// Alert management
let alertTimer = null;
let alertCountdown = null;

export function showAlert(message, duration = 3000) {
  const modal = document.getElementById('alertModal');
  const msg = document.getElementById('alertMessage');
  const btnClose = document.getElementById('alertBtn');

  if (!modal || !msg || !btnClose) return;

  // clear timer lama
  if (alertTimer) clearTimeout(alertTimer);
  if (alertCountdown) clearInterval(alertCountdown);

  let timeLeft = Math.ceil(duration / 1000);
  msg.textContent = message;
  btnClose.innerHTML = `<i class="bi bi-x-lg"></i> (${timeLeft})`;

  modal.classList.remove('hidden');
  modal.classList.add('flex', 'opacity-0');

  // fade-in
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('shake');
    setTimeout(() => modal.classList.remove('shake'), 300);
  }, 10);

  // countdown
  alertCountdown = setInterval(() => {
    timeLeft--;
    btnClose.innerHTML = `<i class="bi bi-x-lg"></i> (${timeLeft})`;
    if (timeLeft <= 0) clearInterval(alertCountdown);
  }, 1000);

  // auto close
  alertTimer = setTimeout(() => {
    closeAlert();
    clearInterval(alertCountdown);
  }, duration);

  // tombol close
  btnClose.onclick = () => {
    clearTimeout(alertTimer);
    clearInterval(alertCountdown);
    closeAlert();
  };

  function closeAlert() {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }, 300);
  }
}

// Render functions
export function renderElemenSummary(dataside) {
  const summaryContainer = document.getElementById('summary');
  if (!summaryContainer || !dataside) return;

  const html = Object.values(dataside).map(item => {
    const marketingInfo = data.nmMkt?.find(m => m.id_mkt === String(item.id_mkt));
    const marketingName = marketingInfo?.mkt || 'Unknown';
    
    return `
      <div class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
           data-id-sj="${item.id_sj}" onclick="activateCard('${item.id_sj}')">
        <div class="flex justify-between items-start mb-2">
          <span class="text-sm font-semibold text-blue-600">#${item.id_sj}</span>
          <span class="text-xs text-gray-500">${item.stamp || ''}</span>
        </div>
        <div class="text-sm text-gray-700 mb-1">
          <i class="bi bi-person text-gray-400"></i> ${marketingName}
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-500">${item.jml_item || 0} items</span>
          <div class="flex gap-1">
            ${item.is_online ? '<span class="w-2 h-2 bg-green-500 rounded-full" title="Online"></span>' : ''}
            ${item.is_ekspedisi ? '<span class="w-2 h-2 bg-blue-500 rounded-full" title="Ekspedisi"></span>' : ''}
            ${item.is_retur ? '<span class="w-2 h-2 bg-yellow-500 rounded-full" title="Retur"></span>' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  summaryContainer.innerHTML = html;
}

export function renderJumlahDataSummary() {
  if (!data.dataside) return;

  const allData = Object.values(data.dataside);
  const totalData = allData.length;
  const totalOnline = allData.filter(item => item.is_online).length;
  const totalEkspedisi = allData.filter(item => item.is_ekspedisi).length;
  const totalRetur = allData.filter(item => item.is_retur).length;

  // Update summary counters
  document.getElementById('col1Text').textContent = totalData;
  document.getElementById('col2Text').textContent = totalOnline;
  document.getElementById('col3Text').textContent = totalEkspedisi;
  document.getElementById('col4Text').textContent = totalRetur;

  // Update global counter
  Object.assign(countSumaryData, {
    totalData,
    totalOnline,
    totalOffline: totalData - totalOnline,
    totalRetur,
    totalEkspedisi,
  });
}

export function renderDetailByIdSj(idSj) {
  const detailContainer = document.getElementById('detail');
  if (!detailContainer || !tempData || tempData.length === 0) {
    detailContainer.innerHTML = '<div class="text-center text-gray-500 py-8">Pilih surat jalan untuk melihat detail</div>';
    return;
  }

  const html = `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold text-gray-800">Detail Surat Jalan #${idSj}</h3>
        <span class="text-sm text-gray-500">${tempData[0]?.stamp || ''}</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="text-sm font-medium text-gray-600">Marketing:</label>
          <p class="text-gray-800">${tempData[0]?.mkt || 'Unknown'}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600">Total Items:</label>
          <p class="text-gray-800">${tempData.length}</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">Item</th>
              <th class="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
              <th class="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tempData.map(item => `
              <tr class="hover:bg-gray-50">
                <td class="border border-gray-200 px-4 py-2 text-sm">${item.nama_barang || item.id_stock || 'Unknown'}</td>
                <td class="border border-gray-200 px-4 py-2 text-sm">${item.quantity || item.q || 0}</td>
                <td class="border border-gray-200 px-4 py-2 text-sm">
                  <span class="px-2 py-1 rounded-full text-xs ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }">
                    ${item.status || 'Unknown'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  detailContainer.innerHTML = html;
}

// Filter and render functions
export function renderFiltered(keyword) {
  const filtered = filterSummary(keyword);
  renderElemenSummary(filtered);
  renderJumlahDataSummary();
}

// Modal functions
export function tampilkanPilihanStockLain(id) {
  getDtStock(id, (r) => {
    let html = r
      .map((item) => {
        const outCount =
          item.c == 0
            ? ''
            : `<span class="px-2 py-0.5 bg-red-100 text-red-700 text-lg font-semibold rounded-full shadow-sm border border-red-300">
            <i class="bi bi-arrow-up"></i> ${item.c}
          </span>`;
        return `
        <div class="item border p-2 mb-2 rounded cursor-pointer hover:bg-gray-100 text-lg flex items-center gap-1 flex-wrap item-stock-alternatif"
            data-id="${item.id_stock}" data-id-kain="${item.id_kain}">

          <!-- ID Stock & RTR -->
          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full shadow-sm border border-blue-300">
            #${item.id_stock} <b class='text-red-400'>${
          item.id_rtr == '?' ? '' : 'R'
        }</b>
          </span>

          ${item.ltrl}

          <!-- LTRL & RKKL -->
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full shadow-sm border border-gray-300">
            <i class="bi bi-geo-alt-fill"></i> ${item.rkkl}
          </span>

          <!-- Quantity -->
          <span class="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full shadow-sm border border-green-300">
            ${item.q}
          </span>

          ${outCount}

          <!-- Status -->
          <span class="px-2 py-0.5 font-medium rounded-full shadow-sm
            ${
              item.stts === 'g'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : item.stts === 'e'
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }">
            ${item.stts.toUpperCase()}
          </span>
        </div>`;
      })
      .join('');

    $('#modal-content-layer-2 .list-stock').html(html);
  });
}

export function activateCard(idSj) {
  console.log(`Load Detail ${idSj}`);
  if (!idSj) return;

  // Update query param di URL
  stQrl("idSj", idSj);

  // Ambil data
  Object.assign(tempData, cariByIdSj(idSj));

  // Reset highlight
  document.querySelectorAll("#summary > div").forEach((el) => {
    el.classList.remove("bg-yellow-200", "border", "border-yellow-500");
  });

  // Tambahkan tanda aktif pada card yang sesuai
  const card = document.querySelector(`#summary > div[data-id-sj="${idSj}"]`);
  if (card) {
    card.classList.add("bg-yellow-200", "border", "border-yellow-500");
  }

  // Render detail
  renderDetailByIdSj(idSj);
}