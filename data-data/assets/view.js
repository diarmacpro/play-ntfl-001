// assets/view.js
// Script to handle data view and button triggers for index.html in /data-data
// Assumes global data: dataJenis, dataWarna, dataSatuan, dataKain
// and that the app class from app.js has been instantiated

document.addEventListener('DOMContentLoaded', () => {
  // Button definitions
  const btns = [
    { id: 'btn-jenis', key: 'jenis', label: 'Jenis', global: 'dataJenis' },
    { id: 'btn-warna', key: 'warna', label: 'Warna', global: 'dataWarna' },
    { id: 'btn-satuan', key: 'satuan', label: 'Satuan', global: 'dataSatuan' },
    { id: 'btn-kain', key: 'kain', label: 'Kain', global: 'dataKain' },
    { id: 'btn-rak', key: 'rak', label: 'Rak', global: 'dataRak' },
    { id: 'btn-kol', key: 'kol', label: 'Kolom', global: 'dataKol' }
  ];

  // Create button container if not present
  const btnContainer = document.getElementById('data-btns') || (() => {
    const c = document.createElement('div');
    c.id = 'data-btns';
    c.className = 'flex gap-2 mb-4';
    document.body.prepend(c);
    return c;
  })();

  // Create buttons
  btns.forEach(({ id, label }) => {
    if (!document.getElementById(id)) {
      const btn = document.createElement('button');
      btn.id = id;
      btn.textContent = label;
      btn.className = 'px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600';
      btnContainer.appendChild(btn);
    }
  });

  // Data display area
  let dataArea = document.getElementById('data-view');
  if (!dataArea) {
    dataArea = document.createElement('div');
    dataArea.id = 'data-view';
    dataArea.className = 'border p-3 rounded bg-gray-50 mt-2';
    btnContainer.after(dataArea);
  }

  // Render function with pagination
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let currentData = [];
  let currentKeys = [];
  let currentKey = '';
  let currentGlobal = '';

  // Search and sort state
  let searchTerm = '';
  let sortKey = '';
  let sortAsc = true;

  // Field width config (by key, in %), per data type
  const FIELD_WIDTHS = {
    jenis: {
      id: '3%', kd_jns: '5%', jns: '92%', aksi: '16%'
    },
    warna: {
      id: '3%', kd_wrn: '5%', wrn: '92%', aksi: '16%'
    },
    satuan: {
      id: '3%', kd_stn: '5%', stn: '46%', s: '46%', aksi: '16%'
    },
    kain: {
      id: '3%', id_kain: '5%', kd_jns: '29%', kd_wrn: '29%', kd_stn: '29%', ktg: '5%', aksi: '16%'
    },
    rak: {
      kd_rak: '20%', rak: '64%', aksi: '16%'
    },
    kol: {
      kd_kol: '20%', kol: '64%', aksi: '16%'
    }
  };
  const HIDE_FIELDS = {
    jenis: [], warna: [], satuan: [], kain: ['hb', 'hg', 'he_a', 'he_b','kd_kat'],
    rak: [], kol: []
  };
  const FIELD_ALIASES = {
    jenis: { kd_jns: 'ID', jns: 'Jenis', aksi: 'Aksi' },
    warna: { kd_wrn: 'ID', wrn: 'Warna', aksi: 'Aksi' },
    satuan: { kd_stn: 'ID', stn: 'Satuan', s: 'S', aksi: 'Aksi' },
    kain: { id_kain: 'ID', kd_jns: 'Jenis', kd_wrn: 'Warna', kd_stn: 'Satuan', ktg: 'Kode', aksi: 'Aksi' },
    rak: { kd_rak: 'ID Rak', rak: 'Rak', aksi: 'Aksi' },
    kol: { kd_kol: 'ID Kolom', kol: 'Kolom', aksi: 'Aksi' }
  };

  // Tambah field aksi pada FIELD_WIDTHS dan FIELD_ALIASES
  Object.keys(FIELD_WIDTHS).forEach(key => {
    FIELD_WIDTHS[key].aksi = '16%'; // Lebar lebih besar agar tombol muat
    FIELD_ALIASES[key] = FIELD_ALIASES[key] || {};
    FIELD_ALIASES[key].aksi = 'Aksi';
  });

  function renderPagination(total, page) {
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    let html = `<div class='flex items-center gap-2 mt-2'>`;
    html += `<button id='btn-prev' class='px-2 py-1 rounded border bg-gray-200' ${page === 1 ? 'disabled' : ''}>Prev</button>`;
    html += `<span>Halaman ${page} / ${totalPages}</span>`;
    html += `<button id='btn-next' class='px-2 py-1 rounded border bg-gray-200' ${page === totalPages ? 'disabled' : ''}>Next</button>`;
    html += `</div>`;
    return html;
  }

  function renderSearchAndSort(keys, showSort = true, keyType = '') {
    let html = `<div class='flex flex-wrap gap-2 mb-2 items-center'>`;
    html += `<input id='search-input' type='text' placeholder='Cari...' class='border px-2 py-1 rounded' value='${searchTerm || ''}' style='min-width:180px' />`;
    html += `<button id="btn-tambah-data" class="ml-2 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600">Tambah Data</button>`;
    if (showSort) {
      html += `<span class='ml-2 text-gray-600'>Sort:</span>`;
      keys.forEach(k => {
        html += `<button class='sort-btn px-2 py-1 rounded border ${sortKey===k?'bg-blue-200':'bg-gray-100'}' data-key='${k}'>${k} ${sortKey===k?(sortAsc?'▲':'▼'):''}</button>`;
      });
    }
    html += `</div>`;
    return html;
  }

  function renderData(key, globalKey, page = 1, keepSearch = false) {
    let data = (window[globalKey] || []).map(row => ({ ...row }));
    let keys = Object.keys(data[0] || {});
    // Hide fields for current data type
    const hideFields = HIDE_FIELDS[key] || [];
    keys = keys.filter(k => !hideFields.includes(k));
    data = data.map(row => {
      const newRow = { ...row };
      hideFields.forEach(f => delete newRow[f]);
      return newRow;
    });
    // Pastikan identifier unik ada di depan
    let idField = key === 'kain' ? 'id_kain' : key === 'jenis' ? 'kd_jns' : key === 'warna' ? 'kd_wrn' : key === 'satuan' ? 'kd_stn' : key === 'rak' ? 'kd_rak' : key === 'kol' ? 'kd_kol' : keys[0];
    if (keys.includes(idField)) {
      keys = [idField, ...keys.filter(k => k !== idField)];
    }
    // Tambahkan field aksi di akhir
    if (!keys.includes('aksi')) keys.push('aksi');
    currentKeys = keys;
    currentKey = key;
    currentGlobal = globalKey;
    currentPage = page;
    // Sort: default desc untuk semua data, id asli dianggap int jika ada
    let sortField = sortKey || idField;
    let sortDesc = sortKey ? !sortAsc : true;
    let filteredData = data;
    if (searchTerm) {
      const tokens = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      filteredData = data.filter(row => {
        const rowStr = keys.map(k => String(row[k]).toLowerCase()).join(' ');
        return tokens.every(token => rowStr.includes(token));
      });
    }
    if (sortField) {
      filteredData = filteredData.slice().sort((a, b) => {
        let va = a[sortField], vb = b[sortField];
        // treat as int if possible
        if (["id_kain","kd_jns","kd_wrn","kd_stn","id"].includes(sortField)) {
          va = parseInt(va, 10); vb = parseInt(vb, 10);
        }
        if (va === vb) return 0;
        if (sortDesc) return va < vb ? 1 : -1;
        return va > vb ? 1 : -1;
      });
    }
    if (!Array.isArray(window[globalKey]) || window[globalKey].length === 0) {
      dataArea.innerHTML = `<div class='text-gray-400'>Data <b>${key}</b> kosong atau belum dimuat.</div>`;
      return;
    }
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      // Tampilkan tabel kosong dengan header dan pesan, data tidak wipe
      let html = renderSearchAndSort(keys, false);
      html += `<table class='min-w-full border text-sm'><thead><tr>`;
      keys.forEach(k => {
        const width = (FIELD_WIDTHS[key] && FIELD_WIDTHS[key][k]) ? FIELD_WIDTHS[key][k] : 'auto';
        const alias = (FIELD_ALIASES[key] && FIELD_ALIASES[key][k]) ? FIELD_ALIASES[key][k] : k;
        html += `<th class='border px-2 py-1 bg-gray-200 cursor-pointer sort-header' data-key='${k}' style='width:${width}'>${alias} ${(sortKey===k)?(sortAsc?'▲':'▼'):''}</th>`;
      });
      html += '</tr></thead><tbody>';
      html += `<tr><td colspan='${keys.length}' class='text-center text-gray-400 py-4'>Tidak ada data yang cocok dengan pencarian.</td></tr>`;
      html += '</tbody></table>';
      html += renderPagination(0, 1);
      dataArea.innerHTML = html;
      // Search event
      const searchInput = document.getElementById('search-input');
      searchInput.oninput = (e) => {
        searchTerm = e.target.value;
        const pos = searchInput.selectionStart;
        renderData(currentKey, currentGlobal, 1, true);
        setTimeout(() => {
          const newInput = document.getElementById('search-input');
          if (newInput) {
            newInput.focus();
            newInput.setSelectionRange(pos, pos);
          }
        }, 0);
      };
      // Sort events on table header
      document.querySelectorAll('.sort-header').forEach(th => {
        th.onclick = () => {
          const k = th.getAttribute('data-key');
          if (sortKey === k) sortAsc = !sortAsc;
          else { sortKey = k; sortAsc = true; }
          renderData(currentKey, currentGlobal, 1, true);
        };
      });
      return;
    }
    const total = filteredData.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageData = filteredData.slice(start, end);
    let html = renderSearchAndSort(keys, false, key);
    html += `<table class='min-w-full border text-sm'><thead><tr>`;
    keys.forEach(k => {
      const width = (FIELD_WIDTHS[key] && FIELD_WIDTHS[key][k]) ? FIELD_WIDTHS[key][k] : 'auto';
      const alias = (FIELD_ALIASES[key] && FIELD_ALIASES[key][k]) ? FIELD_ALIASES[key][k] : k;
      html += `<th class='border px-2 py-1 bg-gray-200 cursor-pointer ${k==='aksi'?'':'sort-header'}' data-key='${k}' style='width:${width}'>${alias} ${(sortKey===k && k!=='aksi')?(sortAsc?'▲':'▼'):''}</th>`;
    });
    html += '</tr></thead><tbody>';
    pageData.forEach((row, idx) => {
      html += '<tr>';
      keys.forEach(k => {
        const width = (FIELD_WIDTHS[key] && FIELD_WIDTHS[key][k]) ? FIELD_WIDTHS[key][k] : 'auto';
        if (k === 'aksi') {
          const idVal = row[idField];
          html += `<td class='border px-2 py-1 text-center' style='width:${width}'>
            <div class='flex flex-row gap-1 justify-center'>
              <button class='btn-edit px-2 py-1 rounded bg-yellow-400 text-xs' data-id='${idVal}'>Edit</button>
              <button class='btn-hapus px-2 py-1 rounded bg-red-500 text-white text-xs' data-id='${idVal}'>Hapus</button>
            </div>
          </td>`;
        } else {
          html += `<td class='border px-2 py-1' style='width:${width}'>${row[k]}</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    html += renderPagination(total, page);
    dataArea.innerHTML = html;
    // Pagination events
    document.getElementById('btn-prev').onclick = () => {
      if (currentPage > 1) renderData(currentKey, currentGlobal, currentPage - 1, true);
    };
    document.getElementById('btn-next').onclick = () => {
      if (currentPage < totalPages) renderData(currentKey, currentGlobal, currentPage + 1, true);
    };
    // Search event
    const searchInput = document.getElementById('search-input');
    searchInput.oninput = (e) => {
      searchTerm = e.target.value;
      const pos = searchInput.selectionStart;
      renderData(currentKey, currentGlobal, 1, true);
      setTimeout(() => {
        const newInput = document.getElementById('search-input');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(pos, pos);
        }
      }, 0);
    };
    // Sort events on table header
    document.querySelectorAll('.sort-header').forEach(th => {
      th.onclick = () => {
        const k = th.getAttribute('data-key');
        if (sortKey === k) sortAsc = !sortAsc;
        else { sortKey = k; sortAsc = true; }
        renderData(currentKey, currentGlobal, 1, true);
      };
    });
    // Aksi tombol edit/hapus
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.onclick = () => {
        console.log('Edit', idField, btn.getAttribute('data-id'));
      };
    });
    document.querySelectorAll('.btn-hapus').forEach(btn => {
      btn.onclick = () => {
        console.log('Hapus', idField, btn.getAttribute('data-id'));
      };
    });
    // Tombol tambah data (semua data)
    const btnTambah = document.getElementById('btn-tambah-data');
    if (btnTambah) {
      btnTambah.onclick = () => {
        console.log('Tambah data pada', key);
      };
    }
  }

  // Button event listeners
  btns.forEach(({ id, key, global }) => {
    document.getElementById(id).addEventListener('click', () => renderData(key, global, 1));
  });

  // Optionally, show first data by default
  // renderData(btns[0].key, btns[0].global);
});
