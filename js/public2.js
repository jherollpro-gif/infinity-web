/* ==========================================================
   SITIO PÚBLICO v3: recibir al visitante
   Bienvenida · Encuentra tu terreno · Agenda tu visita
   ========================================================== */

/* ---------- Bienvenida (solo la primera vez) ---------- */
function maybeWelcome() {
  let seen = false; try { seen = !!localStorage.getItem('infinity_welcomed'); } catch (e) { seen = true; }
  if (seen || Auth.user()) return;
  setTimeout(() => {
    if ($('#modal') || location.hash.replace('#', '') !== '/' && location.hash !== '') return;
    try { localStorage.setItem('infinity_welcomed', '1'); } catch (e) {}
    const bg = modal('Bienvenido', `
      <div class="welcome">${INF('', 1.2)}
        <img src="img/logo.png" alt="" class="w-logo">
        <span class="eyebrow">Bienvenido a Infinity Group</span>
        <h2 class="display">¿Qué te trae <b>por aquí?</b></h2>
        <p class="muted">Elige una opción y te mostramos lo que necesitas.</p>
        <div class="w-opts">
          ${[['invertir', 'trend', 'Quiero invertir', 'Hectáreas y lotes con proyección'], ['vivir', 'house', 'Busco dónde vivir', 'Un lote para mi familia'], ['emprender', 'sprout', 'Quiero emprender', 'Cultivos, turismo o industria'], ['encuentra', 'calc', 'Ayúdame a elegir', 'Responde 4 preguntas']]
            .map(([k, i, t, d]) => `<a class="w-opt" href="#/${k}" data-act="close-modal">${ic(i)}<b>${t}</b><small>${d}</small></a>`).join('')}
        </div>
        <div class="w-foot"><a href="#/ingresar" data-act="close-modal">Soy asesor o parte del equipo</a><button data-act="close-modal">Solo quiero mirar</button></div>
      </div>`, { wide: true });
    bg.classList.add('modal-welcome');
  }, 1400);
}

/* ---------- Encuentra tu terreno (4 preguntas) ---------- */
const QUIZ = [
  ['objetivo', '¿Para qué quieres el terreno?', [['invertir', 'trend', 'Invertir'], ['vivir', 'house', 'Vivir'], ['emprender', 'sprout', 'Emprender']]],
  ['presupuesto', '¿Cuánto quieres invertir?', [['20000', 'coins', 'Hasta S/ 20,000'], ['70000', 'wallet', 'Hasta S/ 70,000'], ['999999999', 'trophy', 'Más de S/ 70,000']]],
  ['pago', '¿Cómo prefieres pagar?', [['contado', 'cash', 'Al contado'], ['cuotas', 'calc', 'En cuotas']]],
  ['zona', '¿Dónde te gustaría?', [['Pucallpa', 'leaf', 'Amazonía (Pucallpa)'], ['Norte', 'map', 'Norte Chico (Huaral, Chancay)'], ['', 'globe', 'Me da igual']]]
];
Router.on('/encuentra', (r) => {
  const q = r.query; const done = QUIZ.every(([k]) => q[k] !== undefined);
  if (!done) {
    const step = QUIZ.findIndex(([k]) => q[k] === undefined); const [key, title, opts] = QUIZ[step];
    const base = Object.entries(q).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    return siteShell(`<section class="quiz"><div class="wrap" style="max-width:860px">
      <div class="q-progress"><i style="width:${(step / QUIZ.length) * 100}%"></i></div>
      <span class="eyebrow">Pregunta ${step + 1} de ${QUIZ.length}</span>
      <h1 class="display">${esc(title)}</h1>
      <div class="q-opts">${opts.map(([v, i, t]) => `<a class="q-opt reveal" href="#/encuentra?${base ? base + '&' : ''}${key}=${encodeURIComponent(v)}">${ic(i)}<b>${t}</b></a>`).join('')}</div>
      ${step ? `<a class="link-arrow" style="margin-top:28px" href="javascript:history.back()">← Volver</a>` : ''}
    </div></section>`);
  }
  const max = Number(q.presupuesto);
  const scored = pubProjects().map((p) => {
    let s = 0; const why = [];
    if ((p.perfiles || []).includes(q.objetivo)) { s += 3; why.push('Ideal para ' + q.objetivo); }
    if (q.zona && (q.zona === 'Pucallpa' ? p.region === 'Pucallpa' : p.region !== 'Pucallpa')) { s += 2; why.push('En la zona que buscas'); }
    if (!p.precioDesde || p.precioDesde <= max) { s += 1; if (p.precioDesde) why.push('Desde ' + money(p.precioDesde)); }
    if (q.pago === 'cuotas' && (p.precios || []).some((x) => /cuota/i.test(x.n))) { s += 1; why.push('Tiene cuotas sin intereses'); }
    return { p, s, why };
  }).sort((a, b) => b.s - a.s);
  const best = scored[0];
  siteShell(`<section class="quiz"><div class="wrap">
    <div class="center" style="max-width:760px;margin:0 auto 40px"><span class="eyebrow">Tu resultado</span><h1 class="display">Encontramos tu <span class="acc">terreno ideal</span></h1><p class="muted" style="font-size:17px">Según tus respuestas, estos proyectos son los que mejor se ajustan a ti.</p></div>
    <div class="match reveal"><div class="m-img">${best.p.portada ? `<img ${srcAttr(best.p.portada)} alt="">` : `<div class="ph-empty">${INF('', 2)}${titleSplit(best.p.nombre)}</div>`}<span class="badge b-gold">★ Mejor opción para ti</span></div>
      <div class="m-body"><h2 class="display" style="font-size:40px">${titleSplit(best.p.nombre)}</h2><p class="muted">${esc(best.p.ubicacion)}</p>
        <ul>${best.why.map((w) => `<li>${ic('check', 2.2)}${esc(w)}</li>`).join('')}</ul>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-gold" href="#/visita?p=${best.p.id}">${ic('calendar')} Agendar visita</a><a class="btn btn-line" href="#/proyecto/${best.p.id}">Ver proyecto</a></div></div></div>
    ${scored.length > 1 ? `<h3 style="margin:50px 0 20px;font-size:22px">También te pueden interesar</h3><div class="g3">${scored.slice(1, 4).map((x) => projectCard(x.p)).join('')}</div>` : ''}
    <div class="center" style="margin-top:40px"><a class="link-arrow" href="#/encuentra">Volver a empezar</a></div>
  </div></section>${ctaFinal()}`);
});

/* ---------- Agenda tu visita ---------- */
Router.on('/visita', (r) => {
  const sel = r.query.p || (pubProjects()[0] || {}).id; const ref = refAsesor();
  const days = [...Array(14)].map((_, i) => new Date(Date.now() + (i + 1) * 864e5)).filter((d) => d.getDay() !== 0);
  siteShell(`<section class="sec" style="padding-top:70px"><div class="wrap g2" style="gap:56px;align-items:start">
    <div class="reveal sticky-col"><span class="eyebrow">Visita guiada</span><h1 class="display" style="font-size:clamp(40px,5vw,66px);margin:14px 0">Conoce tu terreno <b>en persona</b></h1>
      <p class="muted" style="font-size:17px">Elige el día y el turno. ${ref ? esc(firstName(ref.nombre)) + ', tu asesor(a),' : 'Un asesor'} te confirmará por WhatsApp y te acompañará en todo el recorrido.</p>
      <div style="display:grid;gap:14px;margin-top:28px">${[['shield', 'Te mostramos la partida registral y el plano'], ['road', 'Recorres el terreno y las calles abiertas'], ['users', 'Puedes ir con tu familia'], ['key', 'Si te gusta, separas con S/ 2,500']].map(([i, t]) => `<div style="display:flex;gap:14px;align-items:center"><span class="av" style="background:var(--green-soft);color:var(--green)"><span style="width:20px;height:20px">${ic(i)}</span></span><b style="font-weight:600">${t}</b></div>`).join('')}</div></div>
    <form class="card form reveal" data-form="visita">
      <label class="f">Proyecto<select class="in" name="proyectoId">${pubProjects().map((p) => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}</select></label>
      <label class="f">Elige el día</label>
      <div class="day-pick">${days.map((d, i) => { const iso = d.toISOString().slice(0, 10); return `<label><input type="radio" name="fecha" value="${iso}" ${i ? '' : 'checked'} required><span><small>${['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()]}</small><b>${d.getDate()}</b><small>${MESES[d.getMonth()]}</small></span></label>`; }).join('')}</div>
      <label class="f">Turno</label>
      <div class="seg">${['Mañana · 9:00 a. m.', 'Tarde · 3:00 p. m.'].map((t, i) => `<label><input type="radio" name="turno" value="${t}" ${i ? '' : 'checked'}><span>${t}</span></label>`).join('')}</div>
      <div class="two"><label class="f">¿Cuántas personas?<select class="in" name="personas">${[1, 2, 3, 4, 5, 6].map((n) => `<option ${n === 2 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="f">Punto de encuentro<select class="in" name="punto">${(S().puntosEncuentro || []).map((x) => `<option>${esc(x)}</option>`).join('')}</select></label></div>
      <div class="two"><label class="f">Nombre<input class="in" name="nombre" required autocomplete="name"></label><label class="f">Celular / WhatsApp<input class="in" name="telefono" required inputmode="tel" autocomplete="tel" placeholder="9XX XXX XXX"></label></div>
      <label class="f">Comentario (opcional)<input class="in" name="comentario" placeholder="Ej.: vamos con niños"></label>
      <label class="check"><input type="checkbox" required> Acepto que me contacten por WhatsApp para confirmar mi visita.</label>
      <button class="btn btn-gold btn-block">${ic('calendar')} Reservar mi visita</button>
    </form>
  </div></section>`, '');
});

function visitaConfirm(v) {
  const p = DB.get('proyectos', v.proyectoId); const d = v.fecha.replace(/-/g, ''); const h = v.turno.startsWith('Mañana') ? ['T090000', 'T120000'] : ['T150000', 'T180000'];
  const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Visita a ' + (p?.nombre || 'proyecto') + ' · Infinity Group')}&dates=${d}${h[0]}/${d}${h[1]}&details=${encodeURIComponent('Código ' + v.codigo + '. Punto de encuentro: ' + v.punto)}&ctz=America/Lima`;
  $('#main').innerHTML = `<section class="sec"><div class="wrap" style="max-width:720px"><div class="ticket reveal is-in">${INF('', 1)}
    <div class="center"><div class="ok-ico">${ic('check', 2.4)}</div><span class="eyebrow">Visita reservada</span><h1 class="display" style="font-size:44px;margin:12px 0">¡Te esperamos, <b>${esc(firstName(v.nombre))}</b>!</h1></div>
    <div class="t-grid"><div><small>Código</small><b>${esc(v.codigo)}</b></div><div><small>Proyecto</small><b>${esc(p?.nombre || '')}</b></div><div><small>Día</small><b>${dayLabel(v.fecha)}</b></div><div><small>Turno</small><b>${esc(v.turno)}</b></div><div><small>Personas</small><b>${v.personas}</b></div><div><small>Encuentro</small><b>${esc(v.punto)}</b></div></div>
    <p class="center muted">Un asesor te escribirá por WhatsApp para confirmar.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px"><a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(contactPhone(), `Hola, reservé la visita ${v.codigo} a ${p?.nombre || ''} para el ${fdate(v.fecha)} (${v.turno}). Somos ${v.personas}.`)}">${ic('wa', 1.4)} Confirmar por WhatsApp</a><a class="btn btn-line" target="_blank" rel="noopener" href="${cal}">${ic('calendar')} Añadir a mi calendario</a></div>
  </div></div></section>`;
  window.scrollTo(0, 0);
}
