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