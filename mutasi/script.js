function logout(){
	console.log("Logout");
	delFromLocalStorage('z');
	location.reload();
}

function history(){
	console.log("History");
}

function mulaiInisiasiData() {
	console.log('🔄 Proses inisialisasi dimulai...');
}

function selesaiInisiasiData() {
	console.log('✅ Semua data berhasil diinisialisasi.');
}

function errorInisiasiData(error) {
	console.error('❌ Terjadi kesalahan saat inisialisasi:', error);
}

function parInisiasiData(nama) {
	console.log(`✅ Data ${nama.toLowerCase()} selesai`);
}

function inisiasiData(callback) {
	mulaiInisiasiData();

	let selesai = 0;
	const total = 5; // tambahkan jadi 5 karena ada 5 proses
	let gagal = false;

	function cekSelesai() {
		selesai++;
		if (selesai === total && !gagal) {
			if (typeof callback === 'function') {
				callback(data);
			}
			selesaiInisiasiData();
		}
	}

	function tanganiError(err) {
		if (!gagal) {
			gagal = true;
			console.error('Gagal inisiasi:', err);
			errorInisiasiData(err);
		}
	}

	fbsSvc.gDt('/app/data/helper', '', (d) => {
		try {
			data['helper'] = transformData(d, { id_hlp: 'i', hlp: 'v' }, { stts: 1 });
			parInisiasiData("Helper");
			cekSelesai();
		} catch (e) {
			tanganiError(e);
		}
	}, tanganiError);

	fbsSvc.gDt('/app/data/rak', '', (d) => {
		try {
			data['rak'] = Object.values(d);
			parInisiasiData("Rak");
			cekSelesai();
		} catch (e) {
			tanganiError(e);
		}
	}, tanganiError);

	fbsSvc.gDt('/app/data/kol', '', (d) => {
		try {
			data['kol'] = Object.values(d);
			parInisiasiData("Kol");
			cekSelesai();
		} catch (e) {
			tanganiError(e);
		}
	}, tanganiError);

	fbsSvc.gDt('/layer2', '', (d) => {
		try {
			data['layer2'] = _.chain(d)
				.flatMap()
				.filter(v => v != null)
				.uniq()
				.value();
			parInisiasiData("Layer2");
			cekSelesai();
		} catch (e) {
			tanganiError(e);
		}
	}, tanganiError);

	fbsSvc.gDt('/kain', '', (d) => {
		try {
			data['kain'] = _.flatMap(d, arr =>
				arr.map(o => _.pick(o, ['ik', 'jns', 'k', 's']))
			);
			parInisiasiData("Kain");
			cekSelesai();
		} catch (e) {
			tanganiError(e);
		}
	}, tanganiError);
}

function transformData(data, mapKeyVal = null, filterKeyVal = null) {
	const result = [];

	for (const key in data) {
		const item = data[key];

		// Jika filter ada, cek apakah semua key dan value dalam filter cocok
		if (filterKeyVal) {
			const isMatch = Object.entries(filterKeyVal).every(
				([filterKey, filterValue]) => item[filterKey] === filterValue
			);
			if (!isMatch) continue;
		}

		// Mapping nilai ke objek baru
		if (mapKeyVal) {
			const mapped = {};
			for (const [sourceKey, targetKey] of Object.entries(mapKeyVal)) {
				mapped[targetKey] = item[sourceKey];
			}
			result.push(mapped);
		} else {
			// Kalau tidak ada mapKeyVal, gunakan item asli
			result.push(item);
		}
	}

	return result;
}

function cariTerdekat(arr, q) {
    q = String(q).toLowerCase();

    function getScore(entry) {
        const iStr = String(entry.i || '').toLowerCase();
        const vStr = String(entry.v || '').toLowerCase();

        if (!iStr && !vStr) return 0; // abaikan data kosong/null

        let score = 0;

        if (iStr === q || vStr === q) return 100;

        if (vStr.startsWith(q)) score += 80;
        else if (vStr.includes(q)) score += 60;
        else {
            let penalty = Math.abs(vStr.length - q.length);
            score += Math.max(0, 50 - penalty * 5);
        }

        if (iStr.includes(q)) score += 20;

        return score;
    }

    const hasil = arr
        .map(item => ({ item, score: getScore(item) }))
        .filter(d => d.score > 0)
        .sort((a, b) => b.score - a.score);

    // Kembalikan null jika tidak ada satupun item yang mengandung huruf q
    const adaHurufQ = hasil.some(({ item }) => {
        const allStr = `${item.i || ''}${item.v || ''}`.toLowerCase();
        return allStr.includes(q);
    });

    return adaHurufQ && hasil.length ? hasil[0].item : null;
}

function cariLokasi(input, data) {
  const rakList = data.rak || [];
  const kolList = data.kol || [];

  const clean = input.replace(/\s+/g, '').toUpperCase();

  const angka = clean.match(/\d+/g) || [];
  const huruf = clean.match(/[A-Z]+/g) || [];

  if (angka.length === 0 || huruf.length === 0) return null;

  const candidates = [];

  angka.forEach(num => {
    huruf.forEach(char => {
      candidates.push({ rak: num, kol: char }); // angka tetap string
    });
  });

  for (let c of candidates) {
    const rakObj = rakList.find(r => String(parseInt(r.v,10)) === c.rak);
    const kolObj = kolList.find(k => String(k.v).toUpperCase() === c.kol);
    if (rakObj && kolObj) {
      return { rak: rakObj, kol: kolObj };
    }
  }

  return null;
}


function cariDataKainDariStock(id) {
  // console.log(id);

  const dtStock = data.layer2.find(d => d.id_stock == id);
  console.log(dtStock);

  if (!dtStock) {
    console.warn('Data stock tidak ditemukan untuk id', id);
    return null;
  }

  const dtKain = data.kain.find(d => d.ik == dtStock.id_kain);
  // console.log(dtKain);

  if (!dtKain) {
    console.warn('Data kain tidak ditemukan untuk id_kain', dtStock.id_kain);
    return null;
  }

  const hasil = {
    id_stock:dtStock.id_stock,
    id_kain:dtStock.id_kain,
    ltrl:dtStock.ltrl,
    rkkl:dtStock.rkkl,
    q:dtStock.q,
    q_o:dtStock.q_o === "null" ? 0 : dtStock.q_o,
    stts:dtStock.stts,
    k:dtKain.k,
    j:dtKain.jns,
    s:dtKain.s
  };

  // console.log(hasil);
  return hasil;
}


function pecahNamaKain(k, j) {
  // 1. Pisahkan j berdasarkan underscore
  const potonganJ = j.split('_'); // contoh: ['cvc', '24s']

  // 2. Normalisasi potonganJ ke huruf kecil agar pencarian di k konsisten
  const potonganJLower = potonganJ.map(x => x.toLowerCase());

  // 3. Tokenisasi k
  const tokenK = k.split(' ');

  // 4. Pisahkan bagian yang cocok dengan j dan sisanya
  const bagianTerambil = [];
  const bagianSisa = [];

  for (const token of tokenK) {
    const tokenLower = token.toLowerCase();
    if (potonganJLower.some(pj => tokenLower.includes(pj))) {
      bagianTerambil.push(token);
    } else {
      bagianSisa.push(token);
    }
  }

  return {
    j: j,
    k_awal: k,
    k_terambil: bagianTerambil.join(' ').trim(),
    k_sisa: bagianSisa.join(' ').trim()
  };
}