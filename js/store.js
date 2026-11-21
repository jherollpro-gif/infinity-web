/* ==========================================================
   CAPA DE DATOS
   Hoy: guarda todo en este navegador (localStorage + IndexedDB para fotos y videos).
   Mañana: se cambia por Supabase (ver supabase/schema.sql) sin tocar las pantallas,
   porque todas usan solo estas funciones: DB.all / get / add / update / remove.
   ========================================================== */
(function () {
  const KEY = 'infinity_db_v1';
  const SKEY = 'infinity_session';

  // Hash simple (cyrb53) para no guardar contraseñas en texto plano en el modo local.
  // En producción, Supabase Auth maneja las contraseñas.
  function hash(str, seed = 7) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'h' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  const uid = (p = 'id') => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function fresh() {
    const d = JSON.parse(JSON.stringify(window.SEED));
    d.users.forEach((u) => { u.passHash = hash(u.pass); delete u.pass; });
    return d;
  }

  const DB = {
    data: null,
    load() {
      try { this.data = JSON.parse(lsGet(KEY)); } catch (e) { this.data = null; }
      if (!this.data || this.data.version !== window.SEED.version) { this.data = fresh(); this.save(); }
    },
    save() {
      if (!lsSet(KEY, JSON.stringify(this.data))) window.toast && toast('No hay espacio en este navegador para guardar más datos.');
    },
    get settings() { return this.data.settings; },
    all(c) { return this.data[c] || (this.data[c] = []); },
    get(c, id) { return this.all(c).find((x) => x.id === id); },
    add(c, o) { o.id = o.id || uid(c.slice(0, 2)); this.all(c).unshift(o); this.save(); return o; },
    update(c, id, patch) { const o = this.get(c, id); if (o) { Object.assign(o, patch); this.save(); } return o; },
    remove(c, id) { this.data[c] = this.all(c).filter((x) => x.id !== id); this.save(); },
    reset() { lsDel(KEY); lsDel(SKEY); this.load(); },
    clearDemo() {
      ['users', 'equipos', 'ventas', 'leads', 'testimonios', 'metas', 'visitas', 'tareas', 'campanas', 'producciones'].forEach((c) => { this.data[c] = this.all(c).filter((x) => !x.demo); });
      this.data.posts.forEach((p) => { p.likes = p.likes.filter((id) => this.get('users', id)); p.comentarios = p.comentarios.filter((c) => this.get('users', c.autorId)); });
      this.data.settings.modoDemo = false;
      this.save();
    },
    export() { return JSON.stringify(this.data, null, 2); },
    import(json) { const d = JSON.parse(json); if (!d.settings || !d.users) throw new Error('Archivo no válido'); this.data = d; this.save(); },
    hash, uid
  };

  const Auth = {
    user() { const id = lsGet(SKEY); const u = id && DB.get('users', id); return u && u.estado === 'activo' ? u : null; },
    login(email, pass) {
      const u = DB.all('users').find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
      if (!u || u.passHash !== hash(pass)) return { error: 'Correo o contraseña incorrectos.' };
      if (u.estado === 'pendiente') return { error: 'Tu registro está en revisión. Te avisaremos cuando la CEO lo apruebe.' };
      if (u.estado !== 'activo') return { error: 'Tu cuenta está desactivada. Comunícate con la oficina.' };
      lsSet(SKEY, u.id); return { user: u };
    },
    loginAs(id) { lsSet(SKEY, id); },
    logout() { lsDel(SKEY); }
  };

  // ---------- Fotos y videos subidos (IndexedDB) ----------
  const Media = {
    _db: null, _urls: {},
    open() {
      if (this._db) return Promise.resolve(this._db);
      return new Promise((res, rej) => {
        try {
          const r = indexedDB.open('infinity_media', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('files');
          r.onsuccess = () => { this._db = r.result; res(this._db); };
          r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      });
    },
    async put(blob) {
      const db = await this.open(); const key = uid('m');
      await new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(blob, key); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
      return 'idb:' + key;
    },
    async url(ref) {
      if (!ref || !ref.startsWith('idb:')) return ref;
      if (this._urls[ref]) return this._urls[ref];
      try {
        const db = await this.open(); const key = ref.slice(4);
        const blob = await new Promise((res, rej) => { const r = db.transaction('files').objectStore('files').get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
        if (!blob) return '';
        return (this._urls[ref] = URL.createObjectURL(blob));
      } catch (e) { return ''; }
    },
    // Reemplaza src/href de los elementos que apuntan a archivos subidos
    hydrate(root = document) {
      root.querySelectorAll('[data-idb]').forEach(async (el) => {
        const u = await this.url(el.dataset.idb);
        if (!u) return;
        if (el.tagName === 'A') el.href = u; else el.src = u;
        el.removeAttribute('data-idb');
      });
    },
    // Comprime fotos antes de guardarlas
    async fromFile(file, max = 1600) {
      if (file.type.startsWith('image/') && !file.type.includes('gif')) {
        const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.84));
        return this.put(blob);
      }
      return this.put(file);
    }
  };

  window.DB = DB; window.Auth = Auth; window.Media = Media;
})();
