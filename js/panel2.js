/* ==========================================================
   PLATAFORMA: embudo, página pública del asesor, eventos
   ========================================================== */

/* ---------- Embudo comercial (de contacto a venta) ---------- */
function funnelHtml(leads) {
  const n = leads.length;
  const reach = (e) => leads.filter((l) => LEAD_ESTADOS.indexOf(l.estado) >= LEAD_ESTADOS.indexOf(e) && l.estado !== 'descartado').length;
  const steps = [['Contactos', 'Llegaron', n], ['Contactados', 'Se les respondió', leads.filter((l) => l.estado !== 'nuevo').length], ['Visitas', 'Fueron al terreno', reach('visita')], ['Separaciones', 'Separaron', reach('separacion')], ['Ventas', 'Cerraron', reach('venta')]];
  if (!n) return '<p class="muted">Aún no hay contactos para medir el embudo.</p>';
  return `<div class="funnel">${steps.map(([t, d, v], i) => `<div class="fstep"><div class="lbl">${t}<small>${d}</small></div><div class="track"><i style="width:${Math.max(6, (v / n) * 100)}%">${v}</i></div><div class="conv">${i ? Math.round((v / Math.max(1, steps[i - 1][2])) * 100) + ' %' : '100 %'}<small>${i ? 'del paso anterior' : 'base'}</small></div></div>`).join('')}</div>
    <p class="muted" style="font-size:12.5px;margin-top:12px">Conversión total de contacto a venta: <b style="color:var(--green)">${((steps[4][2] / n) * 100).toFixed(1)} %</b></p>`;
}
function origenHtml(leads) {
  const by = {};
  leads.forEach((l) => { const o = l.origen || 'Web'; by[o] = by[o] || { n: 0, v: 0 }; by[o].n++; if (l.estado === 'venta') by[o].v++; });
  const rows = Object.entries(by).sort((a, b) => b[1].n - a[1].n); const max = Math.max(1, ...rows.map((r) => r[1].n));
  return rows.map(([o, x]) => `<div class="rank-row"><div class="meter"><b style="font-size:13.5px">${esc(o)}</b><div><i style="width:${(x.n / max) * 100}%"></i></div></div><span style="font-size:13px;white-space:nowrap"><b>${x.n}</b> contactos · <b style="color:var(--green)">${x.v}</b> ventas</span></div>`).join('') || '<p class="muted">Sin datos.</p>';
}

/* ---------- Mi página pública (asesor / aliado) ---------- */
function vMiPagina(u) {
  const ICONOS = [['trophy', 'Trofeo'], ['award', 'Medalla'], ['star', 'Estrella'], ['users', 'Clientes'], ['up', 'Crecimiento'], ['shield', 'Certificado']];
  panelShell(u, 'mipagina', 'Mi página <b>pública</b>', `<a class="btn btn-gold btn-sm" href="#/asesor/${u.id}" target="_blank">${ic('globe')} Ver mi página</a>`, `
    <div class="panel" style="background:#FFF9EA;border-color:#F0DFAE"><b>Tu marca personal dentro de Infinity.</b><p class="muted" style="font-size:14px;margin-top:4px">Todo lo que pongas aquí lo ven los clientes en tu página. Tus lotes vendidos, tu puesto en el ranking y tus testimonios se actualizan solos.</p></div>
    <div class="pgrid">
      <form class="panel form" data-form="mipagina">
        <h2>Presentación</h2>
        <div class="two"><label class="f">Título profesional<input class="in" name="titulo" value="${esc(u.titulo)}" placeholder="Asesora senior · Especialista en hectáreas"></label><label class="f">Años de experiencia<input class="in" type="number" min="0" name="anios" value="${esc(u.anios)}"></label></div>
        <label class="f">Especialidad<input class="in" name="especialidad" value="${esc(u.especialidad)}" placeholder="Hectáreas para invertir en la Amazonía"></label>
        <label class="f">Tu frase<input class="in" name="frase" value="${esc(u.frase)}" maxlength="140"></label>
        <label class="f">Sobre mí<textarea class="in" name="bio" rows="4">${esc(u.bio)}</textarea></label>
        <div class="two"><label class="f">Foto de perfil<input class="in" type="file" name="fotoFile" accept="image/*"></label><label class="f">Foto de portada<input class="in" type="file" name="portadaFile" accept="image/*"></label></div>
        <label class="check"><input type="checkbox" name="publico" ${u.publico !== false ? 'checked' : ''}> Mostrar mi página en la web</label>
        <button class="btn btn-gold">Guardar presentación</button>
      </form>
      <div>
        <div class="panel"><h2>Logros y reconocimientos</h2>
          <div class="medals" style="grid-template-columns:1fr;margin-bottom:14px">${(u.logros || []).map((m, i) => `<div class="medal" style="padding:12px"><span class="m" style="width:42px;height:42px">${ic(m.i || 'award')}</span><div style="flex:1"><b>${esc(m.t)}</b><small>${esc(m.d || '')}</small></div><button class="btn btn-danger btn-xs" data-act="logro-del" data-i="${i}">Quitar</button></div>`).join('') || '<p class="muted" style="font-size:14px">Agrega tus premios, certificaciones o metas cumplidas.</p>'}</div>
          <form class="form" data-form="logro"><div class="rowitem"><input class="in" name="t" required placeholder="Ej.: Top vendedor de octubre" aria-label="Logro"><input class="in" name="d" placeholder="Ej.: Octubre 2026" aria-label="Detalle"><select class="in" name="i" aria-label="Ícono">${ICONOS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div><button class="btn btn-green btn-sm">${ic('plus')} Agregar logro</button></form></div>
        <div class="panel"><h2>Fotos con mis clientes</h2>
          <div class="thumbs" style="margin-bottom:14px">${(u.fotos || []).map((f, i) => `<div class="t" title="${esc(f.t)}"><img ${srcAttr(f.src)} alt=""><button type="button" data-act="foto-del" data-i="${i}" aria-label="Quitar">×</button></div>`).join('') || '<p class="muted" style="font-size:14px">Sube fotos de entregas, visitas y firmas (con permiso de tus clientes).</p>'}</div>
          <form class="form" data-form="fotocliente"><input class="in" type="file" name="file" accept="image/*" required aria-label="Foto"><input class="in" name="t" placeholder="Ej.: Entrega de lote a la familia Pérez" aria-label="Descripción"><label class="check"><input type="checkbox" required> Mis clientes autorizaron publicar esta foto.</label><button class="btn btn-green btn-sm">${ic('camera')} Subir foto</button></form></div>
        <div class="panel"><h2>Insignias automáticas</h2><p class="muted" style="font-size:13.5px;margin-bottom:12px">Se ganan solas con tus resultados.</p><div class="medals" style="grid-template-columns:1fr">${autoBadges(u).map((m) => `<div class="medal auto" style="padding:12px"><span class="m" style="width:42px;height:42px">${ic(m.i)}</span><div><b>${esc(m.t)}</b><small>${esc(m.d)}</small></div></div>`).join('')}</div></div>
      </div>
    </div>`);
}

/* ---------- Eventos y prensa (CEO) ---------- */
function vEventos(u) {
  const list = DB.all('eventos').slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
  panelShell(u, 'eventos', 'Eventos y <b>prensa</b>', `<button class="btn btn-gold btn-sm" data-act="ev-edit">${ic('plus')} Nuevo</button>`, `
    <p class="muted" style="margin-bottom:16px">Aparecen en el carrusel "Novedades y eventos" del inicio y en la página de la CEO: lanzamientos, sorteos, notas de prensa, foros y entregas.</p>
    <div class="list-cards">${list.map((e) => `<div class="ucard" style="padding:0;overflow:hidden"><img ${srcAttr(e.imagen)} alt="" style="aspect-ratio:16/9;object-fit:cover;width:100%"><div style="padding:16px;display:grid;gap:8px"><span class="badge b-gold" style="justify-self:start">${esc(e.tipo)}</span><b>${esc(e.titulo)}</b><span class="muted" style="font-size:13px">${fdate(e.fecha)} · ${esc(e.texto)}</span><div class="acts"><button class="btn btn-green btn-xs" data-act="ev-edit" data-id="${e.id}">Editar</button><button class="btn btn-danger btn-xs" data-act="ev-del" data-id="${e.id}">Eliminar</button></div></div></div>`).join('') || emptyState('calendar', 'Aún no hay eventos.')}</div>`);
}
function evForm(e = {}) {
  return `<form class="form" data-form="evento" data-id="${esc(e.id || '')}">
    <div class="two"><label class="f">Tipo<select class="in" name="tipo">${['Evento', 'Lanzamiento', 'Prensa', 'Podcast', 'Sorteo', 'Avance de obra', 'Documentación', 'Entrega', 'Foro'].map((t) => `<option ${e.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label><label class="f">Fecha<input class="in" type="date" name="fecha" required value="${esc(e.fecha || today())}"></label></div>
    <label class="f">Título<input class="in" name="titulo" required value="${esc(e.titulo)}"></label>
    <label class="f">Texto corto<input class="in" name="texto" value="${esc(e.texto)}"></label>
    <label class="f">Enlace <span class="hint">(opcional: nota de prensa, video o proyecto)</span><input class="in" name="link" value="${esc(e.link)}" placeholder="https://… o #/proyecto/…"></label>
    <label class="f">Imagen<input class="in" type="file" name="imgFile" accept="image/*" ${e.id ? '' : 'required'}></label>
    <button class="btn btn-gold">Guardar</button></form>`;
}
