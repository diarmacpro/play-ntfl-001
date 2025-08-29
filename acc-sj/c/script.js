/**
 * Fungsi fleksibel untuk melakukan permintaan POST ke API.
 * * @param {string} url - URL endpoint API.
 * @param {object} body - Objek data yang akan dikirim sebagai body JSON.
 * @param {function} successCallback - Fungsi yang akan dipanggil saat permintaan berhasil.
 * Menerima satu argumen: data respons JSON.
 * @param {function} [errorCallback] - Fungsi opsional yang akan dipanggil jika terjadi kesalahan.
 * Menerima satu argumen: objek Error.
 */
function postToAPI(url, body, successCallback, errorCallback) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        // Jika respons tidak OK (misal 404, 500, dll), lempar error
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Panggil successCallback dengan data yang diterima
        if (successCallback && typeof successCallback === 'function') {
            successCallback(data);
        }
    })
    .catch(error => {
        // Panggil errorCallback jika ada dan merupakan sebuah fungsi
        console.error('Terjadi kesalahan:', error);
        if (errorCallback && typeof errorCallback === 'function') {
            errorCallback(error);
        }
    });
}




/**
 * Mengelompokkan array objek berdasarkan kunci tertentu.
 * @param {Array<object>} array - Array objek yang akan dikelompokkan.
 * @param {string} key - Kunci yang akan digunakan untuk pengelompokan (misalnya, 'id_sj').
 * @returns {object} Objek di mana kuncinya adalah nilai dari 'key' dan nilainya adalah array item yang dikelompokkan.
 */
function groupBy(array, key) {
    return array.reduce((result, currentItem) => {
        // Ambil nilai dari kunci yang diberikan
        const keyValue = currentItem[key];
        
        // Buat array baru jika kunci belum ada
        if (!result[keyValue]) {
            result[keyValue] = [];
        }
        
        // Tambahkan item saat ini ke dalam array yang sesuai
        result[keyValue].push(currentItem);
        
        return result;
    }, {}); // Inisialisasi sebagai objek kosong
}



function makeSummary(data) {
    // Group by id_sj
    const grouped = _.groupBy(data, "id_sj");
    const summary = [];

    for (const idSj in grouped) {
        const items = grouped[idSj];

        // hitung count
        const count = items.length;
        
        /*
        // stamp_sj ambil max
        let maxStamp = _.max(items.map(i => i.stamp));
        let stamp = null;
        if (maxStamp) {
            const hhmm = maxStamp.split(" ")[1]?.substring(0, 5); // ambil HH:ii
            stamp = hhmm || maxStamp;
        }
        */

        // stamp_sj ambil min
        let minStamp = _.min(items.map(i => i.stamp));
        let stamp = null;

        if (minStamp) {
            const hhmm = minStamp.split(" ")[1]?.substring(0, 5); // ambil HH:ii
            stamp = hhmm || minStamp;
        }

        // id_sj ambil unique lalu ambil [0]
        const idSjUnique = _.uniq(items.map(i => i.id_sj));
        const id_sj = idSjUnique[0] || null;

        // id_mkt ambil unique lalu ambil [0]
        const idMktUnique = _.uniq(items.map(i => i.id_mkt));
        const id_mkt = idMktUnique[0] || null;

        // rtr → kalau ada selain 0 → 1, else 0 (jumlahkan)
        const rtr = items.reduce((acc, i) => acc + (i.rtr && i.rtr != 0 ? 1 : 0), 0);

        // onOff → kalau ada selain 0 → 1, else 0 (jumlahkan)
        const onOff = items.reduce((acc, i) => acc + (i.onOff && i.onOff != 0 ? 1 : 0), 0);

        // ekspedisi unique join, tapi kalau kosong semua → null
        let ekspedisiVals = _.uniq(items.map(i => i.ekspedisi).filter(v => v && v !== "0" && v !== ""));
        let ekspedisi = ekspedisiVals.length > 0 ? ekspedisiVals.join(", ") : null;

        summary.push({
            c: count,
            stamp,
            id_sj,
            id_mkt,
            rtr,
            onOff,
            ekspedisi
        });
    }

    return summary;
}



function formatToTimeHM(dateTimeStr) {
  if (!dateTimeStr) return null; // handle null/empty
  const date = new Date(dateTimeStr.replace(" ", "T")); 
  // replace spasi biar valid ISO string
  if (isNaN(date.getTime())) return null; // handle invalid date

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}