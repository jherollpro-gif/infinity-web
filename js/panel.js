/* ==========================================================
   PLATAFORMA PRIVADA (CEO · asesores · aliados)
   ========================================================== */
const ROL_TXT = { ceo: 'CEO · acceso total', asesor: 'Asesor(a)', aliado: 'Aliado' };
const isCeo = (u) => u && u.rol === 'ceo';
const ventasOk = () => DB.all('ventas').filter((v) => v.estado === 'confirmada');
const comisionDe = (u) => (u.equipoId && DB.get('equipos', u.equipoId)?.comision) || u.comision || DB.settings.comisionDefault;

/* menuFor(u) vive en panel3.js (menú por rol) */

function panelShell(u, sub, title, actions, body) {
  const items = menuFor(u).map((m) => (m.length === 1 ? `<div class="grp">${m[0]}</div>` :
    `<a href="#/panel${m[0] ? '/' + m[0] : ''}" class="${sub === m[0] ? 'on' : ''}">${ic(m[1])}<span>${m[2]}</span>${m[3] || ''}</a>`)).join('');
  $('#root').innerHTML = `<div class="app">
    <aside class="side" id="side">
      <a class="brand" href="#/"><img src="img/logo.png" alt="" style="background:#fff;border-radius:10px;padding:3px;height:44px"><span><b>INFINITY</b><small>PLATAFORMA</small></span></a>
      <nav>${items}<div class="grp">Sitio</div><a href="#/" target="_blank">${ic('globe')}<span>Ver página web</span></a><a href="#" data-act="logout">${ic('logout')}<span>Cerrar sesión</span></a></nav>
      <div class="me">${avatar(u)}<div><b>${esc(u.nombre)}</b><small>${ROL_TXT[u.rol]}</small></div></div>
    </aside>
    <div class="main">
      ${DB.settings.modoDemo ? `<div class="demo-bar">Modo demostración: los asesores, aliados y ventas son de ejemplo.${isCeo(u) ? ' Bórralos en <a href="#/panel/ajustes" style="font-weight:700;text-decoration:underline">Ajustes</a> cuando empieces a usarla de verdad.' : ''}</div>` : ''}
      <div class="ptop"><div style="display:flex;gap:12px;align-items:center"><button class="pburger" data-act="side" aria-label="Menú">${ic('menu')}</button><h1>${title}</h1></div><div class="acts">${actions || ''}</div></div>
      <div class="pbody">${body}</div>
    </div></div>`;
}

function kpi(label, value, sub, icon, gold) {
  return `<div class="kpi ${gold ? 'gold' : ''}"><div class="ic">${ic(icon)}</div><small>${label}</small><b>${value}</b><span>${sub || ''}</span></div>`;
}
function emptyState(icon, text, action = '') { return `<div class="empty">${ic(icon)}<p>${text}</p>${action ? `<div style="margin-top:14px">${action}</div>` : ''}</div>`; }
const LEAD_ESTADOS = ['nuevo', 'contactado', 'visita', 'separacion', 'venta', 'descartado'];
const estadoBadge = (e) => ({ separacion: 'b-gold', venta: 'b-green', confirmada: 'b-green', reportada: 'b-warn', anulada: 'b-bad', pendiente: 'b-warn', abonada: 'b-green', activo: 'b-green', inactivo: 'b-grey', nuevo: 'b-info', contactado: 'b-warn', visita: 'b-gold', cerrado: 'b-green', descartado: 'b-grey', aprobado: 'b-green' }[e] || 'b-grey');
const badgeE = (e) => `<span class="badge ${estadoBadge(e)}">${esc(e)}</span>`;

function monthlySeries(ventas, months = 6) {
  const out = []; const d = new Date(); d.setDate(1);
  for (let i = months - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1); const key = m.toISOString().slice(0, 7);
    const vs = ventas.filter((v) => v.fecha.slice(0, 7) === key);
    out.push({ label: MESES[m.getMonth()], total: vs.reduce((s, v) => s + v.precio, 0), n: vs.length });
  }
  return out;
}
function barsChart(series, fmt = (x) => x.n) {
  const max = Math.max(1, ...series.map((s) => s.total));
  return `<div class="bars" role="img" aria-label="Ventas por mes">${series.map((s) => `<div class="bar"><i style="height:${Math.max(2, (s.total / max) * 100)}%" title="${money(s.total)} · ${s.n} lotes"><em>${s.n ? fmt(s) : ''}</em></i><span>${s.label}</span></div>`).join('')}</div>`;
}
function ranking(limit = 8) {
  const vs = ventasOk();
  const rows = DB.all('users').filter((u) => u.rol !== 'ceo' && u.estado === 'activo').map((u) => {
    const mine = vs.filter((v) => v.asesorId === u.id); return { u, n: mine.length, total: mine.reduce((s, v) => s + v.precio, 0) };
  }).sort((a, b) => b.n - a.n || b.total - a.total);
  const max = Math.max(1, ...rows.map((r) => r.n));
  return rows.slice(0, limit).map((r, i) => `<div class="rank-row"><span class="pos">${i + 1}</span>${avatar(r.u, 'av-sm')}<div class="meter"><b style="font-size:13.5px">${esc(r.u.nombre)}</b><div><i style="width:${(r.n / max) * 100}%"></i></div></div><b style="font-size:13.5px;white-space:nowrap">${r.n} lotes</b></div>`).join('') || '<p class="muted">Sin ventas todavía.</p>';
}

/* ================= ENRUTADOR DEL PANEL ================= */
Router.on('/panel', (r) => {
  const u = Auth.user();
  if (!u) return Router.go('#/ingresar');
  const sub = r.parts[1] || '';
  if (!canAccess(u, sub)) return Router.go('#/panel');
  const home = isCeo(u) ? vDashCeo : u.rol === 'marketing' ? vDashMkt : vDashAsesor;
  const views = { '': home, red: vRed, metas: vMetas, visitas: vVisitas, tareas: vTareas, marketing: vMarketing, areas: vAreas, proyectos: vProyectos, asesores: vAsesores, equipos: vEquipos, equipo: vMiEquipo, ventas: vVentas, comisiones: vComisiones, muro: vMuro, leads: vLeads, testimonios: vTestimonios, solicitudes: vSolicitudes, ajustes: vAjustes, perfil: vPerfil, catalogo: vCatalogo, mipagina: vMiPagina, eventos: vEventos };
  (views[sub] || views[''])(u, r);
});

/* ---------- Resumen CEO ---------- */
function vDashCeo(u) {
  const vs = ventasOk(); const mes = today().slice(0, 7);
  const vMes = vs.filter((v) => v.fecha.startsWith(mes));
  const pend = vs.filter((v) => v.comisionEstado === 'pendiente').reduce((s, v) => s + v.comisionMonto, 0);
  const ases = DB.all('users').filter((x) => x.rol === 'asesor' && x.estado === 'activo').length;
  const aliados = DB.all('equipos').filter((e) => e.tipo === 'Aliado estratégico').length;
  const rep = DB.all('ventas').filter((v) => v.estado === 'reportada');
  const leads = DB.all('leads').filter((l) => l.estado === 'nuevo');
  const sol = DB.all('users').filter((x) => x.estado === 'pendiente');
  const porProy = DB.all('proyectos').map((p) => ({ p, n: vs.filter((v) => v.proyectoId === p.id).length })).filter((x) => x.n).sort((a, b) => b.n - a.n);
  const maxP = Math.max(1, ...porProy.map((x) => x.n));
  const todo = [
    rep.length && `<a href="#/panel/ventas?f=reportada" class="rank-row"><span class="badge b-warn">${rep.length}</span><span>ventas reportadas por confirmar</span></a>`,
    sol.length && `<a href="#/panel/solicitudes" class="rank-row"><span class="badge b-info">${sol.length}</span><span>solicitudes de registro por aprobar</span></a>`,
    leads.length && `<a href="#/panel/leads" class="rank-row"><span class="badge b-gold">${leads.length}</span><span>contactos nuevos desde la web</span></a>`,
    pend && `<a href="#/panel/comisiones" class="rank-row"><span class="badge b-bad">${money(pend)}</span><span>en comisiones por abonar</span></a>`
  ].filter(Boolean).join('');
  panelShell(u, '', `Hola, <b>${esc(u.nombre.split(' ')[0])}</b>`, `<button class="btn btn-gold btn-sm" data-act="venta-new">${ic('plus')} Registrar venta</button>`, `
    <div class="kpis">
      ${kpi('Ventas del mes', money(vMes.reduce((s, v) => s + v.precio, 0)), vMes.length + ' lotes vendidos', 'trend', true)}
      ${kpi('Lotes vendidos', num(vs.length), 'Total en la plataforma', 'grid')}
      ${kpi('Comisiones por abonar', money(pend), vs.filter((v) => v.comisionEstado === 'pendiente').length + ' ventas', 'wallet')}
      ${kpi('Equipo', ases + ' asesores', DB.all('proyectos').length + ' proyectos · ' + aliados + ' aliados', 'users')}
    </div>
    <div class="pgrid">
      <div class="panel"><h2>Ventas de los últimos 6 meses <span class="muted" style="font-weight:500;font-size:12.5px">lotes por mes</span></h2>${barsChart(monthlySeries(vs))}</div>
      <div class="panel"><h2>Pendientes ${todo ? '' : '<span class="badge b-green">Todo al día</span>'}</h2>${todo || '<p class="muted">No hay nada pendiente. 🎉</p>'}</div>
    </div>
    <div class="pgrid">
      <div class="panel"><h2>Embudo comercial: de contacto a venta <a class="btn btn-line btn-xs" href="#/panel/leads">Ver contactos</a></h2>${funnelHtml(DB.all('leads'))}</div>
      <div class="panel"><h2>¿De dónde llegan los clientes?</h2>${origenHtml(DB.all('leads'))}</div>
    </div>
    <div class="pgrid">
      <div class="panel"><h2>Ranking de asesores <a class="btn btn-line btn-xs" href="#/panel/asesores">Ver todos</a></h2>${ranking(6)}</div>
      <div class="panel"><h2>Ventas por proyecto</h2>${porProy.map((x) => `<div class="rank-row"><div class="meter"><b style="font-size:13.5px">${esc(x.p.nombre)}</b><div><i style="width:${(x.n / maxP) * 100}%"></i></div></div><b style="font-size:13.5px">${x.n}</b></div>`).join('') || '<p class="muted">Sin ventas todavía.</p>'}</div>
    </div>`);
}

/* ---------- Resumen asesor / aliado ---------- */
function vDashAsesor(u) {
  const mine = DB.all('ventas').filter((v) => v.asesorId === u.id);
  const ok = mine.filter((v) => v.estado === 'confirmada');
  const mes = ok.filter((v) => v.fecha.startsWith(today().slice(0, 7)));
  const pend = ok.filter((v) => v.comisionEstado === 'pendiente').reduce((s, v) => s + v.comisionMonto, 0);
  const pag = ok.filter((v) => v.comisionEstado === 'abonada').reduce((s, v) => s + v.comisionMonto, 0);
  const meta = DB.settings.metaMensualLotes || 4;
  const all = DB.all('users').filter((x) => x.rol !== 'ceo' && x.estado === 'activo').map((x) => ({ x, n: ventasOk().filter((v) => v.asesorId === x.id).length })).sort((a, b) => b.n - a.n);
  const pos = all.findIndex((r) => r.x.id === u.id) + 1;
  const ultimo = DB.all('posts')[0];
  panelShell(u, '', 'Mi resumen', `<button class="btn btn-gold btn-sm" data-act="venta-new">${ic('plus')} Reportar venta</button>`, `
    <div class="hero-me">${INF('', 1)}${avatar(u, 'av-lg')}<div style="flex:1;min-width:220px"><small style="color:#bcd3c5">${ROL_TXT[u.rol]} · Puesto #${pos || '–'} del ranking</small><h2>${titleSplit(u.nombre)}</h2>
      <div style="font-size:14px;color:#d5e3da">Meta del mes: <b class="gold-text">${mes.length} de ${meta} lotes</b></div><div class="progress"><i style="width:${Math.min(100, (mes.length / meta) * 100)}%"></i></div></div>
      <div style="display:grid;gap:8px"><a class="btn btn-gold btn-sm" href="#/asesor/${u.id}" target="_blank">${ic('star')} Ver mi página pública</a><a class="btn btn-ghost btn-sm" href="#/panel/catalogo">${ic('share')} Compartir proyectos</a></div></div>
    <div class="kpis">
      ${kpi('Lotes vendidos', num(ok.length), mes.length + ' este mes', 'grid', true)}
      ${kpi('Comisión por abonar', money2(pend), 'Se abona al confirmar el pago', 'wallet')}
      ${kpi('Comisiones abonadas', money2(pag), 'Total recibido', 'coins')}
      ${kpi('Mi comisión', comisionDe(u) + ' %', 'Por venta confirmada', 'trend')}
    </div>
    <div class="pgrid">
      <div class="panel"><h2>Mis ventas por mes</h2>${barsChart(monthlySeries(ok))}</div>
      <div class="panel"><h2>Ranking del equipo</h2>${ranking(6)}</div>
    </div>
    <div class="pgrid"><div class="panel"><h2>Mi embudo de clientes <a class="btn btn-line btn-xs" href="#/panel/leads">Mis contactos</a></h2>${funnelHtml(DB.all('leads').filter((l) => l.asesorId === u.id))}</div>
      <div class="panel"><h2>Mis logros <a class="btn btn-line btn-xs" href="#/panel/mipagina">Editar</a></h2><div class="medals" style="grid-template-columns:1fr">${[...(u.logros || []), ...autoBadges(u).map((b) => Object.assign({ auto: true }, b))].slice(0, 5).map((m) => `<div class="medal ${m.auto ? 'auto' : ''}" style="padding:12px"><span class="m" style="width:42px;height:42px">${ic(m.i || 'award')}</span><div><b>${esc(m.t)}</b><small>${esc(m.d || '')}</small></div></div>`).join('')}</div></div></div>
    ${ultimo ? `<div class="panel"><h2>Último contenido para publicar <a class="btn btn-line btn-xs" href="#/panel/muro">Ver muro</a></h2><div style="max-width:520px">${postCard(ultimo, u)}</div></div>` : ''}`);
}

/* ---------- Proyectos (CEO) ---------- */
function vProyectos(u) {
  const ps = DB.all('proyectos').slice().sort((a, b) => (a.orden || 99) - (b.orden || 99));
  panelShell(u, 'proyectos', 'Proyectos', `<button class="btn btn-gold btn-sm" data-act="proy-edit">${ic('plus')} Nuevo proyecto</button>`, `
    <div class="kpis">${kpi('Proyectos', ps.length, ps.filter((p) => p.publico).length + ' publicados en la web', 'grid', true)}${kpi('En lanzamiento', ps.filter((p) => p.estado === 'Lanzamiento').length, '', 'trend')}${kpi('Lotes vendidos', ventasOk().length, 'En la plataforma', 'cash')}${kpi('Con fotos', ps.filter((p) => p.portada).length + ' de ' + ps.length, 'Agrega fotos a los demás', 'img')}</div>
    <div class="list-cards">${ps.map((p) => {
      const n = ventasOk().filter((v) => v.proyectoId === p.id).length;
      return `<div class="ucard" style="padding:0;overflow:hidden"><div style="aspect-ratio:16/9;background:var(--green-dark)">${p.portada ? `<img ${srcAttr(p.portada)} alt="" style="width:100%;height:100%;object-fit:cover">` : `<div class="ph-empty" style="font-size:20px"><img src="img/logo.png" alt="" style="width:46px">Sin foto</div>`}</div>
        <div style="padding:16px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:16px">${esc(p.nombre)}</b>${p.publico ? '<span class="badge b-green">Publicado</span>' : '<span class="badge b-grey">Oculto</span>'}</div>
        <span class="muted" style="font-size:13px">${esc(p.ubicacion)}</span>
        <div class="meta" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px"><div style="background:var(--ivory);border-radius:10px;padding:8px 10px">Estado<b style="display:block">${esc(p.estado)}</b></div><div style="background:var(--ivory);border-radius:10px;padding:8px 10px">Vendidos<b style="display:block">${n}</b></div></div>
        <div class="acts" style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-green btn-xs" data-act="proy-edit" data-id="${p.id}">${ic('edit')} Editar</button><a class="btn btn-line btn-xs" href="#/proyecto/${p.id}" target="_blank">Ver en la web</a><button class="btn btn-danger btn-xs" data-act="proy-del" data-id="${p.id}">Eliminar</button></div></div></div>`;
    }).join('')}</div>`);
}

function proyForm(p = {}) {
  const precios = (p.precios || []).map((x) => [x.t, x.v, x.n].join(' | ')).join('\n');
  return `<form class="form" data-form="proyecto" data-id="${esc(p.id || '')}">
    <div class="two"><label class="f">Nombre<input class="in" name="nombre" required value="${esc(p.nombre)}"></label><label class="f">Ciudad / región<input class="in" name="region" required value="${esc(p.region)}" placeholder="Pucallpa, Huaral…"></label></div>
    <label class="f">Ubicación completa<input class="in" name="ubicacion" value="${esc(p.ubicacion)}"></label>
    <div class="three"><label class="f">Tipo<select class="in" name="tipo">${['Lotes', 'Hectáreas', 'Industrial', 'Casas', 'Departamentos'].map((t) => `<option ${p.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="f">Estado<select class="in" name="estado">${['Lanzamiento', 'Preventa', 'En venta', 'Consultar', 'Vendido'].map((t) => `<option ${p.estado === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="f">Precio desde (S/)<input class="in" type="number" min="0" name="precioDesde" value="${esc(p.precioDesde || '')}"></label></div>
    <label class="f">Texto de precio<input class="in" name="precioTexto" value="${esc(p.precioTexto)}" placeholder="Lotes desde S/ … · Hectárea desde S/ …"></label>
    <label class="f">Resumen (1 línea para la tarjeta)<input class="in" name="resumen" maxlength="160" value="${esc(p.resumen)}"></label>
    <label class="f">Descripción<textarea class="in" name="descripcion" rows="5">${esc(p.descripcion)}</textarea></label>
    <label class="f">Precios y formas de pago <span class="hint">Una por línea: Título | Precio | Nota</span><textarea class="in" name="precios" rows="3" placeholder="Lote de 200 m² | Desde S/ 25,000 | 20 % de inicial">${esc(precios)}</textarea></label>
    <label class="f">¿Qué se puede hacer? <span class="hint">Separado por comas</span><input class="in" name="usos" value="${esc((p.usos || []).join(', '))}"></label>
    <div class="three"><label class="f">Metrajes<input class="in" name="area" value="${esc(p.area)}"></label><label class="f">Total de unidades<input class="in" name="totalLotes" value="${esc(p.totalLotes)}"></label><label class="f">Disponibles<input class="in" name="disponibles" value="${esc(p.disponibles)}"></label></div>
    <div class="two"><label class="f">Documentación<input class="in" name="partida" value="${esc(p.partida)}" placeholder="Partida registral N° …"></label><label class="f">Entrega<input class="in" name="entrega" value="${esc(p.entrega)}"></label></div>
    <div class="three"><label class="f">Latitud<input class="in" name="lat" value="${esc(p.lat ?? '')}"></label><label class="f">Longitud<input class="in" name="lng" value="${esc(p.lng ?? '')}"></label><label class="f">Orden en la web<input class="in" type="number" name="orden" value="${esc(p.orden || 9)}"></label></div>
    <label class="f">Foto de portada<input class="in" type="file" name="portadaFile" accept="image/*"></label>
    ${p.portada ? `<div class="thumbs"><div class="t"><img ${srcAttr(p.portada)} alt=""></div></div>` : ''}
    <label class="f">Agregar fotos a la galería <span class="hint">Puedes elegir varias</span><input class="in" type="file" name="galeriaFiles" accept="image/*" multiple></label>
    <div class="thumbs" data-gal>${(p.galeria || []).map((g, i) => `<div class="t"><img ${srcAttr(g)} alt=""><button type="button" data-act="gal-del" data-i="${i}" aria-label="Quitar">×</button></div>`).join('')}</div>
    <div class="two"><label class="f">Plano (imagen)<input class="in" type="file" name="planoFile" accept="image/*"></label><label class="f">Video (archivo)<input class="in" type="file" name="videoFile" accept="video/*"></label></div>
    <div style="display:flex;gap:18px;flex-wrap:wrap"><label class="check"><input type="checkbox" name="publico" ${p.publico !== false ? 'checked' : ''}> Publicado en la web</label><label class="check"><input type="checkbox" name="destacado" ${p.destacado ? 'checked' : ''}> Destacado en el inicio</label></div>
    <button class="btn btn-gold">Guardar proyecto</button></form>`;
}

/* ---------- Asesores (CEO) ---------- */
function vAsesores(u, r) {
  const q = (r.query.q || '').toLowerCase();
  const list = DB.all('users').filter((x) => x.rol !== 'ceo' && x.estado !== 'pendiente' && (!q || x.nombre.toLowerCase().includes(q)));
  const vs = ventasOk();
  panelShell(u, 'asesores', 'Asesores', `<button class="btn btn-gold btn-sm" data-act="user-edit">${ic('plus')} Agregar asesor</button>`, `
    <div class="toolbar"><input class="in" type="search" placeholder="Buscar por nombre…" value="${esc(r.query.q || '')}" data-search="#/panel/asesores"><span class="muted" style="font-size:13px">${list.length} personas</span></div>
    <div class="list-cards">${list.map((x) => {
      const mine = vs.filter((v) => v.asesorId === x.id); const eq = DB.get('equipos', x.equipoId);
      const pend = mine.filter((v) => v.comisionEstado === 'pendiente').reduce((s, v) => s + v.comisionMonto, 0);
      return `<div class="ucard"><div class="top">${avatar(x, 'av-lg')}<div><b style="font-size:16px">${esc(x.nombre)}</b><div class="muted" style="font-size:13px">${ROL_TXT[x.rol]}${eq ? ' · ' + esc(eq.nombre) : ''}</div><div style="margin-top:4px">${badgeE(x.estado)} ${x.demo ? '<span class="badge b-warn">Ejemplo</span>' : ''}</div></div></div>
        <div class="meta"><div>Lotes<b>${mine.length}</b></div><div>Vendido<b>${money(mine.reduce((s, v) => s + v.precio, 0))}</b></div><div>Comisión<b>${comisionDe(x)} %</b></div><div>Por abonar<b>${money(pend)}</b></div></div>
        <div class="acts"><button class="btn btn-green btn-xs" data-act="user-edit" data-id="${x.id}">${ic('edit')} Editar</button><a class="btn btn-wa btn-xs" target="_blank" rel="noopener" href="${waLink(x.telefono)}">WhatsApp</a><a class="btn btn-line btn-xs" href="#/panel/comisiones?a=${x.id}">Comisiones</a></div></div>`;
    }).join('') || emptyState('users', 'Aún no hay asesores.')}</div>`);
}
function userForm(x = {}) {
  return `<form class="form" data-form="user" data-id="${esc(x.id || '')}">
    <div class="two"><label class="f">Nombre<input class="in" name="nombre" required value="${esc(x.nombre)}"></label><label class="f">Rol<select class="in" name="rol">${[['asesor', 'Asesor(a)'], ['aliado', 'Aliado'], ['ceo', 'CEO / administrador']].map(([v, t]) => `<option value="${v}" ${x.rol === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
    <div class="two"><label class="f">Correo (para ingresar)<input class="in" type="email" name="email" required value="${esc(x.email)}"></label><label class="f">WhatsApp <span class="hint">con 51 delante</span><input class="in" name="telefono" value="${esc(x.telefono)}" placeholder="519XXXXXXXX"></label></div>
    <div class="three"><label class="f">Ciudad / zona<input class="in" name="zona" value="${esc(x.zona)}"></label><label class="f">Equipo<select class="in" name="equipoId"><option value="">Sin equipo</option>${DB.all('equipos').map((e) => `<option value="${e.id}" ${x.equipoId === e.id ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('')}</select></label><label class="f">Comisión %<input class="in" type="number" step="0.5" min="0" max="50" name="comision" value="${esc(x.comision ?? DB.settings.comisionDefault)}"></label></div>
    <label class="f">Estado<select class="in" name="estado">${['activo', 'pendiente', 'inactivo'].map((v) => `<option ${x.estado === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <label class="f">Presentación corta<textarea class="in" name="bio" rows="2">${esc(x.bio)}</textarea></label>
    <label class="f">Foto de perfil<input class="in" type="file" name="fotoFile" accept="image/*"></label>
    <label class="f">${x.id ? 'Nueva contraseña <span class="hint">(déjalo vacío para no cambiarla)</span>' : 'Contraseña inicial'}<input class="in" type="text" name="pass" ${x.id ? '' : 'required minlength="8"'} autocomplete="new-password"></label>
    <label class="check"><input type="checkbox" name="publico" ${x.publico !== false ? 'checked' : ''}> Mostrar su perfil en la página web</label>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-gold">Guardar</button>${x.id ? `<button type="button" class="btn btn-danger" data-act="user-del" data-id="${x.id}">Eliminar usuario</button>` : ''}</div></form>`;
}

/* ---------- Equipos y aliados (CEO) ---------- */
function vEquipos(u) {
  const eqs = DB.all('equipos'); const vs = ventasOk();
  panelShell(u, 'equipos', 'Equipos y aliados', `<button class="btn btn-gold btn-sm" data-act="eq-edit">${ic('plus')} Nuevo equipo / aliado</button>`, `
    <div class="kpis">${kpi('Equipos internos', eqs.filter((e) => e.tipo !== 'Aliado estratégico').length, '', 'team', true)}${kpi('Aliados', eqs.filter((e) => e.tipo === 'Aliado estratégico').length, 'Inmobiliarias y equipos externos', 'users')}${kpi('Lotes por aliados', vs.filter((v) => DB.get('equipos', DB.get('users', v.asesorId)?.equipoId)?.tipo === 'Aliado estratégico').length, '', 'grid')}${kpi('Sin equipo', DB.all('users').filter((x) => x.rol !== 'ceo' && !x.equipoId).length, 'asesores', 'user')}</div>
    <div class="list-cards">${eqs.map((e) => {
      const mem = DB.all('users').filter((x) => x.equipoId === e.id); const ids = mem.map((m) => m.id);
      const mine = vs.filter((v) => ids.includes(v.asesorId)); const lider = DB.get('users', e.liderId);
      return `<div class="ucard"><div class="top"><span class="av av-lg" style="font-size:22px">${ic(e.tipo === 'Aliado estratégico' ? 'users' : 'team')}</span><div><b style="font-size:16px">${esc(e.nombre)}</b><div class="muted" style="font-size:13px">${esc(e.tipo)} · ${esc(e.zona || '')}</div>${e.demo ? '<span class="badge b-warn">Ejemplo</span>' : ''}</div></div>
        <div class="meta"><div>Integrantes<b>${mem.length}</b></div><div>Lotes<b>${mine.length}</b></div><div>Vendido<b>${money(mine.reduce((s, v) => s + v.precio, 0))}</b></div><div>Líder<b style="font-size:13px">${esc(lider?.nombre || '—')}</b></div></div>
        <div style="display:flex;gap:-6px;flex-wrap:wrap;gap:4px">${mem.slice(0, 8).map((m) => avatar(m, 'av-sm')).join('')}</div>
        <div class="acts"><button class="btn btn-green btn-xs" data-act="eq-edit" data-id="${e.id}">${ic('edit')} Editar</button><button class="btn btn-danger btn-xs" data-act="eq-del" data-id="${e.id}">Eliminar</button></div></div>`;
    }).join('') || emptyState('team', 'Aún no hay equipos.')}</div>`);
}
function eqForm(e = {}) {
  const us = DB.all('users').filter((x) => x.rol !== 'ceo');
  return `<form class="form" data-form="equipo" data-id="${esc(e.id || '')}">
    <div class="two"><label class="f">Nombre<input class="in" name="nombre" required value="${esc(e.nombre)}"></label><label class="f">Tipo<select class="in" name="tipo">${['Equipo interno', 'Aliado estratégico'].map((t) => `<option ${e.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
    <div class="three"><label class="f">Líder<select class="in" name="liderId"><option value="">—</option>${us.map((x) => `<option value="${x.id}" ${e.liderId === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></label><label class="f">Zona<input class="in" name="zona" value="${esc(e.zona)}"></label><label class="f">Comisión del equipo % <span class="hint">opcional</span><input class="in" type="number" step="0.5" name="comision" value="${esc(e.comision)}"></label></div>
    <label class="f">Descripción<textarea class="in" name="descripcion" rows="2">${esc(e.descripcion)}</textarea></label>
    <label class="f">Integrantes</label><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;max-height:220px;overflow:auto;padding:4px">${us.map((x) => `<label class="check"><input type="checkbox" name="m_${x.id}" ${e.id && x.equipoId === e.id ? 'checked' : ''}> ${esc(x.nombre)}</label>`).join('')}</div>
    <button class="btn btn-gold">Guardar</button></form>`;
}
function vMiEquipo(u) {
  const eq = DB.all('equipos').find((e) => e.liderId === u.id || e.id === u.equipoId);
  if (!eq) return panelShell(u, 'equipo', 'Mi equipo', '', emptyState('team', 'Aún no perteneces a un equipo.'));
  const mem = DB.all('users').filter((x) => x.equipoId === eq.id); const vs = ventasOk();
  panelShell(u, 'equipo', esc(eq.nombre), '', `
    <div class="kpis">${kpi('Integrantes', mem.length, eq.tipo, 'users', true)}${kpi('Lotes del equipo', vs.filter((v) => mem.some((m) => m.id === v.asesorId)).length, '', 'grid')}${kpi('Vendido', money(vs.filter((v) => mem.some((m) => m.id === v.asesorId)).reduce((s, v) => s + v.precio, 0)), '', 'cash')}${kpi('Zona', esc(eq.zona || '—'), '', 'map')}</div>
    <div class="panel"><h2>Integrantes</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nombre</th><th>Zona</th><th class="num">Lotes</th><th class="num">Vendido</th><th></th></tr></thead><tbody>
    ${mem.map((m) => { const mv = vs.filter((v) => v.asesorId === m.id); return `<tr><td><div class="who">${avatar(m, 'av-sm')}${esc(m.nombre)}</div></td><td>${esc(m.zona || '')}</td><td class="num">${mv.length}</td><td class="num">${money(mv.reduce((s, v) => s + v.precio, 0))}</td><td><a class="btn btn-wa btn-xs" href="${waLink(m.telefono)}" target="_blank" rel="noopener">WhatsApp</a></td></tr>`; }).join('')}
    </tbody></table></div></div>`);
}

/* ---------- Ventas ---------- */
function vVentas(u, r) {
  const f = r.query.f || 'todas';
  let list = DB.all('ventas').filter((v) => isCeo(u) || v.asesorId === u.id);
  if (f !== 'todas') list = list.filter((v) => v.estado === f);
  list = list.slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
  const tabs = ['todas', 'confirmada', 'reportada', 'anulada'].map((t) => `<a class="chip ${f === t ? 'on' : ''}" href="#/panel/ventas?f=${t}">${t === 'todas' ? 'Todas' : t[0].toUpperCase() + t.slice(1) + 's'}</a>`).join('');
  panelShell(u, 'ventas', isCeo(u) ? 'Ventas' : 'Mis ventas', `<button class="btn btn-gold btn-sm" data-act="venta-new">${ic('plus')} ${isCeo(u) ? 'Registrar venta' : 'Reportar venta'}</button>`, `
    <div class="filters">${tabs}</div>
    <div class="panel">${list.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fecha</th><th>Proyecto / lote</th><th>Cliente</th>${isCeo(u) ? '<th>Asesor</th>' : ''}<th class="num">Precio</th><th class="num">Comisión</th><th>Estado</th><th></th></tr></thead><tbody>
    ${list.map((v) => { const p = DB.get('proyectos', v.proyectoId); const a = DB.get('users', v.asesorId); return `<tr><td style="white-space:nowrap">${fdate(v.fecha)}</td><td><b>${esc(p?.nombre || '—')}</b><div class="muted" style="font-size:12.5px">${esc(v.lote)}</div></td><td>${esc(v.cliente)}</td>${isCeo(u) ? `<td><div class="who">${avatar(a, 'av-sm')}${esc(a?.nombre || '—')}</div></td>` : ''}<td class="num">${money(v.precio)}</td><td class="num">${money2(v.comisionMonto)}<div class="muted" style="font-size:12px">${v.comisionPct} %</div></td><td>${badgeE(v.estado)}</td>
      <td style="white-space:nowrap">${isCeo(u) ? `${v.estado === 'reportada' ? `<button class="btn btn-green btn-xs" data-act="venta-ok" data-id="${v.id}">Confirmar</button> ` : ''}<button class="btn btn-line btn-xs" data-act="venta-edit" data-id="${v.id}">Editar</button>` : (v.estado === 'reportada' ? '<span class="muted" style="font-size:12px">En revisión</span>' : '')}</td></tr>`; }).join('')}
    </tbody></table></div>` : emptyState('cash', 'No hay ventas registradas aquí.', `<button class="btn btn-gold btn-sm" data-act="venta-new">${isCeo(u) ? 'Registrar' : 'Reportar'} la primera venta</button>`)}</div>`);
}
function ventaForm(u, v = {}) {
  const asesores = DB.all('users').filter((x) => x.rol !== 'ceo' && x.estado === 'activo');
  return `<form class="form" data-form="venta" data-id="${esc(v.id || '')}">
    <div class="two"><label class="f">Proyecto<select class="in" name="proyectoId" required>${DB.all('proyectos').map((p) => `<option value="${p.id}" ${v.proyectoId === p.id ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}</select></label><label class="f">Lote / manzana<input class="in" name="lote" required value="${esc(v.lote)}" placeholder="Mz B – Lote 12"></label></div>
    <div class="two"><label class="f">Cliente<input class="in" name="cliente" required value="${esc(v.cliente)}"></label><label class="f">Fecha<input class="in" type="date" name="fecha" required value="${esc(v.fecha || today())}"></label></div>
    <div class="${isCeo(u) ? 'three' : 'two'}"><label class="f">Precio de venta (S/)<input class="in" type="number" min="0" name="precio" required value="${esc(v.precio)}"></label>
      ${isCeo(u) ? `<label class="f">Asesor<select class="in" name="asesorId" required>${asesores.map((x) => `<option value="${x.id}" ${v.asesorId === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></label>
      <label class="f">Comisión % <span class="hint">vacío = la del asesor</span><input class="in" type="number" step="0.5" name="comisionPct" value="${esc(v.comisionPct ?? '')}"></label>` : `<label class="f">Tu comisión<input class="in" disabled value="${comisionDe(u)} %"></label>`}</div>
    ${isCeo(u) ? `<div class="two"><label class="f">Estado de la venta<select class="in" name="estado">${['confirmada', 'reportada', 'anulada'].map((e) => `<option ${v.estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select></label><label class="f">Comisión<select class="in" name="comisionEstado">${['pendiente', 'abonada'].map((e) => `<option ${v.comisionEstado === e ? 'selected' : ''}>${e}</option>`).join('')}</select></label></div>` : '<p class="muted" style="font-size:13px">Tu venta quedará “en revisión” hasta que la oficina la confirme. Ahí se suma tu comisión.</p>'}
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-gold">${isCeo(u) ? 'Guardar venta' : 'Enviar a revisión'}</button>${v.id && isCeo(u) ? `<button type="button" class="btn btn-danger" data-act="venta-del" data-id="${v.id}">Eliminar</button>` : ''}</div></form>`;
}

/* ---------- Comisiones ---------- */
function vComisiones(u, r) {
  const vs = ventasOk();
  if (!isCeo(u) || r.query.a) {
    const who = isCeo(u) ? DB.get('users', r.query.a) : u;
    if (!who) return Router.go('#/panel/comisiones');
    const mine = vs.filter((v) => v.asesorId === who.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const pend = mine.filter((v) => v.comisionEstado === 'pendiente'); const pag = mine.filter((v) => v.comisionEstado === 'abonada');
    return panelShell(u, 'comisiones', isCeo(u) ? 'Comisiones de ' + esc(who.nombre.split(' ')[0]) : 'Mis comisiones', isCeo(u) ? `<a class="btn btn-line btn-sm" href="#/panel/comisiones">← Todas</a>${pend.length ? ` <button class="btn btn-gold btn-sm" data-act="abonar-todo" data-id="${who.id}">Abonar todo (${money2(pend.reduce((s, v) => s + v.comisionMonto, 0))})</button>` : ''}` : '', `
      <div class="kpis">${kpi('Por abonar', money2(pend.reduce((s, v) => s + v.comisionMonto, 0)), pend.length + ' ventas', 'wallet', true)}${kpi('Abonado', money2(pag.reduce((s, v) => s + v.comisionMonto, 0)), pag.length + ' ventas', 'coins')}${kpi('Comisión', comisionDe(who) + ' %', 'por venta', 'trend')}${kpi('Lotes', mine.length, 'confirmados', 'grid')}</div>
      <div class="panel">${mine.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fecha</th><th>Proyecto / lote</th><th class="num">Venta</th><th class="num">Comisión</th><th>Estado</th><th>Abonado el</th>${isCeo(u) ? '<th></th>' : ''}</tr></thead><tbody>
      ${mine.map((v) => `<tr><td>${fdate(v.fecha)}</td><td><b>${esc(DB.get('proyectos', v.proyectoId)?.nombre || '')}</b><div class="muted" style="font-size:12.5px">${esc(v.lote)}</div></td><td class="num">${money(v.precio)}</td><td class="num"><b>${money2(v.comisionMonto)}</b></td><td>${badgeE(v.comisionEstado)}</td><td>${fdate(v.fechaAbono) || '—'}</td>${isCeo(u) ? `<td>${v.comisionEstado === 'pendiente' ? `<button class="btn btn-green btn-xs" data-act="abonar" data-id="${v.id}">Abonar</button>` : `<button class="btn btn-line btn-xs" data-act="desabonar" data-id="${v.id}">Deshacer</button>`}</td>` : ''}</tr>`).join('')}
      </tbody></table></div>` : emptyState('coins', 'Aún no hay comisiones.')}</div>`);
  }
  const rows = DB.all('users').filter((x) => x.rol !== 'ceo').map((x) => {
    const mine = vs.filter((v) => v.asesorId === x.id);
    return { x, pend: mine.filter((v) => v.comisionEstado === 'pendiente').reduce((s, v) => s + v.comisionMonto, 0), pag: mine.filter((v) => v.comisionEstado === 'abonada').reduce((s, v) => s + v.comisionMonto, 0), n: mine.length };
  }).filter((r) => r.n).sort((a, b) => b.pend - a.pend);
  const tp = rows.reduce((s, r) => s + r.pend, 0), ta = rows.reduce((s, r) => s + r.pag, 0);
  panelShell(u, 'comisiones', 'Comisiones', '', `
    <div class="kpis">${kpi('Total por abonar', money2(tp), rows.filter((r) => r.pend).length + ' personas', 'wallet', true)}${kpi('Total abonado', money2(ta), 'histórico', 'coins')}${kpi('Comisión por defecto', DB.settings.comisionDefault + ' %', 'Se cambia en Ajustes', 'trend')}${kpi('Ventas confirmadas', vs.length, '', 'cash')}</div>
    <div class="panel"><h2>Por asesor</h2>${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Asesor</th><th class="num">Lotes</th><th class="num">Abonado</th><th class="num">Por abonar</th><th></th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td><div class="who">${avatar(r.x, 'av-sm')}<div><b>${esc(r.x.nombre)}</b><div class="muted" style="font-size:12px">${comisionDe(r.x)} %</div></div></div></td><td class="num">${r.n}</td><td class="num">${money2(r.pag)}</td><td class="num"><b style="color:${r.pend ? 'var(--bad)' : 'inherit'}">${money2(r.pend)}</b></td><td style="white-space:nowrap"><a class="btn btn-line btn-xs" href="#/panel/comisiones?a=${r.x.id}">Detalle</a> ${r.pend ? `<button class="btn btn-gold btn-xs" data-act="abonar-todo" data-id="${r.x.id}">Abonar</button>` : ''}</td></tr>`).join('')}
    </tbody></table></div>` : emptyState('coins', 'Aún no hay comisiones.')}</div>`);
}

/* ---------- Muro de contenido ---------- */
function vMuro(u) {
  const posts = DB.all('posts');
  panelShell(u, 'muro', seesAll(u) ? 'Muro de contenido' : 'Contenido para publicar', '', `
    ${seesAll(u) ? `<form class="panel form" data-form="post" style="max-width:640px;margin:0 auto 20px">
      <div style="display:flex;gap:12px;align-items:center">${avatar(u)}<b>Publicar para el equipo</b></div>
      <textarea class="in" name="texto" rows="3" placeholder="Escribe el texto para acompañar el video o la foto. Los asesores podrán copiarlo."></textarea>
      <label class="drop">${ic('img')}<br>Toca para subir un <b>video</b> o una <b>foto</b><input type="file" name="file" accept="video/*,image/*" class="sr"></label>
      <p class="muted" data-file-name style="font-size:13px"></p>
      <div class="two"><label class="f">Proyecto<select class="in" name="proyectoId"><option value="">General</option>${DB.all('proyectos').map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select></label>
      <label class="f">¿Quién lo ve?<select class="in" name="publico"><option value="1">Público: web + equipo</option><option value="0">Solo el equipo (privado)</option></select></label></div>
      <button class="btn btn-gold">Publicar</button></form>` : `<div class="panel" style="max-width:640px;margin:0 auto 20px;background:#FFF9EA;border-color:#F0DFAE"><b>¿Cómo usar este contenido?</b><p class="muted" style="font-size:14px;margin-top:6px">1) Toca <b>Descargar</b> y guarda el video en tu celular. 2) Súbelo a tus redes con el texto de la publicación. 3) Usa <b>Compartir</b> para mandar el enlace por WhatsApp: los contactos que lleguen por tu enlace quedan a tu nombre.</p></div>`}
    <div class="feed">${posts.map((p) => postCard(p, u) + (seesAll(u) ? `<div style="text-align:right;margin-top:-12px"><button class="btn btn-line btn-xs" data-act="post-vis" data-id="${p.id}">${p.publico ? 'Ocultar de la web' : 'Mostrar en la web'}</button> <button class="btn btn-danger btn-xs" data-act="post-del" data-id="${p.id}">Eliminar</button></div>` : '')).join('') || emptyState('video', 'Aún no hay publicaciones.')}</div>`);
}

/* ---------- Catálogo para asesores ---------- */
function vCatalogo(u) {
  panelShell(u, 'catalogo', 'Proyectos y precios', '', `
    <p class="muted" style="margin-bottom:18px">Comparte los proyectos con <b>tu enlace personal</b>: quien lo abra verá tu foto y te escribirá a ti por WhatsApp.</p>
    <div class="list-cards">${DB.all('proyectos').filter((p) => p.publico).map((p) => `<div class="ucard" style="padding:0;overflow:hidden"><div style="aspect-ratio:16/9;background:var(--green-dark)">${p.portada ? `<img ${srcAttr(p.portada)} alt="" style="width:100%;height:100%;object-fit:cover">` : `<div class="ph-empty" style="font-size:20px">${esc(p.nombre)}</div>`}</div>
      <div style="padding:16px;display:grid;gap:10px"><b style="font-size:16px">${esc(p.nombre)}</b><span class="muted" style="font-size:13px">${esc(p.precioTexto)}</span>
      ${(p.precios || []).map((x) => `<div style="font-size:13px;display:flex;justify-content:space-between;gap:8px;border-top:1px dashed var(--line);padding-top:6px"><span>${esc(x.t)}</span><b>${esc(x.v)}</b></div>`).join('')}
      <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-gold btn-xs" data-act="share-project" data-id="${p.id}">${ic('share')} Compartir con mi enlace</button><a class="btn btn-line btn-xs" href="#/proyecto/${p.id}" target="_blank">Ver ficha</a></div></div></div>`).join('')}</div>`);
}

/* ---------- Contactos (leads) ---------- */
function vLeads(u) {
  const list = DB.all('leads').filter((l) => seesAll(u) || l.asesorId === u.id).slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
  const asesores = DB.all('users').filter((x) => x.rol !== 'ceo' && x.estado === 'activo');
  panelShell(u, 'leads', seesAll(u) ? 'Contactos y <b>embudo</b>' : 'Mis <b>contactos</b>', '', `<div class="pgrid"><div class="panel"><h2>Embudo</h2>${funnelHtml(list)}</div><div class="panel"><h2>Origen</h2>${origenHtml(list)}</div></div><div class="panel"><h2>Todos los contactos <span class="muted" style="font-weight:500;font-size:12.5px">Cambia el estado a medida que avanza cada cliente</span></h2>${list.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fecha</th><th>Nombre</th><th>Interés</th><th>Origen</th>${seesAll(u) ? '<th>Asesor</th>' : ''}<th>Estado</th><th></th></tr></thead><tbody>
    ${list.map((l) => `<tr><td style="white-space:nowrap">${ago(l.fecha)}</td><td><b>${esc(l.nombre)}</b><div class="muted" style="font-size:12.5px">${esc(l.telefono)}${l.mensaje ? ' · ' + esc(l.mensaje.slice(0, 60)) : ''}</div></td><td>${esc(l.interes)}</td><td><span class="badge b-grey">${esc(l.origen || 'Web')}</span></td>
      ${seesAll(u) ? `<td><select class="in" style="min-height:34px;padding:5px 8px;font-size:13px" data-lead-asesor="${l.id}"><option value="">Sin asignar</option>${asesores.map((x) => `<option value="${x.id}" ${l.asesorId === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></td>` : ''}
      <td><select class="in" style="min-height:34px;padding:5px 8px;font-size:13px" data-lead-estado="${l.id}">${LEAD_ESTADOS.map((e) => `<option ${l.estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select></td>
      <td><a class="btn btn-wa btn-xs" target="_blank" rel="noopener" href="${waLink(String(l.telefono).replace(/\D/g, '').length === 9 ? '51' + String(l.telefono).replace(/\D/g, '') : l.telefono, 'Hola ' + l.nombre.split(' ')[0] + ', te escribo de Infinity Group por tu consulta sobre ' + l.interes + '.')}">WhatsApp</a></td></tr>`).join('')}
    </tbody></table></div>` : emptyState('inbox', 'Aún no llegan contactos. Cuando alguien llene el formulario de la web, aparecerá aquí.')}</div>`);
}

/* ---------- Testimonios (CEO) ---------- */
function vTestimonios(u) {
  const list = DB.all('testimonios');
  panelShell(u, 'testimonios', 'Testimonios', `<button class="btn btn-gold btn-sm" data-act="test-new">${ic('plus')} Agregar testimonio</button>`, `
    <p class="muted" style="margin-bottom:16px">Los testimonios que envían los clientes desde la web llegan aquí. Solo se publican los que apruebes.</p>
    <div class="list-cards">${list.map((t) => `<div class="ucard"><div class="top">${t.foto ? `<span class="av av-lg"><img ${srcAttr(t.foto)} alt=""></span>` : `<span class="av av-lg">${esc(initials(t.nombre))}</span>`}<div><b>${esc(t.nombre)}</b><div class="muted" style="font-size:13px">${esc(t.ciudad || '')} · ${ago(t.fecha)}${DB.get('users', t.asesorId) ? ' · Asesor: ' + esc(DB.get('users', t.asesorId).nombre) : ''}</div>${badgeE(t.estado)}</div></div>
      <p style="font-style:italic">“${esc(t.texto)}”</p>
      <div class="acts">${t.estado !== 'aprobado' ? `<button class="btn btn-green btn-xs" data-act="test-ok" data-id="${t.id}">Aprobar y publicar</button>` : `<button class="btn btn-line btn-xs" data-act="test-hide" data-id="${t.id}">Ocultar</button>`}<button class="btn btn-danger btn-xs" data-act="test-del" data-id="${t.id}">Eliminar</button></div></div>`).join('') || emptyState('quote', 'Aún no hay testimonios.')}</div>`);
}

/* ---------- Solicitudes (CEO) ---------- */
function vSolicitudes(u) {
  const list = DB.all('users').filter((x) => x.estado === 'pendiente');
  panelShell(u, 'solicitudes', 'Solicitudes de registro', '', `<div class="list-cards">${list.map((x) => `<div class="ucard"><div class="top">${avatar(x, 'av-lg')}<div><b style="font-size:16px">${esc(x.nombre)}</b><div class="muted" style="font-size:13px">${ROL_TXT[x.rol]} · ${esc(x.zona || '')}</div><div class="muted" style="font-size:12.5px">${esc(x.email)} · ${esc(x.telefono)}</div></div></div>
    ${x.bio ? `<p style="font-size:14px">${esc(x.bio)}</p>` : ''}<div class="acts"><button class="btn btn-green btn-xs" data-act="sol-ok" data-id="${x.id}">${ic('check')} Aprobar</button><button class="btn btn-line btn-xs" data-act="user-edit" data-id="${x.id}">Revisar</button><a class="btn btn-wa btn-xs" href="${waLink(x.telefono)}" target="_blank" rel="noopener">WhatsApp</a><button class="btn btn-danger btn-xs" data-act="user-del" data-id="${x.id}">Rechazar</button></div></div>`).join('') || emptyState('user', 'No hay solicitudes pendientes.')}</div>`);
}

/* ---------- Ajustes de la web (CEO) ---------- */
function vAjustes(u) {
  const s = DB.settings;
  const dir = (d, i) => `<fieldset class="card form" style="padding:18px"><legend style="font-weight:700;padding:0 6px">Directivo ${i + 1}</legend>
    <div class="two"><label class="f">Nombre<input class="in" name="d${i}_nombre" value="${esc(d.nombre)}"></label><label class="f">Cargo<input class="in" name="d${i}_cargo" value="${esc(d.cargo)}"></label></div>
    <label class="f">Frase<input class="in" name="d${i}_frase" value="${esc(d.frase)}"></label>
    <label class="f">Historia<textarea class="in" name="d${i}_historia" rows="4">${esc(d.historia)}</textarea></label>
    <div class="two"><label class="f">Facebook<input class="in" name="d${i}_facebook" value="${esc(d.facebook)}"></label><label class="f">Instagram<input class="in" name="d${i}_instagram" value="${esc(d.instagram)}"></label></div>
    <label class="f">Foto<input class="in" type="file" name="d${i}_fotoFile" accept="image/*"></label></fieldset>`;
  panelShell(u, 'ajustes', 'Ajustes de la web', '', `<form class="form" data-form="ajustes" style="max-width:900px">
    <div class="panel form"><h2>Empresa</h2>
      <div class="two"><label class="f">Nombre comercial<input class="in" name="empresa" value="${esc(s.empresa)}"></label><label class="f">Razón social<input class="in" name="razonSocial" value="${esc(s.razonSocial)}"></label></div>
      <div class="three"><label class="f">RUC<input class="in" name="ruc" value="${esc(s.ruc)}"></label><label class="f">WhatsApp principal <span class="hint">con 51</span><input class="in" name="whatsapp" value="${esc(s.whatsapp)}"></label><label class="f">Horario<input class="in" name="horario" value="${esc(s.horario)}"></label></div>
      <label class="f">Dirección<input class="in" name="direccion" value="${esc(s.direccion)}"></label>
      <label class="f">Frase principal de la web<input class="in" name="lema" value="${esc(s.lema)}"></label></div>
    <div class="panel form"><h2>Historia, misión y visión</h2>
      <label class="f">Historia<textarea class="in" name="historia" rows="4">${esc(s.historia)}</textarea></label>
      <label class="f">Misión<textarea class="in" name="mision" rows="3">${esc(s.mision)}</textarea></label>
      <label class="f">Visión<textarea class="in" name="vision" rows="3">${esc(s.vision)}</textarea></label>
      <label class="f">Valores <span class="hint">separados por comas</span><input class="in" name="valores" value="${esc(s.valores.join(', '))}"></label>
      <div class="two"><label class="f">Lotes vendidos (histórico)<input class="in" type="number" name="lotesVendidos" value="${s.stats.lotesVendidos}"></label><label class="f">Proyectos desarrollados (histórico)<input class="in" type="number" name="proyectosHistoricos" value="${s.stats.proyectosHistoricos}"></label></div></div>
    <div class="panel form"><h2>Trayectoria (línea de tiempo) <span class="hint muted" style="font-weight:500;font-size:12px">Una por línea: Título | Descripción</span></h2><textarea class="in" name="hitos" rows="6">${esc((s.hitos || []).map((h) => h.t + ' | ' + h.d).join('\n'))}</textarea></div>
    <div class="panel form"><h2>Textos de los espacios Invertir · Vivir · Emprender</h2>${['invertir', 'vivir', 'emprender'].map((k) => `<div class="two"><label class="f">${k[0].toUpperCase() + k.slice(1)}: título<input class="in" name="au_${k}_titulo" value="${esc(s.audiencias[k].titulo)}"></label><label class="f">Texto<input class="in" name="au_${k}_texto" value="${esc(s.audiencias[k].texto)}"></label></div>`).join('')}</div>
    <div class="panel form"><h2>CEO y directivos</h2>${s.directivos.map(dir).join('')}</div>
    <div class="panel form"><h2>Anuncio destacado (barra superior y portada)</h2>
      <label class="check"><input type="checkbox" name="an_activo" ${s.anuncio.activo ? 'checked' : ''}> Mostrar anuncio</label>
      <div class="two"><label class="f">Etiqueta<input class="in" name="an_etiqueta" value="${esc(s.anuncio.etiqueta)}"></label><label class="f">Título<input class="in" name="an_titulo" value="${esc(s.anuncio.titulo)}"></label></div>
      <label class="f">Texto<textarea class="in" name="an_texto" rows="2">${esc(s.anuncio.texto)}</textarea></label>
      <label class="f">Proyecto al que lleva<select class="in" name="an_proyectoId">${DB.all('proyectos').map((p) => `<option value="${p.id}" ${s.anuncio.proyectoId === p.id ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}</select></label></div>
    <div class="panel form"><h2>Redes sociales</h2><div class="two">${['facebook', 'instagram', 'tiktok', 'youtube'].map((k) => `<label class="f">${k[0].toUpperCase() + k.slice(1)}<input class="in" name="r_${k}" value="${esc(s.redes[k])}" placeholder="https://…"></label>`).join('')}</div></div>
    <div class="panel form"><h2>Comisiones y metas</h2><div class="two"><label class="f">Comisión por defecto %<input class="in" type="number" step="0.5" name="comisionDefault" value="${s.comisionDefault}"></label><label class="f">Meta mensual de lotes por asesor<input class="in" type="number" name="metaMensualLotes" value="${s.metaMensualLotes}"></label></div></div>
    <button class="btn btn-gold" style="position:sticky;bottom:16px;justify-self:start;box-shadow:var(--shadow-lg)">Guardar cambios</button></form>
    <div class="panel" style="max-width:900px;margin-top:24px"><h2>Datos</h2><div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-line btn-sm" data-act="export">${ic('down')} Descargar copia de seguridad</button>
      <label class="btn btn-line btn-sm">Restaurar copia<input type="file" accept="application/json" class="sr" data-import></label>
      ${s.modoDemo ? `<button class="btn btn-danger btn-sm" data-act="clear-demo">Borrar datos de ejemplo</button>` : ''}
      <button class="btn btn-danger btn-sm" data-act="reset-all">Restablecer todo</button></div></div>`);
}

/* ---------- Mi perfil ---------- */
function vPerfil(u) {
  const link = baseUrl() + '#/?ref=' + u.id;
  panelShell(u, 'perfil', 'Mi perfil', '', `<div class="pgrid"><form class="panel form" data-form="perfil">
    <div style="display:flex;gap:16px;align-items:center">${avatar(u, 'av-lg')}<label class="btn btn-line btn-sm">Cambiar foto<input type="file" name="fotoFile" accept="image/*" class="sr"></label></div>
    <div class="two"><label class="f">Nombre<input class="in" name="nombre" required value="${esc(u.nombre)}"></label><label class="f">WhatsApp <span class="hint">con 51</span><input class="in" name="telefono" value="${esc(u.telefono)}"></label></div>
    <label class="f">Ciudad / zona<input class="in" name="zona" value="${esc(u.zona)}"></label>
    <label class="f">Presentación<textarea class="in" name="bio" rows="3">${esc(u.bio)}</textarea></label>
    <label class="f">Nueva contraseña <span class="hint">(opcional)</span><input class="in" type="password" name="pass" minlength="8" autocomplete="new-password"></label>
    <button class="btn btn-gold">Guardar</button></form>
    ${u.rol !== 'ceo' ? `<div class="panel"><h2>Mi enlace personal</h2><p class="muted" style="font-size:14px">Compártelo en tus redes. Quien entre por aquí verá tu foto y te escribirá a ti.</p><input class="in" readonly value="${esc(link)}" style="margin:12px 0" onclick="this.select()"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-green btn-sm" data-act="copy" data-text="${esc(link)}">Copiar enlace</button><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Conoce los proyectos de Infinity Group: ' + link)}">Enviar por WhatsApp</a></div></div>` : ''}</div>`);
}
