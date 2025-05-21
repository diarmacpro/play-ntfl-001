// f.o.d_v.0.0.js
// Local replacement for Firebase-based Fbs class (API compatible)
// Data is stored in localStorage (or in-memory fallback)

(function(global) {
    function getPathKey(path) {
        return 'fbs:' + path.replace(/\//g, '|');
    }
    function load(path) {
        if (typeof localStorage !== 'undefined') {
            const raw = localStorage.getItem(getPathKey(path));
            if (!raw) return [];
            try { return JSON.parse(raw) || []; } catch { return []; }
        } else {
            if (!load._mem) load._mem = {};
            return load._mem[getPathKey(path)] || [];
        }
    }
    function save(path, data) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(getPathKey(path), JSON.stringify(data));
        } else {
            if (!load._mem) load._mem = {};
            load._mem[getPathKey(path)] = data;
        }
    }
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    class Fbs {
        constructor(db) {
            // db arg ignored for local
        }
        iDt(path, data, cb) {
            // push data (auto id_stock if not exist)
            let arr = load(path);
            let item = clone(data);
            if (!item.id_stock) {
                item.id_stock = 'L' + Date.now() + Math.floor(Math.random()*1000);
            }
            arr.push(item);
            save(path, arr);
            if (typeof cb === 'function') cb(item);
        }
        iDtKy(path, data, cb) {
            // upsert by id_stock
            let arr = load(path);
            let idx = arr.findIndex(x => x.id_stock === data.id_stock);
            if (idx >= 0) arr[idx] = clone(data);
            else arr.push(clone(data));
            save(path, arr);
            if (typeof cb === 'function') cb(data);
        }
        gDt(path, key, cb) {
            // get all or by id_stock
            let arr = load(path);
            let out;
            if (key) {
                out = arr.find(x => x.id_stock === key) || null;
            } else {
                out = arr;
            }
            if (typeof cb === 'function') cb(clone(out));
        }
        upd(path, key, data, cb) {
            // update by id_stock
            let arr = load(path);
            let idx = arr.findIndex(x => x.id_stock === key);
            if (idx >= 0) {
                arr[idx] = Object.assign({}, arr[idx], data);
                save(path, arr);
                if (typeof cb === 'function') cb(clone(arr[idx]));
            } else {
                if (typeof cb === 'function') cb(null);
            }
        }
        delDt(path, key, cb) {
            // delete by id_stock or all if key empty
            let arr = load(path);
            if (!key) {
                arr = [];
            } else {
                arr = arr.filter(x => x.id_stock !== key);
            }
            save(path, arr);
            if (typeof cb === 'function') cb(true);
        }
        gDtOn(path, key, cb) {
            // just call gDt (no realtime)
            this.gDt(path, key, cb);
        }
        gDtOff(path, key, cb) {
            // noop for local
            if (typeof cb === 'function') cb();
        }
    }
    global.Fbs = Fbs;
})(typeof window !== 'undefined' ? window : globalThis);
