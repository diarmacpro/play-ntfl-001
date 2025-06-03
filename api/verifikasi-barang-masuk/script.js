function formatDateTime(isoString) {
    const date = new Date(isoString);

    const pad = num => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // bulan dimulai dari 0
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function cekLokasiAsync(lokasi) {
  return new Promise((resolve) => {
    if (typeof lokasi !== 'string') return resolve(false);

    const bagian = lokasi.trim().toUpperCase().split(/\s+/); // Pisah dengan spasi berlebih
    if (bagian.length !== 2) return resolve(false);

    const [part1, part2] = bagian;

    // Fungsi bantu untuk cari dengan includes
    const cariRak = key => _.find(dataLocal.dataRak, o => o.v.toUpperCase().includes(key));
    const cariKol = key => _.find(dataLocal.dataKol, o => o.v.toUpperCase().includes(key));

    // Coba dua kemungkinan: part1 = rak & part2 = kol ATAU sebaliknya
    let rakAda = cariRak(part1);
    let kolAda = cariKol(part2);

    if (!rakAda || !kolAda) {
      // Coba alternatif jika urutan dibalik
      rakAda = cariRak(part2);
      kolAda = cariKol(part1);
    }

    if (!rakAda || !kolAda) return resolve(false);

    return resolve({
      loc: `${rakAda.v} ${kolAda.v}`,
      kode: { rak: rakAda.i, kol: kolAda.i }
    });
  });
}

function cekHelperAsync(kataKunci) {
  return new Promise((resolve) => {
    if (typeof kataKunci !== 'string') return resolve(false);

    const kunci = kataKunci.trim().toUpperCase();

    const hasil = _.find(dataLocal.dataHelper, o => {
      if (o.stts !== 1) return false;

      const referensi = `${o.id_hlp} ${o.hlp}`.toUpperCase();
      return referensi.includes(kunci);
    });

    if (!hasil) return resolve(false);

    return resolve({
      id_hlp: hasil.id_hlp,
      hlp: hasil.hlp
    });
  });
}


