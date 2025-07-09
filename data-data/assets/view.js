// assets/view.js
// Script to handle data view and button triggers for index.html in /data-data
// Assumes global data: dataJenis, dataWarna, dataSatuan, dataKain
// and that the app class from app.js has been instantiated

// Cek login sebelum menjalankan script utama
if (!localStorage.getItem('userLogin')) {
  // alert('Silakan login terlebih dahulu!');
  window.location.href = './login'; // Ganti dengan path login Anda jika berbeda
  throw new Error('Belum login'); // Stop eksekusi script
}

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

  // Tambahkan tombol Home di awal btns
  const btnsWithHome = [
    { id: 'btn-home', key: 'home', label: '🏠 Home', global: null }
  ].concat(btns);

  // Tambahkan tombol Logout di akhir btns
  btnsWithHome.push({ id: 'btn-logout', key: 'logout', label: 'Logout', global: null });

  // Create button container if not present
  const btnContainer = document.getElementById('data-btns') || (() => {
    const c = document.createElement('div');
    c.id = 'data-btns';
    c.className = 'flex gap-2 mb-4';
    document.body.prepend(c);
    return c;
  })();

  // Create buttons (Home + data + Logout)
  btnsWithHome.forEach(({ id, label }) => {
    // Hapus elemen jika sudah ada agar className tidak bentrok
    const existingBtn = document.getElementById(id);
    if (existingBtn) existingBtn.remove();
    const btn = document.createElement('button');
    btn.id = id;
    btn.textContent = label;
    if (id === 'btn-home') {
      btn.className = 'px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-900 font-bold border border-gray-400';
    } else if (id === 'btn-logout') {
      btn.className = 'px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 font-bold border border-red-400 ml-auto';
    } else {
      btn.className = 'px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600';
    }
    btnContainer.appendChild(btn);
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
      id: '3%', kd_jns: '5%', jns: '92%'
    },
    warna: {
      id: '3%', kd_wrn: '5%', wrn: '92%'
    },
    satuan: {
      id: '3%', kd_stn: '5%', stn: '46%', s: '46%'
    },
    kain: {
      id: '3%', id_kain: '5%', kd_jns: '29%', kd_wrn: '29%', kd_stn: '29%', ktg: '5%'
    },
    rak: {
      kd_rak: '20%', rak: '80%'
    },
    kol: {
      kd_kol: '20%', kol: '80%'
    }
  };
  const HIDE_FIELDS = {
    jenis: [], warna: [], satuan: [], kain: ['hb', 'hg', 'he_a', 'he_b','kd_kat'],
    rak: [], kol: []
  };
  const FIELD_ALIASES = {
    jenis: { kd_jns: 'ID', jns: 'Jenis' },
    warna: { kd_wrn: 'ID', wrn: 'Warna' },
    satuan: { kd_stn: 'ID', stn: 'Satuan', s: 'S' },
    kain: { id_kain: 'ID', kd_jns: 'Jenis', kd_wrn: 'Warna', kd_stn: 'Satuan', ktg: 'Kode' },
    rak: { kd_rak: 'ID Rak', rak: 'Rak' },
    kol: { kd_kol: 'ID Kolom', kol: 'Kolom' }
  };

  // Tidak perlu menambah field aksi pada FIELD_WIDTHS dan FIELD_ALIASES
  // Object.keys(FIELD_WIDTHS).forEach(key => {
  //   FIELD_WIDTHS[key].aksi = '16%';
  //   FIELD_ALIASES[key] = FIELD_ALIASES[key] || {};
  //   FIELD_ALIASES[key].aksi = 'Aksi';
  // });

  function renderPagination(total, page, filteredTotal, originalTotal) {
    const totalPages = Math.ceil(filteredTotal / PAGE_SIZE) || 1;
    let html = `<div class='flex items-center justify-between mt-2'>`;
    // Kiri: tombol prev/next
    html += `<div class='flex items-center gap-2'>`;
    html += `<button id='btn-prev' class='px-2 py-1 rounded border bg-gray-200' ${page === 1 ? 'disabled' : ''}>Prev</button>`;
    html += `<span>Halaman ${page} / ${totalPages}</span>`;
    html += `<button id='btn-next' class='px-2 py-1 rounded border bg-gray-200' ${page === totalPages ? 'disabled' : ''}>Next</button>`;
    html += `</div>`;
    // Kanan: total data
    let info = `Total: ${filteredTotal} data`;
    if (filteredTotal !== originalTotal) {
      info += ` (dari ${originalTotal})`;
    }
    html += `<div class='text-gray-600 text-sm font-medium'>${info}</div>`;
    html += `</div>`;
    return html;
  }

  function renderSearchAndSort(keys, showSort = true, keyType = '') {
    let html = `<div class='flex flex-wrap gap-2 mb-2 items-center'>`;
    // Tombol Sync
    html += `<button id='btn-sync-data' class='px-3 py-1 rounded bg-purple-500 text-white hover:bg-purple-600'>Sync</button>`;
    // Tombol Download CSV
    html += `<button id='btn-download-csv' class='px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-900'>Download</button>`;
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
      // JOIN untuk data kain
      if (key === 'kain') {
        // Jenis
        if (window.dataJenis && newRow.kd_jns) {
          const jenis = window.dataJenis.find(j => String(j.kd_jns) === String(newRow.kd_jns));
          if (jenis) newRow.kd_jns = jenis.jns;
        }
        // Warna
        if (window.dataWarna && newRow.kd_wrn) {
          const warna = window.dataWarna.find(w => String(w.kd_wrn) === String(newRow.kd_wrn));
          if (warna) newRow.kd_wrn = warna.wrn;
        }
        // Satuan
        if (window.dataSatuan && newRow.kd_stn) {
          const satuan = window.dataSatuan.find(s => String(s.kd_stn) === String(newRow.kd_stn));
          if (satuan) newRow.kd_stn = satuan.s;
        }
      }
      return newRow;
    });
    // Pastikan identifier unik ada di depan
    let idField = key === 'kain' ? 'id_kain' : key === 'jenis' ? 'kd_jns' : key === 'warna' ? 'kd_wrn' : key === 'satuan' ? 'kd_stn' : key === 'rak' ? 'kd_rak' : key === 'kol' ? 'kd_kol' : keys[0];
    if (keys.includes(idField)) {
      keys = [idField, ...keys.filter(k => k !== idField)];
    }
    // Hapus field aksi jika ada
    keys = keys.filter(k => k !== 'aksi');
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
        // Hanya kolom id yang tidak bisa diedit inline
        if (k === idField) {
          html += `<td class='border px-2 py-1' style='width:${width}'>${row[k]}</td>`;
        } else {
          html += `<td class='border px-2 py-1 editable-cell' data-key='${k}' data-id='${row[idField]}' style='width:${width};cursor:pointer;'>${row[k]}</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    html += renderPagination(total, page, filteredData.length, data.length);
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

    /*
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
    */


    // Tombol tambah data (semua data)
    const btnTambah = document.getElementById('btn-tambah-data');
    if (btnTambah) {
      btnTambah.onclick = () => {
        showTambahDataModal(keys, key);
      };
    }
    // Tombol Sync event
    const btnSync = document.getElementById('btn-sync-data');
    if (btnSync) {
      btnSync.onclick = async () => {
        btnSync.disabled = true;
        btnSync.textContent = 'Sync...';
        try {
          if (window.app && typeof window.app.syncDataByKey === 'function') {
            await window.app.syncDataByKey(key);
            // Setelah syncDataByKey selesai, trigger klik tombol data aktif agar render ulang identik dengan klik user
            const btn = document.getElementById('btn-' + key);
            if (btn) btn.click();
          } else {
            alert('Fungsi syncDataByKey tidak ditemukan!');
          }
        } finally {
          btnSync.disabled = false;
          btnSync.textContent = 'Sync';
        }
      };
    }
    // Tombol Download event
    const btnDownload = document.getElementById('btn-download-csv');
    if (btnDownload) {
      btnDownload.onclick = () => {
        const data = (window[globalKey] || []).map(row => ({ ...row }));
        if (!data.length) {
          alert('Data kosong!');
          return;
        }
        // Ambil field yang tidak disembunyikan
        const hideFields = HIDE_FIELDS[key] || [];
        const keys = Object.keys(data[0]).filter(k => !hideFields.includes(k));
        // Header CSV
        const csvRows = [keys.map(k => '"' + (FIELD_ALIASES[key]?.[k] || k) + '"').join(',')];
        // Data CSV
        data.forEach(row => {
          csvRows.push(keys.map(k => '"' + String(row[k] ?? '').replace(/"/g, '""') + '"').join(','));
        });
        const csvContent = csvRows.join('\r\n');
        // Nama file: nama_data_tanggal-bulan-tahun_jam-menit-detik.csv
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const nama = key;
        const tgl = `${pad(now.getDate())}-${pad(now.getMonth()+1)}-${now.getFullYear()}`;
        const jam = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        const filename = `${nama}_${tgl}_${jam}.csv`;
        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      };
    }
    // Inline edit event (harus dipasang setelah innerHTML di-set)
    setTimeout(() => {
      document.querySelectorAll('.editable-cell').forEach(td => {
        td.onclick = function(e) {
          if (td.querySelector('input')) return; // already editing
          const oldVal = td.textContent;
          const keyField = td.getAttribute('data-key');
          const idVal = td.getAttribute('data-id');
          const input = document.createElement('input');
          input.type = 'text';
          input.value = oldVal;
          input.className = 'border px-1 py-1 rounded w-full';
          td.textContent = '';
          td.appendChild(input);
          input.focus();
          input.select();
          // Save on blur or enter
          const save = async () => {
            const newVal = input.value;
            td.textContent = newVal;
            if (newVal !== oldVal) {
              // Update global and IndexedDB
              const dataArr = window[globalKey] || [];
              const idx = dataArr.findIndex(r => String(r[idField]) === String(idVal));
              if (idx !== -1) {
                dataArr[idx][keyField] = newVal;
                window[globalKey] = dataArr;
                // Simpan ke IndexedDB
                const cached = await localforage.getItem(key);
                if (cached && cached.data) {
                  cached.data = dataArr;
                  await localforage.setItem(key, cached);
                } else {
                  await localforage.setItem(key, { data: dataArr, hash: '', lastSync: new Date().toISOString() });
                }
                // Simulasi simpan ke server
                console.log('direncanakan akan disimpan pada server');
              }
            }
          };
          input.onblur = save;
          input.onkeydown = function(ev) {
            if (ev.key === 'Enter') {
              input.blur();
            } else if (ev.key === 'Escape') {
              td.textContent = oldVal;
            }
          };
        };
      });
    }, 0);
  }

  // Modal HTML injection (once)
  function ensureModal() {
    if (document.getElementById('modal-tambah-data')) return;
    const modal = document.createElement('div');
    modal.id = 'modal-tambah-data';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[95vw] w-full sm:w-[400px] relative">
        <h3 class="text-lg font-bold mb-4" id="modal-title">Tambah Data</h3>
        <form id="form-tambah-data" class="flex flex-col gap-3"></form>
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" id="btn-batal-modal" class="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400">Batal</button>
          <button type="submit" form="form-tambah-data" class="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600">Simpan</button>
        </div>
        <button type="button" id="btn-close-modal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Show modal and generate form fields
  function showTambahDataModal(keys, keyType) {
    ensureModal();
    const modal = document.getElementById('modal-tambah-data');
    const form = document.getElementById('form-tambah-data');
    form.innerHTML = '';
    // Tentukan nama field id untuk setiap tipe data
    const idField = keyType === 'kain' ? 'id_kain' : keyType === 'jenis' ? 'kd_jns' : keyType === 'warna' ? 'kd_wrn' : keyType === 'satuan' ? 'kd_stn' : keyType === 'rak' ? 'kd_rak' : keyType === 'kol' ? 'kd_kol' : keys[0];
    // Exclude 'aksi' dan idField dari input
    const inputKeys = keys.filter(k => k !== 'aksi' && k !== idField);
    inputKeys.forEach(k => {
      // Untuk data kain, kolom kd_jns, kd_wrn, kd_stn pakai searchable select
      if (keyType === 'kain' && ['kd_jns', 'kd_wrn', 'kd_stn'].includes(k)) {
        // Ambil data global
        let options = [];
        let labelField = '';
        if (k === 'kd_jns' && Array.isArray(window.dataJenis)) {
          options = window.dataJenis;
          labelField = 'jns';
        } else if (k === 'kd_wrn' && Array.isArray(window.dataWarna)) {
          options = window.dataWarna;
          labelField = 'wrn';
        } else if (k === 'kd_stn' && Array.isArray(window.dataSatuan)) {
          options = window.dataSatuan;
          labelField = 's';
        }
        // Buat wrapper untuk searchable select
        form.innerHTML += `
          <label class="flex flex-col gap-1">
            <span class="font-medium">${FIELD_ALIASES[keyType][k] || k}</span>
            <div class="relative">
              <input type="text" class="search-input border px-2 py-1 rounded w-full" placeholder="Cari..." data-for="${k}" autocomplete="off" />
              <div class="option-list absolute left-0 right-0 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto mt-1 hidden" data-for="${k}"></div>
              <input type="hidden" name="${k}" />
            </div>
          </label>
        `;
        setTimeout(() => {
          const searchInput = form.querySelector(`.search-input[data-for='${k}']`);
          const optionList = form.querySelector(`.option-list[data-for='${k}']`);
          const hiddenInput = form.querySelector(`input[type='hidden'][name='${k}']`);
          let filtered = [];
          function renderOptions(list) {
            // Render semua hasil (tanpa slice), biar scrollable
            optionList.innerHTML = list.map(opt => `<div class='option-item px-2 py-1 hover:bg-blue-100 cursor-pointer' data-val='${opt[k]}'>${opt[labelField]}</div>`).join('');
            optionList.classList.toggle('hidden', list.length === 0);
          }
          // Saat input fokus, tampilkan semua hasil (atau hasil filter)
          searchInput.onfocus = function() {
            const val = searchInput.value.trim().toLowerCase();
            if (val) {
              filtered = options.filter(opt => String(opt[labelField]).toLowerCase().includes(val));
            } else {
              filtered = options;
            }
            renderOptions(filtered);
          };
          // Saat input blur, sembunyikan option list
          searchInput.onblur = function() {
            setTimeout(() => optionList.classList.add('hidden'), 150);
          };
          // Saat input berubah, filter dan tampilkan semua hasil
          searchInput.oninput = function() {
            const val = searchInput.value.trim().toLowerCase();
            filtered = options.filter(opt => String(opt[labelField]).toLowerCase().includes(val));
            renderOptions(filtered);
          };
          // Klik pada option
          optionList.onclick = function(e) {
            if (e.target.classList.contains('option-item')) {
              const val = e.target.getAttribute('data-val');
              const label = e.target.textContent;
              hiddenInput.value = val;
              searchInput.value = label;
              optionList.classList.add('hidden');
            }
          };
        }, 0);
      } else {
        let label = (FIELD_ALIASES[keyType] && FIELD_ALIASES[keyType][k]) ? FIELD_ALIASES[keyType][k] : k;
        form.innerHTML += `
          <label class="flex flex-col gap-1">
            <span class="font-medium">${label}</span>
            <input name="${k}" class="border px-2 py-1 rounded" required />
          </label>
        `;
      }
    });
    modal.classList.remove('hidden');
    // Focus first input
    setTimeout(() => {
      const firstInput = form.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
    // Close modal handlers
    document.getElementById('btn-batal-modal').onclick = closeModal;
    document.getElementById('btn-close-modal').onclick = closeModal;
    function closeModal() {
      modal.classList.add('hidden');
    }
    // Form submit handler
    form.onsubmit = function(ev) {
      ev.preventDefault();
      const formData = {};
      inputKeys.forEach(k => {
        formData[k] = form.elements[k].value;
      });

      window.app.tambahData(keyType,formData);
      // Tidak ada id/kd di data yang dikirim/log
      console.log('[Tambah Data] Data baru tanpa id/kd:', JSON.parse(JSON.stringify(formData)), 'Tipe:', keyType);
      closeModal();
      // Optional: trigger re-render or callback
    };
  }

  // Helper: set active menu button
  function setActiveMenu(id) {
    btnsWithHome.forEach(({ id: btnId }) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        if (btnId === id) {
          btn.classList.add('ring', 'ring-blue-500', 'bg-blue-700', 'text-white');
          btn.classList.remove('bg-blue-500', 'bg-gray-700', 'hover:bg-blue-600', 'hover:bg-gray-900');
        } else if (btnId === 'btn-home') {
          btn.className = 'px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-900 font-bold border border-gray-400';
        } else {
          btn.className = 'px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600';
        }
      }
    });
  }

  // Button event listeners (Home + data + Logout)
  btnsWithHome.forEach(({ id, key, global }) => {
    document.getElementById(id).addEventListener('click', (e) => {
      e.preventDefault();
      if (key === 'logout') {
        if (confirm('Yakin ingin logout?')) {
          localStorage.removeItem('userLogin');
          window.location.href = './login';
        }
        return;
      }
      setActiveMenu(id);
      if (key === 'home') {
        // SPA style: update URL tanpa reload dan render dashboard
        const url = new URL(window.location);
        url.search = '';
        window.history.replaceState({}, '', url);
        // Render dashboard tanpa reload
        let html = `
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Dashboard Data Master</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    `;
        btns.forEach(({ label, global, key }, i) => {
          let arr = window[global];
          let count = 0;
          if (Array.isArray(arr)) {
            count = arr.length;
          } else if (localforage) {
            localforage.getItem(key).then(item => {
              const el = document.getElementById('count-'+key);
              if (el) el.textContent = item && item.data ? item.data.length : 0;
            });
          }
          html += `
      <div class="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col items-center border border-blue-100 hover:shadow-2xl transition">
        <div class="text-4xl font-extrabold text-blue-600 mb-2" id="count-${key}">${count}</div>
        <div class="text-lg font-semibold text-gray-700 mb-1">${label}</div>
        <button class="mt-2 px-4 py-1 rounded bg-blue-500 text-white font-medium hover:bg-blue-700 transition btn-lihat-data" data-key="${key}">Lihat Data</button>
      </div>
      `;
        });
        html += `</div>`;
        dataArea.innerHTML = html;
        // Routing SPA untuk tombol Lihat Data
        document.querySelectorAll('.btn-lihat-data').forEach(btn => {
          btn.onclick = function(e) {
            e.preventDefault();
            const key = btn.getAttribute('data-key');
            const btnToolbar = document.getElementById('btn-' + key);
            if (btnToolbar) btnToolbar.click();
          };
        });
      } else {
        const url = new URL(window.location);
        url.searchParams.set('data', key);
        window.history.replaceState({}, '', url);
        renderData(key, global, 1);
      }
    });
  });

  // Routing: update URL tanpa reload
  btns.forEach(({ id, key, global }) => {
    document.getElementById(id).addEventListener('click', () => {
      // Update URL tanpa reload
      const url = new URL(window.location);
      url.searchParams.set('data', key);
      window.history.replaceState({}, '', url);
      renderData(key, global, 1);
    });
  });

  // On load: set active menu based on URL or default to home
  const params = new URLSearchParams(window.location.search);
  const dataKey = params.get('data');
  if (dataKey && btns.some(b => b.key === dataKey)) {
    const btnObj = btns.find(b => b.key === dataKey);
    setActiveMenu('btn-' + btnObj.key);
    // Tunggu data global siap, lalu render
    const tryRender = () => {
      if (window[btnObj.global] && Array.isArray(window[btnObj.global]) && window[btnObj.global].length > 0) {
        renderData(btnObj.key, btnObj.global, 1);
      } else {
        if (!tryRender.attempts) tryRender.attempts = 0;
        if (tryRender.attempts++ < 20) setTimeout(tryRender, 100);
      }
    };
    tryRender();
  } else {
    setActiveMenu('btn-home');
    // Dashboard: tampilkan info ringkas semua data master dengan tampilan modern
    let html = `
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Dashboard Data Master</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    `;
    btns.forEach(({ label, global, key }, i) => {
      let arr = window[global];
      // Jika data belum siap, coba ambil dari IndexedDB secara async
      let count = 0;
      if (Array.isArray(arr)) {
        count = arr.length;
      } else if (localforage) {
        // Async fetch count dari IndexedDB
        localforage.getItem(key).then(item => {
          const el = document.getElementById('count-'+key);
          if (el) el.textContent = item && item.data ? item.data.length : 0;
        });
      }
      html += `
      <div class="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col items-center border border-blue-100 hover:shadow-2xl transition">
        <div class="text-4xl font-extrabold text-blue-600 mb-2" id="count-${key}">${count}</div>
        <div class="text-lg font-semibold text-gray-700 mb-1">${label}</div>
        <button class="mt-2 px-4 py-1 rounded bg-blue-500 text-white font-medium hover:bg-blue-700 transition btn-lihat-data" data-key="${key}">Lihat Data</button>
      </div>
      `;
    });
    html += `</div>`;
    dataArea.innerHTML = html;
    // Routing SPA untuk tombol Lihat Data
    document.querySelectorAll('.btn-lihat-data').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        const key = btn.getAttribute('data-key');
        const btnToolbar = document.getElementById('btn-' + key);
        if (btnToolbar) btnToolbar.click();
      };
    });
  }

  // Listen custom event untuk re-render setelah sync
  window.addEventListener('data-synced', (e) => {
    const { key, globalKey } = e.detail;
    // Render ulang data yang sedang aktif jika sama, atau jika tidak, tetap render ulang jika key sama dengan currentKey
    if (currentKey === key) {
      // Simulasikan klik tombol data yang aktif agar aksi dan render sama persis
      const btn = document.querySelector(`[id^='btn-'][id$='${key}']`);
      if (btn) btn.click();
    } else if (currentKeys.includes(key)) {
      renderData(key, globalKey, currentPage);
    }
  });

  // Service worker: daftar event untuk fetch dan sync
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, key, globalKey } = event.data || {};
      if (type === 'sync' && key && globalKey) {
        // Cek apakah data yang disinkronisasi adalah yang sedang ditampilkan
        if (currentKey === key) {
          // Jika ya, lakukan render ulang
          renderData(key, globalKey, currentPage);
        } else if (currentKeys.includes(key)) {
          // Jika tidak, cukup perbarui data di cache
          renderData(key, globalKey, 1);
        }
      }
    });
  }
});
