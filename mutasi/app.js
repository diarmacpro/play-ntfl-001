function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Gagal membaca dari localStorage:', e);
        return null;
    }
}

function setToLocalStorage(key, value) {
    try {
        const item = JSON.stringify(value);
        localStorage.setItem(key, item);
    } catch (e) {
        console.error('Gagal menyimpan ke localStorage:', e);
    }
}

function delFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Gagal menghapus dari localStorage:', e);
    }
}

function kirimMutasiJQuery(payload) {
  return new Promise((resolve, reject) => {
    pR('https://cdn.weva.my.id/apix/queryMutasi', { data: payload }, (err, result) => {
      if (err) return reject(err);
      resolve(result.data);
    });
  });
}