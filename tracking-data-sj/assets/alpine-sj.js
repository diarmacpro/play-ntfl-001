import { getDataByTanggal, saveDataByTanggal, getDataByTanggalWithFilter } from './db.js';
import { filterSJData, groupByMarketing } from './filter.js';

export function dtDeepSearchSJ() {
  return {
    selectedRow: null,
    showingModal: false,
    searchQuery: '',
    filteredData: [],
    sortField: null,
    sortDirection: 'asc',
    showDetail(row) {
      this.selectedRow = row;
      this.showingModal = true;
    },
    closeModal() {
      this.showingModal = false;
      this.selectedRow = null;
    },
    performSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredData = [...this.tableData];
        return;
      }
      const keywords = this.searchQuery.toLowerCase().split(' ').filter(k => k.trim());
      this.filteredData = this.tableData.filter(row => {
        const searchableText = [
          row.mkt, row.id_sj, row.hlp, row.id_stock, row.k, row.lot, row.rol, row.rak, row.kol, row.ge, row.qty, row.q_bs, row.dlt, row.habis, row.onOff, row.c_o, row.nm_wh, row.nm_fn, row.nm_del, row.nm_add,
          this.cvDtTm(row.stamp), this.cvDtTm(row.stamp_sj), this.cvDtTm(row.d_create), this.cvDtTm(row.d_mgr), this.cvDtTm(row.d_wh), this.cvDtTm(row.d_finish)
        ].filter(field => field != null && field !== '').join(' ').toLowerCase();
        return keywords.every(keyword => searchableText.includes(keyword));
      });
      if (this.sortField) this.applySorting();
    },
    clearSearch() {
      this.searchQuery = '';
      this.filteredData = [...this.tableData];
      if (this.sortField) this.applySorting();
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.applySorting();
    },
    applySorting() {
      if (!this.sortField) return;
      this.filteredData.sort((a, b) => {
        let aVal = this.getSortValue(a, this.sortField);
        let bVal = this.getSortValue(b, this.sortField);
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        let result;
        if (aVal < bVal) result = -1;
        else if (aVal > bVal) result = 1;
        else result = 0;
        return this.sortDirection === 'desc' ? -result : result;
      });
    },
    getSortValue(row, field) {
      switch (field) {
        case 'stamp':
        case 'stamp_sj':
          return row[field] ? new Date(row[field]) : null;
        case 'qty':
          return parseInt(row[field]) || 0;
        default:
          return row[field] || '';
      }
    },
    getSortIcon(field) {
      if (this.sortField !== field) return 'bi-arrow-down-up text-gray-400';
      return this.sortDirection === 'asc' ? 'bi-arrow-up text-blue-600' : 'bi-arrow-down text-blue-600';
    },
    initialForm: {
      id_stock: '',
      id_sj: '',
      tanggalAcuan: new Date().toISOString().slice(0, 10),
      del: 'true'
    },
    form: {
      id_stock: '',
      id_sj: '',
      tanggalAcuan: new Date().toISOString().slice(0, 10),
      del: 'true'
    },
    loading: false,
    initialized: false,
    hasUrlParams: false,
    showTable: false,
    tableData: [],
    fields: [
      { name: 'id_stock', label: 'Id Stock', type: 'text' },
      { name: 'id_sj', label: 'Id SJ', type: 'text' },
      { name: 'tanggalAcuan', label: 'Tanggal Acuan', type: 'date' }
    ],
    selectedMarketing: '',
    marketingOptions: [],
    marketingInput: '',
    init() {
      if (this.initialized) return;
      this.waitForUtility();
    },
    waitForUtility() {
      if (!window.u) {
        setTimeout(() => this.waitForUtility(), 100);
        return;
      }
      this.setupFormFromUrl();
      this.initialized = true;
    },
    setupFormFromUrl() {
      const urlParams = u.gtParam();
      this.hasUrlParams = Object.keys(urlParams).length > 0;
      for (const key in this.form) {
        if (urlParams[key]) {
          this.form[key] = urlParams[key];
        }
      }
      if (this.hasUrlParams) {
        this.generate();
      } else {
        this.showTable = false;
      }
    },
    parseCommaSeparated(str) {
      if (!str || typeof str !== 'string') return [];
      return str.split(',').map(s => s.trim()).filter(s => s);
    },
    async generate() {
      if (this.loading) return;
      this.loading = true;
      const raw = {
        id_stock: this.parseCommaSeparated(this.form.id_stock),
        id_sj: this.parseCommaSeparated(this.form.id_sj),
        tanggalAcuan: this.form.tanggalAcuan,
        del: this.form.del
      };
      const filter = {};
      for (const key in raw) {
        const val = raw[key];
        if (Array.isArray(val) && val.length) {
          filter[key] = val.join(',');
        } else if (typeof val === 'string' && val.trim() !== '') {
          filter[key] = val;
        }
      }
      if (window.u && typeof u.stParam === 'function') {
        u.stParam(filter);
      }
      let indexedData = null;
      let indexedDataChecked = false;
      if (filter.tanggalAcuan) {
        try {
          indexedData = await getDataByTanggalWithFilter(filter.tanggalAcuan, filter);
          const dbRaw = await getDataByTanggal(filter.tanggalAcuan);
          if (dbRaw && Array.isArray(dbRaw.data)) indexedDataChecked = true;
        } catch (e) {
          indexedData = null;
        }
      }
      if (indexedDataChecked) {
        let filtered = filterSJData(indexedData.data, filter);
        this.tableData = filtered;
        this.filteredData = [...filtered];
        this.marketingOptions = groupByMarketing(filtered);
        this.showTable = true;
        this.loading = false;
        return;
      }
      // Jika data tanggalAcuan belum ada di IndexedDB, fetch seluruh data tanggalAcuan (del=false, debug=false, filter lain null)
      if (!indexedDataChecked && filter.tanggalAcuan) {
        const fullPayload = {
          tanggalAcuan: filter.tanggalAcuan,
          del: 'false',
          debug: false,
          id_stock: null,
          id_sj: null,
          bulanTahun: null
        };
        pR('https://cdn.weva.my.id/apix/dataDeepSj', { filter: fullPayload }, async (e, d) => {
          if (filter.tanggalAcuan && d && d.data) await saveDataByTanggal(filter.tanggalAcuan, d);
          let filtered = filterSJData(d.data, filter);
          this.tableData = filtered;
          this.filteredData = [...filtered];
          this.marketingOptions = groupByMarketing(filtered);
          this.showTable = true;
          this.loading = false;
          this.searchQuery = '';
          this.sortField = null;
          this.sortDirection = 'asc';
        });
        return;
      }
      // Fetch data jika tidak ada di IndexedDB
      pR('https://cdn.weva.my.id/apix/dataDeepSj', { filter }, async (e, d) => {
        this.loading = false;
        if (d && d.data && Array.isArray(d.data)) {
          this.tableData = d.data;
          this.filteredData = [...d.data];
          this.marketingOptions = groupByMarketing(d.data);
          this.showTable = true;
          if (filter.tanggalAcuan) await saveDataByTanggal(filter.tanggalAcuan, d);
        } else if (d && Array.isArray(d)) {
          this.tableData = d;
          this.filteredData = [...d];
          this.marketingOptions = groupByMarketing(d);
          this.showTable = true;
          if (filter.tanggalAcuan) await saveDataByTanggal(filter.tanggalAcuan, { data: d });
        } else {
          this.tableData = [];
          this.filteredData = [];
          this.marketingOptions = [];
          this.showTable = true;
        }
        this.searchQuery = '';
        this.sortField = null;
        this.sortDirection = 'asc';
      });
    },
    async syncTanggalAcuan() {
      if (this.loading) return;
      this.loading = true;
      const tanggalAcuan = this.form.tanggalAcuan;
      if (!tanggalAcuan) {
        this.loading = false;
        return;
      }
      const fullPayload = {
        tanggalAcuan: tanggalAcuan,
        del: 'false',
        debug: false,
        id_stock: null,
        id_sj: null,
        bulanTahun: null
      };
      pR('https://cdn.weva.my.id/apix/dataDeepSj', { filter: fullPayload }, async (e, d) => {
        if (tanggalAcuan && d && d.data) await saveDataByTanggal(tanggalAcuan, d);
        this.loading = false;
        this.generate();
      });
    },
    backToFilter() {
      this.showTable = false;
      this.tableData = [];
      this.filteredData = [];
      this.loading = false;
      this.searchQuery = '';
      this.sortField = null;
      this.sortDirection = 'asc';
      this.form = { ...this.initialForm };
      if (window.u && typeof u.stParam === 'function') {
        u.stParam({});
      }
      if (window.history && window.history.pushState) {
        window.history.pushState({}, document.title, window.location.pathname);
      }
    },
    cvDtTm(dt) {
      return window.u ? window.u.cvDtTm(dt) : dt;
    },
    getMarketingName(id) {
      const found = this.marketingOptions.find(m => String(m.id_mkt) === String(id));
      return found ? found.mkt : id;
    }
  };
}
