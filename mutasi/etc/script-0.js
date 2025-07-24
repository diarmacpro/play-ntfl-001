function mulaiInisiasiData() {
	console.log('🔄 Proses inisialisasi dimulai...');
}

function selesaiInisiasiData() {
	console.log('✅ Semua data berhasil diinisialisasi.');
}

function errorInisiasiData(error) {
	console.error('❌ Terjadi kesalahan saat inisialisasi:', error);
}

function inisiasiData(callback) {
	mulaiInisiasiData(); // Notifikasi awal inisiasi dimulai

	let selesai = 0;
	const total = 4;
	let gagal = false;

	function cekSelesai() {
		selesai++;
		if (selesai === total && !gagal) {
			if (typeof callback === 'function') {
				callback(data);
			}
			selesaiInisiasiData(); // Sukses semua
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
			cekSelesai();
		} catch (e) {
			tanganiError(e);
		}
	}, tanganiError);

	fbsSvc.gDt('/app/data/rak', '', (d) => {
		try {
			data['rak'] = Object.values(d);
			cekSelesai();
		} catch (e) {
			tanganiError(e);
		}
	}, tanganiError);

	fbsSvc.gDt('/app/data/kol', '', (d) => {
		try {
			data['kol'] = Object.values(d);
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

/*
function cariTerdekat(arr, q) {
    q = String(q).toLowerCase();

    // Fungsi hitung skor kemiripan
    function getScore(entry) {
        const iStr = String(entry.i).toLowerCase();
        const vStr = String(entry.v).toLowerCase();

        // Semakin kecil jarak, semakin tinggi skor
        let score = 0;

        if (iStr === q || vStr === q) return 100; // perfect match
        if (vStr.startsWith(q)) score += 80;
        else if (vStr.includes(q)) score += 60;
        else {
            // penalti per beda karakter
            let penalty = Math.abs(vStr.length - q.length);
            score += Math.max(0, 50 - penalty * 5);
        }

        // Bonus jika i juga mirip
        if (iStr.includes(q)) score += 20;

        return score;
    }

    const hasil = arr
        .map(item => ({ item, score: getScore(item) }))
        .sort((a, b) => b.score - a.score)
        .filter(d => d.score > 0); // hanya yang punya skor positif

    return hasil.length ? hasil[0].item : null;
}
*/

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

/*
function cariLokasi(input, data) {
  const rakList = Object.values(data.rak || []);
  const kolList = Object.values(data.kol || []);

  const clean = input.replace(/\s+/g, '').toUpperCase(); // hapus spasi & uppercase

  const angka = clean.match(/\d+/g) || [];     // ambil semua angka
  const huruf = clean.match(/[A-Z]+/g) || [];  // ambil semua huruf

  if (angka.length === 0 || huruf.length === 0) return null;

  // kombinasi mungkin: [angka, huruf] atau [huruf, angka]
  const candidates = [];

  angka.forEach(num => {
    huruf.forEach(char => {
      candidates.push({ rak: parseInt(num), kol: char });
    });
  });

  // coba cari kombinasi valid
  for (let c of candidates) {
    const rakObj = rakList.find(r => String(r.i) === String(c.rak));
    const kolObj = kolList.find(k => String(k.v).toUpperCase() === c.kol);
    if (rakObj && kolObj) {
      return { rak: rakObj, kol: kolObj };
    }
  }

  return null; // tidak ada kombinasi valid
}
*/

/*
function cariLokasi(input, data) {
  const rakList = Object.values(data.rak || []);
  const kolList = Object.values(data.kol || []);

  const clean = input.replace(/\s+/g, '').toUpperCase(); // hapus spasi & uppercase

  const angka = clean.match(/\d+/g) || [];     // ambil semua angka
  const huruf = clean.match(/[A-Z]+/g) || [];  // ambil semua huruf

  if (angka.length === 0 || huruf.length === 0) return null;

  // kombinasi mungkin: [angka, huruf] atau [huruf, angka]
  const candidates = [];

  angka.forEach(num => {
    huruf.forEach(char => {
      candidates.push({ rak: num, kol: char });
      candidates.push({ rak: char, kol: num });
    });
  });

  for (let c of candidates) {
    const rakObj = rakList.find(r => String(r.v).toUpperCase() === String(c.rak));
    const kolObj = kolList.find(k => String(k.v).toUpperCase() === String(c.kol));

    if (rakObj && kolObj) {
      return { rak: rakObj, kol: kolObj };
    }
  }

  return null; // tidak ada kombinasi valid
}
*/

function cariLokasi(input, data) {
  const rakList = data.rak || [];
  const kolList = data.kol || [];

  const clean = input.replace(/\s+/g, '').toUpperCase();

  
	console.log(clean);

  const angka = clean.match(/\d+/g) || [];
  const huruf = clean.match(/[A-Z]+/g) || [];

	console.log(angka,huruf);

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
