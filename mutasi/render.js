function renderHistory(dataArray) {
  const container = document.getElementById('historyContainer');
  container.innerHTML = '';

  // Group by ID
  const grouped = dataArray.reduce((acc, item) => {
    if (!acc[item.id]) acc[item.id] = [];
    acc[item.id].push(item);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([id, items]) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'border border-gray-200 rounded-xl p-4 shadow-sm bg-white';

    const header = `
      <div class="flex justify-between items-center mb-4">
        <div class="text-base font-bold text-gray-800">ID: ${id}</div>
        <div class="text-sm text-gray-500">Nama: <span class="font-medium">${items[0].nama}</span></div>
      </div>
    `;

    const histories = items.map(item => `
      <div class="mb-3 px-4 py-3 bg-gray-50 rounded-lg shadow-sm">
        <div class="text-xs text-center text-gray-500 mb-1 font-semibold">${item.jam}</div>
        <div class="flex justify-between text-sm">
          <div class="flex flex-col text-left text-gray-700">
            <span class="font-semibold text-blue-600">${item.lokasi_akhir}</span>
            <span class="text-xs text-gray-500">Helper: ${item.helper}</span>
          </div>
          <div class="flex flex-col text-right text-gray-700">
            <span class="font-semibold text-green-600">${item.lokasi_awal}</span>
            <span class="text-xs text-gray-500">PIC: ${item.pic}</span>
          </div>
        </div>
      </div>
    `).join('');

    groupEl.innerHTML = header + histories;
    container.appendChild(groupEl);
  });
}



const contohData = [
  {
    "jam": "08:15:01",
    "id": "A001",
    "nama": "Barang Alpha",
    "lokasi_awal": "Gudang 1",
    "lokasi_akhir": "Rak A1",
    "pic": "Diar",
    "helper": "Rudi"
  },
  {
    "jam": "08:17:32",
    "id": "A001",
    "nama": "Barang Alpha",
    "lokasi_awal": "Rak A1",
    "lokasi_akhir": "Rak B2",
    "pic": "Diar",
    "helper": "Rudi"
  },
  {
    "jam": "09:05:12",
    "id": "B002",
    "nama": "Barang Beta",
    "lokasi_awal": "Gudang 2",
    "lokasi_akhir": "Rak C1",
    "pic": "Sari",
    "helper": "Deni"
  },
  {
    "jam": "09:08:44",
    "id": "B002",
    "nama": "Barang Beta",
    "lokasi_awal": "Rak C1",
    "lokasi_akhir": "Rak D3",
    "pic": "Sari",
    "helper": "Deni"
  },
  {
    "jam": "10:20:00",
    "id": "C003",
    "nama": "Barang Gamma",
    "lokasi_awal": "Gudang 3",
    "lokasi_akhir": "Rak E1",
    "pic": "Andi",
    "helper": "Budi"
  }
];

// Panggil saat modal ditampilkan
renderHistory(contohData);