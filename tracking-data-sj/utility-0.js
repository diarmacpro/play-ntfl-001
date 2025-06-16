export class utility {
    /**
     * Ambil parameter URL
     * @param  {...string} keys - Parameter yang ingin diambil. Jika tidak diisi, akan mengembalikan semua.
     * @returns {object|string|null}
     */
    gtParam(...keys) {
    const params = new URLSearchParams(window.location.search);

    if (keys.length === 0) {
        return Object.fromEntries(params.entries());
    }

    if (keys.length === 1) {
        return params.get(keys[0]);
    }

    const result = {};
    for (const key of keys) {
        result[key] = params.get(key);
    }
    return result;
    }

    /**
     * Set parameter URL (overwrite atau tambah)
     * @param {object} paramObj - Objek key-value pasangan yang ingin disetel
     */
    stParam(paramObj = {}) {
    const params = new URLSearchParams(window.location.search);
    for (const key in paramObj) {
        if (paramObj[key] != null) {
        params.set(key, paramObj[key]);
        }
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.pushState(null, '', newUrl);
    }

    /**
     * Hapus parameter URL
     * @param  {...string} keys - Nama parameter yang ingin dihapus
     */
    dlParam(...keys) {
    const params = new URLSearchParams(window.location.search);
    for (const key of keys) {
        params.delete(key);
    }

    const newQuery = params.toString();
    const newUrl = newQuery
        ? `${window.location.pathname}?${newQuery}`
        : window.location.pathname;

    history.pushState(null, '', newUrl);
    }

    cvDtTm(isoString) {
    const d = new Date(isoString);

    const pad = n => String(n).padStart(2, '0');

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1); // bulan dimulai dari 0
    const date = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    }

}