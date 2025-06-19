// Filter utility for SJ data
export function filterSJData(data, filter) {
  if (!Array.isArray(data)) return [];
  const isDelTrue = filter.del === 'true';
  return data.filter(row => {
    if (filter.id_stock) {
      const arr = filter.id_stock.split(',').map(s => s.trim());
      if (!arr.includes(String(row.id_stock))) return false;
    }
    if (filter.id_sj) {
      const arr = filter.id_sj.split(',').map(s => s.trim());
      if (!arr.includes(String(row.id_sj))) return false;
    }
    if (filter.id_mkt) {
      const arr = filter.id_mkt.split(',').map(s => s.trim());
      if (!arr.includes(String(row.id_mkt))) return false;
    }
    if (filter.bulanTahun) {
      const yyyymm = String(row.stamp).slice(0, 7);
      if (yyyymm !== filter.bulanTahun) return false;
    }
    if (filter.tanggalAcuan) {
      const yyyymmdd = String(row.stamp).slice(0, 10);
      if (yyyymmdd !== filter.tanggalAcuan) return false;
    }
    if (isDelTrue) {
      if (String(row.dlt) !== '1') return false;
    }
    return true;
  });
}

export function groupByMarketing(data) {
  const grouped = {};
  data.forEach(row => {
    if (!grouped[row.id_mkt]) {
      grouped[row.id_mkt] = {
        id_mkt: row.id_mkt,
        mkt: row.mkt,
        count: 0
      };
    }
    grouped[row.id_mkt].count += 1;
  });
  return Object.values(grouped);
}
