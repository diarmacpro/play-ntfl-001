function renderHistory(dataArray) {
  const container = document.getElementById('historyContainer');
  container.innerHTML = '';

  // Group by ID
  const grouped = dataArray.reduce((acc, item) => {
    if (!acc[item.id]) acc[item.id] = [];
    acc[item.id].push(item);
    return acc;
  }, {});

  // Render per grup ID
  Object.entries(grouped).forEach(([id, items]) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'border border-gray-300 rounded-xl p-4 shadow-sm bg-white';

    // Judul Grup
    const header = `
      <div class="flex justify-between items-center mb-2">
        <div class="text-lg font-bold text-gray-800">ID: ${id}</div>
        <div class="text-sm text-gray-500">Nama: <span class="font-medium">${items[0].nama}</span></div>
      </div>
      <hr class="mb-3">
    `;

    const histories = items.map(item => `
      <div class="border-b border-gray-200 py-2 text-sm text-gray-700">
        <div class="flex justify-between flex-wrap">
          <span class="font-mono text-blue-600">${item.jam}</span>
          <span>Lokasi Awal: <span class="font-semibold">${item.lokasi_awal}</span></span>
          <span>Lokasi Akhir: <span class="font-semibold">${item.lokasi_akhir}</span></span>
        </div>
        <div class="flex justify-between mt-1 text-xs text-gray-600">
          <span>PIC: <span class="font-semibold">${item.pic}</span></span>
          <span>Helper: <span class="font-semibold">${item.helper}</span></span>
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