function clearJumlahDataSummary() {
  $('#col1Text').text('');
  $('#col2Text').text('');
  $('#col3Text').text('');
  $('#col4Text').text('');
}

function renderJumlahDataSummary() {
  // console.log("Jumlah Hasil");

  // Reset semua properti ke 0
  countSumaryData.totalData = 0;
  countSumaryData.totalOnline = 0;
  countSumaryData.totalRetur = 0;
  countSumaryData.totalEkspedisi = 0;

  // Gunakan data.hasil_filter jika ada dan tidak kosong, jika tidak gunakan data.dataside
  const sourceData =
    data.hasil_filter && Object.keys(data.hasil_filter).length > 0
      ? data.hasil_filter
      : data.dataside;

  // Loop untuk menghitung
  for (const key in sourceData) {
    const item = sourceData[key];
    countSumaryData.totalData += 1;
    if (item.onoff === 1) countSumaryData.totalOnline += 1;
    if (item.rtr !== 0) countSumaryData.totalRetur += 1;
    if (item.ekspedisi !== 0) countSumaryData.totalEkspedisi += 1;
  }

  // Update tampilan UI
  $('#col1Text').text(countSumaryData.totalData);
  $('#col2Text').text(`${countSumaryData.totalOnline}`);
  $('#col3Text').text(countSumaryData.totalEkspedisi);
  $('#col4Text').text(countSumaryData.totalRetur);

  renderDashboard();

  return countSumaryData; // opsional
}

function gtHlp(param) {
  if (param === undefined || param === null || param === '') return null;

  // cek apakah param angka murni
  if (/^\d+$/.test(param)) {
    const num = Number(param);

    // cari persis
    const exact = data.helper.find((h) => h.id_hlp === num);
    if (exact) return exact;

    // cari terdekat
    return data.helper.reduce((nearest, curr) => {
      return Math.abs(curr.id_hlp - num) < Math.abs(nearest.id_hlp - num)
        ? curr
        : nearest;
    });
  } else {
    // jika string, cari berdasarkan hlp (case-insensitive)
    const lowerParam = String(param).toLowerCase();
    const found = data.helper.filter((h) =>
      h.hlp.toLowerCase().includes(lowerParam)
    );

    return found.length > 0 ? found[0] : null; // hanya ambil yang pertama
  }
}

function prosesDataSJ(url, params, callback) {
  pR(url, params, (e, d) => {
    const grouped = _.chain(d.data)
      .groupBy('id_sj')
      .mapValues((sjGroup) =>
        _.groupBy(sjGroup, (item) => item.id_mkt ?? 'null')
      )
      .value();

    // Pisahkan berdasarkan jumlah id_mkt
    const [singleMkt, multipleMkt] = _.partition(
      Object.entries(grouped),
      ([, mktGroup]) => Object.keys(mktGroup).length === 1
    );

    const singleMktObj = Object.fromEntries(singleMkt);
    const multipleMktObj = Object.fromEntries(multipleMkt);

    const summary = {};

    Object.entries(singleMktObj).forEach(([id_sj, itemsByMkt]) => {
      const id_mkt = Object.keys(itemsByMkt)[0];
      const items = itemsByMkt[id_mkt];

      // Ambil waktu dari stamp_sj
      const stamp_sj_time = (() => {
        const s = items[0]?.stamp_sj;
        if (!s) return '';
        return new Date(s).toTimeString().split(' ')[0];
      })();

      // Hitung status_sj
      const status_sj = (() => {
        const status = {
          d_mgr: items[0]?.d_mgr,
          d_wh: items[0]?.d_wh,
          d_finish: items[0]?.d_finish,
        };
        if (status.d_mgr && !status.d_wh && !status.d_finish) return 1;
        if (status.d_mgr && status.d_wh && !status.d_finish) return 2;
        if (status.d_mgr && status.d_wh && status.d_finish) return 3;
        return 4;
      })();

      // Hitung jumlah properti valid, skip jika rtr/onOff = 0
      const countValid = (key) =>
        items.filter(
          (item) =>
            item[key] != null &&
            item[key] !== '' &&
            !(['rtr', 'onOff'].includes(key) && item[key] === 0)
        ).length;

      summary[id_sj] = {
        id_sj: Number(id_sj),
        id_mkt: Number(id_mkt),
        mkt: cariById(Number(id_mkt)).mkt,
        jml_item: items.length,
        stamp: stamp_sj_time,
        status_sj,
        rtr: countValid('rtr'),
        onoff: countValid('onOff'),
        ekspedisi: countValid('ekspedisi'),
      };
    });

    const res = { raw: d.data, summary, singleMktObj, multipleMktObj };
    if (callback) callback(res);
  });
}

function tentukanStatus(status) {
  const { d_mgr, d_wh, d_finish } = status;

  if (d_mgr && d_wh && d_finish) {
    return 'red-500';
  } else if (!d_finish && d_mgr && d_wh) {
    return 'yellow-400';
  } else if (d_mgr && !d_wh && !d_finish) {
    return 'green-500';
  } else {
    return '';
  }
  return null; // default jika tidak cocok
}

function cekPerPropertiStamp(tglPerItemDetail, jmlData) {
  let hasil = {};
  for (let key in tglPerItemDetail) {
    const total = tglPerItemDetail[key].reduce((a, b) => a + b, 0);
    hasil[key] = total === jmlData;
  }
  return hasil;
}

function renderDetailByIdSj(idSj) {
  const detailContainer = document.getElementById('detail');
  detailContainer.innerHTML = ''; // reset isi

  const dataDetail = cariByIdSj(idSj);

  const jmlData = dataDetail.length;

  if (!dataDetail || dataDetail.length === 0) {
    detailContainer.innerHTML =
      '<p class="text-gray-500 italic">Tidak ada detail untuk SJ ini.</p>';
    return;
  }

  // wrapper utama flex-col, full width
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col border rounded-lg h-[500px] w-full';

  // ========== HEADER ==========
  const header = document.createElement('div');
  header.className = 'flex-shrink-0 w-full';
  header.innerHTML = `
    <div class="flex justify-between items-center border-b border-gray-200 py-1 text-sm bg-gray-50 w-full">
      <span class="text-center text-xl bg-blue-200 w-[6%] font-mono"><i class="bi bi-123"></i></span>
      <span class="text-center text-xl bg-blue-100 w-[33%]"><i class="bi bi-box-seam-fill"></i></span>
      <span class="text-center text-xl bg-blue-200 w-[10%]"><i class="bi bi-person-up"></i></span>
      <span class="text-center text-xl bg-blue-100 w-[4%]"><i class="bi bi-toggles2"></i></span>
      <span class="text-center text-xl bg-blue-200 w-[5%]"><i class="bi bi-hash"></i></span>
      <span class="text-center text-xl bg-blue-100 w-[2%]"><i class="bi bi-arrow-down-up"></i></span>
      <span class="text-center text-xl bg-blue-200 w-[6%]"><i class="bi bi-geo-alt-fill"></i></span>
      <span class="text-center text-xl bg-blue-100 w-[6%]"><i class="bi bi-layers-fill"></i></span>
      <span class="text-center text-xl bg-blue-200 w-[11%]"><i class="bi bi-stack"></i></span>
      <span class="text-center text-xl bg-blue-100 w-[4%]"><i class="bi bi-box-arrow-up"></i></span>
      <span class="text-center text-xl bg-blue-200 w-[13%]"><i class="bi bi-google-play"></i></span>
    </div>
  `;
  wrapper.appendChild(header);

  // ========== CONTENT (scroll, full width) ==========
  const content = document.createElement('div');
  content.className = 'flex-1 overflow-auto w-full';

  let ekspedisiArray = [];
  let stampSjArray = [];

  let tglPerItemDetail = {
    d_mgr: [],
    d_wh: [],
    d_finish: [],
  };

  // console.log("---------------",dataDetail);

  dataDetail.forEach((item) => {
    const habis = item.hapus ? (item.hapus == 1 ? 1 : 0) : 0;

    ekspedisiArray.push(item.ekspedisi ?? '');
    stampSjArray.push(item.stamp_sj ?? '');

    tglPerItemDetail.d_mgr.push(item.d_mgr ? 1 : 0);
    tglPerItemDetail.d_wh.push(item.d_wh ? 1 : 0);
    tglPerItemDetail.d_finish.push(item.d_finish ? 1 : 0);

    const row = document.createElement('div');
    row.className =
      'flex justify-between items-center border-b border-gray-200 py-1 text-sm w-full';
    row.innerHTML = `
      <span class="w-[6%] font-mono">${item.id_stock}${
      item.rtr == 0 ? '' : ' <b>R</b>'
    }</span>
      <span class="w-[33%] truncate">${item.k}</span>
      <span class="w-[10%] truncate">
        <input class="w-full px-1 py-0.5 border border-gray-300 text-xs input-hlp" data-hlp="${
          nmHlp(item.id_hlp) ? nmHlp(item.id_hlp).id_hlp : ''
        }" value="${nmHlp(item.id_hlp) ? nmHlp(item.id_hlp).hlp : ''}">
      </span>
      <span class="text-center w-[4%]">
        <input type="checkbox" class="custom-checkbox" ${
          item.habis == 1 ? 'checked' : item.ge == 'g' ? 'checked' : ''
        } ${item.ge == 'g' ? 'disabled' : ''}/>
      </span>
      <span class="text-center w-[5%]">${item.lot}#${item.rol}</span>
      <span class="text-center w-[2%]">${item.ge}</span>
      <span class="text-center w-[6%]">${item.rak} ${item.kol}</span>
      <span class="w-[6%] px-1">
        <input class="w-full px-1 py-0.5 border border-gray-300 text-xs" 
               value="${item.qty} ${item.q_bs ?? ''}" placeholder="Qty">
      </span>
      <span class="w-[11%] px-1">
        <input class="w-full px-1 py-0.5 border border-gray-300 text-xs" placeholder="Bs">
      </span>
      <span class="text-center w-[4%]">${item.c_o}</span>
      <span class="w-[13%] flex justify-center gap-1">
        <button class="px-1 py-0.5 bg-yellow-600 text-white rounded 
                      hover:bg-yellow-700 active:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition switch-item">
          <i class="bi bi-repeat"></i>
        </button>

        <button class="px-1 py-0.5 bg-red-500 text-white rounded 
                      hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition">
          <i class="bi bi-trash"></i>
        </button>

        <button class="px-1 py-0.5 bg-blue-500 text-white rounded 
                      hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition open-layer-2"
                      data-id-kain="${item.id_kain}">
          <i class="bi bi-copy"></i>
        </button>

        <button onclick="showAlert('${item.notes}',7000)" 
                class="px-1 py-0.5 bg-green-600 text-white rounded 
                      hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 
                      transition ${
                        !item.notes
                          ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 active:bg-gray-400'
                          : ''
                      }" 
                ${!item.notes ? 'disabled' : ''}>
          <i class="bi bi-file-text-fill"></i>
        </button>

      </span>
    `;
    content.appendChild(row);
  });

  // console.log(tentukanStatus(cekPerPropertiStamp(tglPerItemDetail, jmlData)))

  // console.log(tglPerItemDetail);

  wrapper.appendChild(content);

  // ========== FOOTER ==========
  const footer = document.createElement('div');
  footer.className = 'flex-shrink-0 mt-2 text-lg text-gray-600 w-full';

  let hasilGabunganEkspedisi = [
    ...new Set(ekspedisiArray.filter((v) => v && v.trim() !== '')),
  ].join(', ');
  let hasilGabunganStampSj = formatStampRange(stampSjArray);

  footer.innerHTML = `
    ${
      hasilGabunganEkspedisi
        ? `Ekspedisi : <b>${hasilGabunganEkspedisi}</b><br>`
        : ''
    }
    ${hasilGabunganStampSj}
    <hr class="my-2">
    <div class="flex justify-end">
      <button class="px-2 py-1 bg-yellow-300 text-black rounded hover:bg-yellow-400">
        Simpan <i class="bi bi-lock-fill"></i>
      </button>
    </div>
  `;
  wrapper.appendChild(footer);

  // masukkan ke detail
  detailContainer.appendChild(wrapper);
}

function formatStampRange(stampArray) {
  const [minStamp, maxStamp] = getMinMaxStamp(stampArray);

  if (!minStamp) return '';

  const minFormatted = formatTanggalJakarta(minStamp);
  const maxFormatted = formatTanggalJakarta(maxStamp);

  return minStamp === maxStamp
    ? `Stamp SJ : <b>${minFormatted}</b><br>`
    : `Stamp SJ : <b>${minFormatted} ~ ${maxFormatted}</b><br>`;
}

function getMinMaxStamp(stampArray) {
  // Filter unik & valid
  const filtered = [...new Set(stampArray.filter((v) => v && v.trim() !== ''))];

  if (filtered.length === 0) return [];

  // Urutkan berdasarkan waktu
  filtered.sort((a, b) => new Date(a) - new Date(b));

  // Ambil min & max
  return [filtered[0], filtered[filtered.length - 1]];
}

function formatTanggalJakarta(isoString) {
  const options = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('id-ID', options);
  const parts = formatter.formatToParts(new Date(isoString));

  const get = (type) => parts.find((p) => p.type === type)?.value;

  return `${get('day')} ${get('month')} ${get('year')}, ${get('hour')}:${get(
    'minute'
  )} WIB`;
}

function renderElemenSummary(data) {
  clearJumlahDataSummary();
  const container = document.getElementById('summary');
  container.innerHTML = ''; // clear dulu

  // Pastikan data jadi array dan urutkan descending berdasarkan id_sj
  const sortedData = _.sortBy(
    Array.isArray(data) ? data : Object.values(data),
    (item) => Number(item.id_sj)
  ).reverse(); // reverse biar yang paling besar di atas

  // Loop setiap id_sj
  _.forEach(sortedData, (item) => {
    const rtrText = parseInt(item.rtr, 10) === 0 ? 'hidden' : ``;
    const ekspedisiText = parseInt(item.ekspedisi, 10) !== 0 ? '' : 'hidden';
    const onoffText = item.onoff === 1 ? 'green-600' : 'red-600';

    function getStatusClass(status) {
      switch (status) {
        case 1:
          return 'bg-green-500/80 text-black';
        case 2:
          return 'bg-yellow-500/80 text-black';
        case 3:
          return 'bg-red-500/80 text-white';
        case 4:
          return 'bg-blue-600/80 text-white';
        default:
          return 'bg-gray-500/80 text-white';
      }
    }

    const card = document.createElement('div');
    card.className =
      'rounded py-1 px-2 cursor-pointer bg-white hover:bg-blue-200 transition-none';
    card.setAttribute('data-id-sj', item.id_sj); // <-- tambahkan attribute
    const jamMenit = item.stamp.split(':').slice(0, 2).join(':');

    card.innerHTML = `
			<div class="flex items-center w-full">
				<span class="px-2 py-1 rounded-lg mr-1 text-xs font-medium shadow-sm ${getStatusClass(
          item.status_sj
        )}">${jamMenit}</span>

				<span class="w-[25%]">
					${item.id_sj} (<span class="font-bold">${item.jml_item}</span>)
				</span>

				<div class="flex items-center w-[44%]">
					<i class="rounded-full shadow-md bi bi-circle-fill text-${onoffText}"></i>
					<span class="ml-1">${item.mkt}</span>
				</div>

				<div class="flex items-center gap-1 w-[16%]">
					<i class="bi bi-truck px-1 bg-blue-600 border border-gray-900 text-white ${ekspedisiText}"></i>
					<i class="bi bi-recycle px-1 bg-yellow-300 border border-gray-900 ${rtrText}"></i>
				</div>
			</div>
		`;

    // Tambahkan event click
    card.addEventListener('click', function () {
      const idSj = this.getAttribute('data-id-sj');

      // console.log(cariByIdSj(idSj));
      tempData = cariByIdSj(idSj);

      // Hapus tanda aktif dari semua card
      document.querySelectorAll('#summary > div').forEach((el) => {
        el.classList.remove('bg-yellow-200', 'border', 'border-yellow-500');
      });

      // Tambahkan tanda aktif ke card yang diklik
      this.classList.add('bg-yellow-200', 'border', 'border-yellow-500');

      // Render detail
      renderDetailByIdSj(idSj);
    });

    container.appendChild(card);
  });

  renderJumlahDataSummary();

  if (_.isEmpty(sortedData)) {
    container.innerHTML =
      '<p class="text-gray-500 italic">Tidak ada data SJ.</p>';
    clearJumlahDataSummary();
  }
}

function cariData(data, keyword) {
  // pecah keyword jadi kata-kata, kecilkan huruf semua
  let terms = keyword.toLowerCase().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    let target = `${item.ik} ${item.k}`.toLowerCase();
    // cek semua terms ada di target (walau acak urutannya)
    return terms.every((t) => target.includes(t));
  });
}

function reloadFetch() {
  console.log('Reload Fetch');
}

function closeDetail() {
  tempData = {};
  console.log('Close Detail');
  document.querySelectorAll('#summary > div').forEach((el) => {
    el.classList.remove('bg-yellow-200', 'border', 'border-yellow-500');
  });
  renderDashboard();
}

function renderDashboard() {
  const detailContainer = document.getElementById('detail');
  detailContainer.innerHTML = '';

  if (!data.result || !data.result.raw) {
    detailContainer.innerHTML = `
      <div class="flex items-center justify-center h-96">
        <div class="text-center">
          <i class="bi bi-database text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg">Tidak ada data untuk ditampilkan</p>
          <p class="text-gray-400 text-sm">Pilih tanggal atau muat data terlebih dahulu</p>
        </div>
      </div>
    `;
    return;
  }

  const rawData = data.result.raw;
  const analytics = generateAnalytics(rawData);

  detailContainer.innerHTML = `
<div class="space-y-6">

  <!-- Metrics Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
    ${generateMetricCards(analytics)}
  </div>

  <!-- Wrapper overflow agar fit height -->
  <div class="h-[73vh] overflow-y-auto">

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Status Distribution -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <i class="bi bi-pie-chart-fill text-blue-600 mr-2"></i>
          Status Distribusi SJ
        </h3>
        <div id="statusChart" class="space-y-3 mb-8">
          ${generateStatusChart(analytics.statusDistribution)}
        </div>
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <i class="bi bi-truck text-green-600 mr-2"></i>
          Top Ekspedisi
        </h3>
        <div class="space-y-3">
          ${generateEkspedisiList(analytics.ekspedisiStats)}
        </div>
      </div>

      <!--  -->
      <div class="bg-white rounded-xl shadow-lg p-6">
      </div>

      <!--  -->
      <div class="bg-white rounded-xl shadow-lg p-6">
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="bi bi-clock-history text-orange-600 mr-2"></i>
        Aktivitas Terbaru
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left">Waktu</th>
              <th class="px-4 py-2 text-left">SJ</th>
              <th class="px-4 py-2 text-left">Marketing</th>
              <th class="px-4 py-2 text-left">Item</th>
              <th class="px-4 py-2 text-left">Status</th>
              <th class="px-4 py-2 text-left">Ekspedisi</th>
            </tr>
          </thead>
          <tbody>
            ${generateRecentActivity(rawData.slice(0, 10))}
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

  `;
}

function generateAnalytics(rawData) {
  const analytics = {
    totalItems: rawData.length,
    totalSJ: new Set(rawData.map(item => item.id_sj)).size,
    totalMarketing: new Set(rawData.map(item => item.id_mkt)).size,
    statusDistribution: {},
    ekspedisiStats: {},
    efficiency: 0
  };

  // Status distribution
  rawData.forEach(item => {
    const status = getItemStatus(item);
    analytics.statusDistribution[status] = (analytics.statusDistribution[status] || 0) + 1;
  });

  // Ekspedisi stats
  rawData.forEach(item => {
    if (item.ekspedisi && item.ekspedisi.trim()) {
      const ekspedisi = item.ekspedisi.split('|')[0].trim();
      analytics.ekspedisiStats[ekspedisi] = (analytics.ekspedisiStats[ekspedisi] || 0) + 1;
    }
  });

  // Calculate efficiency (finished items / total items)
  const finishedItems = rawData.filter(item => item.d_finish).length;
  analytics.efficiency = Math.round((finishedItems / rawData.length) * 100);

  return analytics;
}

function getItemStatus(item) {
  if (item.d_finish) return 'Selesai';
  if (item.d_wh) return 'Diproses WH';
  if (item.d_mgr) return 'Disetujui SPV';
  return 'Pending';
}

function generateMetricCards(analytics) {
  const metrics = [
    {
      title: 'Item`s',
      value: analytics.totalItems,
      icon: 'bi-box-seam',
      color: 'blue'
    },
    {
      title: 'S.J.',
      value: analytics.totalSJ,
      icon: 'bi-file-earmark-text',
      color: 'green'
    },
    {
      title: 'PIC',
      value: analytics.totalMarketing,
      icon: 'bi-people',
      color: 'purple'
    },
    {
      title: 'Finish',
      value: `${analytics.efficiency}%`,
      icon: 'bi-speedometer2',
      color: 'orange'
    }
  ];

  return metrics.map(metric => `
    <div class="bg-white rounded-xl shadow-lg p-2 hover:shadow-xl transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">${metric.title}</p>
          <p class="text-2xl font-bold text-gray-900">${metric.value}</p>
        </div>
        <div class="w-12 h-12 bg-${metric.color}-100 rounded-lg flex items-center justify-center">
          <i class="${metric.icon} text-${metric.color}-600 text-xl"></i>
        </div>
      </div>
    </div>
  `).join('');
}

function generateStatusChart(statusDistribution) {
  const total = Object.values(statusDistribution).reduce((sum, count) => sum + count, 0);
  const colors = {
    'Selesai': 'bg-red-500',
    'Diproses WH': 'bg-yellow-500',
    'Disetujui SPV': 'bg-green-500',
    'Pending': 'bg-blue-500'
  };

  return Object.entries(statusDistribution).map(([status, count]) => {
    const percentage = Math.round((count / total) * 100);
    return `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center">
          <div class="w-4 h-4 ${colors[status]} rounded mr-3"></div>
          <span class="text-sm text-gray-700">${status}</span>
        </div>
        <div class="flex items-center">
          <div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
            <div class="${colors[status]} h-2 rounded-full" style="width: ${percentage}%"></div>
          </div>
          <span class="text-sm font-medium">${count}</span>
        </div>
      </div>
    `;
  }).join('');
}

function generateEkspedisiList(ekspedisiStats) {
  const sortedEkspedisi = Object.entries(ekspedisiStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return sortedEkspedisi.map(([ekspedisi, count]) => `
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center">
        <i class="bi bi-truck text-blue-600 mr-3"></i>
        <span class="font-medium">${ekspedisi}</span>
      </div>
      <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
        ${count}
      </span>
    </div>
  `).join('');
}

function generateRecentActivity(recentData) {
  return recentData.map(item => {
    const status = getItemStatus(item);
    const statusColors = {
      'Selesai': 'bg-green-100 text-green-800',
      'Diproses WH': 'bg-yellow-100 text-yellow-800',
      'Disetujui SPV': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-red-100 text-red-800'
    };

    const marketing = cariById(item.id_mkt);
    const time = new Date(item.stamp_sj).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <tr class="border-b hover:bg-gray-50">
        <td class="px-4 py-2">${time}</td>
        <td class="px-4 py-2 font-medium">${item.id_sj}</td>
        <td class="px-4 py-2">${marketing ? marketing.mkt : 'Unknown'}</td>
        <td class="px-4 py-2 truncate max-w-xs">${item.k}</td>
        <td class="px-4 py-2">
          <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}">
            ${status}
          </span>
        </td>
        <td class="px-4 py-2 text-sm">${item.ekspedisi || '-'}</td>
      </tr>
    `;
  }).join('');
}

function modalStockLainya(mode) {
  const modal = document.getElementById('layer-2-modal');
  const modalContent = document.getElementById('modal-content-layer-2');
  const modalTitle = modal.querySelector('h2');

  // Set title berdasarkan mode
  if (mode === 'tambah') {
    modalTitle.textContent = 'Tambah Stock Baru';
  } else if (mode === 'switch') {
    modalTitle.textContent = 'Ganti Stock Item';
  }

  // Generate content berdasarkan mode
  let content = '';
  
  if (mode === 'tambah') {
    content = generateTambahStockContent();
  } else if (mode === 'switch') {
    content = generateSwitchStockContent();
  }

  modalContent.innerHTML = content;
  modal.classList.remove('hidden');
}

function generateTambahStockContent() {
  return `
    <div class="space-y-4">
      <!-- Search Bar -->
      <div class="relative">
        <input 
          type="text" 
          id="searchStock" 
          placeholder="Cari berdasarkan nama kain atau kode..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
        <i class="bi bi-search absolute right-3 top-3 text-gray-400"></i>
      </div>

      <!-- Filter Options -->
      <div class="flex gap-2 flex-wrap">
        <button class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 filter-btn" data-filter="all">
          Semua
        </button>
        <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 filter-btn" data-filter="available">
          Tersedia
        </button>
        <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 filter-btn" data-filter="low-stock">
          Stock Rendah
        </button>
      </div>

      <!-- Stock List -->
      <div class="list-stock max-h-[400px] overflow-y-auto space-y-2">
        <div class="text-center py-8 text-gray-500">
          <i class="bi bi-search text-4xl mb-2"></i>
          <p>Gunakan pencarian untuk menemukan stock</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between pt-4 border-t">
        <button class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
          <i class="bi bi-plus-circle mr-2"></i>Stock Baru
        </button>
        <div class="space-x-2">
          <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" id="confirmTambah">
            <i class="bi bi-check-lg mr-2"></i>Tambah Terpilih
          </button>
        </div>
      </div>
    </div>
  `;
}

function generateSwitchStockContent() {
  if (!tempData || tempData.length === 0) {
    return `
      <div class="text-center py-8">
        <i class="bi bi-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
        <p class="text-gray-600">Tidak ada item yang dipilih untuk diganti</p>
        <p class="text-sm text-gray-500">Pilih item dari detail SJ terlebih dahulu</p>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      <!-- Current Item Info -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 class="font-semibold text-yellow-800 mb-2">Item yang akan diganti:</h4>
        <div class="text-sm text-yellow-700">
          <p><strong>ID Stock:</strong> ${tempData[0]?.id_stock}</p>
          <p><strong>Kain:</strong> ${tempData[0]?.k}</p>
          <p><strong>Quantity:</strong> ${tempData[0]?.qty} ${tempData[0]?.ge}</p>
          <p><strong>Lokasi:</strong> ${tempData[0]?.rak} ${tempData[0]?.kol}</p>
        </div>
      </div>

      <!-- Search Replacement -->
      <div class="relative">
        <input 
          type="text" 
          id="searchReplacement" 
          placeholder="Cari pengganti berdasarkan nama kain yang sama..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
        <i class="bi bi-arrow-left-right absolute right-3 top-3 text-gray-400"></i>
      </div>

      <!-- Replacement Options -->
      <div class="list-stock max-h-[350px] overflow-y-auto space-y-2">
        <div class="text-center py-8 text-gray-500">
          <i class="bi bi-arrow-left-right text-4xl mb-2"></i>
          <p>Cari stock pengganti yang sesuai</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end pt-4 border-t space-x-2">
        <button class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700" id="confirmSwitch">
          <i class="bi bi-arrow-left-right mr-2"></i>Ganti Item
        </button>
      </div>
    </div>
  `;
}

// Global Event Handlers
function switchItemHandler() {
  modalStockLainya('switch');
}

function openLayer2Handler() {
  console.log('Listener Layer2');
  const idKain = $(this).data('id-kain');
  $('#layer-2-modal').removeClass('hidden');
  tampilkanPilihanStockLain(idKain);
}

function closeLayer2Handler() {
  $('#layer-2-modal').addClass('hidden');
}

function modalBackdropHandler(e) {
  if (e.target.id === 'layer-2-modal') {
    $('#layer-2-modal').addClass('hidden');
  }
}

function addItemHandler() {
  const idStock = $(this).data('id');
  const idKain = $(this).data('id-kain');
  console.log(idStock, idKain);
}

function helperInputHandler(e) {
  if (e.which === 13) {
    console.log('Enter ditekan, value:', $(this).val());
  }
}

// Initialize all event listeners once
function initializeEventListeners() {
  // Switch Item Listener
  $(document).on('click', '.switch-item', switchItemHandler);

  // Layer 2 Modal Listeners
  $(document).on('click', '.open-layer-2', openLayer2Handler);
  $(document).on(
    'click',
    '#close-layer-2, #close-btn-layer-2',
    closeLayer2Handler
  );
  $(document).on('click', '#layer-2-modal', modalBackdropHandler);

  // Add Items Listener
  $(document).on('click', '.item-stock-alternatif', addItemHandler);

  // Helper Input Listener
  $(document).on('keypress', '.input-hlp', helperInputHandler);
}
