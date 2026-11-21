/* ==========================================================
   NÚCLEO: utilidades, íconos, modales y enrutador
   ========================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
const money2 = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n) => Number(n || 0).toLocaleString('es-PE');
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fdate = (d) => { if (!d) return ''; const x = new Date(d + (d.length === 10 ? 'T12:00' : '')); return x.getDate() + ' ' + MESES[x.getMonth()] + ' ' + x.getFullYear(); };
const ago = (d) => { const days = Math.round((Date.now() - new Date(d + (d.length === 10 ? 'T12:00' : '')).getTime()) / 864e5); return days <= 0 ? 'Hoy' : days === 1 ? 'Ayer' : days < 30 ? 'Hace ' + days + ' días' : fdate(d); };
const today = () => new Date().toISOString().slice(0, 10);
const initials = (n) => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const waLink = (phone, text) => 'https://wa.me/' + String(phone || '').replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');

/* Atributos para imágenes/videos: rutas normales o archivos subidos (idb:) */
const srcAttr = (s) => (s && s.startsWith('idb:') ? `src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-idb="${esc(s)}"` : `src="${esc(s)}"`);
const vsrcAttr = (s) => (s && s.startsWith('idb:') ? `data-idb="${esc(s)}"` : `src="${esc(s)}"`);
const hrefAttr = (s) => (s && s.startsWith('idb:') ? `href="#" data-idb="${esc(s)}"` : `href="${esc(s)}"`);

function avatar(u, cls = '') {
  if (!u) return `<span class="av ${cls}">?</span>`;
  return u.foto ? `<span class="av ${cls}"><img ${srcAttr(u.foto)} alt=""></span>` : `<span class="av ${cls}">${esc(initials(u.nombre))}</span>`;
}

/* ---------- Íconos (trazo) ---------- */
const ICONS = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  map: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.8.1 4.8 1.8 5.4 4.9"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5"/>',
  team: '<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
  video: '<rect x="2.5" y="5.5" width="14" height="13" rx="2"/><path d="M16.5 10l5-3v10l-5-3"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.1 4 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4 20 4 22.4 7.1 21.2 10.6 19.5 15.4 12 20 12 20z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  down: '<path d="M12 3v12M6.5 10l5.5 5.5 5.5-5.5M4 20h16"/>',
  share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"/>',
  quote: '<path d="M4 18v-5c0-4 2-6.5 6-7.5M14 18v-5c0-4 2-6.5 6-7.5"/>',
  inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6H3v-6z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  logout: '<path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 16l-4-4 4-4M6 12h10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M4.5 12.5l5 5 10-11"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  doc: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
  truck: '<path d="M2 6h11v10H2zM13 10h4l4 4v2h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  pro: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a7 7 0 0114 0v2"/><path d="M12 13l1.2 2.5L12 21l-1.2-5.5z"/>',
  wallet: '<path d="M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M3 7l12-4v4M16 13.5h2"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l7-7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  fb: '<path d="M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
  ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
  tt: '<path d="M14 3v11.5a3.5 3.5 0 11-3.5-3.5M14 3c.5 2.8 2.3 4.5 5 4.8"/>',
  yt: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9v6l5-3z" fill="currentColor"/>',
  wa: '<path d="M12 2.5a9.5 9.5 0 00-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1012 2.5z"/><path d="M8.6 7.8c.2-.5.5-.5.8-.5h.6c.2 0 .4.1.6.5l.8 1.9c.1.2.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .7.7 1.2 1.7 2.1 2.9 2.7.3.1.5.1.7-.1l.7-.8c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.6 0 .9-.6 1.9-1.6 2.1-.8.2-1.9.1-3.7-.8a9.4 9.4 0 01-3.9-3.9c-.8-1.6-.7-2.9-.2-3.9z" fill="currentColor" stroke="none"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  road: '<path d="M8 3L4 21M16 3l4 18M12 4v3M12 10v4M12 17v3"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M12 14v4M8 21h8M9 18h6"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>',
  star: '<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z"/>',
  up: '<path d="M7 17L17 7M8 7h9v9"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  house: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M12 17.5s-3-1.8-3-3.6a1.6 1.6 0 013-.8 1.6 1.6 0 013 .8c0 1.8-3 3.6-3 3.6z"/>',
  funnel: '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h2M16 15v3"/>',
  sprout: '<path d="M12 21v-8"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6zM12 11C12 7.5 9.5 5.5 5 5.5c0 3.5 2.5 5.5 7 5.5z"/>',
  play2: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/>',
  waze: '<path d="M5 15c-1.5 0-2-1-2-2 1 0 1.5-1 1.5-3A7.5 7.5 0 0112 3a8 8 0 018 8c0 4-3 7-7 7h-3"/><circle cx="8" cy="19" r="1.6"/><circle cx="15" cy="19" r="1.6"/><circle cx="10" cy="10" r=".8" fill="currentColor"/><circle cx="15" cy="10" r=".8" fill="currentColor"/>'
};

/* Trazo del infinito del logo (decorativo) */
const INF = (cls = '', sw = 1.2) => `<svg class="inf ${cls}" viewBox="0 0 200 100" fill="none" aria-hidden="true"><defs><linearGradient id="ig${cls.length}" x1="0" x2="1"><stop offset="0" stop-color="#F3D98A"/><stop offset=".5" stop-color="#C9A24A"/><stop offset="1" stop-color="#9C7424"/></linearGradient></defs><path pathLength="1" d="M100 50 C100 15 160 10 175 50 C190 88 125 90 100 50 C75 10 10 12 25 50 C40 90 100 85 100 50 Z" stroke="url(#ig${cls.length})" stroke-width="${sw}"/></svg>`;
const ARROW = `<svg class="arrow-mark" viewBox="0 0 24 32" aria-hidden="true"><path d="M12 0l9 11h-6v21H9V11H3z" fill="url(#ag)"/><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D98A"/><stop offset="1" stop-color="#9C7424"/></linearGradient></defs></svg>`;
const ic = (n, sw = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- Toast, modal, lightbox ---------- */
function toast(msg) {
  $$('.toast').forEach((t) => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
function modal(title, body, { wide = false, onOpen } = {}) {
  closeModal();
  const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.id = 'modal';
  bg.innerHTML = `<div class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-h"><h3>${esc(title)}</h3><button class="x" data-act="close-modal" aria-label="Cerrar">×</button></div><div class="modal-b">${body}</div></div>`;
  bg.addEventListener('mousedown', (e) => { if (e.target === bg) closeModal(); });
  document.body.appendChild(bg); document.body.style.overflow = 'hidden';
  Media.hydrate(bg);
  onOpen && onOpen(bg);
  const f = bg.querySelector('input,select,textarea'); f && setTimeout(() => f.focus(), 50);
  return bg;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); if (!$('.lightbox')) document.body.style.overflow = ''; }
function lightbox(src, isVideo) {
  const lb = document.createElement('div'); lb.className = 'lightbox';
  lb.innerHTML = `<button class="x" aria-label="Cerrar">×</button>` + (isVideo ? `<video ${vsrcAttr(src)} controls autoplay playsinline></video>` : `<img ${srcAttr(src)} alt="">`);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.x')) { lb.remove(); document.body.style.overflow = ''; } });
  document.body.appendChild(lb); document.body.style.overflow = 'hidden'; Media.hydrate(lb);
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $('.lightbox')?.remove(); closeModal(); } });

/* ---------- Leer formularios ---------- */
function formData(form) {
  const o = {};
  $$('[name]', form).forEach((el) => {
    if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
    else if (el.type === 'checkbox') o[el.name] = el.checked;
    else if (el.type === 'file') return;
    else if (el.type === 'number') o[el.name] = el.value === '' ? '' : Number(el.value);
    else o[el.name] = el.value.trim();
  });
  return o;
}

/* ---------- Compartir ---------- */
function baseUrl() { return location.href.split('#')[0]; }
function share({ title, text, url, file }) {
  const full = (text ? text + '\n' : '') + url;
  if (navigator.share) { navigator.share({ title, text, url }).catch(() => {}); return; }
  modal('Compartir', `
    <div class="form">
      <a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(full)}">${ic('wa')} Compartir por WhatsApp</a>
      <a class="btn btn-green btn-block" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">${ic('fb')} Compartir en Facebook</a>
      <button class="btn btn-line btn-block" data-act="copy" data-text="${esc(full)}">Copiar enlace</button>
      ${file ? `<p class="muted" style="font-size:13px">Consejo: para Instagram y TikTok, descarga el video y súbelo desde tu celular.</p>` : ''}
    </div>`);
}

/* ---------- Animaciones ---------- */
function reveal() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));
  $$('[data-count]').forEach((el) => {
    const io2 = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io2.disconnect();
      const to = Number(el.dataset.count), pre = el.dataset.pre || '', t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1400); el.textContent = pre + num(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    io2.observe(el);
  });
}

/* ---------- Enrutador ---------- */
const Router = {
  routes: {},
  on(path, fn) { this.routes[path] = fn; },
  parse() {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = Object.fromEntries(new URLSearchParams(qs || ''));
    return { path, parts, query };
  },
  go(h) { if (location.hash === h) this.render(); else location.hash = h; },
  render() {
    const r = this.parse();
    if (r.query.ref) { try { sessionStorage.setItem('infinity_ref', r.query.ref); } catch (e) {} }
    const key = '/' + (r.parts[0] || '');
    const fn = this.routes[key] || this.routes['/404'];
    closeModal();
    fn(r);
    Media.hydrate();
    reveal();
  }
};
window.addEventListener('hashchange', () => { Router.render(); window.scrollTo(0, 0); });

/* Asesor que compartió el enlace (?ref=) → los contactos le llegan a él */
function refAsesor() {
  let id = ''; try { id = sessionStorage.getItem('infinity_ref') || ''; } catch (e) {}
  const u = id && DB.get('users', id);
  return u && u.estado === 'activo' && u.telefono ? u : null;
}
function contactPhone() { const r = refAsesor(); return r ? r.telefono : DB.settings.whatsapp; }
