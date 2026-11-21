/* ==========================================================
   SITIO PÚBLICO v2
   Espacios: inversionista · vivir · emprender · proyectos · asesores · CEO · familias
   ========================================================== */
const S = () => DB.settings;
const pubProjects = () => DB.all('proyectos').filter((p) => p.publico).sort((a, b) => (a.orden || 99) - (b.orden || 99));
const activeAsesores = () => DB.all('users').filter((u) => (u.rol === 'asesor' || u.rol === 'aliado') && u.estado === 'activo');
const lotesDe = (uid) => DB.all('ventas').filter((v) => v.asesorId === uid && v.estado === 'confirmada').length;
const testimoniosDe = (uid) => DB.all('testimonios').filter((t) => t.asesorId === uid && t.estado === 'aprobado');
const rankingIds = () => activeAsesores().map((u) => [u.id, lotesDe(u.id)]).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
const firstName = (n) => String(n || '').split(' ')[0];
const titleSplit = (t) => { const w = String(t).split(' '); const k = Math.max(1, Math.ceil(w.length / 2)); return `${esc(w.slice(0, k).join(' '))} <b>${esc(w.slice(k).join(' '))}</b>`; };

/* Insignias automáticas según resultados */
function autoBadges(u) {
  const n = lotesDe(u.id); const pos = rankingIds().indexOf(u.id) + 1; const t = testimoniosDe(u.id).length; const out = [];
  if (pos && pos <= 3 && n) out.push({ t: `Top ${pos} del ranking`, d: 'Ranking general de ventas', i: 'trophy' });
  if (n >= 10) out.push({ t: '+10 lotes vendidos', d: 'Asesor de alto rendimiento', i: 'award' });
  else if (n >= 5) out.push({ t: '+5 lotes vendidos', d: 'En crecimiento constante', i: 'up' });
  if (t >= 1) out.push({ t: `${t} testimonio${t > 1 ? 's' : ''} de clientes`, d: 'Familias que lo recomiendan', i: 'star' });
  out.push({ t: 'Asesor verificado', d: S().empresa, i: 'shield' });
  return out;
}

/* ---------- Estructura general ---------- */
function siteShell(content, active = '') {
  const s = S(); const u = Auth.user(); const ref = refAsesor();
  const links = [['/proyectos', 'Proyectos'], ['/invertir', 'Invertir'], ['/vivir', 'Vivir'], ['/nosotros', 'Nosotros'], ['/asesores', 'Asesores'], ['/familias', 'Familias'], ['/contenido', 'Contenido'], ['/contacto', 'Contacto']];
  const nav = links.map(([h, t]) => `<a href="#${h}" class="${active === h ? 'on' : ''}">${t}</a>`).join('');
  $('#root').innerHTML = `
  ${s.anuncio?.activo ? `<div class="topbar"><div class="wrap"><span><i class="pulse"></i><b style="color:#fff">${esc(s.anuncio.etiqueta)}:</b> ${esc(s.anuncio.titulo)}</span><a href="#/proyecto/${esc(s.anuncio.proyectoId)}">Ver proyecto →</a></div></div>` : ''}
  <header class="header"><div class="wrap">
    <a class="brand" href="#/" aria-label="${esc(s.empresa)}, inicio"><img src="img/logo.png" alt=""><span><b>INFINITY</b><small>GROUP MB</small></span></a>
    <nav class="nav" aria-label="Principal">${nav}</nav>
    <div class="header-cta">
      <a class="btn btn-line btn-sm hide-m" href="#/${u ? 'panel' : 'ingresar'}">${u ? 'Mi panel' : 'Ingresar'}</a>
      <a class="btn btn-gold btn-sm hide-m" href="#/visita">${ic('calendar')} Agendar visita</a>
      <button class="burger" data-act="burger" aria-label="Abrir menú">${ic('menu')}</button>
    </div>
  </div></header>
  <div class="mnav" id="mnav"><a href="#/">Inicio</a><a href="#/encuentra">Encuentra tu terreno</a>${nav}<a class="btn btn-gold" href="#/visita">Agendar visita</a><a class="btn btn-line" href="#/unete">Únete al equipo</a><a class="btn btn-green" href="#/${u ? 'panel' : 'ingresar'}">${u ? 'Mi panel' : 'Ingresar'}</a></div>
  <main id="main">${content}</main>
  ${footer()}
  <a class="wa-float" href="${waLink(contactPhone(), 'Hola, quiero información sobre sus proyectos.')}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp${ref ? ' a ' + esc(ref.nombre) : ''}">${ic('wa', 1.4)}</a>`;
}

function footer() {
  const s = S();
  return `<footer class="footer"><div class="wrap">
    <div class="big" aria-hidden="true">INFINITY GROUP</div>
    <div class="cols">
      <div><a class="brand" href="#/"><img src="img/logo.png" alt="" style="height:54px;background:#fff;border-radius:12px;padding:4px"><span><b style="color:#fff">INFINITY</b><small>GROUP MB</small></span></a>
        <p style="margin-top:18px;max-width:330px">${esc(s.lema)}. Lotes, hectáreas y terrenos industriales con documentación en regla.</p>
        <div style="display:flex;gap:10px;margin-top:20px">${socialIcons()}</div></div>
      <div><h4>Proyectos</h4><ul>${pubProjects().map((p) => `<li><a href="#/proyecto/${p.id}">${esc(p.nombre)}</a></li>`).join('')}</ul></div>
      <div><h4>Infinity</h4><ul><li><a href="#/invertir">Para invertir</a></li><li><a href="#/vivir">Para vivir</a></li><li><a href="#/emprender">Para emprender</a></li><li><a href="#/nosotros">Nosotros</a></li><li><a href="#/asesores">Asesores</a></li><li><a href="#/guia">Guía para comprar seguro</a></li><li><a href="#/unete">Trabaja con nosotros</a></li></ul></div>
      <div><h4>Contacto</h4><ul><li>${esc(s.direccion)}</li><li><a href="${waLink(s.whatsapp)}" target="_blank" rel="noopener">WhatsApp +${esc(s.whatsapp)}</a></li><li>${esc(s.horario)}</li><li>${esc(s.razonSocial)} · RUC ${esc(s.ruc)}</li><li><a href="#/ingresar">Ingreso del equipo</a></li></ul></div>
    </div>
    <div class="bottom"><span>© ${new Date().getFullYear()} ${esc(s.razonSocial)}. Todos los derechos reservados.</span><span>Precios y condiciones sujetos a disponibilidad. Las proyecciones de valorización son referenciales y no están garantizadas.</span></div>
  </div></footer>`;
}
function socialIcons() {
  const r = S().redes; const st = 'width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center';
  return [['facebook', 'fb'], ['instagram', 'ig'], ['tiktok', 'tt'], ['youtube', 'yt']].filter(([k]) => r[k]).map(([k, i]) => `<a href="${esc(r[k])}" target="_blank" rel="noopener" aria-label="${k}" style="${st}"><span style="width:18px;height:18px;display:block">${ic(i)}</span></a>`).join('');
}
function socialCards() {
  const r = S().redes; const d = S().directivos; const items = [];
  if (r.facebook) items.push([r.facebook, 'fb', 'Facebook', S().empresa]);
  if (d[0]?.facebook) items.push([d[0].facebook, 'fb', 'Facebook', d[0].nombre]);
  if (r.instagram) items.push([r.instagram, 'ig', 'Instagram', '@' + r.instagram.replace(/\/$/, '').split('/').pop()]);
  if (r.tiktok) items.push([r.tiktok, 'tt', 'TikTok', S().empresa]);
  if (r.youtube) items.push([r.youtube, 'yt', 'YouTube', S().empresa]);
  return items.map(([u, i, n, h]) => `<a class="social" href="${esc(u)}" target="_blank" rel="noopener">${ic(i)}<span><b>${n}</b><small>${esc(h)}</small></span></a>`).join('');
}
const secHead = (eyebrow, title, text = '', center = false) => `<div class="sec-head ${center ? 'center' : ''} reveal"><span class="eyebrow">${eyebrow}</span><h2 class="display">${title}</h2>${text ? `<p>${text}</p>` : ''}</div>`;

/* ---------- Tarjetas ---------- */
function projectCard(p) {
  const badge = { Lanzamiento: 'b-gold', 'En venta': 'b-green', Preventa: 'b-info', Vendido: 'b-grey' }[p.estado] || 'b-silver';
  const perf = { invertir: 'Inversión', vivir: 'Para vivir', emprender: 'Emprender' };
  return `<article class="pcard reveal" data-go="#/proyecto/${p.id}" tabindex="0" role="link" aria-label="${esc(p.nombre)}">
    <div class="ph">${p.portada ? `<img ${srcAttr(p.portada)} alt="${esc(p.nombre)}" loading="lazy">` : `<div class="ph-empty">${INF('', 2)}<img src="img/logo.png" alt="" style="width:64px;position:relative">${titleSplit(p.nombre)}</div>`}
      <span class="badge ${badge}">${esc(p.estado)}</span><span class="loc">${ic('map')} ${esc(p.region)}</span></div>
    <div class="body"><div class="tags"><span class="badge b-soft">${esc(p.tipo)}</span>${(p.perfiles || []).slice(0, 2).map((x) => `<span class="badge b-grey">${perf[x] || x}</span>`).join('')}</div>
      <h3>${esc(p.nombre)}</h3><p class="muted" style="font-size:14px">${esc(p.resumen)}</p>
      <div class="price"><div><small>${p.precioDesde ? 'Desde' : 'Precio'}</small><b>${p.precioDesde ? money(p.precioDesde) : 'Consultar'}</b></div><span class="go">${ic('up', 2)}</span></div></div>
  </article>`;
}
function asesorCard(u, pos) {
  const lotes = lotesDe(u.id); const t = testimoniosDe(u.id).length;
  return `<article class="acard reveal" data-go="#/asesor/${u.id}" tabindex="0" role="link" aria-label="Perfil de ${esc(u.nombre)}">
    ${pos && pos <= 3 && lotes ? `<span class="badge b-gold rank">★ Top ${pos}</span>` : ''}
    <div class="ph">${u.foto ? `<img ${srcAttr(u.foto)} alt="${esc(u.nombre)}" loading="lazy">` : `<div class="avatar">${INF('', 2)}${esc(initials(u.nombre))}</div>`}</div>
    <div class="body"><h3>${esc(u.nombre)}${u.demo ? ' <span class="badge b-warn">Ejemplo</span>' : ''}</h3><div class="zone">${esc(u.titulo || 'Asesor(a) inmobiliario(a)')} · ${esc(u.zona || '')}</div><div style="margin-top:6px">${rangoBadge(u)}</div>
      <div class="mini"><span><b>${lotes}</b>lotes</span><span><b>${u.anios || '–'}</b>años</span><span><b>${t}</b>reseñas</span></div>
      <div class="acts"><a class="btn btn-line btn-sm" href="#/asesor/${u.id}">Ver perfil</a><a class="btn btn-wa btn-sm" href="${waLink(u.telefono, 'Hola ' + firstName(u.nombre) + ', vi tu perfil en la web de Infinity Group y quiero información.')}" target="_blank" rel="noopener" aria-label="WhatsApp de ${esc(u.nombre)}">${ic('wa', 1.4)}</a></div></div>
  </article>`;
}
function testimonialCard(t) {
  const proy = DB.get('proyectos', t.proyectoId); const a = DB.get('users', t.asesorId);
  return `<article class="tcard reveal"><div class="stars">★★★★★</div><p class="q">${esc(t.texto)}</p>
    <div class="who">${t.foto ? `<span class="av"><img ${srcAttr(t.foto)} alt=""></span>` : `<span class="av">${esc(initials(t.nombre))}</span>`}<div><b>${esc(t.nombre)}${t.demo ? ' <span class="badge b-warn">Ejemplo</span>' : ''}</b><div class="muted" style="font-size:13px">${esc(t.ciudad || '')}${proy ? ' · ' + esc(proy.nombre) : ''}${a ? ` · con <a href="#/asesor/${a.id}" style="color:var(--green);font-weight:700">${esc(firstName(a.nombre))}</a>` : ''}</div></div></div></article>`;
}
function videoThumb(p) {
  const poster = p.tipo === 'video' ? p.poster : p.src;
  return `<div class="vthumb reveal" data-post="${p.id}" role="button" tabindex="0" aria-label="Ver publicación">
    ${poster ? `<img ${srcAttr(poster)} alt="" loading="lazy">` : `<video ${vsrcAttr(p.src)} muted playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover"></video>`}
    ${p.tipo === 'video' ? `<div class="play"><span>${ic('play')}</span></div>` : ''}<p>${esc((p.texto || '').split('\n')[0].slice(0, 70))}</p></div>`;
}
function eventCard(e) {
  return `<a class="ev" href="${esc(e.link || '#/')}"><img ${srcAttr(e.imagen)} alt="" loading="lazy"><time>${fdate(e.fecha)}</time><span class="badge b-gold">${esc(e.tipo)}</span><h3>${esc(e.titulo)}</h3><p>${esc(e.texto)}</p></a>`;
}
function specBar(p, tag) {
  if (!p) return '';
  const ub = p.ubicacion.split('·')[0].split(',')[0];
  return `<div class="specbar reveal">
    <a class="sb-name" href="#/proyecto/${p.id}"><span class="sb-tag">${esc(tag || p.estado)}</span><b>${esc(p.nombre)}</b></a>
    <div><small>Ubicación</small><b>${esc(ub)}</b></div>
    <div><small>Metrajes</small><b>${esc(p.area || p.tipo)}</b></div>
    <div><small>${p.financia ? 'Financia' : 'Tipo'}</small><b>${esc(p.financia || p.tipo)}</b></div>
    <a class="sb-price" href="#/proyecto/${p.id}"><small>Desde</small><b>${p.precioDesde ? money(p.precioDesde) : 'Consultar'}</b></a>
  </div>`;
}
function proofs(list) { return list.map(([i, t]) => `<figure class="proof reveal" data-zoom="${i}"><img src="${i}" alt="${t}" loading="lazy"><figcaption>${t}</figcaption></figure>`).join(''); }
function ctaFinal(title = 'Tu terreno te está <b>esperando</b>', text = 'Agenda una visita guiada o conversa con un asesor hoy mismo.') {
  return `<section class="sec" style="padding-top:40px"><div class="wrap"><div class="cta-final reveal">${INF('', 1)}
    <div><span class="eyebrow">Da el siguiente paso</span><h2 style="margin-top:14px">${title}</h2><p>${text}</p></div>
    <div class="acts"><a class="btn btn-gold" href="#/contacto">Agendar mi visita</a><a class="btn btn-ghost" href="${waLink(contactPhone(), 'Hola, quiero hablar con un asesor.')}" target="_blank" rel="noopener">${ic('wa', 1.4)} Escribir por WhatsApp</a></div>
  </div></div></section>`;
}
function stepsBlock() {
  return `<section class="sec sec-alt"><div class="wrap">${secHead('Cómo comprar', 'Cinco pasos, <b>cero sorpresas</b>', 'Un proceso claro, por escrito y acompañado de principio a fin.', true)}
    <div class="steps">${[['map', 'Elige tu proyecto', 'Revisa precios, planos y documentos en la web.'], ['road', 'Visita el terreno', 'Te llevamos a conocerlo con un asesor.'], ['key', 'Separa tu lote', 'Con S/ 2,500 aseguras tu unidad.'], ['doc', 'Firma en notaría', 'Contrato con firmas legalizadas.'], ['house', 'Recibe tu terreno', 'Entrega del terreno según tu contrato.']]
      .map(([i, t, d]) => `<div class="step reveal"><div class="dot">${ic(i)}</div><div><h4>${t}</h4><p>${d}</p></div></div>`).join('')}</div>
  </div></section>`;
}
function magnetBlock() {
  return `<section class="sec" style="padding-top:20px"><div class="wrap"><div class="magnet reveal">
    <div class="l"><span class="eyebrow">Guía gratuita</span><h2 class="display" style="font-size:clamp(30px,3.6vw,46px);margin:14px 0 8px">7 cosas que debes revisar <b>antes de comprar un terreno</b></h2>
      <p class="muted">Lo que nadie te dice y que te protege de una mala compra. Gratis y sin compromiso.</p>
      <ul>${['Cómo verificar al propietario en SUNARP', 'Qué debe decir tu contrato', 'Las señales de alerta más comunes'].map((t) => `<li>${ic('check', 2.2)}${t}</li>`).join('')}</ul>
      <form class="form" data-form="magnet"><div class="two"><input class="in" name="nombre" required placeholder="Tu nombre" autocomplete="name" aria-label="Tu nombre"><input class="in" name="telefono" required placeholder="Tu WhatsApp" inputmode="tel" aria-label="Tu WhatsApp"></div><button class="btn btn-green">Quiero la guía gratis</button></form></div>
    <div class="r">${INF('', 1.5)}<div class="book"><small>INFINITY GROUP · GUÍA</small><b>7 cosas que debes revisar antes de comprar un terreno</b><img src="img/logo.png" alt="" style="background:#fff;border-radius:8px;padding:3px"></div></div>
  </div></div></section>`;
}

/* ================= INICIO ================= */
Router.on('/', () => {
  const s = S(); const projs = pubProjects(); const ases = activeAsesores();
  const an = s.anuncio; const anP = an?.activo && DB.get('proyectos', an.proyectoId);
  const top = rankingIds().slice(0, 4).map((id) => DB.get('users', id)).filter((u) => u.publico);
  const posts = DB.all('posts').filter((p) => p.publico).slice(0, 4);
  const tests = DB.all('testimonios').filter((t) => t.estado === 'aprobado').slice(0, 3);
  const mag = s.directivos[0]; const A = s.audiencias;
  siteShell(`
  <section class="hero">
    <video class="hero-bg" autoplay muted loop playsinline poster="img/calle.jpg" src="videos/dron.mp4"></video>
    ${INF('', 1)}
    <div class="wrap hero-in">
      <span class="eyebrow">Desarrolladora inmobiliaria · Perú</span>
      <h1 class="display">Tierra segura para construir tu <span class="acc">patrimonio</span></h1>
      <p class="lead">Lotes, hectáreas y terrenos industriales en Huaral, Chancay y Pucallpa. Proyectos propios, documentación en regla y un equipo que te acompaña de principio a fin.</p>
      <div class="ctas"><a class="btn btn-gold" href="#/encuentra">Encuentra tu terreno ${ic('up', 2.2)}</a><a class="btn btn-ghost" href="#/visita">${ic('calendar')} Agendar visita</a><a class="btn btn-ghost" href="${waLink(contactPhone(), 'Hola, quiero hablar con un asesor.')}" target="_blank" rel="noopener">${ic('wa', 1.4)} Hablar con un asesor</a></div>
      <div class="trust-row"><span>${ic('shield')} Partida registral SUNARP</span><span>${ic('doc')} Firma en notaría</span><span>${ic('truck')} Maquinaria propia</span></div>
    </div>
    <div class="wrap" style="position:relative;z-index:3;width:100%">${specBar(anP, an?.etiqueta)}</div>
  </section>

  <section class="paths"><div class="wrap">
    ${secHead('¿Qué estás buscando?', 'Un terreno para cada <b>sueño</b>', '', true)}
    <div class="path-grid">
      ${[['invertir', '01', 'img/monte.jpg', A.invertir], ['vivir', '02', 'img/jardin.jpg', A.vivir], ['emprender', '03', 'img/frutas.jpg', A.emprender]]
        .map(([k, n, img, a]) => `<a class="path reveal" href="#/${k}"><img src="${img}" alt="" loading="lazy"><span class="num">${n}</span><span class="go">${ic('up', 2)}</span><h3>${titleSplit(a.titulo)}</h3><p>${esc(a.texto)}</p></a>`).join('')}
    </div>
  </div></section>

  <section class="stats-band">${INF('', 1)}<div class="wrap stats">
    <div class="stat"><b><sup>+</sup><span data-count="${s.stats.lotesVendidos}">0</span></b><span>Lotes vendidos</span></div>
    <div class="stat"><b><span data-count="${s.stats.proyectosHistoricos}">0</span></b><span>Proyectos desarrollados</span></div>
    <div class="stat"><b><span data-count="${projs.length}">0</span></b><span>Proyectos en venta</span></div>
    <div class="stat"><b><span data-count="${ases.length}">0</span></b><span>Asesores certificados</span></div>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="row-between">${secHead('Proyectos', 'Elige dónde empieza <b>tu historia</b>')}<a class="link-arrow" href="#/proyectos">Ver los ${projs.length} proyectos ${ic('up', 2)}</a></div>
    <div class="g3">${projs.filter((p) => p.destacado).slice(0, 3).map(projectCard).join('')}</div>
  </div></section>

  <section class="sec sec-alt" style="padding-bottom:0"><div class="wrap">
    ${secHead('¿Por qué Infinity Group?', 'No somos intermediarios: <b>somos los dueños</b>', 'Desarrollamos nuestros propios proyectos. Tú tratas directamente con la empresa.')}
    <div class="pillars">${[['grid', 'Proyectos propios', 'Desarrollamos cada proyecto de principio a fin.'], ['shield', 'Documentación en regla', 'Partida en SUNARP y firma en notaría. Todo por escrito.'], ['truck', 'Maquinaria pesada propia', 'Abrimos calles con nuestros propios equipos.'], ['pro', 'Profesionales especializados', 'Ingenieros, arquitectos y asesores certificados.'], ['users', 'Trabajadores a sueldo', 'Un equipo estable, no vendedores de paso.'], ['trend', 'Zonas con proyección', 'Norte Chico y la Amazonía: regiones que crecen.']]
      .map(([i, t, d], k) => `<div class="pillar reveal"><span class="n">0${k + 1}</span><div class="ico">${ic(i)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  </div><div style="height:110px"></div></section>

  <section class="sec"><div class="wrap leader">
    <div class="frame reveal"><div class="photo"><img ${srcAttr(mag.foto || 'img/logo.png')} alt="${esc(mag.nombre)}"></div><div class="sticker"><b class="gold-text">+${num(s.stats.lotesVendidos)}</b><span>lotes vendidos</span></div></div>
    <div class="reveal"><span class="eyebrow">Liderazgo</span><blockquote>“${esc(mag.frase)}”</blockquote>
      <div class="sig">${esc(mag.nombre)}</div><div class="role">${esc(mag.cargo)} · ${esc(s.empresa)}</div>
      <p class="muted" style="margin:20px 0 28px;font-size:16px">${esc(mag.historia)}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-green" href="#/lider/${mag.id}">Conoce su trayectoria</a><a class="btn btn-line" href="#/nosotros">Nuestra historia</a></div></div>
  </div></section>

  ${DB.all('eventos').length ? `<section class="sec sec-dark"><div class="wrap">
    <div class="row-between">${secHead('Novedades y eventos', 'Lo que está pasando en <b>Infinity</b>')}<div class="rail-nav"><button data-act="rail" data-dir="-1" aria-label="Anterior">←</button><button data-act="rail" data-dir="1" aria-label="Siguiente">→</button></div></div>
    <div class="rail" id="rail">${DB.all('eventos').map(eventCard).join('')}</div>
  </div></section>` : ''}

  ${stepsBlock()}

  ${top.length ? `<section class="sec"><div class="wrap">
    <div class="row-between">${secHead('Nuestro equipo', 'Asesores que conocen <b>cada metro</b>', 'Cada asesor tiene su propia página con sus logros y lo que dicen sus clientes.')}<a class="link-arrow" href="#/asesores">Conoce a todo el equipo ${ic('up', 2)}</a></div>
    <div class="g4">${top.map((u, i) => asesorCard(u, i + 1)).join('')}</div>
  </div></section>` : ''}

  <section class="sec sec-alt"><div class="wrap">
    ${secHead('Familias que confiaron', 'La confianza <b>se demuestra</b>', 'Documentos, firmas y familias reales.', true)}
    ${tests.length ? `<div class="g3" style="margin-bottom:24px">${tests.map(testimonialCard).join('')}</div>` : ''}
    <div class="g3">${proofs([['img/docs.jpg', 'Partida registral SUNARP N° 11008305'], ['img/notaria.jpg', 'Firma en notaría'], ['img/lotes7000.jpg', 'Más de 7,000 lotes vendidos']])}</div>
    <div class="center" style="margin-top:30px"><a class="link-arrow" href="#/familias">Ver más historias y dejar la tuya ${ic('up', 2)}</a></div>
  </div></section>

  ${magnetBlock()}

  ${posts.length ? `<section class="sec" style="padding-top:40px"><div class="wrap">
    <div class="row-between">${secHead('En video', 'Mira el avance <b>tal como es</b>')}<a class="link-arrow" href="#/contenido">Ver todo el contenido ${ic('up', 2)}</a></div>
    <div class="vgrid">${posts.map(videoThumb).join('')}</div>
  </div></section>` : ''}

  <section class="sec sec-dark"><div class="wrap center">${secHead('Síguenos', 'Únete a nuestra <b>comunidad</b>', 'Avances de obra, lanzamientos y consejos para invertir en tierra.', true)}<div class="socials">${socialCards()}</div></div></section>
  ${ctaFinal()}
  `, '/');
  maybeWelcome();
});

/* ================= ESPACIOS: INVERTIR / VIVIR / EMPRENDER ================= */
const AUD = {
  invertir: { img: 'img/monte.jpg', eyebrow: 'Para inversionistas', reasons: [['shield', 'Activo real y documentado', 'Tu inversión está respaldada por una partida registral, no por una promesa.'], ['trend', 'Zonas en crecimiento', 'Elegimos regiones con proyección: Norte Chico, Chancay y la Amazonía.'], ['coins', 'Precio de prelanzamiento', 'Quien entra primero compra al mejor precio por m².'], ['leaf', 'Tierra productiva', 'Además de valorizarse, tu hectárea puede producir.']], faqs: [['¿Por qué invertir en tierra?', 'La tierra es un activo real y limitado. A diferencia del dinero en efectivo, no se imprime más.'], ['¿La valorización está garantizada?', 'No. Ninguna inversión tiene ganancia garantizada. Te mostramos la información del proyecto para que decidas con datos.'], ['¿Puedo comprar varias hectáreas?', 'Sí. Escríbenos y un asesor te arma una propuesta.']] },
  vivir: { img: 'img/jardin.jpg', eyebrow: 'Para tu familia', reasons: [['house', 'Un lugar propio', 'Construye la casa o la casa de campo que tu familia merece.'], ['calc', 'Cuotas sin intereses', 'En lotes, paga con 30 % de inicial y hasta 15 cuotas sin intereses.'], ['key', 'Entrega del terreno', 'Recibes tu terreno según lo que indica tu contrato.'], ['users', 'Acompañamiento', 'Un asesor te guía en cada paso, sin letra chica.']], faqs: [['¿Puedo pagar en cuotas?', 'Sí, en los lotes: 30 % de inicial y hasta 15 cuotas sin intereses. Pregunta por cada proyecto.'], ['¿Puedo visitar antes de comprar?', 'Claro, te lo recomendamos. Coordinamos una visita guiada.']] },
  emprender: { img: 'img/frutas.jpg', eyebrow: 'Para emprendedores', reasons: [['sprout', 'Cultivos rentables', 'Cacao, plátano, papaya, yuca y frutales.'], ['leaf', 'Piscigranja', 'Crianza de paco y otras especies en estanques.'], ['house', 'Turismo rural', 'Bungalows ecológicos, piscina y comida típica.'], ['truck', 'Lotes industriales', 'Almacenes y logística en el eje de Chancay.']], faqs: [['¿Qué puedo hacer en una hectárea?', 'Sembrar, criar animales, armar una piscigranja o un negocio de turismo rural. Tu asesor te orienta.']] }
};
['invertir', 'vivir', 'emprender'].forEach((k) => Router.on('/' + k, () => {
  const a = S().audiencias[k]; const x = AUD[k];
  const ps = pubProjects().filter((p) => (p.perfiles || []).includes(k));
  siteShell(`
  <section class="pd-hero" style="min-height:min(70vh,620px)"><img src="${x.img}" alt="">${INF('', 1)}<div class="wrap" style="padding-bottom:60px">
    <span class="eyebrow">${x.eyebrow}</span><h1 class="display">${titleSplit(a.titulo)}</h1><p style="max-width:620px;color:#d3e2d9;font-size:18px">${esc(a.texto)}</p>
    <div class="ctas" style="display:flex;gap:12px;margin-top:26px;flex-wrap:wrap"><a class="btn btn-gold" href="#proyectos-${k}">Ver proyectos</a><a class="btn btn-ghost" href="${waLink(contactPhone(), 'Hola, busco un terreno para ' + k + '.')}" target="_blank" rel="noopener">${ic('wa', 1.4)} Asesoría gratis</a></div>
  </div></section>
  <section class="sec"><div class="wrap">${secHead('Por qué tiene sentido', 'Razones para <b>dar el paso</b>')}
    <div class="pillars" style="grid-template-columns:repeat(${Math.min(4, x.reasons.length)},1fr)">${x.reasons.map(([i, t, d], n) => `<div class="pillar reveal"><span class="n">0${n + 1}</span><div class="ico">${ic(i)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
  <section class="sec sec-alt anchor" id="proyectos-${k}"><div class="wrap">${secHead('Proyectos recomendados', `${ps.length} opciones <b>para ti</b>`)}<div class="g3">${ps.map(projectCard).join('') || '<p class="muted">Pronto tendremos proyectos para este perfil.</p>'}</div></div></section>
  ${stepsBlock()}
  <section class="sec"><div class="wrap" style="max-width:900px">${secHead('Preguntas frecuentes', 'Resolvemos <b>tus dudas</b>')}<div class="faq">${x.faqs.map(([q, r]) => `<details><summary>${esc(q)}</summary><p>${esc(r)}</p></details>`).join('')}</div></div></section>
  ${magnetBlock()}${ctaFinal()}`, '/' + k);
}));

/* ================= PROYECTOS ================= */
Router.on('/proyectos', (r) => {
  const f = r.query.f || 'Todos'; const all = pubProjects();
  const cats = ['Todos', ...new Set([...all.map((p) => p.region), ...all.map((p) => p.tipo)])];
  const list = f === 'Todos' ? all : all.filter((p) => p.region === f || p.tipo === f);
  siteShell(`<section class="sec" style="padding-top:80px"><div class="wrap">
    ${secHead(`${all.length} proyectos`, 'Nuestros <b>proyectos</b>', 'Lotes, hectáreas y terrenos industriales con documentación en regla.')}
    <div class="filters" role="tablist">${cats.map((c) => `<a class="chip ${c === f ? 'on' : ''}" href="#/proyectos?f=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>
    <div class="g3">${list.map(projectCard).join('') || '<p class="muted">No hay proyectos en esta categoría.</p>'}</div>
  </div></section>${ctaFinal()}`, '/proyectos');
});

Router.on('/proyecto', (r) => {
  const p = DB.get('proyectos', r.parts[1]);
  if (!p) return Router.routes['/404']();
  const ref = refAsesor(); const phone = contactPhone(); const u = Auth.user();
  const msg = `Hola, quiero información de ${p.nombre}.`;
  const tabs = p.galeriaTabs && Object.keys(p.galeriaTabs).length ? p.galeriaTabs : (p.galeria?.length ? { Galería: p.galeria } : null);
  const tab0 = tabs ? Object.keys(tabs)[0] : '';
  const bbox = p.lat ? `${p.lng - 0.08},${p.lat - 0.05},${p.lng + 0.08},${p.lat + 0.05}` : '';
  const loteP = (p.precios || []).find((x) => /lote/i.test(x.t));
  const simPrice = loteP ? Number(String(loteP.v).replace(/[^\d]/g, '')) : p.precioDesde;
  const sellers = activeAsesores().filter((a) => a.publico && DB.all('ventas').some((v) => v.asesorId === a.id && v.proyectoId === p.id)).slice(0, 4);
  const sub = [['descripcion', 'Descripción'], p.precios?.length && ['precios', 'Precios'], tabs && ['galeria', 'Galería'], p.video && ['video', 'Video'], p.plano && ['plano', 'Plano'], bbox && ['ubicacion', 'Ubicación'], p.docs?.length && ['documentos', 'Documentos'], p.faqs?.length && ['faq', 'Preguntas']].filter(Boolean);
  siteShell(`
  <section class="pd-hero">${p.portada ? `<img ${srcAttr(p.portada)} alt="${esc(p.nombre)}">` : `<div class="ph-empty" style="position:absolute;inset:0">${INF('', 1)}</div>`}<div class="wrap">
    <a href="#/proyectos" style="color:#cfe0d6;font-size:14px;font-weight:600">← Todos los proyectos</a>
    <div style="display:flex;gap:8px;margin:16px 0 4px;flex-wrap:wrap"><span class="badge b-gold">${esc(p.estado)}</span><span class="badge">${esc(p.tipo)}</span></div>
    <h1 class="display">${titleSplit(p.nombre)}</h1>
    <p style="display:flex;gap:8px;align-items:flex-start;color:#d3e2d9;max-width:720px;margin-bottom:26px"><span style="width:18px;height:18px;flex:none;margin-top:3px">${ic('map')}</span>${esc(p.ubicacion)}</p>
    ${specBar(p)}
  </div></section>
  <nav class="subnav" aria-label="Secciones del proyecto"><div class="wrap">${sub.map(([id, t]) => `<a href="javascript:void 0" data-act="jump" data-to="${id}">${t}</a>`).join('')}<a class="btn btn-gold btn-sm" href="javascript:void 0" data-act="jump" data-to="cotizar">Cotizar</a></div></nav>

  <section class="sec anchor" id="descripcion"><div class="wrap">
    <div class="g2" style="gap:60px;align-items:start">
      <div class="reveal"><span class="eyebrow">El proyecto</span><h2 class="display" style="font-size:clamp(34px,4vw,52px);margin:14px 0 18px">Vive y crece en <b>${esc(p.region)}</b></h2><p style="white-space:pre-line;font-size:16.5px;color:#2b3731">${esc(p.descripcion)}</p>
        ${p.usos?.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:22px">${p.usos.map((x) => `<span class="badge b-soft" style="text-transform:none;font-size:13px;padding:8px 13px">🌱 ${esc(x)}</span>`).join('')}</div>` : ''}</div>
      <div class="reveal">${p.caracteristicas?.length ? `<div class="feat" style="grid-template-columns:1fr 1fr">${p.caracteristicas.map(([i, t]) => `<div>${ic(i)}<span>${esc(t)}</span></div>`).join('')}</div>` : ''}
        ${ref ? `<div class="card" style="margin-top:16px;display:flex;gap:14px;align-items:center;padding:18px">${avatar(ref)}<div style="flex:1"><small class="muted">Tu asesor(a)</small><b style="display:block">${esc(ref.nombre)}</b></div><a class="btn btn-wa btn-sm" href="${waLink(phone, msg)}" target="_blank" rel="noopener">${ic('wa', 1.4)} Escribir</a></div>` : ''}</div>
    </div>
  </div></section>

  ${p.precios?.length ? `<section class="sec sec-alt anchor" id="precios"><div class="wrap">${secHead('Precios y formas de pago', 'Invierte <b>a tu medida</b>')}
    <div class="price-cards">${p.precios.map((x) => `<div class="pc reveal"><small>${esc(x.t)}</small><b>${esc(x.v)}</b><div class="n">${esc(x.n || '')}</div></div>`).join('')}</div>
    ${simPrice ? `<div class="sim reveal" style="margin-top:22px">${INF('', 1)}<h3 style="font-size:22px;margin-bottom:16px">${ic('calc')} Simula tus cuotas</h3>
      <div class="form" data-sim><div class="three"><label class="f">Precio (S/)<input class="in" type="number" name="sp" value="${simPrice}"></label><label class="f">Inicial (%)<input class="in" type="number" name="si" value="30" min="0" max="100"></label><label class="f">Cuotas<select class="in" name="sc">${[3, 6, 9, 12, 15].map((n) => `<option ${n === 15 ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
      <div class="sim-out"><div><small>Inicial</small><b data-o="ini">–</b></div><div><small>Cuota mensual</small><b data-o="cuota">–</b></div><div><small>Separas con</small><b>S/ 2,500</b></div></div>
      <p style="font-size:12px;color:#a6c0b2;margin-top:12px">Simulación referencial sin intereses. Las condiciones exactas dependen del proyecto y del tipo de unidad.</p></div></div>` : ''}
  </div></section>` : ''}

  ${tabs ? `<section class="sec anchor" id="galeria"><div class="wrap">${secHead('Galería', 'Explora <b>cada rincón</b>')}
    <div class="tabs">${Object.keys(tabs).map((t, i) => `<button class="chip ${i ? '' : 'on'}" data-act="gal-tab" data-tab="${esc(t)}">${esc(t)}</button>`).join('')}</div>
    <div class="gallery" id="gal" data-pid="${p.id}">${tabs[tab0].map((i) => `<img ${srcAttr(i)} alt="" data-zoom="${esc(i)}" loading="lazy">`).join('')}</div>
  </div></section>` : ''}

  ${p.video ? `<section class="sec sec-dark anchor" id="video" style="padding:80px 0"><div class="wrap">${secHead('En video', 'Recorre el terreno <b>desde el aire</b>')}<video ${vsrcAttr(p.video)} controls playsinline preload="metadata" poster="${p.portada && !p.portada.startsWith('idb:') ? esc(p.portada) : ''}" style="width:100%;border-radius:22px;background:#000;max-height:640px"></video></div></section>` : ''}

  ${p.plano ? `<section class="sec anchor" id="plano"><div class="wrap">${secHead('Plano', 'Elige tu <b>ubicación</b>', 'En verde, las unidades separadas; en rojo, las vendidas. Pregunta por la disponibilidad actual.')}<img ${srcAttr(p.plano)} alt="Plano de ${esc(p.nombre)}" style="border-radius:22px;cursor:zoom-in;width:100%" data-zoom="${esc(p.plano)}"></div></section>` : ''}

  ${bbox ? `<section class="sec sec-alt anchor" id="ubicacion"><div class="wrap"><div class="loc-split reveal">
    <iframe loading="lazy" title="Mapa de ${esc(p.nombre)}" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat},${p.lng}"></iframe>
    <div class="info"><span class="eyebrow">Ubicación</span><h2>Estamos donde <b>tu futuro crece</b></h2><p style="display:flex;gap:10px;color:#cfe0d6"><span style="width:20px;height:20px;flex:none">${ic('map')}</span>${esc(p.ubicacion)}</p>
      <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${p.lat},${p.lng}">${ic('map')} Ir con Google Maps</a>
      <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes">${ic('waze')} Ir con Waze</a></div>
  </div></div></section>` : ''}

  ${p.docs?.length ? `<section class="sec anchor" id="documentos"><div class="wrap">${secHead('Documentación', 'Todo <b>por escrito</b>', p.partida ? esc(p.partida) + '. Verifícala tú mismo en SUNARP.' : '')}<div class="g2">${proofs(p.docs.map((d, i) => [d, i ? 'Firma en notaría' : (p.partida || 'Documentación')]))}</div>
    <div style="margin-top:18px"><a class="link-arrow" href="#/guia">Cómo verificar un terreno en SUNARP ${ic('up', 2)}</a></div></div></section>` : ''}

  ${sellers.length ? `<section class="sec sec-alt"><div class="wrap">${secHead('Asesores de este proyecto', 'Habla con quien <b>ya lo vende</b>')}<div class="g4">${sellers.map((a) => asesorCard(a)).join('')}</div></div></section>` : ''}

  ${p.faqs?.length ? `<section class="sec anchor" id="faq"><div class="wrap" style="max-width:900px">${secHead('Preguntas frecuentes', `Sobre <b>${esc(p.nombre)}</b>`)}<div class="faq">${p.faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div></section>` : ''}

  <section class="sec sec-alt anchor" id="cotizar"><div class="wrap g2" style="gap:56px;align-items:center">
    <div class="reveal"><span class="eyebrow">Cotiza sin compromiso</span><h2 class="display" style="font-size:clamp(34px,4.2vw,56px);margin:14px 0">¿Listo para dar el <b>siguiente paso?</b></h2><p class="muted" style="font-size:17px">Déjanos tus datos y ${ref ? esc(firstName(ref.nombre)) : 'un asesor'} te envía la cotización por WhatsApp.</p>
      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap"><a class="btn btn-gold" href="#/visita?p=${p.id}">${ic('calendar')} Agendar visita</a><a class="btn btn-wa" href="${waLink(phone, msg)}" target="_blank" rel="noopener">${ic('wa', 1.4)} WhatsApp directo</a><button class="btn btn-line" data-act="share-project" data-id="${p.id}">${ic('share')} Compartir${u && u.rol !== 'ceo' ? ' con mi enlace' : ''}</button></div></div>
    ${leadForm(p.id)}
  </div></section>`, '/proyectos');
});

function leadForm(proyectoId = '') {
  const p = proyectoId && DB.get('proyectos', proyectoId);
  const opts = p?.precios?.length ? p.precios.map((x) => x.t) : null;
  return `<form class="card form reveal" data-form="lead" data-proyecto="${esc(proyectoId)}">
    ${opts ? `<label class="f">¿Qué te interesa?<select class="in" name="interes">${opts.map((o) => `<option>${esc(p.nombre)} · ${esc(o)}</option>`).join('')}</select></label>`
    : `<label class="f">¿Qué te interesa?<select class="in" name="interes">${pubProjects().map((x) => `<option ${x.id === proyectoId ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}<option>Aún no lo sé, quiero asesoría</option></select></label>`}
    <div class="two"><label class="f">Nombre<input class="in" name="nombre" required autocomplete="name"></label><label class="f">Celular / WhatsApp<input class="in" name="telefono" required inputmode="tel" autocomplete="tel" placeholder="9XX XXX XXX"></label></div>
    <label class="f">Busco un terreno para<select class="in" name="perfil"><option>Invertir</option><option>Vivir</option><option>Emprender</option></select></label>
    <label class="f">Mensaje (opcional)<textarea class="in" name="mensaje" rows="3" placeholder="Ej.: quiero visitar el terreno este sábado"></textarea></label>
    <label class="check"><input type="checkbox" required> Acepto que me contacten por WhatsApp para responder mi consulta.</label>
    <button class="btn btn-gold btn-block">Quiero mi cotización</button>
  </form>`;
}

/* ================= NOSOTROS ================= */
Router.on('/nosotros', () => {
  const s = S();
  siteShell(`
  <section class="pd-hero" style="min-height:min(72vh,640px)"><img src="img/lotes7000.jpg" alt="">${INF('', 1)}<div class="wrap" style="padding-bottom:70px"><span class="eyebrow">Nuestra historia</span><h1 class="display">Convertimos tierra en <span class="acc">legado</span></h1><p style="max-width:680px;color:#d3e2d9;font-size:18px">${esc(s.historia)}</p></div></section>
  <section class="stats-band"><div class="wrap stats">
    <div class="stat"><b><sup>+</sup><span data-count="${s.stats.lotesVendidos}">0</span></b><span>Lotes vendidos</span></div>
    <div class="stat"><b><span data-count="${s.stats.proyectosHistoricos}">0</span></b><span>Proyectos desarrollados</span></div>
    <div class="stat"><b><span data-count="${pubProjects().length}">0</span></b><span>Proyectos en venta</span></div>
    <div class="stat"><b><span data-count="${activeAsesores().length}">0</span></b><span>Asesores</span></div>
  </div></section>
  <section class="sec"><div class="wrap">${secHead('Liderazgo', 'Las personas detrás de <b>Infinity</b>', '', true)}
    <div class="g2">${s.directivos.map((d) => `<a class="path reveal" href="#/lider/${d.id}" style="min-height:520px">${d.foto ? `<img ${srcAttr(d.foto)} alt="${esc(d.nombre)}" style="object-position:top">` : `<div class="avatar" style="position:absolute;inset:0;z-index:-2;font-size:140px">${esc(initials(d.nombre))}</div>`}<span class="num">${esc(d.cargo)}</span><span class="go">${ic('up', 2)}</span><h3>${titleSplit(d.nombre)}</h3><p>${esc(d.frase)}</p></a>`).join('')}</div>
  </div></section>
  <section class="sec sec-alt"><div class="wrap g2">
    <div class="mv reveal"><span class="eyebrow">Misión</span><h3>Nuestra <b>misión</b></h3><p style="font-size:17px">${esc(s.mision)}</p></div>
    <div class="mv reveal"><span class="eyebrow">Visión</span><h3>Nuestra <b>visión</b></h3><p style="font-size:17px">${esc(s.vision)}</p></div>
  </div></section>
  <section class="sec sec-dark"><div class="wrap">${secHead('Trayectoria', 'Un camino que <b>sigue creciendo</b>', '', true)}<div class="timeline">${(s.hitos || []).map((h, i) => `<div class="tl reveal"><span class="dot">${i + 1}</span><div><h3>${esc(h.t)}</h3><p>${esc(h.d)}</p></div></div>`).join('')}</div></div></section>
  <section class="sec"><div class="wrap center">${secHead('Valores', 'Lo que <b>nos mueve</b>', '', true)}<div class="values" style="--c:1">${s.valores.map((v) => `<span style="color:var(--green);border-color:var(--line);background:#fff">${esc(v)}</span>`).join('')}</div></div></section>
  ${ctaFinal()}`, '/nosotros');
});

/* ================= ESPACIO DE LA CEO / DIRECTIVOS ================= */
Router.on('/lider', (r) => {
  const s = S(); const d = s.directivos.find((x) => x.id === r.parts[1]) || s.directivos[0];
  const isCeo = d === s.directivos[0];
  siteShell(`
  <section class="sec" style="padding-top:70px"><div class="wrap leader">
    <div class="frame reveal"><div class="photo">${d.foto ? `<img ${srcAttr(d.foto)} alt="${esc(d.nombre)}">` : `<div class="avatar" style="font-size:140px">${esc(initials(d.nombre))}</div>`}</div>${isCeo ? `<div class="sticker"><b class="gold-text">${s.stats.proyectosHistoricos}</b><span>proyectos liderados</span></div>` : ''}</div>
    <div class="reveal"><span class="eyebrow">${esc(d.cargo)} · ${esc(s.empresa)}</span><h1 class="display" style="font-size:clamp(44px,5.6vw,78px);margin:14px 0">${titleSplit(d.nombre)}</h1>
      ${d.frase ? `<blockquote style="font-family:var(--serif);font-style:italic;font-size:clamp(24px,2.6vw,34px);line-height:1.25;margin-bottom:20px">“${esc(d.frase)}”</blockquote>` : ''}
      <p class="muted" style="font-size:16.5px;white-space:pre-line">${esc(d.historia)}</p>
      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap">${d.facebook ? `<a class="btn btn-line btn-sm" href="${esc(d.facebook)}" target="_blank" rel="noopener">${ic('fb')} Facebook</a>` : ''}${d.instagram ? `<a class="btn btn-line btn-sm" href="${esc(d.instagram)}" target="_blank" rel="noopener">${ic('ig')} Instagram</a>` : ''}<a class="btn btn-green btn-sm" href="#/proyectos">Ver sus proyectos</a></div></div>
  </div></section>
  ${isCeo ? `<section class="stats-band"><div class="wrap stats">
    <div class="stat"><b><sup>+</sup><span data-count="${s.stats.lotesVendidos}">0</span></b><span>Lotes vendidos</span></div>
    <div class="stat"><b><span data-count="${s.stats.proyectosHistoricos}">0</span></b><span>Proyectos</span></div>
    <div class="stat"><b><span data-count="3">0</span></b><span>Regiones</span></div>
    <div class="stat"><b><span data-count="${activeAsesores().length}">0</span></b><span>Asesores en su equipo</span></div></div></section>
  <section class="sec"><div class="wrap">${secHead('Trayectoria', 'Hitos de un camino <b>con visión</b>', '', true)}<div class="timeline">${(s.hitos || []).map((h, i) => `<div class="tl reveal"><span class="dot">${i + 1}</span><div><h3>${esc(h.t)}</h3><p>${esc(h.d)}</p></div></div>`).join('')}</div></div></section>
  <section class="sec sec-dark"><div class="wrap"><div class="row-between">${secHead('En acción', 'Eventos y <b>logros recientes</b>')}<div class="rail-nav"><button data-act="rail" data-dir="-1" aria-label="Anterior">←</button><button data-act="rail" data-dir="1" aria-label="Siguiente">→</button></div></div><div class="rail" id="rail">${DB.all('eventos').map(eventCard).join('')}</div></div></section>
  <section class="sec"><div class="wrap">${secHead('Galería', 'En el campo, <b>con su gente</b>')}<div class="g3">${proofs([['img/magaly_obra.jpg', 'Supervisando las obras en Pucallpa'], ['img/notaria.jpg', 'Firmas en notaría con clientes'], ['img/visita.jpg', 'Visitas guiadas al terreno']])}</div></div></section>` : ''}
  ${ctaFinal('Construyamos juntos <b>tu patrimonio</b>')}`, '/nosotros');
});

/* ================= ASESORES ================= */
Router.on('/asesores', (r) => {
  const z = r.query.z || 'Todas';
  const all = activeAsesores().filter((u) => u.publico);
  const zonas = ['Todas', ...new Set(all.map((u) => u.zona).filter(Boolean))];
  const ids = rankingIds();
  const list = all.filter((u) => z === 'Todas' || u.zona === z).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  siteShell(`<section class="sec" style="padding-top:80px"><div class="wrap">
    ${secHead(`${all.length} asesores`, 'Nuestro equipo de <b>asesores</b>', 'Conoce sus logros, lo que dicen sus clientes y escríbeles directo.')}
    <div class="filters">${zonas.map((c) => `<a class="chip ${c === z ? 'on' : ''}" href="#/asesores?z=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>
    <div class="g4">${list.map((u) => asesorCard(u, ids.indexOf(u.id) + 1)).join('')}</div>
    <div class="cta-final" style="margin-top:60px">${INF('', 1)}<div><span class="eyebrow">Trabaja con nosotros</span><h2 style="margin-top:12px">¿Quieres ser parte <b>del equipo?</b></h2><p>Tu propia página de asesor, contenido listo para publicar y comisiones visibles en tiempo real.</p></div><div class="acts"><a class="btn btn-gold" href="#/unete">Postula aquí</a></div></div>
  </div></section>`, '/asesores');
});

/* ================= PÁGINA PÚBLICA DE CADA ASESOR ================= */
Router.on('/asesor', (r) => {
  const u = DB.get('users', r.parts[1]);
  if (!u || u.estado !== 'activo' || u.rol === 'ceo') return Router.routes['/404']();
  const lotes = lotesDe(u.id); const tests = testimoniosDe(u.id);
  const pos = rankingIds().indexOf(u.id) + 1;
  const proys = [...new Set(DB.all('ventas').filter((v) => v.asesorId === u.id).map((v) => v.proyectoId))].map((id) => DB.get('proyectos', id)).filter((p) => p && p.publico);
  const medals = [...(u.logros || []), ...autoBadges(u).map((b) => Object.assign({ auto: true }, b))];
  const link = baseUrl() + '#/asesor/' + u.id + '?ref=' + u.id;
  try { sessionStorage.setItem('infinity_ref', u.id); } catch (e) {}
  siteShell(`
  <section class="cover">${u.portada ? `<img ${srcAttr(u.portada)} alt="">` : `<img src="img/monte.jpg" alt="">`}${INF('', 1)}</section>
  <section style="padding-bottom:100px"><div class="wrap">
    <div class="profile-head">
      <span class="av av-xl">${u.foto ? `<img ${srcAttr(u.foto)} alt="${esc(u.nombre)}">` : esc(initials(u.nombre))}</span>
      <div><h1>${titleSplit(u.nombre)}</h1><div class="t">${esc(u.titulo || 'Asesor(a) inmobiliario(a)')} · ${esc(u.zona || '')}</div><div style="margin-top:8px">${rangoBadge(u)}</div>${u.demo ? '<span class="badge b-warn" style="margin-top:6px">Perfil de ejemplo</span>' : ''}</div>
      <div class="acts"><a class="btn btn-wa" href="${waLink(u.telefono, 'Hola ' + firstName(u.nombre) + ', vi tu perfil en la web de Infinity Group.')}" target="_blank" rel="noopener">${ic('wa', 1.4)} Escríbeme</a><button class="btn btn-line" data-act="share-link" data-url="${esc(link)}" data-title="${esc(u.nombre)}">${ic('share')} Compartir</button></div>
    </div>
    <div class="pstats reveal"><div class="pstat"><b>${lotes}</b><span>Lotes vendidos</span></div><div class="pstat"><b>${u.anios || '–'}</b><span>Años de experiencia</span></div><div class="pstat"><b>${tests.length}</b><span>Testimonios</span></div><div class="pstat"><b>${pos ? '#' + pos : '–'}</b><span>En el ranking</span></div></div>

    <div class="g2 blk" style="gap:50px;align-items:start;margin-top:40px">
      <div class="reveal"><span class="eyebrow">Sobre mí</span>${u.frase ? `<blockquote style="font-family:var(--serif);font-style:italic;font-size:30px;line-height:1.25;margin:14px 0">“${esc(u.frase)}”</blockquote>` : ''}<p class="muted" style="font-size:16px;white-space:pre-line">${esc(u.bio || '')}</p>
        ${u.especialidad ? `<p style="margin-top:14px"><span class="badge b-soft" style="text-transform:none;font-size:13px;padding:8px 13px">Especialidad: ${esc(u.especialidad)}</span></p>` : ''}</div>
      <div class="reveal"><span class="eyebrow">Logros y reconocimientos</span><div class="medals" style="margin-top:16px">${medals.map((m) => `<div class="medal ${m.auto ? 'auto' : ''}"><span class="m">${ic(m.i || 'award')}</span><div><b>${esc(m.t)}</b><small>${esc(m.d || '')}</small></div></div>`).join('')}</div></div>
    </div>

    ${u.fotos?.length ? `<div class="blk"><h2>Con <b>mis clientes</b></h2><div class="photo-wall">${u.fotos.map((f) => `<figure class="reveal" data-zoom="${esc(f.src)}"><img ${srcAttr(f.src)} alt="" loading="lazy">${f.t ? `<figcaption>${esc(f.t)}</figcaption>` : ''}</figure>`).join('')}</div></div>` : ''}

    <div class="blk"><h2>Lo que dicen <b>mis clientes</b></h2>${tests.length ? `<div class="g3">${tests.map(testimonialCard).join('')}</div>` : '<p class="muted">Aún no hay testimonios publicados.</p>'}
      <button class="btn btn-line btn-sm" style="margin-top:20px" data-act="test-for" data-id="${u.id}">${ic('star')} ¿Compraste con ${esc(firstName(u.nombre))}? Deja tu experiencia</button></div>

    ${proys.length ? `<div class="blk"><h2>Proyectos <b>que vendo</b></h2><div class="g3">${proys.map(projectCard).join('')}</div></div>` : ''}
  </div></section>`, '/asesores');
});

/* ================= FAMILIAS ================= */
Router.on('/familias', () => {
  const tests = DB.all('testimonios').filter((t) => t.estado === 'aprobado');
  siteShell(`
  <section class="pd-hero" style="min-height:min(64vh,560px)"><img src="img/visita.jpg" alt="">${INF('', 1)}<div class="wrap" style="padding-bottom:60px"><span class="eyebrow">Familias que confiaron</span><h1 class="display">Cada lote es una <span class="acc">familia</span></h1><p style="max-width:620px;color:#d3e2d9;font-size:18px">Más de ${num(S().stats.lotesVendidos)} familias ya tienen algo propio. Estas son algunas de sus historias.</p></div></section>
  <section class="sec"><div class="wrap">
    ${tests.length ? `<div class="g3">${tests.map(testimonialCard).join('')}</div>` : ''}
    <div class="g3" style="margin-top:${tests.length ? 40 : 0}px">${proofs([['img/notaria.jpg', 'Firma en notaría'], ['img/visita.jpg', 'Visita guiada al terreno'], ['img/lotes7000.jpg', '+7,000 lotes vendidos'], ['img/plaza.jpg', 'Pucallpa nos recibe'], ['img/magaly_obra.jpg', 'La CEO en obra'], ['img/catedral.jpg', 'Recorridos por la ciudad']])}</div>
  </div></section>
  <section class="sec sec-alt"><div class="wrap" style="max-width:780px">${secHead('Tu experiencia', '¿Ya compraste <b>con nosotros?</b>', 'Cuéntanos cómo te fue. Publicaremos tu testimonio después de revisarlo.', true)}${testForm()}</div></section>`, '/familias');
});
function testForm(asesorId = '') {
  return `<form class="card form" data-form="testimonio">
    <div class="two"><label class="f">Tu nombre<input class="in" name="nombre" required></label><label class="f">Ciudad<input class="in" name="ciudad"></label></div>
    <div class="two"><label class="f">Proyecto<select class="in" name="proyectoId">${pubProjects().map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select></label>
    <label class="f">¿Quién fue tu asesor(a)?<select class="in" name="asesorId"><option value="">No recuerdo</option>${activeAsesores().map((a) => `<option value="${a.id}" ${a.id === asesorId ? 'selected' : ''}>${esc(a.nombre)}</option>`).join('')}</select></label></div>
    <label class="f">Tu experiencia<textarea class="in" name="texto" required maxlength="400" placeholder="¿Cómo fue tu experiencia comprando con Infinity Group?"></textarea></label>
    <label class="f">Foto con tu asesor o en tu terreno (opcional)<input class="in" type="file" name="foto" accept="image/*"></label>
    <label class="check"><input type="checkbox" name="permiso" required> Autorizo publicar mi testimonio y mi foto en la web y redes de ${esc(S().empresa)}.</label>
    <button class="btn btn-gold">Enviar mi testimonio</button></form>`;
}

/* ================= CONTENIDO ================= */
Router.on('/contenido', (r) => {
  const posts = DB.all('posts').filter((p) => p.publico);
  siteShell(`<section class="sec" style="padding-top:80px"><div class="wrap">
    ${secHead('Contenido', 'Avances, lanzamientos <b>y novedades</b>', 'Mira, descarga y comparte con tu familia lo que estamos construyendo.', true)}
    <div class="feed">${posts.map((p) => postCard(p, null)).join('') || '<p class="muted center">Pronto publicaremos novedades.</p>'}</div>
  </div></section>`, '/contenido');
  if (r.parts[1]) setTimeout(() => document.getElementById('post-' + r.parts[1])?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
});

/* ================= CONTACTO ================= */
Router.on('/contacto', () => {
  const s = S(); const ref = refAsesor();
  siteShell(`<section class="sec" style="padding-top:80px"><div class="wrap g2" style="gap:56px;align-items:start">
    <div class="reveal"><span class="eyebrow">Hablemos</span><h1 class="display" style="font-size:clamp(40px,5vw,66px);margin:14px 0">Agenda tu <b>visita</b> al terreno</h1>
      <p class="muted" style="font-size:17px">Déjanos tus datos y ${ref ? esc(firstName(ref.nombre)) + ', tu asesor(a),' : 'un asesor'} te escribe por WhatsApp. Sin compromiso.</p>
      <div style="display:grid;gap:14px;margin-top:30px">${[['map', s.direccion], ['calendar', s.horario], ['phone', '+' + s.whatsapp]].map(([i, t]) => `<div style="display:flex;gap:14px;align-items:center"><span class="av" style="background:var(--green-soft);color:var(--green)"><span style="width:20px;height:20px">${ic(i)}</span></span><span style="font-weight:600">${esc(t)}</span></div>`).join('')}</div>
      <div class="socials" style="justify-content:flex-start;margin-top:30px">${socialCards().replace(/class="social"/g, 'class="social" style="background:var(--green);"')}</div></div>
    ${leadForm()}
  </div></section>`, '/contacto');
});

/* ================= GUÍA PARA COMPRAR SEGURO ================= */
Router.on('/guia', () => {
  siteShell(`<section class="pd-hero" style="min-height:min(56vh,500px)"><img src="img/docs.jpg" alt="">${INF('', 1)}<div class="wrap" style="padding-bottom:56px"><span class="eyebrow">Guía gratuita</span><h1 class="display" style="font-size:clamp(36px,5vw,68px)">7 cosas que debes revisar <b>antes de comprar un terreno</b></h1></div></section>
  <section class="sec"><div class="guide">
    <p>Comprar un terreno es una de las decisiones más importantes de tu vida. Esta guía te ayuda a hacerlo con seguridad, compres con nosotros o con quien sea.</p>
    <h2>1. Verifica quién es el propietario</h2><p>Pide el número de partida registral y consúltalo en SUNARP. El vendedor debe ser el propietario inscrito o tener un poder vigente para vender.</p>
    <h2>2. Revisa cargas y gravámenes</h2><p>Solicita un Certificado Registral Inmobiliario (CRI). Te dice si el terreno tiene hipotecas, embargos o juicios.</p>
    <h2>3. Visita el terreno</h2><p>Compara lo que ves con el plano: medidas, linderos, accesos y servicios. Desconfía de quien no quiere llevarte.</p>
    <h2>4. Todo por escrito</h2><p>El contrato debe indicar el precio, la forma de pago, el plazo de entrega del terreno y del título, y qué pasa si alguna parte no cumple. Legaliza las firmas en notaría.</p>
    <h2>5. Paga a la empresa, nunca a una persona</h2><p>Deposita solo en las cuentas a nombre de la empresa y guarda todos tus comprobantes.</p>
    <h2>6. Pregunta por la independización</h2><p>Si compras un lote dentro de un terreno mayor, pregunta en qué etapa está la independización y en qué plazo recibirás tu título. Exige que el plazo figure en el contrato.</p>
    <h2>7. Desconfía de lo “demasiado bueno”</h2><p>Ganancias garantizadas, presión para pagar hoy o vendedores que no te dan documentos son señales de alerta.</p>
    <div class="callout"><b>En Infinity Group:</b> El Encanto de Pucallpa está inscrito en SUNARP con la partida N° 11008305 a favor de Infinity Group. La independización se ingresó el 26 de octubre de 2026 y el plazo del título figura en el contrato.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px"><a class="btn btn-green" href="https://www.sunarp.gob.pe" target="_blank" rel="noopener">${ic('globe')} Ir a SUNARP</a><a class="btn btn-gold" href="#/proyectos">Ver proyectos con partida</a></div>
  </div></section>${ctaFinal('¿Tienes dudas? <b>Te las resolvemos</b>')}`);
});

/* ================= ÚNETE ================= */
Router.on('/unete', () => {
  const eqs = DB.all('equipos');
  siteShell(`<section class="auth">
    <div class="auth-side"><img src="img/magaly_obra.jpg" alt="">${INF('', 1)}<div><span class="eyebrow">Trabaja con nosotros</span><h2 style="margin-top:14px">Vende proyectos propios con una empresa que <b>respalda tu trabajo</b></h2>
      <ul style="list-style:none;margin-top:24px;display:grid;gap:12px;color:#d3e2d9">${['Tu propia página de asesor con tus logros y clientes', 'Comisiones visibles en tiempo real', 'Contenido listo para publicar en tus redes', 'Tu enlace personal: los clientes te llegan a ti'].map((t) => `<li style="display:flex;gap:10px"><span style="width:20px;height:20px;color:var(--gold-2);flex:none">${ic('check', 2.2)}</span>${t}</li>`).join('')}</ul></div></div>
    <div class="auth-main"><form class="auth-box form" data-form="registro">
      <h1>Únete al <b>equipo</b></h1><p class="muted">Completa tus datos. La CEO revisará tu solicitud y te avisaremos por WhatsApp.</p>
      <label class="f">Quiero registrarme como<select class="in" name="rol"><option value="asesor">Asesor(a) inmobiliario(a)</option><option value="aliado">Aliado / inmobiliaria o equipo externo</option></select></label>
      <label class="f">Nombre completo (o de tu empresa si eres aliado)<input class="in" name="nombre" required autocomplete="name"></label>
      <div class="two"><label class="f">Celular / WhatsApp<input class="in" name="telefono" required inputmode="tel" placeholder="9XX XXX XXX"></label><label class="f">Ciudad<input class="in" name="zona" required></label></div>
      <label class="f">Equipo (opcional)<select class="in" name="equipoId"><option value="">Aún no tengo equipo</option>${eqs.map((e) => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('')}</select></label>
      <label class="f">Correo<input class="in" type="email" name="email" required autocomplete="email"></label>
      <label class="f">Crea una contraseña <span class="hint">(mínimo 8 caracteres)</span><input class="in" type="password" name="pass" minlength="8" required autocomplete="new-password"></label>
      <label class="f">Tu foto de perfil (opcional)<input class="in" type="file" name="foto" accept="image/*"></label>
      <label class="f">Cuéntanos tu experiencia en ventas (opcional)<textarea class="in" name="bio" rows="3"></textarea></label>
      <button class="btn btn-gold btn-block">Enviar solicitud</button>
      <p class="muted center" style="font-size:13px">¿Ya tienes cuenta? <a href="#/ingresar" style="color:var(--green);font-weight:700">Ingresa aquí</a></p>
    </form></div></section>`, '/unete');
});

/* ================= INGRESAR ================= */
Router.on('/ingresar', () => {
  if (Auth.user()) return Router.go('#/panel');
  const demo = S().modoDemo;
  siteShell(`<section class="auth">
    <div class="auth-side"><img src="img/calle.jpg" alt="">${INF('', 1)}<div><span class="eyebrow">Plataforma Infinity</span><h2 style="margin-top:14px">Tus ventas, tus comisiones y <b>tu marca personal</b>, en un solo lugar</h2></div></div>
    <div class="auth-main"><div class="auth-box"><form class="form" data-form="login">
      <h1>Bienvenido <b>de vuelta</b></h1><p class="muted">Acceso para la CEO, asesores y aliados.</p>
      <label class="f">Correo<input class="in" type="email" name="email" required autocomplete="email"></label>
      <label class="f">Contraseña<input class="in" type="password" name="pass" required autocomplete="current-password"></label>
      <p class="form-err" style="color:var(--bad);font-size:14px" role="alert"></p>
      <button class="btn btn-green btn-block">Ingresar</button>
      <p class="muted center" style="font-size:13px">¿Aún no eres parte? <a href="#/unete" style="color:var(--green);font-weight:700">Regístrate</a></p></form>
      ${demo ? `<div class="demo-box"><p><b>Modo demostración.</b> Entra con un clic para ver cada tipo de cuenta:</p><div class="btns">
        <button class="btn btn-green btn-sm" data-act="demo-login" data-id="u-ceo">Entrar como CEO</button>
        <button class="btn btn-line btn-sm" data-act="demo-login" data-id="u-a4">Como asesor</button>
        <button class="btn btn-line btn-sm" data-act="demo-login" data-id="u-al1">Como aliado</button>
        <button class="btn btn-line btn-sm" data-act="demo-login" data-id="u-mk">Como marketing</button></div></div>` : ''}
    </div></div></section>`);
});

Router.on('/404', () => siteShell(`<section class="sec"><div class="wrap center"><h2 class="display" style="font-size:52px">Página <b>no encontrada</b></h2><p class="muted" style="margin:12px 0 26px">Puede que el enlace haya cambiado.</p><a class="btn btn-green" href="#/">Volver al inicio</a></div></section>`));

/* ---------- Publicación del muro ---------- */
function postCard(p, me) {
  const a = DB.get('users', p.autorId) || { nombre: S().empresa, foto: 'img/logo.png' };
  const liked = me && p.likes.includes(me.id);
  const proy = DB.get('proyectos', p.proyectoId);
  return `<article class="post" id="post-${p.id}">
    <div class="post-h">${avatar(a)}<div><b>${esc(a.nombre)}</b><small>${ago(p.fecha)}${proy ? ' · ' + esc(proy.nombre) : ''}${me ? ' · ' + (p.publico ? '🌐 Público' : '🔒 Solo equipo') : ''}</small></div></div>
    ${p.texto ? `<div class="post-t">${esc(p.texto)}</div>` : ''}
    ${p.src ? `<div class="post-m">${p.tipo === 'video' ? `<video ${vsrcAttr(p.src)} ${p.poster ? `poster="${esc(p.poster)}"` : ''} controls playsinline preload="metadata"></video>` : `<img ${srcAttr(p.src)} alt="" loading="lazy">`}</div>` : ''}
    <div class="post-c"><span>${p.likes.length ? '❤️ ' + p.likes.length : ''}</span><span>${p.comentarios.length ? p.comentarios.length + ' comentarios · ' : ''}${p.descargas || 0} descargas</span></div>
    <div class="post-a" style="grid-template-columns:repeat(${me ? 4 : 2},1fr)">
      ${me ? `<button class="${liked ? 'liked' : ''}" data-act="like" data-id="${p.id}">${ic('heart')} ${liked ? 'Te gusta' : 'Me gusta'}</button>
      <button data-act="comment" data-id="${p.id}">${ic('chat')} Comentar</button>` : ''}
      ${p.src ? `<a ${hrefAttr(p.src)} download="${esc(fileName(p))}" data-act="download" data-id="${p.id}">${ic('down')} Descargar</a>` : '<span></span>'}
      <button data-act="share-post" data-id="${p.id}">${ic('share')} Compartir</button>
    </div>
    ${me && p.comentarios.length ? `<div class="comments">${p.comentarios.map((c) => { const cu = DB.get('users', c.autorId); return `<div class="cmt">${avatar(cu, 'av-sm')}<div><b>${esc(cu?.nombre || 'Usuario')}</b>${esc(c.texto)}</div></div>`; }).join('')}</div>` : ''}
  </article>`;
}
function fileName(p) { return 'infinity-group-' + p.id + (p.tipo === 'video' ? '.mp4' : '.jpg'); }
