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

function renderDetailByIdSj(idSj) {
    const detailContainer = document.getElementById('detail');
    detailContainer.innerHTML = ''; // bersihkan isi

    const dataDetail = cariByIdSj(idSj);

    if (!dataDetail || dataDetail.length === 0) {
        detailContainer.innerHTML = '<p class="text-gray-500 italic">Tidak ada detail untuk SJ ini.</p>';
        return;
    }

    const headerDetail = `
        <div class="flex justify-between items-center border-b border-gray-200 py-1 text-sm">
            <span class="w-[6%] font-mono">Id</span>
            <span class="w-[33.5%]">Barang</span>
            <span class="w-[10%]">Helper</span>
            <span class="w-[2.5%]">Hbs</span>
            <span class="w-[4%]">Lt#Rl</span>
            <span class="w-[6%]">Q|Bs</span>
            <span class="w-[2%]"><i class="bi bi-arrow-down-up"></i></span>
            <span class="w-[5%]">Loc</span>
            <span class="w-[6%]">Ekspd</span>
            <span class="w-[4%]">Note</span>
            <span class="w-[4%] text-center"><i class="bi bi-box-arrow-up"></i></span>
            <span class="w-[9%]">Aksi</span>
        </div>
    `;

    // Masukkan header
    detailContainer.insertAdjacentHTML('beforeend', headerDetail);

    // Masukkan setiap row
    dataDetail.forEach(item => {
        const row = document.createElement('div');
        row.className = 'flex justify-between items-center border-b border-gray-200 py-1 text-sm';

        row.innerHTML = `
            <span class="border-r border-gray-300 w-[6%] font-mono">${item.id_stock}${item.rtr == 0 ? '' : ' <b>R</b>'}</span>
            <span class="border-r border-gray-300 w-[33.5%]">${item.k}</span>
            <span class="border-r border-gray-300 w-[10%]">${item.id_hlp ?? ''}</span>
            <span class="border-r border-gray-300 w-[2.5%] text-center">
                <label class="inline-flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600 rounded">
                </label>
            </span>
            <span class="border-r border-gray-300 w-[4%]">${item.lot}#${item.rol}</span>
            <span class="border-r border-gray-300 w-[6%]">${item.qty} ${item.q_bs ?? ''}</span>
            <span class="border-r border-gray-300 w-[2%] text-center">${item.ge}</span>
            <span class="border-r border-gray-300 w-[5%]">${item.rak} ${item.kol}</span>
            <span class="border-r border-gray-300 w-[6%]">${item.ekspedisi}</span>
            <span class="border-r border-gray-300 w-[4%]">${item.notes}</span>
            <span class="border-r border-gray-300 w-[4%] text-center">${item.c_o}</span>
            <span class="w-[9%]">
                <div class="flex gap-1">
                    <button class="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-yellow-600">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                </div>
            </span>
        `;

        detailContainer.appendChild(row);
    });
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
		
		function getStatusColor(status) {
			switch (status) {
				case 1: return 'green';
				case 2: return 'yellow';
				case 3: return 'red';
				case 4: return 'black';
				default: return 'gray';
			}
		}

		const card = document.createElement('div');
		card.className = 'rounded py-1 px-2 cursor-pointer bg-white hover:bg-blue-200 transition-colors duration-300';
		card.setAttribute('data-id-sj', item.id_sj); // <-- tambahkan attribute
		const jamMenit = item.stamp.split(':').slice(0, 2).join(':');

		card.innerHTML = `
			<div class="flex items-center w-full">
				<span class="text-sm text-gray-500 w-[15%]">${jamMenit}</span>

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
			// const hasil = cariByIdSj(idSj);
			
    	renderDetailByIdSj(idSj);
			console.log('Klik data ID SJ:', idSj, '=>', hasil);
		});

		container.appendChild(card);
	});

	if (_.isEmpty(sortedData)) {
		container.innerHTML = '<p class="text-gray-500 italic">Tidak ada data SJ.</p>';
	}
}

