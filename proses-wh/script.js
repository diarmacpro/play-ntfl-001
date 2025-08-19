function gtHlp(param) {
  if (param === undefined || param === null || param === '') return null;

  // cek apakah param angka murni
  if (/^\d+$/.test(param)) {
    const num = Number(param);

    // cari persis
    const exact = data.helper.find(h => h.id_hlp === num);
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
    const found = data.helper.filter(h => h.hlp.toLowerCase().includes(lowerParam));

    return found.length > 0 ? found[0] : null; // hanya ambil yang pertama
  }
}



function prosesDataSJ(url, params, callback) {
	pR(url, params, (e, d) => {
		const grouped = _.chain(d.data)
			.groupBy('id_sj')
			.mapValues(sjGroup =>
				_.groupBy(sjGroup, item => item.id_mkt ?? 'null')
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
					d_finish: items[0]?.d_finish
				};
				if (status.d_mgr && !status.d_wh && !status.d_finish) return 1;
				if (status.d_mgr && status.d_wh && !status.d_finish) return 2;
				if (status.d_mgr && status.d_wh && status.d_finish) return 3;
				return 4;
			})();

			// Hitung jumlah properti valid, skip jika rtr/onOff = 0
			const countValid = (key) =>
				items.filter(item =>
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
				ekspedisi: countValid('ekspedisi')
			};
		});

		const res = { raw:d.data, summary, singleMktObj, multipleMktObj };
		if (callback) callback(res);
	});
}

function tentukanStatus(status) {
  const { d_mgr, d_wh, d_finish } = status;

  if (d_mgr && d_wh && d_finish) {
    return "red-500";
  } else if (!d_finish && d_mgr && d_wh) {
    return "yellow-400";
  } else if (d_mgr && !d_wh && !d_finish) {
    return "green-500";
  } else {
		return "";
	}
  return null; // default jika tidak cocok
}

function cekPerPropertiStamp(tglPerItemDetail, jmlData) {
  let hasil = {};
  for (let key in tglPerItemDetail) {
    const total = tglPerItemDetail[key].reduce((a, b) => a + b, 0);
    hasil[key] = (total === jmlData);
  }
  return hasil;
}

function renderDetailByIdSj(idSj) {
  const detailContainer = document.getElementById('detail');
  detailContainer.innerHTML = ''; // reset isi

  const dataDetail = cariByIdSj(idSj);

	const jmlData = dataDetail.length;

  if (!dataDetail || dataDetail.length === 0) {
    detailContainer.innerHTML = '<p class="text-gray-500 italic">Tidak ada detail untuk SJ ini.</p>';
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
	d_finish: []
	};

  // console.log("---------------",dataDetail);

  dataDetail.forEach(item => {
    const habis = item.hapus ? (item.hapus == 1 ? 1 : 0) : 0;

    ekspedisiArray.push(item.ekspedisi ?? '');
    stampSjArray.push(item.stamp_sj ?? '');

		tglPerItemDetail.d_mgr.push(item.d_mgr ? 1 : 0);
		tglPerItemDetail.d_wh.push(item.d_wh ? 1 : 0);
		tglPerItemDetail.d_finish.push(item.d_finish ? 1 : 0);
     
    const row = document.createElement('div');
    row.className = 'flex justify-between items-center border-b border-gray-200 py-1 text-sm w-full';
    row.innerHTML = `
      <span class="w-[6%] font-mono">${item.id_stock}${item.rtr == 0 ? '' : ' <b>R</b>'}</span>
      <span class="w-[33%] truncate">${item.k}</span>
      <span class="w-[10%] truncate">
        <input class="w-full px-1 py-0.5 border border-gray-300 text-xs input-hlp" data-hlp="${nmHlp(item.id_hlp) ? nmHlp(item.id_hlp).id_hlp : ''}" value="${nmHlp(item.id_hlp) ? nmHlp(item.id_hlp).hlp : ''}">
      </span>
      <span class="text-center w-[4%]">
        <input type="checkbox" class="custom-checkbox" ${item.habis == 1 ? 'checked' : (item.ge == 'g' ? 'checked' : '')} ${item.ge == 'g' ? 'disabled' : ''}/>
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
                      hover:bg-yellow-700 active:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition">
          <i class="bi bi-repeat"></i>
        </button>

        <button class="px-1 py-0.5 bg-red-500 text-white rounded 
                      hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition">
          <i class="bi bi-trash"></i>
        </button>

        <button class="px-1 py-0.5 bg-green-500 text-white rounded 
                      hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition open-layer-2"
                      data-id-kain="${item.id_kain}">
          <i class="bi bi-plus-lg"></i>
        </button>

        <button onclick="showAlert('${item.notes}',7000)" 
                class="px-1 py-0.5 bg-blue-600 text-white rounded 
                      hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 
                      transition ${!item.notes ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 active:bg-gray-400' : ''}" 
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

  let hasilGabunganEkspedisi = [...new Set(ekspedisiArray.filter(v => v && v.trim() !== ''))].join(', ');
  let hasilGabunganStampSj = formatStampRange(stampSjArray);

  footer.innerHTML = `
    ${hasilGabunganEkspedisi ? `Ekspedisi : <b>${hasilGabunganEkspedisi}</b><br>` : ''}
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

  listenerLayer2();
}


function formatStampRange(stampArray) {
  const [minStamp, maxStamp] = getMinMaxStamp(stampArray);

  if (!minStamp) return '';

  const minFormatted = formatTanggalJakarta(minStamp);
  const maxFormatted = formatTanggalJakarta(maxStamp);

  return (minStamp === maxStamp)
    ? `Stamp SJ : <b>${minFormatted}</b><br>`
    : `Stamp SJ : <b>${minFormatted} ~ ${maxFormatted}</b><br>`;
}

function getMinMaxStamp(stampArray) {
  // Filter unik & valid
  const filtered = [...new Set(
    stampArray.filter(v => v && v.trim() !== '')
  )];

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
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('id-ID', options);
  const parts = formatter.formatToParts(new Date(isoString));

  const get = type => parts.find(p => p.type === type)?.value;

  return `${get('day')} ${get('month')} ${get('year')}, ${get('hour')}:${get('minute')} WIB`;
}

function renderElemenSummary(data) {
	const container = document.getElementById('summary');
	container.innerHTML = ''; // clear dulu

	// Pastikan data jadi array dan urutkan descending berdasarkan id_sj
	const sortedData = _.sortBy(
		Array.isArray(data) ? data : Object.values(data),
		item => Number(item.id_sj)
	).reverse(); // reverse biar yang paling besar di atas

	// Loop setiap id_sj
	_.forEach(sortedData, (item) => {
		const rtrText = parseInt(item.rtr,10) === 0 ? 'hidden' : ``;
		const ekspedisiText = parseInt(item.ekspedisi,10) !== 0 ? '' : 'hidden';
		const onoffText = item.onoff === 1 ? 'green-600' : 'red-600';
		
function getStatusClass(status) {
  switch (status) {
    case 1: return "bg-green-500/80 text-black";
    case 2: return "bg-yellow-500/80 text-black";
    case 3: return "bg-red-500/80 text-white";
    case 4: return "bg-blue-600/80 text-white";
    default: return "bg-gray-500/80 text-white";
  }
}

		const card = document.createElement('div');
		card.className = 'rounded py-1 px-2 cursor-pointer bg-white hover:bg-blue-200 transition-none';
		card.setAttribute('data-id-sj', item.id_sj); // <-- tambahkan attribute
		const jamMenit = item.stamp.split(':').slice(0, 2).join(':');

		card.innerHTML = `
			<div class="flex items-center w-full">
				<span class="px-2 py-1 rounded-lg mr-1 text-xs font-medium shadow-sm ${getStatusClass(item.status_sj)}">${jamMenit}</span>

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
			document.querySelectorAll('#summary > div').forEach(el => {
				el.classList.remove('bg-yellow-200', 'border', 'border-yellow-500');
			});

			// Tambahkan tanda aktif ke card yang diklik
			this.classList.add('bg-yellow-200', 'border', 'border-yellow-500');

			// Render detail
			renderDetailByIdSj(idSj);
		});


		container.appendChild(card);
	});

	if (_.isEmpty(sortedData)) {
		container.innerHTML = '<p class="text-gray-500 italic">Tidak ada data SJ.</p>';
	}
}

