function renderHistory(dataArray) {
  console.log(dataArray);
  if(dataArray == null){
    $('#tabContentBefore').html("Tidak ada Data, Sebelum Jam 12");
    $('#tabContentAfter').html("Tidak ada Data, Setelah Jam 12");
  }else{
    const beforeContainer = document.getElementById('tabContentBefore');
    const afterContainer = document.getElementById('tabContentAfter');
    beforeContainer.innerHTML = '';
    afterContainer.innerHTML = '';

    const groupById = (data) => {
      return data.reduce((acc, item) => {
        if (!acc[item.id]) acc[item.id] = [];
        acc[item.id].push(item);
        return acc;
      }, {});
    };

    // Pisahkan sebelum dan sesudah jam 12
    const isBeforeNoon = item => {
      const [h] = item.jam.split(':').map(Number);
      return h < 12;
    };

    const groupedBefore = groupById(dataArray.filter(isBeforeNoon));
    const groupedAfter = groupById(dataArray.filter(item => !isBeforeNoon(item)));

    const buildGroup = grouped => {
      return Object.entries(grouped).map(([id, items]) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'border border-gray-200 rounded-xl p-2 shadow-sm bg-white';

        const header = `
          <div class="flex justify-between items-center mb-1">
            <div class="text-base font-bold text-gray-800 me-2">${id}</div>
            <div class="text-sm text-gray-500"><span class="font-medium">${items[0].nama}</span></div>
          </div>
        `;

        const histories = items.map(item => `
          <div class="mb-1 px-0 py-1 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div class="text-xs text-center text-red-700 mb-1 font-semibold">${item.jam} <b>(${item.pic})</b></div>
            <div class="flex items-center justify-between text-sm px-3">
              <div class="flex-1 flex justify-start text-blue-600 font-semibold">
                ${item.lokasi_awal}
                <i class="bi bi-arrow-right mx-2"></i>
                <span class="font-semibold text-green-600">${item.lokasi_akhir.rak} ${item.lokasi_akhir.kol}</span>
              </div>
              <div class="text-center px-2">
                <span class="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 mx-2">by</span>
              </div>
              <div class="flex-1 flex justify-end font-bold text-gray-500">
                ${item.helper}
              </div>
            </div>
          </div>
        `).join('');

        groupEl.innerHTML = header + histories;
        return groupEl;
      });
    };

    buildGroup(groupedBefore).forEach(el => beforeContainer.appendChild(el));
    buildGroup(groupedAfter).forEach(el => afterContainer.appendChild(el));
  }
}


/*
function renderHistory(dataArray) {
  const container = document.getElementById('historyContainer');
  container.innerHTML = '';

  // Group by ID
  // const dataArrayX = _.orderBy(dataArray, ['jam'], ['asc']);

  // const grouped = dataArrayX.reduce((acc, item) => {
  const grouped = dataArray.reduce((acc, item) => {
    if (!acc[item.id]) acc[item.id] = [];
    acc[item.id].push(item);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([id, items]) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'border border-gray-200 rounded-xl p-2 shadow-sm bg-white';

    const header = `
      <div class="flex justify-between items-center mb-1">
        <div class="text-base font-bold text-gray-800 me-2">${id}</div>
        <div class="text-sm text-gray-500"><span class="font-medium">${items[0].nama}</span></div>
      </div>
    `;
    
    const histories = items.map(item => `
      <div class="mb-1 px-0 py-1 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div class="text-xs text-center text-red-700 mb-1 font-semibold">${item.jam} <b>(${item.pic})</b></div>
          <div class="flex items-center justify-between text-sm px-3">
            <!-- div a: kiri -->
            <div class="flex-1 flex justify-start text-blue-600 font-semibold">
              ${item.lokasi_awal}
              <i class="bi bi-arrow-right mx-2"></i>
              <span class="font-semibold text-green-600">${item.lokasi_akhir.rak} ${item.lokasi_akhir.kol}</span>
            </div>

            <!-- div b: tengah -->
            <div class="text-center px-2">
              <span class="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 mx-2">by</span>
            </div>

            <!-- div c: kanan -->
            <div class="flex-1 flex justify-end font-bold text-gray-500">
              ${item.helper}
            </div>
          </div>

      </div>
    `).join('');

    groupEl.innerHTML = header + histories;
    container.appendChild(groupEl);
  });
}
*/


/*
dataHistory = [
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
renderHistory(dataHistory);
*/

function formatTanggalWaktu(isoString) {
  const date = new Date(isoString);

  // Sesuaikan ke WIB (UTC+7)
  date.setHours(date.getHours() + 7);

  const pad = n => n.toString().padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // bulan 0–11
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

function gtHistory(tgl){
  fbsSvc.gDt(`/app/mutasi/${tgl}/`, '', (d) => {
    console.log("raw",d);
    $('.tanggal-saja-real').text(tgl);
    if(d){
      const arr = Object.values(d);
      console.log(arr);
      renderHistory(arr);
    }else{
      renderHistory(d);
    }
  })
}

$(function() {
    $('#pilihTanggalHistory').on('change', function() {
      gtHistory($(this).val());
        // console.log("Tanggal dipilih:", );
    });
});