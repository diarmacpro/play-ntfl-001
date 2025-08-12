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
		// console.log(res);
		// return res;
	});
}

function renderElemenSummary(data) {
	const container = document.getElementById('summary');
	container.innerHTML = ''; // clear dulu

	// Loop setiap id_sj
	_.forEach(data, (item, key) => {
		// Buat elemen ringkasan untuk satu SJ
		const rtrText = item.rtr === 0 ? 'hidden' : ``;
		const ekspedisiText = item.ekspedisi === 1 ? '' : 'hidden';
		const onoffText = item.onoff === 1 ? 'green-600' : 'red-600';
		
		function getStatusColor(status) {
			switch (status) {
				case 1: return 'green';   // hijau
				case 2: return 'yellow';  // kuning
				case 3: return 'red';     // merah
				case 4: return 'black';   // hitam
				default: return 'gray';
			}
		}
		// Card container
		const card = document.createElement('div');
		card.className = 'rounded py-1 px-2 cursor-pointer bg-white hover:bg-blue-200 transition-colors duration-300';
    const jamMenit = item.stamp.split(':').slice(0, 2).join(':');

        // "id_sj": 46577,
        // "id_mkt": 16,
        // "jml_item": 1,
        // "stamp": "13:46:50",
        // "status_sj": 1,
        // "rtr": 0,
        // "onoff": 1,
        // "ekspedisi": 1

		// Isi card
		card.innerHTML = `
      <div class="flex items-center w-full">
        <span class="text-sm text-gray-500 w-[15%]">${jamMenit}</span>

        <span class="w-[25%]">
          ${item.id_sj} (<span class="font-bold">${item.jml_item}</span>)
        </span>

        <div class="flex items-center w-[44%]">
          <i class="rounded-full shadow-md bi bi-circle-fill text-${onoffText}"></i>
          <span class="ml-1">${cariById(item.id_mkt).mkt}</span>
        </div>

        <div class="flex items-center gap-1 w-[16%]">
          <i class="bi bi-truck px-1 bg-blue-600 border border-gray-900 text-white ${ekspedisiText}"></i>
          <i class="bi bi-recycle px-1 bg-yellow-300 border border-gray-900 ${rtrText}"></i>
        </div>
      </div>

		`;

		container.appendChild(card);
	});

	if (_.isEmpty(data)) {
		container.innerHTML = '<p class="text-gray-500 italic">Tidak ada data SJ.</p>';
	}
}

// Contoh pemanggilan (asumsi hasil sudah ada di variabel `result`):
// 