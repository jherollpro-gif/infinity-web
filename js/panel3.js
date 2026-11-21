/* ==========================================================
   PLATAFORMA v3: organización completa
   Rangos · Mi red · Metas con fechas · Agenda de visitas ·
   Tablero de tareas · Marketing (publicidad + grabaciones) · Áreas
   ========================================================== */
ROL_TXT.marketing = 'Marketing';
const seesAll = (u) => u && (u.rol === 'ceo' || u.rol === 'marketing');
const AREAS = ['Dirección', 'Comercial', 'Marketing', 'Operaciones'];
const VIS_ESTADOS = [['pendiente', 'Por confirmar'], ['confirmada', 'Confirmada'], ['realizada', 'Realizada'], ['separo', 'Separó'], ['noasistio', 'No asistió'], ['cancelada', 'Cancelada']];
const PROD_ESTADOS = [['idea', 'Idea'], ['programado', 'Programado'], ['grabado', 'Grabado'], ['edicion', 'En edición'], ['publicado', 'Publicado']];
const ACCESS = {
  marketing: ['', 'marketing', 'visitas', 'leads', 'muro', 'eventos', 'tareas', 'metas', 'areas', 'catalogo', 'perfil'],
  asesor: ['', 'mipagina', 'ventas', 'comisiones', 'leads', 'visitas', 'red', 'metas', 'tareas', 'equipo', 'muro', 'catalogo', 'areas', 'perfil'],
  aliado: ['', 'mipagina', 'ventas', 'comisiones', 'leads', 'visitas', 'red', 'metas', 'tareas', 'equipo', 'muro', 'catalogo', 'areas', 'perfil']
};
const canAccess = (u, sub) => isCeo(u) || (ACCESS[u.rol] || []).includes(sub);
const daysTo = (d) => Math.ceil((new Date(d + 'T23:59') - Date.now()) / 864e5);
const dayLabel = (d) => { const x = daysTo(d); return x === 0 ? 'Hoy' : x === 1 ? 'Mañana' : x === -1 ? 'Ayer' : ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][new Date(d + 'T12:00').getDay()] + ' ' + fdate(d); };

/* ---------- Rangos ---------- */
function rangoDe(u) {
  const rs = DB.settings.rangos || [{ n: 'Asesor', min: 0, bono: 0, i: 'sprout' }];
  const n = lotesDe(u.id); let idx = 0;
  rs.forEach((r, i) => { if (n >= r.min) idx = i; });
  const next = rs[idx + 1];
  return Object.assign({}, rs[idx], { idx, lotes: n, next, falta: next ? next.min - n : 0, pct: next ? Math.round(((n - rs[idx].min) / (next.min - rs[idx].min)) * 100) : 100 });
}
const rangoBadge = (u) => { const r = rangoDe(u); return `<span class="rk rk${r.idx}">${ic(r.i || 'award')}${esc(r.n)}</span>`; };

/* ---------- Red (equipo debajo) y bonos de equipo ---------- */
const redDe = (uid) => DB.all('users').filter((x) => x.patrocinadorId === uid && x.estado !== 'pendiente' && x.id !== uid);
function bonosDe(uid) {
  const ids = redDe(uid).map((x) => x.id); const pct = DB.settings.bonoEquipo || 0;
  return ventasOk().filter((v) => ids.includes(v.asesorId)).map((v) => ({ v, monto: Math.round(v.precio * pct) / 100 }));
}

/* ---------- Metas ---------- */
function metaProgreso(m, uid) {
  let vs = ventasOk().filter((v) => v.fecha >= m.desde && v.fecha <= m.hasta && (!m.proyectoId || v.proyectoId === m.proyectoId));
  if (m.alcance === 'equipo') { const ids = DB.all('users').filter((x) => x.equipoId === m.targetId).map((x) => x.id); vs = vs.filter((v) => ids.includes(v.asesorId)); }
  if (m.alcance === 'asesor') vs = vs.filter((v) => v.asesorId === m.targetId);
  if (m.alcance === 'cada' && uid) vs = vs.filter((v) => v.asesorId === uid);
  const val = m.tipo === 'soles' ? vs.reduce((s, v) => s + v.precio, 0) : vs.length;
  return { val, pct: Math.min(100, Math.round((val / Math.max(1, m.objetivo)) * 100)), dias: daysTo(m.hasta) };
}
const metasPara = (u) => DB.all('metas').filter((m) => isCeo(u) || u.rol === 'marketing' || m.alcance === 'empresa' || m.alcance === 'cada' || (m.alcance === 'equipo' && m.targetId === u.equipoId) || (m.alcance === 'asesor' && m.targetId === u.id));
function metaCard(m, uid) {
  const p = metaProgreso(m, uid); const fmt = (x) => (m.tipo === 'soles' ? money(x) : x + ' lotes');
  const target = m.alcance === 'empresa' ? 'Toda la empresa' : m.alcance === 'cada' ? (uid ? 'Tu meta personal' : 'Cada asesor') : m.alcance === 'equipo' ? (DB.get('equipos', m.targetId)?.nombre || 'Equipo') : (DB.get('users', m.targetId)?.nombre || 'Asesor');
  const st = p.pct >= 100 ? '<span class="badge b-green">¡Cumplida!</span>' : p.dias < 0 ? '<span class="badge b-grey">Cerrada</span>' : `<span class="badge ${p.dias <= 7 ? 'b-bad' : 'b-warn'}">${p.dias === 0 ? 'Cierra hoy' : 'Quedan ' + p.dias + ' días'}</span>`;
  return `<div class="meta-card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><small class="muted" style="font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:11px">${esc(target)}</small><b style="display:block;font-size:16px;margin-top:2px">${esc(m.titulo)}</b></div>${st}</div>
    <div class="meta-bar"><i style="width:${p.pct}%"></i></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;gap:10px;flex-wrap:wrap"><span><b>${fmt(p.val)}</b> de ${fmt(m.objetivo)} · ${p.pct} %</span><span class="muted">${fdate(m.desde)} → ${fdate(m.hasta)}</span></div>
    ${m.premio ? `<div class="meta-prize">${ic('trophy')} ${esc(m.premio)}</div>` : ''}</div>`;
}

/* ---------- Menú por rol ---------- */
function menuFor(u) {
  const b = (n) => (n ? `<span class="n">${n}</span>` : '');
  const pend = DB.all('users').filter((x) => x.estado === 'pendiente').length;
  const rep = DB.all('ventas').filter((v) => v.estado === 'reportada').length;
  const tPend = DB.all('testimonios').filter((t) => t.estado === 'pendiente').length;
  const leadsN = DB.all('leads').filter((l) => l.estado === 'nuevo' && (seesAll(u) || l.asesorId === u.id)).length;
  const visN = DB.all('visitas').filter((v) => v.fecha >= today() && (seesAll(u) ? !v.asesorId : v.asesorId === u.id && v.estado === 'pendiente')).length;
  const tarN = DB.all('tareas').filter((t) => t.estado !== 'hecho' && (isCeo(u) || t.responsableId === u.id)).length;
  if (isCeo(u)) return [
    ['Dirección'], ['', 'home', 'Resumen general'], ['metas', 'trophy', 'Metas'], ['areas', 'team', 'Áreas y organigrama'], ['tareas', 'check', 'Tablero de tareas', b(tarN)],
    ['Comercial'], ['proyectos', 'grid', 'Proyectos'], ['asesores', 'users', 'Asesores'], ['equipos', 'team', 'Equipos y aliados'], ['ventas', 'cash', 'Ventas', b(rep)], ['comisiones', 'coins', 'Comisiones y bonos'],
    ['Clientes'], ['visitas', 'calendar', 'Agenda de visitas', b(visN)], ['leads', 'funnel', 'Contactos y embudo', b(leadsN)], ['testimonios', 'quote', 'Testimonios', b(tPend)],
    ['Marketing'], ['marketing', 'trend', 'Publicidad y grabaciones'], ['muro', 'video', 'Muro de contenido'], ['eventos', 'star', 'Eventos y prensa'],
    ['Cuenta'], ['solicitudes', 'user', 'Solicitudes', b(pend)], ['ajustes', 'gear', 'Ajustes de la web'], ['perfil', 'user', 'Mi perfil']
  ];
  if (u.rol === 'marketing') return [
    ['Marketing'], ['', 'home', 'Resumen'], ['marketing', 'trend', 'Publicidad y grabaciones'], ['muro', 'video', 'Muro de contenido'], ['eventos', 'star', 'Eventos y prensa'],
    ['Atención'], ['visitas', 'calendar', 'Agenda de visitas', b(visN)], ['leads', 'funnel', 'Contactos y embudo', b(leadsN)],
    ['Equipo'], ['tareas', 'check', 'Tablero de tareas', b(tarN)], ['metas', 'trophy', 'Metas'], ['areas', 'team', 'Áreas'],
    ['Cuenta'], ['perfil', 'user', 'Mi perfil']
  ];
  return [
    ['Mi trabajo'], ['', 'home', 'Mi resumen'], ['visitas', 'calendar', 'Mis visitas', b(visN)], ['leads', 'funnel', 'Mis contactos', b(leadsN)], ['tareas', 'check', 'Mis tareas', b(tarN)],
    ['Mis resultados'], ['ventas', 'cash', 'Mis ventas'], ['comisiones', 'coins', 'Comisiones y bonos'], ['metas', 'trophy', 'Metas y rango'], ['red', 'users', 'Mi red'],
    ...(u.rol === 'aliado' || DB.all('equipos').some((e) => e.liderId === u.id) ? [['equipo', 'team', 'Mi equipo']] : []),
    ['Mi marca'], ['mipagina', 'star', 'Mi página pública'], ['muro', 'video', 'Contenido para publicar'], ['catalogo', 'grid', 'Proyectos y precios'],
    ['Cuenta'], ['areas', 'team', 'Áreas'], ['perfil', 'user', 'Mi perfil']
  ];
}

/* ---------- Agregados a los resúmenes ---------- */
const _dashCeo = vDashCeo;
vDashCeo = function (u, r) {
  _dashCeo(u, r);
  const metas = DB.all('metas').filter((m) => metaProgreso(m).dias >= 0).slice(0, 3);
  const sin = DB.all('visitas').filter((v) => !v.asesorId && v.fecha >= today()).length;
  const hoyV = DB.all('visitas').filter((v) => v.fecha === today()).length;
  $('.pbody').insertAdjacentHTML('afterbegin', `
    ${sin ? `<a class="alert-bar" href="#/panel/visitas">${ic('calendar')} <span><b>${sin} visita${sin > 1 ? 's' : ''} sin asesor asignado.</b> Asígnalas para que nadie se quede sin atención.</span><b>Asignar →</b></a>` : ''}
    ${metas.length ? `<div class="metas-row">${metas.map((m) => metaCard(m)).join('')}</div>` : ''}
    <div class="quick">${[['visitas', 'calendar', hoyV + ' visitas hoy'], ['tareas', 'check', DB.all('tareas').filter((t) => t.estado !== 'hecho').length + ' tareas abiertas'], ['marketing', 'trend', DB.all('campanas').filter((c) => c.estado === 'activa').length + ' campañas activas'], ['areas', 'team', 'Ver organigrama']].map(([h, i, t]) => `<a href="#/panel/${h}">${ic(i)}<span>${t}</span></a>`).join('')}</div>`);
};
const _dashAs = vDashAsesor;
vDashAsesor = function (u, r) {
  _dashAs(u, r);
  const rg = rangoDe(u); const misV = DB.all('visitas').filter((v) => v.asesorId === u.id && v.fecha >= today()).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 3);
  const metas = metasPara(u).filter((m) => metaProgreso(m, u.id).dias >= 0).slice(0, 2);
  const bonos = bonosDe(u.id).filter((b) => b.v.bonoEstado !== 'abonada').reduce((s, b) => s + b.monto, 0);
  $('.hero-me').insertAdjacentHTML('afterend', `
    <div class="pgrid">
      <div class="panel rank-panel"><h2>Mi rango ${rangoBadge(u)}</h2>
        <div class="rank-steps">${(DB.settings.rangos || []).map((x, i) => `<div class="${i <= rg.idx ? 'on' : ''}"><span>${ic(x.i)}</span><b>${esc(x.n)}</b><small>${x.min}+ lotes</small></div>`).join('')}</div>
        ${rg.next ? `<p style="margin-top:14px;font-size:14px">Te faltan <b>${rg.falta} lote${rg.falta > 1 ? 's' : ''}</b> para ser <b>${esc(rg.next.n)}</b>: ${esc(rg.next.d)}</p><div class="meta-bar"><i style="width:${rg.pct}%"></i></div>` : '<p style="margin-top:14px"><b>¡Llegaste al rango más alto!</b></p>'}
        ${rg.bono ? `<p class="muted" style="font-size:13px;margin-top:8px">Tu rango suma +${rg.bono} % a la comisión de cada venta nueva.</p>` : ''}</div>
      <div class="panel"><h2>Próximas visitas <a class="btn btn-line btn-xs" href="#/panel/visitas">Agenda</a></h2>${misV.map(visitRowMini).join('') || '<p class="muted">No tienes visitas agendadas. Revisa la agenda: puedes tomar visitas sin asignar.</p>'}
        ${bonos ? `<div class="meta-prize" style="margin-top:12px">${ic('users')} Bono de equipo por abonar: <b>${money2(bonos)}</b></div>` : ''}</div>
    </div>
    ${metas.length ? `<div class="metas-row">${metas.map((m) => metaCard(m, u.id)).join('')}</div>` : ''}`);
};
function visitRowMini(v) {
  const p = DB.get('proyectos', v.proyectoId);
  return `<div class="rank-row"><span class="cal-day"><b>${new Date(v.fecha + 'T12:00').getDate()}</b>${MESES[new Date(v.fecha + 'T12:00').getMonth()]}</span><div style="flex:1;min-width:0"><b style="font-size:14px">${esc(v.nombre)}</b><div class="muted" style="font-size:12.5px">${esc(v.turno)} · ${esc(p?.nombre || '')} · ${v.personas} pers.</div></div>${badgeE(visEstadoTxt(v.estado))}</div>`;
}
const visEstadoTxt = (e) => (VIS_ESTADOS.find((x) => x[0] === e) || [e, e])[1];

/* ---------- Resumen de MARKETING ---------- */
function vDashMkt(u) {
  const mes = today().slice(0, 7); const leads = DB.all('leads');
  const act = DB.all('campanas').filter((c) => c.estado === 'activa');
  const gasto = act.reduce((s, c) => s + Number(c.gasto || 0), 0), cont = act.reduce((s, c) => s + Number(c.contactos || 0), 0);
  const prox = DB.all('visitas').filter((v) => v.fecha >= today() && daysTo(v.fecha) <= 7);
  const prods = DB.all('producciones').filter((p) => p.estado !== 'publicado').sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 4);
  panelShell(u, '', `Hola, <b>${esc(firstName(u.nombre))}</b>`, `<a class="btn btn-gold btn-sm" href="#/panel/marketing">${ic('plus')} Nueva campaña</a>`, `
    <div class="kpis">${kpi('Contactos del mes', leads.filter((l) => l.fecha.startsWith(mes)).length, 'De todas las fuentes', 'inbox', true)}${kpi('Inversión activa', money(gasto), act.length + ' campañas activas', 'cash')}${kpi('Costo por contacto', cont ? money2(gasto / cont) : '–', 'Promedio de campañas activas', 'trend')}${kpi('Visitas en 7 días', prox.length, prox.filter((v) => !v.asesorId).length + ' sin asignar', 'calendar')}</div>
    <div class="pgrid"><div class="panel"><h2>Embudo comercial</h2>${funnelHtml(leads)}</div><div class="panel"><h2>Origen de los contactos</h2>${origenHtml(leads)}</div></div>
    <div class="pgrid"><div class="panel"><h2>Próximas grabaciones <a class="btn btn-line btn-xs" href="#/panel/marketing?t=prod">Calendario</a></h2>${prods.map((p) => `<div class="rank-row"><span class="cal-day"><b>${new Date(p.fecha + 'T12:00').getDate()}</b>${MESES[new Date(p.fecha + 'T12:00').getMonth()]}</span><div style="flex:1"><b style="font-size:14px">${esc(p.titulo)}</b><div class="muted" style="font-size:12.5px">${esc(p.tipo)} · ${esc(p.lugar)}</div></div><span class="badge b-soft">${esc((PROD_ESTADOS.find((x) => x[0] === p.estado) || [0, p.estado])[1])}</span></div>`).join('') || '<p class="muted">Sin grabaciones pendientes.</p>'}</div>
    <div class="panel"><h2>Visitas por asignar <a class="btn btn-line btn-xs" href="#/panel/visitas">Agenda</a></h2>${prox.filter((v) => !v.asesorId).map(visitRowMini).join('') || '<p class="muted">Todas las visitas tienen asesor. 👏</p>'}</div></div>`);
}

/* ================= AGENDA DE VISITAS ================= */
function vVisitas(u, r) {
  const f = r.query.f || 'proximas';
  let list = DB.all('visitas').filter((v) => seesAll(u) || v.asesorId === u.id || (!v.asesorId && v.fecha >= today()));
  if (f === 'proximas') list = list.filter((v) => v.fecha >= today());
  if (f === 'sin') list = list.filter((v) => !v.asesorId && v.fecha >= today());
  if (f === 'pasadas') list = list.filter((v) => v.fecha < today());
  list.sort((a, b) => (f === 'pasadas' ? b.fecha.localeCompare(a.fecha) : a.fecha.localeCompare(b.fecha)));
  const days = [...new Set(list.map((v) => v.fecha))];
  const asesores = DB.all('users').filter((x) => (x.rol === 'asesor' || x.rol === 'aliado') && x.estado === 'activo');
  const all = DB.all('visitas');
  panelShell(u, 'visitas', seesAll(u) ? 'Agenda de <b>visitas</b>' : 'Mis <b>visitas</b>', `<button class="btn btn-gold btn-sm" data-act="vis-new">${ic('plus')} Agendar visita</button><a class="btn btn-line btn-sm" href="#/visita" target="_blank">${ic('globe')} Formulario público</a>`, `
    <div class="kpis">${kpi('Próximos 7 días', all.filter((v) => v.fecha >= today() && daysTo(v.fecha) <= 7).length, 'visitas agendadas', 'calendar', true)}${kpi('Sin asesor', all.filter((v) => !v.asesorId && v.fecha >= today()).length, 'por asignar', 'user')}${kpi('Personas esperadas', all.filter((v) => v.fecha >= today()).reduce((s, v) => s + Number(v.personas || 0), 0), 'en las próximas visitas', 'users')}${kpi('Separaron', all.filter((v) => v.estado === 'separo').length, 'después de visitar', 'key')}</div>
    <div class="filters">${[['proximas', 'Próximas'], ['sin', 'Sin asignar'], ['pasadas', 'Pasadas'], ['todas', 'Todas']].map(([k, t]) => `<a class="chip ${f === k ? 'on' : ''}" href="#/panel/visitas?f=${k}">${t}</a>`).join('')}</div>
    ${days.map((d) => `<div class="day-group"><div class="day-head"><b>${dayLabel(d)}</b><span>${((n) => n + (n === 1 ? ' visita' : ' visitas'))(list.filter((v) => v.fecha === d).length)} · ${list.filter((v) => v.fecha === d).reduce((s, v) => s + Number(v.personas || 0), 0)} personas</span></div>
      ${list.filter((v) => v.fecha === d).map((v) => { const p = DB.get('proyectos', v.proyectoId); const a = DB.get('users', v.asesorId); return `<div class="visit">
        <div class="v-time">${ic('calendar')}<b>${esc(v.turno.split('·')[0])}</b><small>${esc(v.turno.split('·')[1] || '')}</small></div>
        <div class="v-main"><b>${esc(v.nombre)}</b> <span class="muted" style="font-size:12.5px">${esc(v.codigo || '')}</span>${v.demo ? ' <span class="badge b-warn">Ejemplo</span>' : ''}<div class="muted" style="font-size:13px">${esc(p?.nombre || '')} · ${v.personas} persona${v.personas > 1 ? 's' : ''} · ${esc(v.punto)}${v.comentario ? ' · “' + esc(v.comentario) + '”' : ''}</div></div>
        <div class="v-who">${seesAll(u) ? `<select class="in in-sm" data-vis-asesor="${v.id}" aria-label="Asesor asignado"><option value="">Sin asignar</option>${asesores.map((x) => `<option value="${x.id}" ${v.asesorId === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select>`
          : a ? `<span style="display:flex;gap:8px;align-items:center;font-size:13px">${avatar(a, 'av-sm')}${a.id === u.id ? 'Tú' : esc(a.nombre)}</span>` : `<button class="btn btn-gold btn-xs" data-act="vis-tomar" data-id="${v.id}">Atender esta visita</button>`}</div>
        <div class="v-st">${(seesAll(u) || v.asesorId === u.id) ? `<select class="in in-sm" data-vis-estado="${v.id}" aria-label="Estado">${VIS_ESTADOS.map(([k, t]) => `<option value="${k}" ${v.estado === k ? 'selected' : ''}>${t}</option>`).join('')}</select>` : badgeE(visEstadoTxt(v.estado))}
          <a class="btn btn-wa btn-xs" target="_blank" rel="noopener" href="${waLink(String(v.telefono).replace(/\D/g, '').length === 9 ? '51' + String(v.telefono).replace(/\D/g, '') : v.telefono, `Hola ${firstName(v.nombre)}, te escribe Infinity Group para confirmar tu visita a ${p?.nombre || 'nuestro proyecto'} el ${fdate(v.fecha)} (${v.turno}).`)}" aria-label="WhatsApp">${ic('wa', 1.4)}</a></div>
      </div>`; }).join('')}</div>`).join('') || emptyState('calendar', 'No hay visitas en esta vista.')}`);
}
function visitaForm(v = {}) {
  return `<form class="form" data-form="visita-int" data-id="${esc(v.id || '')}">
    <div class="two"><label class="f">Nombre del cliente<input class="in" name="nombre" required value="${esc(v.nombre)}"></label><label class="f">Celular<input class="in" name="telefono" required value="${esc(v.telefono)}"></label></div>
    <div class="three"><label class="f">Proyecto<select class="in" name="proyectoId">${pubProjects().map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select></label><label class="f">Fecha<input class="in" type="date" name="fecha" required min="${today()}" value="${esc(v.fecha || today())}"></label><label class="f">Turno<select class="in" name="turno"><option>Mañana · 9:00 a. m.</option><option>Tarde · 3:00 p. m.</option></select></label></div>
    <div class="two"><label class="f">Personas<input class="in" type="number" min="1" max="20" name="personas" value="${esc(v.personas || 1)}"></label><label class="f">Punto de encuentro<select class="in" name="punto">${(DB.settings.puntosEncuentro || []).map((x) => `<option>${esc(x)}</option>`).join('')}</select></label></div>
    <label class="f">Comentario<input class="in" name="comentario" value="${esc(v.comentario)}"></label>
    <button class="btn btn-gold">Agendar</button></form>`;
}

/* ================= TABLERO DE TAREAS ================= */
function vTareas(u, r) {
  const area = r.query.a || 'Todas'; const mine = !isCeo(u) && r.query.v !== 'equipo';
  let list = DB.all('tareas').filter((t) => (area === 'Todas' || t.area === area) && (!mine || t.responsableId === u.id));
  const cols = [['pendiente', 'Por hacer'], ['curso', 'En curso'], ['hecho', 'Hecho']];
  panelShell(u, 'tareas', 'Tablero de <b>tareas</b>', `<button class="btn btn-gold btn-sm" data-act="tarea-new">${ic('plus')} Nueva tarea</button>`, `
    <div class="filters">${['Todas', ...AREAS].map((a) => `<a class="chip ${a === area ? 'on' : ''}" href="#/panel/tareas?a=${encodeURIComponent(a)}${r.query.v ? '&v=' + r.query.v : ''}">${a}</a>`).join('')}
      ${!isCeo(u) ? `<a class="chip ${mine ? 'on' : ''}" href="#/panel/tareas?a=${encodeURIComponent(area)}">Mis tareas</a><a class="chip ${!mine ? 'on' : ''}" href="#/panel/tareas?a=${encodeURIComponent(area)}&v=equipo">Todo el equipo</a>` : ''}</div>
    <div class="kanban">${cols.map(([k, t]) => `<div class="kcol"><div class="khead"><b>${t}</b><span>${list.filter((x) => x.estado === k).length}</span></div>
      ${list.filter((x) => x.estado === k).sort((a, b) => a.vence.localeCompare(b.vence)).map((x) => { const a = DB.get('users', x.responsableId); const late = x.estado !== 'hecho' && x.vence < today(); return `<div class="kcard pr-${x.prioridad}">
        <div style="display:flex;justify-content:space-between;gap:8px"><span class="badge b-soft">${esc(x.area)}</span><span class="badge ${late ? 'b-bad' : 'b-grey'}">${late ? 'Vencida' : dayLabel(x.vence)}</span></div>
        <b>${esc(x.titulo)}</b>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="display:flex;gap:8px;align-items:center;font-size:12.5px">${avatar(a, 'av-sm')}${esc(a ? firstName(a.nombre) : '—')}</span>
          <span class="kmove">${k !== 'pendiente' ? `<button data-act="tarea-mv" data-id="${x.id}" data-to="${k === 'hecho' ? 'curso' : 'pendiente'}" aria-label="Mover atrás">←</button>` : ''}${k !== 'hecho' ? `<button data-act="tarea-mv" data-id="${x.id}" data-to="${k === 'pendiente' ? 'curso' : 'hecho'}" aria-label="Mover adelante">→</button>` : `<button data-act="tarea-del" data-id="${x.id}" aria-label="Eliminar">×</button>`}</span></div>
      </div>`; }).join('') || '<p class="muted" style="font-size:13px;padding:10px">Nada por aquí.</p>'}</div>`).join('')}</div>`);
}
function tareaForm() {
  const us = DB.all('users').filter((x) => x.estado === 'activo');
  return `<form class="form" data-form="tarea"><label class="f">¿Qué hay que hacer?<input class="in" name="titulo" required></label>
    <div class="three"><label class="f">Área<select class="in" name="area">${AREAS.map((a) => `<option>${a}</option>`).join('')}</select></label><label class="f">Responsable<select class="in" name="responsableId">${us.map((x) => `<option value="${x.id}" ${x.id === Auth.user().id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></label><label class="f">Fecha límite<input class="in" type="date" name="vence" required value="${today()}"></label></div>
    <label class="f">Prioridad<select class="in" name="prioridad"><option value="alta">Alta</option><option value="media" selected>Media</option><option value="baja">Baja</option></select></label>
    <button class="btn btn-gold">Crear tarea</button></form>`;
}

/* ================= METAS Y RANGOS ================= */
function vMetas(u) {
  const list = metasPara(u); const act = list.filter((m) => metaProgreso(m, u.id).dias >= 0), old = list.filter((m) => metaProgreso(m, u.id).dias < 0);
  const rs = DB.settings.rangos || [];
  panelShell(u, 'metas', 'Metas y <b>rangos</b>', isCeo(u) ? `<button class="btn btn-gold btn-sm" data-act="meta-new">${ic('plus')} Nueva meta</button>` : '', `
    <div class="panel"><h2>Metas activas</h2><div class="metas-row" style="margin:0">${act.map((m) => metaCard(m, isCeo(u) || u.rol === 'marketing' ? '' : u.id) + (isCeo(u) ? `<div style="margin:-6px 0 6px;text-align:right"><button class="btn btn-danger btn-xs" data-act="meta-del" data-id="${m.id}">Eliminar</button></div>` : '')).join('') || '<p class="muted">No hay metas activas.</p>'}</div></div>
    <div class="panel"><h2>Rangos de asesor <span class="muted" style="font-weight:500;font-size:12.5px">Se suben solos con los lotes vendidos y suman comisión</span></h2>
      <div class="rank-ladder">${rs.map((x, i) => `<div class="rl rk${i}"><span class="rk-ico">${ic(x.i)}</span><b>${esc(x.n)}</b><small>Desde ${x.min} lotes</small><em>${x.bono ? '+' + x.bono + ' % comisión' : 'Comisión base'}</em><p>${esc(x.d)}</p></div>`).join('')}</div>
      ${!seesAll(u) ? `<p style="margin-top:16px">Tu rango actual: ${rangoBadge(u)}</p>` : ''}
      <p class="muted" style="font-size:13px;margin-top:10px">Además, cada líder gana <b>${DB.settings.bonoEquipo} %</b> de bono de equipo por cada venta de las personas que trajo a Infinity.</p></div>
    <div class="panel"><h2>Ranking general</h2>${ranking(10)}</div>
    ${old.length ? `<div class="panel"><h2>Metas cerradas</h2><div class="metas-row" style="margin:0">${old.map((m) => metaCard(m, u.id)).join('')}</div></div>` : ''}`);
}
function metaForm() {
  return `<form class="form" data-form="meta"><label class="f">Nombre de la meta<input class="in" name="titulo" required placeholder="Ej.: 30 lotes en diciembre"></label>
    <div class="three"><label class="f">¿Para quién?<select class="in" name="alcance"><option value="empresa">Toda la empresa</option><option value="cada">Cada asesor (individual)</option><option value="equipo">Un equipo</option><option value="asesor">Un asesor</option></select></label>
      <label class="f">Equipo / asesor <span class="hint">si aplica</span><select class="in" name="targetId"><option value="">—</option>${DB.all('equipos').map((e) => `<option value="${e.id}">Equipo: ${esc(e.nombre)}</option>`).join('')}${DB.all('users').filter((x) => x.rol === 'asesor' || x.rol === 'aliado').map((x) => `<option value="${x.id}">Asesor: ${esc(x.nombre)}</option>`).join('')}</select></label>
      <label class="f">Proyecto<select class="in" name="proyectoId"><option value="">Todos</option>${DB.all('proyectos').map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select></label></div>
    <div class="three"><label class="f">Se mide en<select class="in" name="tipo"><option value="lotes">Lotes vendidos</option><option value="soles">Soles vendidos</option></select></label><label class="f">Objetivo<input class="in" type="number" min="1" name="objetivo" required></label><label class="f">Premio<input class="in" name="premio" placeholder="Ej.: Bono de S/ 500"></label></div>
    <div class="two"><label class="f">Desde<input class="in" type="date" name="desde" required value="${today()}"></label><label class="f">Hasta<input class="in" type="date" name="hasta" required></label></div>
    <button class="btn btn-gold">Crear meta</button></form>`;
}

/* ================= MI RED (equipo debajo) ================= */
function vRed(u) {
  const direct = redDe(u.id); const bonos = bonosDe(u.id);
  const pend = bonos.filter((b) => b.v.bonoEstado !== 'abonada').reduce((s, b) => s + b.monto, 0), pag = bonos.filter((b) => b.v.bonoEstado === 'abonada').reduce((s, b) => s + b.monto, 0);
  const inv = baseUrl() + '#/unete?ref=' + u.id;
  const sponsor = DB.get('users', u.patrocinadorId);
  const node = (x, lvl) => { const sub = redDe(x.id); const n = lotesDe(x.id); return `<div class="tree-node lvl${lvl}"><div class="tn">${avatar(x)}<div style="flex:1;min-width:0"><b>${esc(x.nombre)}</b><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:3px">${rangoBadge(x)}<span class="muted" style="font-size:12.5px">${n} lotes · ${esc(x.zona || '')}</span></div></div><a class="btn btn-wa btn-xs" href="${waLink(x.telefono)}" target="_blank" rel="noopener" aria-label="WhatsApp">${ic('wa', 1.4)}</a></div>${lvl < 2 && sub.length ? `<div class="tree-kids">${sub.map((y) => node(y, lvl + 1)).join('')}</div>` : ''}</div>`; };
  panelShell(u, 'red', 'Mi <b>red</b>', '', `
    <div class="kpis">${kpi('Personas en mi red', direct.length, 'directas', 'users', true)}${kpi('Lotes de mi red', bonos.length, 'ventas confirmadas', 'grid')}${kpi('Bono por abonar', money2(pend), DB.settings.bonoEquipo + ' % de cada venta', 'wallet')}${kpi('Bono abonado', money2(pag), 'histórico', 'coins')}</div>
    <div class="pgrid"><div class="panel"><h2>Mi árbol</h2>
      ${sponsor ? `<p class="muted" style="font-size:13px;margin-bottom:12px">Tu líder: <b style="color:var(--ink)">${esc(sponsor.nombre)}</b></p>` : ''}
      <div class="tree"><div class="tree-node lvl0"><div class="tn tn-me">${avatar(u)}<div><b>Tú · ${esc(u.nombre)}</b><div style="margin-top:3px">${rangoBadge(u)}</div></div></div><div class="tree-kids">${direct.map((x) => node(x, 1)).join('') || '<p class="muted" style="padding:10px 0 0 10px;font-size:14px">Aún no tienes personas en tu red.</p>'}</div></div></div></div>
    <div class="panel"><h2>Haz crecer tu equipo</h2><p class="muted" style="font-size:14px">Comparte tu enlace. Quien se registre con él queda en tu red y ganas <b>${DB.settings.bonoEquipo} %</b> de cada venta que haga.</p>
      <input class="in" readonly value="${esc(inv)}" style="margin:12px 0" aria-label="Tu enlace de invitación"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-green btn-sm" data-act="copy" data-text="${esc(inv)}">Copiar enlace</button><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Únete a mi equipo en Infinity Group: ' + inv)}">Invitar por WhatsApp</a></div></div></div>`);
}

/* ================= MARKETING ================= */
function vMarketing(u, r) {
  const t = r.query.t || 'pub';
  const tabs = `<div class="filters"><a class="chip ${t === 'pub' ? 'on' : ''}" href="#/panel/marketing">${ic('trend')} Publicidad</a><a class="chip ${t === 'prod' ? 'on' : ''}" href="#/panel/marketing?t=prod">${ic('camera')} Grabaciones y producción</a></div>`;
  if (t === 'prod') {
    const list = DB.all('producciones').slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
    return panelShell(u, 'marketing', 'Grabaciones y <b>producción</b>', `<button class="btn btn-gold btn-sm" data-act="prod-new">${ic('plus')} Programar grabación</button>`, `${tabs}
      <div class="pipeline">${PROD_ESTADOS.map(([k, n]) => `<div><b>${list.filter((x) => x.estado === k).length}</b><span>${n}</span></div>`).join('')}</div>
      ${[...new Set(list.map((x) => x.fecha))].map((d) => `<div class="day-group"><div class="day-head"><b>${dayLabel(d)}</b></div>${list.filter((x) => x.fecha === d).map((x) => { const a = DB.get('users', x.responsableId); const p = DB.get('proyectos', x.proyectoId); return `<div class="visit"><div class="v-time">${ic(x.tipo === 'Dron' ? 'globe' : x.tipo === 'Guion' ? 'doc' : 'camera')}<b>${esc(x.tipo)}</b></div>
        <div class="v-main"><b>${esc(x.titulo)}</b>${x.demo ? ' <span class="badge b-warn">Ejemplo</span>' : ''}<div class="muted" style="font-size:13px">${esc(x.lugar)}${p ? ' · ' + esc(p.nombre) : ''}${x.notas ? ' · ' + esc(x.notas) : ''}</div></div>
        <div class="v-who"><span style="display:flex;gap:8px;align-items:center;font-size:13px">${avatar(a, 'av-sm')}${esc(a ? firstName(a.nombre) : '—')}</span></div>
        <div class="v-st"><select class="in in-sm" data-prod-estado="${x.id}" aria-label="Estado">${PROD_ESTADOS.map(([k, n]) => `<option value="${k}" ${x.estado === k ? 'selected' : ''}>${n}</option>`).join('')}</select><button class="btn btn-danger btn-xs" data-act="prod-del" data-id="${x.id}" aria-label="Eliminar">×</button></div></div>`; }).join('')}</div>`).join('') || emptyState('camera', 'No hay grabaciones programadas.')}`);
  }
  const list = DB.all('campanas');
  const tg = list.reduce((s, c) => s + Number(c.gasto || 0), 0), tc = list.reduce((s, c) => s + Number(c.contactos || 0), 0), tv = list.reduce((s, c) => s + Number(c.ventas || 0), 0);
  panelShell(u, 'marketing', 'Publicidad y <b>campañas</b>', `<button class="btn btn-gold btn-sm" data-act="camp-new">${ic('plus')} Nueva campaña</button>`, `${tabs}
    <div class="kpis">${kpi('Inversión total', money(tg), list.length + ' campañas', 'cash', true)}${kpi('Contactos', num(tc), 'generados por publicidad', 'inbox')}${kpi('Costo por contacto', tc ? money2(tg / tc) : '–', 'promedio', 'trend')}${kpi('Ventas atribuidas', tv, tv ? 'Costo por venta: ' + money(tg / tv) : '', 'key')}</div>
    <div class="list-cards" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${list.map((c) => { const cpl = c.contactos ? c.gasto / c.contactos : 0; return `<div class="ucard camp">
      <div style="display:flex;justify-content:space-between;gap:8px"><span class="badge ${c.plataforma === 'TikTok' ? 'b-grey' : c.plataforma === 'Google' ? 'b-info' : 'b-soft'}">${esc(c.plataforma)}</span><span class="badge ${c.estado === 'activa' ? 'b-green' : c.estado === 'programada' ? 'b-warn' : 'b-grey'}">${esc(c.estado)}</span></div>
      <b style="font-size:15.5px">${esc(c.nombre)}</b>${c.demo ? ' <span class="badge b-warn" style="justify-self:start">Ejemplo</span>' : ''}
      <span class="muted" style="font-size:12.5px">${fdate(c.desde)} → ${fdate(c.hasta)} · ${money(c.presupuestoDia)}/día</span>
      <div class="meta"><div>Gastado<b>${money(c.gasto)}</b></div><div>Contactos<b>${c.contactos}</b></div><div>Costo/contacto<b>${cpl ? money2(cpl) : '–'}</b></div><div>Ventas<b>${c.ventas}</b></div></div>
      <div class="acts"><button class="btn btn-green btn-xs" data-act="camp-edit" data-id="${c.id}">Actualizar números</button><button class="btn btn-danger btn-xs" data-act="camp-del" data-id="${c.id}">Eliminar</button></div></div>`; }).join('') || emptyState('trend', 'Aún no hay campañas.')}</div>`);
}
function campForm(c = {}) {
  return `<form class="form" data-form="campana" data-id="${esc(c.id || '')}"><label class="f">Nombre de la campaña<input class="in" name="nombre" required value="${esc(c.nombre)}"></label>
    <div class="three"><label class="f">Plataforma<select class="in" name="plataforma">${['Meta Ads', 'TikTok', 'Google', 'YouTube', 'Radio / TV', 'Volanteo', 'Evento'].map((x) => `<option ${c.plataforma === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label class="f">Proyecto<select class="in" name="proyectoId"><option value="">General</option>${DB.all('proyectos').map((p) => `<option value="${p.id}" ${c.proyectoId === p.id ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}</select></label><label class="f">Estado<select class="in" name="estado">${['activa', 'programada', 'pausada', 'terminada'].map((x) => `<option ${c.estado === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
    <div class="three"><label class="f">Presupuesto diario (S/)<input class="in" type="number" min="0" name="presupuestoDia" value="${esc(c.presupuestoDia ?? '')}"></label><label class="f">Desde<input class="in" type="date" name="desde" value="${esc(c.desde || today())}"></label><label class="f">Hasta<input class="in" type="date" name="hasta" value="${esc(c.hasta || '')}"></label></div>
    <div class="three"><label class="f">Gastado (S/)<input class="in" type="number" min="0" step="0.01" name="gasto" value="${esc(c.gasto ?? 0)}"></label><label class="f">Contactos<input class="in" type="number" min="0" name="contactos" value="${esc(c.contactos ?? 0)}"></label><label class="f">Ventas<input class="in" type="number" min="0" name="ventas" value="${esc(c.ventas ?? 0)}"></label></div>
    <button class="btn btn-gold">Guardar</button></form>`;
}
function prodForm() {
  const us = DB.all('users').filter((x) => x.estado === 'activo');
  return `<form class="form" data-form="produccion"><label class="f">¿Qué se graba?<input class="in" name="titulo" required placeholder="Ej.: Testimonio de la familia Pérez"></label>
    <div class="three"><label class="f">Tipo<select class="in" name="tipo">${['Video', 'Dron', 'Testimonio', 'Fotos', 'Guion', 'Transmisión en vivo', 'Evento'].map((x) => `<option>${x}</option>`).join('')}</select></label><label class="f">Fecha<input class="in" type="date" name="fecha" required value="${today()}"></label><label class="f">Responsable<select class="in" name="responsableId">${us.map((x) => `<option value="${x.id}" ${x.rol === 'marketing' ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></label></div>
    <div class="two"><label class="f">Lugar<input class="in" name="lugar"></label><label class="f">Proyecto<select class="in" name="proyectoId"><option value="">General</option>${DB.all('proyectos').map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select></label></div>
    <label class="f">Notas<input class="in" name="notas" placeholder="Hora, equipo, autorizaciones…"></label><button class="btn btn-gold">Programar</button></form>`;
}

/* ================= ÁREAS Y ORGANIGRAMA ================= */
function vAreas(u) {
  const s = DB.settings; const us = DB.all('users').filter((x) => x.estado === 'activo');
  const person = (x, extra = '') => `<div class="org-p">${avatar(x)}<div><b>${esc(x.nombre)}</b><small>${extra || ROL_TXT[x.rol] || ''}</small></div></div>`;
  panelShell(u, 'areas', 'Áreas y <b>organigrama</b>', '', `
    <div class="org">
      <div class="org-top"><span class="eyebrow">Dirección</span><div class="org-row">${s.directivos.map((d) => `<div class="org-p org-lead">${d.foto ? `<span class="av av-lg"><img ${srcAttr(d.foto)} alt=""></span>` : `<span class="av av-lg">${esc(initials(d.nombre))}</span>`}<div><b>${esc(d.nombre)}</b><small>${esc(d.cargo)}</small></div></div>`).join('')}</div></div>
      <div class="org-line"></div>
      <div class="org-areas">
        <div class="org-area"><h3>${ic('trend')} Marketing</h3><p class="muted">Publicidad, contenido, grabaciones y agenda de visitas.</p>${us.filter((x) => x.rol === 'marketing').map((x) => person(x)).join('') || '<p class="muted">Sin personas asignadas.</p>'}</div>
        <div class="org-area"><h3>${ic('cash')} Comercial</h3><p class="muted">Equipos de asesores y aliados.</p>${DB.all('equipos').map((e) => { const lider = DB.get('users', e.liderId); const mem = us.filter((x) => x.equipoId === e.id); return `<div class="org-team"><b>${esc(e.nombre)}</b><small>${esc(e.tipo)} · ${esc(e.zona || '')}</small>${lider ? person(lider, 'Líder · ' + rangoDe(lider).n) : ''}<div class="org-mini">${mem.filter((m) => m.id !== e.liderId).map((m) => `<span title="${esc(m.nombre)}">${avatar(m, 'av-sm')}</span>`).join('')}</div></div>`; }).join('')}
          ${us.filter((x) => (x.rol === 'asesor') && !x.equipoId).length ? `<div class="org-team"><b>Asesores independientes</b><div class="org-mini">${us.filter((x) => x.rol === 'asesor' && !x.equipoId).map((m) => `<span title="${esc(m.nombre)}">${avatar(m, 'av-sm')}</span>`).join('')}</div></div>` : ''}</div>
        <div class="org-area"><h3>${ic('truck')} Operaciones</h3><p class="muted">Obras, maquinaria, contratos, notaría y entregas.</p><p style="font-size:13.5px">Tareas abiertas: <b>${DB.all('tareas').filter((t) => t.area === 'Operaciones' && t.estado !== 'hecho').length}</b></p><a class="btn btn-line btn-xs" href="#/panel/tareas?a=Operaciones&v=equipo">Ver tareas</a></div>
      </div>
    </div>`);
}

/* ================= COMISIONES: bonos de equipo ================= */
const _vCom = vComisiones;
vComisiones = function (u, r) {
  _vCom(u, r);
  const who = isCeo(u) ? (r.query.a ? DB.get('users', r.query.a) : null) : u;
  if (who) {
    const bonos = bonosDe(who.id); if (!bonos.length) return;
    $('.pbody').insertAdjacentHTML('beforeend', `<div class="panel"><h2>Bono de equipo (${DB.settings.bonoEquipo} % de las ventas de su red)</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fecha</th><th>Vendió</th><th>Proyecto</th><th class="num">Venta</th><th class="num">Bono</th><th>Estado</th></tr></thead><tbody>
      ${bonos.map(({ v, monto }) => `<tr><td>${fdate(v.fecha)}</td><td><div class="who">${avatar(DB.get('users', v.asesorId), 'av-sm')}${esc(DB.get('users', v.asesorId)?.nombre || '')}</div></td><td>${esc(DB.get('proyectos', v.proyectoId)?.nombre || '')}</td><td class="num">${money(v.precio)}</td><td class="num"><b>${money2(monto)}</b></td><td>${badgeE(v.bonoEstado === 'abonada' ? 'abonada' : 'pendiente')}</td></tr>`).join('')}
      </tbody></table></div>${isCeo(u) && bonos.some((b) => b.v.bonoEstado !== 'abonada') ? `<button class="btn btn-gold btn-sm" style="margin-top:14px" data-act="bono-abonar" data-id="${who.id}">Abonar bono de equipo</button>` : ''}</div>`);
  } else if (isCeo(u)) {
    const lideres = DB.all('users').map((x) => ({ x, b: bonosDe(x.id) })).filter((y) => y.b.length);
    if (!lideres.length) return;
    $('.pbody').insertAdjacentHTML('beforeend', `<div class="panel"><h2>Bonos de equipo por líder</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Líder</th><th class="num">Ventas de su red</th><th class="num">Por abonar</th><th></th></tr></thead><tbody>
      ${lideres.map(({ x, b }) => { const p = b.filter((y) => y.v.bonoEstado !== 'abonada').reduce((s, y) => s + y.monto, 0); return `<tr><td><div class="who">${avatar(x, 'av-sm')}<b>${esc(x.nombre)}</b></div></td><td class="num">${b.length}</td><td class="num"><b style="color:${p ? 'var(--bad)' : 'inherit'}">${money2(p)}</b></td><td><a class="btn btn-line btn-xs" href="#/panel/comisiones?a=${x.id}">Detalle</a> ${p ? `<button class="btn btn-gold btn-xs" data-act="bono-abonar" data-id="${x.id}">Abonar</button>` : ''}</td></tr>`; }).join('')}
      </tbody></table></div></div>`);
  }
};
