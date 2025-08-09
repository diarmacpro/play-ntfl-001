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
		const rtrText = item.rtr === 0 ? 'Tidak ada retur' : `Retur: ${item.rtr}`;
		const ekspedisiText = item.ekspedisi === 1 ? 'Ekspedisi ON' : 'Ekspedisi OFF';
		const onoffText = item.onoff === 1 ? 'On' : 'Off';
		
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
		card.className = 'border rounded p-4 shadow hover:shadow-lg transition cursor-pointer bg-white';


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
			<div class="flex justify-between items-center mb-2">
				<h3 class="font-semibold text-lg">SJ ID: ${item.id_sj}</h3>
				<span class="text-sm text-gray-500">${item.stamp}</span>
			</div>
			<p>Marketing ID: <strong>${item.id_mkt}</strong></p>
			<p>Jumlah Item: <strong>${item.jml_item}</strong></p>
			<i data-lucide="circle" class="text-green-600 fill-current"></i>
			<p>${rtrText}</p>
			<p>Status On/Off: <strong>${onoffText}</strong></p>
			<p>${ekspedisiText}</p>
		`;

		container.appendChild(card);
	});

	if (_.isEmpty(data)) {
		container.innerHTML = '<p class="text-gray-500 italic">Tidak ada data SJ.</p>';
	}
}

// Contoh pemanggilan (asumsi hasil sudah ada di variabel `result`):
// 