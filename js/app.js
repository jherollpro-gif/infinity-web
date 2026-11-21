/* ==========================================================
   ACCIONES: clics y formularios
   ========================================================== */
async function uploadOne(input, max) { const f = input?.files?.[0]; return f ? Media.fromFile(f, max) : null; }

document.addEventListener('click', async (e) => {
  const go = e.target.closest('[data-go]');
  if (go && !e.target.closest('a,button')) return Router.go(go.dataset.go);
  const zoom = e.target.closest('[data-zoom]');
  if (zoom) return lightbox(zoom.dataset.zoom);
  const thumb = e.target.closest('[data-post]');
  if (thumb) { const p = DB.get('posts', thumb.dataset.post); return p && lightbox(p.src, p.tipo === 'video'); }

  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;
  const u = Auth.user();
  const rerender = () => Router.render();

  switch (act) {
    case 'close-modal': closeModal(); break;
    case 'burger': $('#mnav')?.classList.toggle('open'); break;
    case 'side': $('#side')?.classList.toggle('open'); break;
    case 'copy': e.preventDefault(); navigator.clipboard?.writeText(el.dataset.text).then(() => toast('Copiado ✔'), () => toast('No se pudo copiar')); break;
    case 'logout': e.preventDefault(); Auth.logout(); Router.go('#/'); break;
    case 'demo-login': Auth.loginAs(id); Router.go('#/panel'); break;
    case 'rail': { const r = $('#rail'); r && r.scrollBy({ left: Number(el.dataset.dir) * (r.clientWidth * 0.8), behavior: 'smooth' }); break; }
    case 'jump': document.getElementById(el.dataset.to)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
    case 'gal-tab': {
      const g = $('#gal'); const p = DB.get('proyectos', g.dataset.pid); const imgs = (p.galeriaTabs || { Galería: p.galeria })[el.dataset.tab] || [];
      $$('[data-act="gal-tab"]').forEach((b) => b.classList.toggle('on', b === el));
      g.innerHTML = imgs.map((i) => `<img ${srcAttr(i)} alt="" data-zoom="${esc(i)}" loading="lazy">`).join(''); Media.hydrate(g); break;
    }
    case 'share-link': share({ title: el.dataset.title, text: el.dataset.title + ' · ' + S().empresa, url: el.dataset.url }); break;
    case 'test-for': modal('Tu experiencia con ' + (DB.get('users', id)?.nombre || ''), testForm(id)); break;
    case 'logro-del': { const me = Auth.user(); me.logros.splice(Number(el.dataset.i), 1); DB.save(); toast('Logro quitado'); rerender(); break; }
    case 'foto-del': { const me = Auth.user(); me.fotos.splice(Number(el.dataset.i), 1); DB.save(); toast('Foto quitada'); rerender(); break; }
    case 'ev-edit': modal(id ? 'Editar evento' : 'Nuevo evento o nota de prensa', evForm(id ? DB.get('eventos', id) : {})); break;
    case 'vis-new': modal('Agendar visita', visitaForm(), { wide: true }); break;
    case 'vis-tomar': DB.update('visitas', id, { asesorId: u.id }); toast('La visita ahora es tuya. Escríbele para confirmar.'); rerender(); break;
    case 'tarea-new': modal('Nueva tarea', tareaForm(), { wide: true }); break;
    case 'tarea-mv': DB.update('tareas', id, { estado: el.dataset.to }); rerenderKeepScroll(); break;
    case 'tarea-del': DB.remove('tareas', id); rerenderKeepScroll(); break;
    case 'meta-new': modal('Nueva meta', metaForm(), { wide: true }); break;
    case 'meta-del': if (confirmBox('¿Eliminar esta meta?')) { DB.remove('metas', id); rerender(); } break;
    case 'camp-new': modal('Nueva campaña', campForm(), { wide: true }); break;
    case 'camp-edit': modal('Actualizar campaña', campForm(DB.get('campanas', id)), { wide: true }); break;
    case 'camp-del': if (confirmBox('¿Eliminar esta campaña?')) { DB.remove('campanas', id); rerender(); } break;
    case 'prod-new': modal('Programar grabación', prodForm(), { wide: true }); break;
    case 'prod-del': if (confirmBox('¿Eliminar esta grabación?')) { DB.remove('producciones', id); rerenderKeepScroll(); } break;
    case 'bono-abonar': {
      const bs = bonosDe(id).filter((b) => b.v.bonoEstado !== 'abonada'); const tot = bs.reduce((s, b) => s + b.monto, 0);
      if (confirmBox(`¿Marcar como abonado el bono de equipo de ${money2(tot)} a ${DB.get('users', id)?.nombre}?`)) { bs.forEach((b) => { b.v.bonoEstado = 'abonada'; }); DB.save(); toast('Bono de equipo abonado ✔'); rerender(); }
      break;
    }
    case 'ev-del': if (confirmBox('¿Eliminar este evento?')) { DB.remove('eventos', id); rerender(); } break;

    /* Proyectos */
    case 'share-project': {
      const p = DB.get('proyectos', id);
      const ref = u && u.rol !== 'ceo' ? '?ref=' + u.id : '';
      share({ title: p.nombre, text: `${p.nombre} – ${p.precioTexto}`, url: baseUrl() + '#/proyecto/' + p.id + ref });
      break;
    }
    case 'proy-edit': {
      const p = id ? DB.get('proyectos', id) : {};
      modal(id ? 'Editar proyecto' : 'Nuevo proyecto', proyForm(p), { wide: true });
      break;
    }
    case 'gal-del': {
      const form = el.closest('form'); const p = DB.get('proyectos', form.dataset.id);
      if (p) { p.galeria.splice(Number(el.dataset.i), 1); DB.save(); el.parentElement.remove(); toast('Foto quitada'); }
      break;
    }
    case 'proy-del':
      if (confirmBox('¿Eliminar este proyecto? Las ventas registradas se conservan.')) { DB.remove('proyectos', id); toast('Proyecto eliminado'); rerender(); }
      break;

    /* Usuarios */
    case 'user-edit': modal(id ? 'Editar usuario' : 'Nuevo asesor', userForm(id ? DB.get('users', id) : { rol: 'asesor', estado: 'activo' }), { wide: true }); break;
    case 'user-del':
      if (id === u.id) return toast('No puedes eliminar tu propia cuenta.');
      if (confirmBox('¿Eliminar a esta persona de la plataforma?')) { DB.remove('users', id); closeModal(); toast('Usuario eliminado'); rerender(); }
      break;
    case 'sol-ok': DB.update('users', id, { estado: 'activo' }); toast('Solicitud aprobada. Avísale por WhatsApp.'); rerender(); break;

    /* Equipos */
    case 'eq-edit': modal(id ? 'Editar equipo' : 'Nuevo equipo o aliado', eqForm(id ? DB.get('equipos', id) : {}), { wide: true }); break;
    case 'eq-del':
      if (confirmBox('¿Eliminar este equipo? Sus integrantes quedarán sin equipo.')) { DB.all('users').forEach((x) => { if (x.equipoId === id) x.equipoId = ''; }); DB.remove('equipos', id); rerender(); }
      break;

    /* Ventas y comisiones */
    case 'venta-new': modal(u.rol === 'ceo' ? 'Registrar venta' : 'Reportar venta', ventaForm(u), { wide: true }); break;
    case 'venta-edit': modal('Editar venta', ventaForm(u, DB.get('ventas', id)), { wide: true }); break;
    case 'venta-ok': DB.update('ventas', id, { estado: 'confirmada' }); toast('Venta confirmada. La comisión quedó por abonar.'); rerender(); break;
    case 'venta-del': if (confirmBox('¿Eliminar esta venta?')) { DB.remove('ventas', id); closeModal(); rerender(); } break;
    case 'abonar': DB.update('ventas', id, { comisionEstado: 'abonada', fechaAbono: today() }); toast('Comisión abonada ✔'); rerender(); break;
    case 'desabonar': DB.update('ventas', id, { comisionEstado: 'pendiente', fechaAbono: '' }); rerender(); break;
    case 'abonar-todo': {
      const vs = ventasOk().filter((v) => v.asesorId === id && v.comisionEstado === 'pendiente');
      const tot = vs.reduce((s, v) => s + v.comisionMonto, 0);
      if (confirmBox(`¿Marcar como abonadas ${vs.length} comisiones por ${money2(tot)} a ${DB.get('users', id)?.nombre}?`)) {
        vs.forEach((v) => { v.comisionEstado = 'abonada'; v.fechaAbono = today(); }); DB.save(); toast('Comisiones abonadas ✔'); rerender();
      }
      break;
    }

    /* Muro */
    case 'like': {
      const p = DB.get('posts', id); const i = p.likes.indexOf(u.id);
      i >= 0 ? p.likes.splice(i, 1) : p.likes.push(u.id); DB.save(); rerenderKeepScroll(); break;
    }
    case 'comment':
      modal('Comentar', `<form class="form" data-form="comment" data-id="${id}"><textarea class="in" name="texto" required rows="3" placeholder="Escribe tu comentario…"></textarea><button class="btn btn-gold">Publicar comentario</button></form>`);
      break;
    case 'download': {
      const p = DB.get('posts', id); p.descargas = (p.descargas || 0) + 1; DB.save();
      toast('Descargando… si se abre el video, mantenlo presionado y elige “Descargar”.');
      break;
    }
    case 'share-post': {
      const p = DB.get('posts', id);
      const ref = u && u.rol !== 'ceo' ? '?ref=' + u.id : '';
      share({ title: S().empresa, text: (p.texto || '').split('\n')[0], url: baseUrl() + '#/contenido/' + p.id + ref, file: true });
      break;
    }
    case 'post-vis': { const p = DB.get('posts', id); DB.update('posts', id, { publico: !p.publico }); toast(p.publico ? 'Ahora se ve en la web' : 'Ahora es solo para el equipo'); rerenderKeepScroll(); break; }
    case 'post-del': if (confirmBox('¿Eliminar esta publicación?')) { DB.remove('posts', id); rerenderKeepScroll(); } break;

    /* Testimonios */
    case 'test-new': modal('Agregar testimonio', `<form class="form" data-form="testimonio" data-admin="1"><div class="two"><label class="f">Nombre<input class="in" name="nombre" required></label><label class="f">Ciudad<input class="in" name="ciudad"></label></div><label class="f">Proyecto<select class="in" name="proyectoId">${DB.all('proyectos').map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select></label><label class="f">Testimonio<textarea class="in" name="texto" required></textarea></label><label class="f">Foto<input class="in" type="file" name="foto" accept="image/*"></label><label class="check"><input type="checkbox" name="permiso" required> El cliente autorizó publicar su testimonio y su foto.</label><button class="btn btn-gold">Guardar y publicar</button></form>`); break;
    case 'test-ok': DB.update('testimonios', id, { estado: 'aprobado' }); toast('Testimonio publicado en la web'); rerender(); break;
    case 'test-hide': DB.update('testimonios', id, { estado: 'pendiente' }); rerender(); break;
    case 'test-del': if (confirmBox('¿Eliminar este testimonio?')) { DB.remove('testimonios', id); rerender(); } break;

    /* Datos */
    case 'export': {
      const blob = new Blob([DB.export()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'infinity-respaldo-' + today() + '.json'; a.click();
      toast('Copia descargada (no incluye videos ni fotos subidos)'); break;
    }
    case 'clear-demo':
      if (confirmBox('Se borrarán los asesores, aliados y ventas de EJEMPLO. Tus proyectos, contenido y ajustes se conservan. ¿Continuar?')) { DB.clearDemo(); toast('Datos de ejemplo borrados. ¡A trabajar con datos reales!'); rerender(); }
      break;
    case 'reset-all':
      if (confirmBox('Esto borra TODO lo guardado en este navegador y vuelve a la versión inicial. No se puede deshacer. ¿Continuar?')) { DB.reset(); Router.go('#/'); }
      break;
  }
});

function confirmBox(msg) { return window.confirm(msg); }
function rerenderKeepScroll() { const y = window.scrollY; Router.render(); window.scrollTo(0, y); }

document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-go],[data-post]')) { e.preventDefault(); e.target.click(); }
});

/* Cambios inmediatos (selects, búsqueda, archivos) */
document.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.dataset.leadEstado) { DB.update('leads', t.dataset.leadEstado, { estado: t.value }); toast('Estado actualizado'); }
  if (t.dataset.visAsesor !== undefined) { DB.update('visitas', t.dataset.visAsesor, { asesorId: t.value }); toast(t.value ? 'Visita asignada a ' + DB.get('users', t.value).nombre : 'Visita sin asignar'); }
  if (t.dataset.visEstado) { DB.update('visitas', t.dataset.visEstado, { estado: t.value }); toast('Estado de la visita actualizado'); }
  if (t.dataset.prodEstado) { DB.update('producciones', t.dataset.prodEstado, { estado: t.value }); toast('Producción actualizada'); }
  if (t.dataset.leadAsesor) { DB.update('leads', t.dataset.leadAsesor, { asesorId: t.value }); toast('Contacto asignado'); }
  if (t.name === 'file' && t.closest('[data-form="post"]')) { const f = t.files[0]; $('[data-file-name]').textContent = f ? '📎 ' + f.name + ' (' + (f.size / 1048576).toFixed(1) + ' MB)' : ''; }
  if (t.name === 'fotoFile' && t.closest('[data-form="perfil"]')) { const u = Auth.user(); const ref = await uploadOne(t, 700); if (ref) { DB.update('users', u.id, { foto: ref }); toast('Foto actualizada'); Router.render(); } }
  if (t.matches('[data-import]')) {
    const f = t.files[0]; if (!f) return;
    try { DB.import(await f.text()); toast('Copia restaurada'); Router.render(); } catch (err) { toast('Ese archivo no es una copia válida'); }
  }
});
function runSim() {
  const box = $('[data-sim]'); if (!box) return;
  const p = Number($('[name=sp]', box).value) || 0, i = Number($('[name=si]', box).value) || 0, c = Number($('[name=sc]', box).value) || 1;
  const ini = p * i / 100; $('[data-o=ini]', box).textContent = money(ini); $('[data-o=cuota]', box).textContent = money2((p - ini) / c);
}
document.addEventListener('input', (e) => { if (e.target.closest('[data-sim]')) runSim(); });
document.addEventListener('change', (e) => { if (e.target.closest('[data-sim]')) runSim(); });
let searchTimer;
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.search) { clearTimeout(searchTimer); searchTimer = setTimeout(() => { history.replaceState(null, '', t.dataset.search + '?q=' + encodeURIComponent(t.value)); Router.render(); const n = $('[data-search]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300); }
});

/* Formularios */
document.addEventListener('submit', async (e) => {
  const form = e.target.closest('[data-form]'); if (!form) return;
  e.preventDefault();
  const btn = form.querySelector('button:not([type=button])'); if (btn) { btn.disabled = true; btn.dataset.txt = btn.innerHTML; btn.textContent = 'Guardando…'; }
  try { await handleForm(form.dataset.form, form, formData(form)); }
  catch (err) { console.error(err); toast('Algo salió mal: ' + (err.message || err)); }
  finally { if (btn && document.body.contains(btn)) { btn.disabled = false; btn.innerHTML = btn.dataset.txt; } }
});

async function handleForm(kind, form, d) {
  const u = Auth.user(); const id = form.dataset.id;
  switch (kind) {
    case 'login': {
      const r = Auth.login(d.email, d.pass);
      if (r.error) { form.querySelector('.form-err').textContent = r.error; return; }
      Router.go('#/panel'); return;
    }
    case 'registro': {
      if (DB.all('users').some((x) => x.email.toLowerCase() === d.email.toLowerCase())) return toast('Ese correo ya está registrado. Ingresa con tu contraseña.');
      const foto = await uploadOne(form.querySelector('[name=foto]'), 700);
      const tel = d.telefono.replace(/\D/g, '');
      DB.add('users', { patrocinadorId: refAsesor()?.id || '', titulo: '', anios: '', especialidad: '', portada: '', frase: '', logros: [], fotos: [], nombre: d.nombre, email: d.email, passHash: DB.hash(d.pass), rol: d.rol, estado: 'pendiente', foto: foto || '', telefono: tel.length === 9 ? '51' + tel : tel, zona: d.zona, equipoId: d.equipoId, comision: DB.settings.comisionDefault, bio: d.bio, publico: true, fecha: today() });
      $('#main').innerHTML = `<section class="sec"><div class="wrap center" style="max-width:640px"><div style="width:72px;height:72px;margin:0 auto 18px;border-radius:50%;background:#E3F1E8;color:var(--ok);display:flex;align-items:center;justify-content:center"><span style="width:36px;height:36px">${ic('check', 2.4)}</span></div><h2 class="serif" style="font-size:44px;font-weight:600">¡Solicitud enviada!</h2><p class="muted" style="font-size:17px;margin:12px 0 26px">Gracias, ${esc(d.nombre.split(' ')[0])}. La CEO revisará tu registro y te avisaremos por WhatsApp. Cuando te aprueben, podrás ingresar con tu correo y contraseña.</p><a class="btn btn-wa" href="${waLink(S().whatsapp, 'Hola, acabo de registrarme en la web como ' + d.rol + ': ' + d.nombre)}" target="_blank" rel="noopener">${ic('wa', 1.4)} Avisar por WhatsApp</a></div></section>`;
      window.scrollTo(0, 0); return;
    }
    case 'lead': {
      const ref = refAsesor();
      DB.add('leads', { nombre: d.nombre, telefono: d.telefono, interes: d.interes, perfil: d.perfil, proyectoId: form.dataset.proyecto || '', mensaje: d.mensaje, fecha: today(), estado: 'nuevo', asesorId: ref ? ref.id : '', origen: ref ? 'Enlace de asesor' : 'Web' });
      window.open(waLink(contactPhone(), `Hola, soy ${d.nombre}. Me interesa: ${d.interes}${d.perfil ? ' (para ' + d.perfil.toLowerCase() + ')' : ''}.${d.mensaje ? ' ' + d.mensaje : ''}`), '_blank', 'noopener');
      form.innerHTML = `<div class="center" style="padding:30px 10px"><div style="width:64px;height:64px;margin:0 auto 14px;border-radius:50%;background:#E3F1E8;color:var(--ok);display:flex;align-items:center;justify-content:center"><span style="width:32px;height:32px">${ic('check', 2.4)}</span></div><h3 class="serif" style="font-size:30px">¡Gracias, ${esc(d.nombre.split(' ')[0])}!</h3><p class="muted">Te escribiremos muy pronto por WhatsApp.</p></div>`;
      return;
    }
    case 'magnet': {
      const ref = refAsesor();
      DB.add('leads', { nombre: d.nombre, telefono: d.telefono, interes: 'Guía: comprar seguro', mensaje: '', fecha: today(), estado: 'nuevo', asesorId: ref ? ref.id : '', origen: 'Guía gratuita' });
      toast('¡Listo! Aquí tienes tu guía.'); Router.go('#/guia'); return;
    }
    case 'testimonio': {
      const foto = await uploadOne(form.querySelector('[name=foto]'), 600);
      DB.add('testimonios', { nombre: d.nombre, ciudad: d.ciudad, proyectoId: d.proyectoId, asesorId: d.asesorId || '', texto: d.texto, foto: foto || '', estado: form.dataset.admin ? 'aprobado' : 'pendiente', fecha: today() });
      if (form.dataset.admin) { closeModal(); toast('Testimonio publicado'); Router.render(); return; }
      if (form.closest('#modal')) { closeModal(); toast('¡Gracias! Publicaremos tu testimonio después de revisarlo.'); return; }
      form.innerHTML = `<div class="center" style="padding:30px"><h3 class="serif" style="font-size:30px">¡Gracias por tu confianza!</h3><p class="muted">Publicaremos tu testimonio después de revisarlo.</p></div>`;
      return;
    }
    case 'proyecto': {
      const p = id ? DB.get('proyectos', id) : { id: 'p-' + d.nombre.toLowerCase().normalize('NFD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-3), galeria: [], docs: [], extras: [], video: '', plano: '', portada: '' };
      const patch = {
        nombre: d.nombre, region: d.region, ubicacion: d.ubicacion, tipo: d.tipo, estado: d.estado, precioDesde: Number(d.precioDesde) || 0, precioTexto: d.precioTexto || 'Consulta precios y disponibilidad',
        resumen: d.resumen, descripcion: d.descripcion, usos: d.usos.split(',').map((x) => x.trim()).filter(Boolean),
        precios: d.precios.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[0]).map(([t, v, n]) => ({ t, v: v || '', n: n || '' })),
        area: d.area, totalLotes: d.totalLotes, disponibles: d.disponibles, partida: d.partida, entrega: d.entrega,
        lat: d.lat === '' ? null : Number(d.lat), lng: d.lng === '' ? null : Number(d.lng), orden: Number(d.orden) || 9, publico: d.publico, destacado: d.destacado
      };
      const portada = await uploadOne(form.querySelector('[name=portadaFile]'));
      if (portada) patch.portada = portada;
      const plano = await uploadOne(form.querySelector('[name=planoFile]'), 2400);
      if (plano) patch.plano = plano;
      const video = await uploadOne(form.querySelector('[name=videoFile]'));
      if (video) patch.video = video;
      const gal = [...(form.querySelector('[name=galeriaFiles]').files || [])];
      const refs = []; for (const f of gal) refs.push(await Media.fromFile(f));
      patch.galeria = [...(p.galeria || []), ...refs];
      if (!patch.portada && !p.portada && patch.galeria[0]) patch.portada = patch.galeria[0];
      if (id) DB.update('proyectos', id, patch); else DB.add('proyectos', Object.assign(p, patch));
      closeModal(); toast('Proyecto guardado ✔'); Router.render(); return;
    }
    case 'user': {
      if (DB.all('users').some((x) => x.email.toLowerCase() === d.email.toLowerCase() && x.id !== id)) return toast('Ese correo ya lo usa otra persona.');
      const patch = { nombre: d.nombre, rol: d.rol, email: d.email, telefono: d.telefono.replace(/\D/g, ''), zona: d.zona, equipoId: d.equipoId, comision: Number(d.comision) || 0, estado: d.estado, bio: d.bio, publico: d.publico };
      if (d.pass) patch.passHash = DB.hash(d.pass);
      const foto = await uploadOne(form.querySelector('[name=fotoFile]'), 700); if (foto) patch.foto = foto;
      if (id) DB.update('users', id, patch); else DB.add('users', Object.assign({ foto: '', fecha: today() }, patch));
      closeModal(); toast('Guardado ✔'); Router.render(); return;
    }
    case 'equipo': {
      const patch = { nombre: d.nombre, tipo: d.tipo, liderId: d.liderId, zona: d.zona, comision: d.comision === '' ? '' : Number(d.comision), descripcion: d.descripcion };
      const eq = id ? DB.update('equipos', id, patch) : DB.add('equipos', patch);
      DB.all('users').forEach((x) => { const on = d['m_' + x.id]; if (on) x.equipoId = eq.id; else if (x.equipoId === eq.id) x.equipoId = ''; });
      DB.save(); closeModal(); toast('Equipo guardado ✔'); Router.render(); return;
    }
    case 'venta': {
      const ceo = u.rol === 'ceo';
      const asesorId = ceo ? d.asesorId : u.id; const a = DB.get('users', asesorId);
      const pct = ceo && d.comisionPct !== '' ? Number(d.comisionPct) : comisionDe(a) + (rangoDe(a).bono || 0);
      const precio = Number(d.precio) || 0;
      const patch = { proyectoId: d.proyectoId, lote: d.lote, cliente: d.cliente, fecha: d.fecha, precio, asesorId, comisionPct: pct, comisionMonto: Math.round(precio * pct) / 100 };
      if (ceo) { patch.estado = d.estado; patch.comisionEstado = d.comisionEstado; if (d.comisionEstado === 'abonada') { const old = id && DB.get('ventas', id); patch.fechaAbono = old?.fechaAbono || today(); } else patch.fechaAbono = ''; }
      if (id) DB.update('ventas', id, patch);
      else DB.add('ventas', Object.assign({ estado: 'reportada', comisionEstado: 'pendiente', bonoEstado: 'pendiente', fechaAbono: '' }, patch));
      closeModal(); toast(ceo ? 'Venta guardada ✔' : 'Venta enviada a revisión ✔'); Router.render(); return;
    }
    case 'post': {
      const input = form.querySelector('[name=file]'); const f = input.files[0];
      if (!f && !d.texto) return toast('Escribe un texto o sube un video/foto.');
      let src = '', tipo = 'imagen';
      if (f) { tipo = f.type.startsWith('video') ? 'video' : 'imagen'; src = await Media.fromFile(f); }
      DB.add('posts', { autorId: u.id, fecha: today(), texto: d.texto, tipo, src, poster: '', publico: d.publico === '1', proyectoId: d.proyectoId, likes: [], descargas: 0, comentarios: [] });
      toast('Publicado ✔'); Router.render(); return;
    }
    case 'comment': {
      const p = DB.get('posts', id); p.comentarios.push({ autorId: u.id, texto: d.texto, fecha: today() }); DB.save();
      closeModal(); rerenderKeepScroll(); return;
    }
    case 'visita': case 'visita-int': {
      const ref = refAsesor(); const codigo = 'VIS-' + String(Date.now()).slice(-5);
      const v = DB.add('visitas', { codigo, nombre: d.nombre, telefono: d.telefono, proyectoId: d.proyectoId, fecha: d.fecha, turno: d.turno, personas: Number(d.personas) || 1, punto: d.punto, comentario: d.comentario, asesorId: kind === 'visita-int' && u && !seesAll(u) ? u.id : (ref ? ref.id : ''), estado: 'pendiente', origen: kind === 'visita' ? (ref ? 'Enlace de asesor' : 'Agenda web') : 'Registro interno', creado: today() });
      DB.add('leads', { nombre: d.nombre, telefono: d.telefono, interes: DB.get('proyectos', d.proyectoId)?.nombre || '', proyectoId: d.proyectoId, mensaje: 'Visita ' + codigo + ' · ' + d.fecha, fecha: today(), estado: 'visita', asesorId: v.asesorId, origen: v.origen });
      if (kind === 'visita-int') { closeModal(); toast('Visita agendada ✔'); Router.render(); return; }
      visitaConfirm(v); return;
    }
    case 'tarea': DB.add('tareas', { titulo: d.titulo, area: d.area, responsableId: d.responsableId, vence: d.vence, estado: 'pendiente', prioridad: d.prioridad }); closeModal(); toast('Tarea creada ✔'); Router.render(); return;
    case 'meta': DB.add('metas', { titulo: d.titulo, alcance: d.alcance, targetId: d.targetId, proyectoId: d.proyectoId, tipo: d.tipo, objetivo: Number(d.objetivo), premio: d.premio, desde: d.desde, hasta: d.hasta }); closeModal(); toast('Meta creada. Ya la ve todo el equipo ✔'); Router.render(); return;
    case 'campana': {
      const patch = { nombre: d.nombre, plataforma: d.plataforma, proyectoId: d.proyectoId, estado: d.estado, presupuestoDia: Number(d.presupuestoDia) || 0, desde: d.desde, hasta: d.hasta, gasto: Number(d.gasto) || 0, contactos: Number(d.contactos) || 0, ventas: Number(d.ventas) || 0 };
      if (id) DB.update('campanas', id, patch); else DB.add('campanas', patch);
      closeModal(); toast('Campaña guardada ✔'); Router.render(); return;
    }
    case 'produccion': DB.add('producciones', { titulo: d.titulo, tipo: d.tipo, fecha: d.fecha, responsableId: d.responsableId, lugar: d.lugar, proyectoId: d.proyectoId, notas: d.notas, estado: 'programado' }); closeModal(); toast('Grabación programada ✔'); Router.render(); return;
    case 'mipagina': {
      const patch = { titulo: d.titulo, anios: d.anios, especialidad: d.especialidad, frase: d.frase, bio: d.bio, publico: d.publico };
      const foto = await uploadOne(form.querySelector('[name=fotoFile]'), 700); if (foto) patch.foto = foto;
      const portada = await uploadOne(form.querySelector('[name=portadaFile]'), 1800); if (portada) patch.portada = portada;
      DB.update('users', u.id, patch); toast('Tu página se actualizó ✔'); Router.render(); return;
    }
    case 'logro': { u.logros = u.logros || []; u.logros.push({ t: d.t, d: d.d, i: d.i }); DB.save(); toast('Logro agregado ✔'); Router.render(); return; }
    case 'fotocliente': {
      const src = await uploadOne(form.querySelector('[name=file]'), 1400); if (!src) return;
      u.fotos = u.fotos || []; u.fotos.unshift({ src, t: d.t }); DB.save(); toast('Foto publicada en tu página ✔'); Router.render(); return;
    }
    case 'evento': {
      const patch = { tipo: d.tipo, fecha: d.fecha, titulo: d.titulo, texto: d.texto, link: d.link };
      const img = await uploadOne(form.querySelector('[name=imgFile]'), 1400); if (img) patch.imagen = img;
      if (id) DB.update('eventos', id, patch); else DB.add('eventos', patch);
      closeModal(); toast('Evento guardado ✔'); Router.render(); return;
    }
    case 'perfil': {
      const patch = { nombre: d.nombre, telefono: d.telefono.replace(/\D/g, ''), zona: d.zona, bio: d.bio };
      if (d.pass) patch.passHash = DB.hash(d.pass);
      DB.update('users', u.id, patch); toast('Perfil guardado ✔'); Router.render(); return;
    }
    case 'ajustes': {
      const s = DB.settings;
      Object.assign(s, { empresa: d.empresa, razonSocial: d.razonSocial, ruc: d.ruc, whatsapp: d.whatsapp.replace(/\D/g, ''), horario: d.horario, direccion: d.direccion, lema: d.lema, historia: d.historia, mision: d.mision, vision: d.vision, comisionDefault: Number(d.comisionDefault) || 0, metaMensualLotes: Number(d.metaMensualLotes) || 1 });
      s.valores = d.valores.split(',').map((x) => x.trim()).filter(Boolean);
      s.stats = { lotesVendidos: Number(d.lotesVendidos) || 0, proyectosHistoricos: Number(d.proyectosHistoricos) || 0 };
      s.anuncio = Object.assign(s.anuncio, { activo: d.an_activo, etiqueta: d.an_etiqueta, titulo: d.an_titulo, texto: d.an_texto, proyectoId: d.an_proyectoId });
      ['facebook', 'instagram', 'tiktok', 'youtube'].forEach((k) => (s.redes[k] = d['r_' + k]));
      s.hitos = d.hitos.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[0]).map(([t, dd]) => ({ t, d: dd || '' }));
      ['invertir', 'vivir', 'emprender'].forEach((k) => { s.audiencias[k] = { titulo: d[`au_${k}_titulo`], texto: d[`au_${k}_texto`] }; });
      for (let i = 0; i < s.directivos.length; i++) {
        const dd = s.directivos[i];
        ['nombre', 'cargo', 'frase', 'historia', 'facebook', 'instagram'].forEach((k) => (dd[k] = d[`d${i}_${k}`]));
        const foto = await uploadOne(form.querySelector(`[name=d${i}_fotoFile]`), 1200); if (foto) dd.foto = foto;
      }
      DB.save(); toast('Cambios guardados. Ya se ven en la web ✔'); return;
    }
  }
}

/* ---------- Arranque ---------- */
DB.load();
const _render = Router.render.bind(Router);
Router.render = function () { _render(); runSim(); };
Router.render();
