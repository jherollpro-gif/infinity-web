/* ==========================================================
   DATOS INICIALES
   - Empresa, directivos y proyectos: datos reales (Facebook + material del proyecto).
   - Asesores, aliados y ventas marcados con demo:true son de EJEMPLO.
     La CEO los borra desde Ajustes → "Borrar datos de ejemplo".
   ========================================================== */
window.SEED = (function () {
  const hoy = new Date();
  const fechaHace = (dias) => new Date(hoy.getTime() - dias * 864e5).toISOString().slice(0, 10);

  const settings = {
    empresa: 'Infinity Group MB',
    razonSocial: 'Infinity Group MB S.A.C.',
    ruc: '20615486281',
    lema: 'Tierra segura para construir tu patrimonio',
    direccion: 'Av. Alfredo Mendiola 267, San Martín de Porres, Lima',
    whatsapp: '51925375153',
    horario: 'Lunes a sábado · 9:00 a. m. – 7:00 p. m.',
    anuncio: {
      activo: true,
      etiqueta: 'Gran lanzamiento',
      titulo: 'El Encanto de Pucallpa',
      texto: 'Hectáreas desde S/ 6.90 el m² y lotes de 1,000 m². KM 44 de la Carretera Federico Basadre.',
      proyectoId: 'p-pucallpa',
      imagen: 'img/calle.jpg'
    },
    historia:
      'Infinity Group MB nació con una convicción: la tierra es el patrimonio más seguro que una familia peruana puede construir. ' +
      'Desde el Norte Chico —Huaral y Chancay— hemos desarrollado proyectos de lotes, hectáreas y terrenos industriales, ' +
      'con documentación en regla, maquinaria propia y un equipo de profesionales a tiempo completo. ' +
      'Hoy damos el salto a la expansión nacional con El Encanto de Pucallpa, en la Amazonía peruana.',
    mision:
      'Hacer realidad el patrimonio de las familias peruanas con terrenos seguros, documentados y con alto potencial de crecimiento, acompañándolas con transparencia en cada paso.',
    vision:
      'Ser la desarrolladora inmobiliaria más confiable del Perú, reconocida por convertir la tierra en oportunidades que trascienden generaciones.',
    valores: ['Transparencia', 'Seguridad jurídica', 'Compromiso', 'Trabajo en equipo', 'Visión de futuro', 'Cercanía'],
    stats: { proyectosHistoricos: 17, lotesVendidos: 7000 },
    comisionDefault: 7,
    metaMensualLotes: 4,
    directivos: [
      {
        id: 'd-magaly',
        nombre: 'Magaly Bermúdez',
        cargo: 'CEO y fundadora',
        foto: 'img/magaly.jpg',
        frase: 'Transformo oportunidades en proyectos que generan valor y construyo negocios con visión de futuro.',
        historia:
          'Empresaria y desarrolladora inmobiliaria. Fundó Infinity Group MB y ha liderado 17 proyectos en el Norte Chico, con más de 7,000 lotes vendidos. ' +
          'Su sello: proyectos propios, trabajadores a sueldo, profesionales especializados y maquinaria pesada propia. ' +
          'Hoy conduce la expansión nacional de la empresa, empezando por la Amazonía con El Encanto de Pucallpa.',
        facebook: 'https://www.facebook.com/profile.php?id=100084294792873',
        instagram: 'https://www.instagram.com/magalybermudez_oficial/'
      },
      {
        id: 'd-giuseppe',
        nombre: 'Giuseppe Benavides',
        cargo: 'Socio · Dirección comercial',
        foto: '',
        frase: 'Cada terreno que vendemos es el inicio de la historia de una familia.',
        historia:
          'Conocido en redes como “El Lobo de los Bienes Raíces”. Acompaña la estrategia comercial de Infinity Group MB y la formación de asesores.',
        facebook: 'https://www.facebook.com/profile.php?id=61552171676885',
        instagram: ''
      }
    ],
    redes: {
      facebook: 'https://www.facebook.com/profile.php?id=61588248958184',
      instagram: 'https://www.instagram.com/magalybermudez_oficial/',
      tiktok: '',
      youtube: ''
    },
    modoDemo: true
  };

  const proyectos = [
    {
      id: 'p-pucallpa',
      nombre: 'El Encanto de Pucallpa',
      region: 'Pucallpa',
      ubicacion: 'KM 44, Carretera Federico Basadre · Sector Santa Catalina, Campo Verde, Ucayali',
      tipo: 'Hectáreas',
      estado: 'Lanzamiento',
      precioDesde: 14900,
      precioTexto: 'Lotes 1,000 m² desde S/ 14,900 · Hectárea desde S/ 69,000',
      resumen: 'Hectáreas y lotes de campo en plena Amazonía, con calles abiertas por maquinaria propia y una quebrada natural que cruza el terreno.',
      descripcion:
        'El Encanto de Pucallpa es nuestro primer proyecto en la Amazonía peruana. Hectáreas de 10,000 m² y lotes de 1,000 m² a unos 2 km de la carretera Federico Basadre, ' +
        'con calles de 10 metros que ya se están abriendo con maquinaria propia y una quebrada natural dentro del terreno.\n\n' +
        'Ideal para sembrar, criar, emprender en turismo rural o simplemente asegurar el patrimonio de tu familia en una de las regiones con mayor proyección del país.',
      precios: [
        { t: 'Hectárea (10,000 m²)', v: 'Desde S/ 69,000', n: 'S/ 6.90 el m² · al contado' },
        { t: 'Lote de 1,000 m²', v: 'Desde S/ 14,900', n: '30 % de inicial y hasta 15 cuotas sin intereses' },
        { t: 'Separación', v: 'S/ 2,500', n: 'Aplica a lotes y hectáreas' }
      ],
      usos: ['Cacao', 'Plátano', 'Papaya', 'Yuca', 'Frutales', 'Piscigranja (paco)', 'Crianza de gallinas', 'Bungalows ecológicos', 'Turismo rural'],
      area: '1,000 m² y 10,000 m²',
      partida: 'Partida registral SUNARP N° 11008305',
      entrega: 'Entrega inmediata del terreno',
      lat: -8.559, lng: -74.891,
      portada: 'img/calle.jpg',
      galeria: ['img/calle.jpg', 'img/magaly_obra.jpg', 'img/cargador.jpg', 'img/monte.jpg', 'img/visita.jpg', 'img/selva.jpg', 'img/plaza.jpg', 'img/catedral.jpg'],
      plano: 'img/plano.jpg',
      docs: ['img/docs.jpg', 'img/notaria.jpg'],
      extras: ['img/frutas.jpg', 'img/piscigranja.jpg'],
      video: 'videos/dron.mp4',
      totalLotes: '', disponibles: '',
      destacado: true, publico: true, orden: 1,
      perfiles: ['invertir', 'emprender', 'vivir'],
      financia: 'Lotes en cuotas sin intereses',
      caracteristicas: [
        ['road', 'Calles de 10 metros'], ['leaf', 'Quebrada natural'], ['key', 'Entrega inmediata del terreno'],
        ['shield', 'Partida SUNARP'], ['truck', 'Maquinaria propia'], ['map', 'A 2 km de la carretera']
      ],
      galeriaTabs: {
        'Terreno': ['img/calle.jpg', 'img/monte.jpg', 'img/selva.jpg'],
        'Avance de obra': ['img/cargador.jpg', 'img/magaly_obra.jpg'],
        'Visitas': ['img/visita.jpg', 'img/notaria.jpg'],
        'Pucallpa': ['img/plaza.jpg', 'img/catedral.jpg', 'img/jardin.jpg']
      },
      faqs: [
        ['¿El terreno tiene partida registral?', 'Sí. El terreno está inscrito en SUNARP con la partida N° 11008305 a favor de Infinity Group. La independización se ingresó el 26 de octubre de 2026.'],
        ['¿Puedo pagar en cuotas?', 'Los lotes de 1,000 m² se pagan con 30 % de inicial y hasta 15 cuotas sin intereses. La hectárea se vende al contado.'],
        ['¿Cuándo recibo mi terreno?', 'La entrega del terreno es inmediata. El título independizado se entrega en 24 meses más una prórroga, según lo que indica el contrato.'],
        ['¿Cómo separo mi terreno?', 'Con S/ 2,500. Aplica tanto para lotes como para hectáreas.'],
        ['¿Dónde queda exactamente?', 'En el KM 44 de la Carretera Federico Basadre, sector Santa Catalina, Campo Verde (Ucayali), a unos 2 km de la carretera.'],
        ['¿Puedo visitar el terreno antes de comprar?', 'Sí, y te lo recomendamos. Escríbenos por WhatsApp y coordinamos tu visita guiada.']
      ]
    },
    {
      id: 'p-palacio-verde', nombre: 'Palacio Verde', region: 'Huaral', ubicacion: 'Huaral, Lima', tipo: 'Lotes', estado: 'Consultar',
      precioDesde: 0, precioTexto: 'Consulta precios y disponibilidad',
      resumen: 'Lotes residenciales en Huaral, en el corazón del Norte Chico.',
      descripcion: 'Proyecto de lotes en Huaral. Escríbenos para conocer precios, metrajes y disponibilidad actual.',
      precios: [], usos: [], area: '', partida: '', entrega: '', lat: -11.495, lng: -77.207,
      portada: '', galeria: [], plano: '', docs: [], extras: [], video: '', totalLotes: '', disponibles: '', destacado: true, publico: true, orden: 2, perfiles: ['vivir','invertir'], caracteristicas: [], faqs: []
    },
    {
      id: 'p-los-sauces', nombre: 'Los Sauces', region: 'Huaral', ubicacion: 'Huaral, Lima', tipo: 'Lotes', estado: 'Consultar',
      precioDesde: 0, precioTexto: 'Consulta precios y disponibilidad',
      resumen: 'Lotes en Huaral rodeados de campo y a minutos de la ciudad.',
      descripcion: 'Proyecto de lotes en Huaral. Escríbenos para conocer precios, metrajes y disponibilidad actual.',
      precios: [], usos: [], area: '', partida: '', entrega: '', lat: -11.495, lng: -77.207,
      portada: '', galeria: [], plano: '', docs: [], extras: [], video: '', totalLotes: '', disponibles: '', destacado: false, publico: true, orden: 3, perfiles: ['vivir'], caracteristicas: [], faqs: []
    },
    {
      id: 'p-km98', nombre: 'Hectáreas KM 98', region: 'Chancay', ubicacion: 'KM 98, Chancay, Lima', tipo: 'Hectáreas', estado: 'Consultar',
      precioDesde: 0, precioTexto: 'Consulta precios y disponibilidad',
      resumen: 'Hectáreas en Chancay, la zona que crece de la mano del megapuerto.',
      descripcion: 'Hectáreas en el KM 98, Chancay. Escríbenos para conocer precios y disponibilidad.',
      precios: [], usos: [], area: '', partida: '', entrega: '', lat: -11.56, lng: -77.27,
      portada: '', galeria: [], plano: '', docs: [], extras: [], video: '', totalLotes: '', disponibles: '', destacado: true, publico: true, orden: 4, perfiles: ['invertir','emprender'], caracteristicas: [], faqs: []
    },
    {
      id: 'p-km101', nombre: 'Lotes industriales KM 101', region: 'Chancay', ubicacion: 'KM 101, Chancay, Lima', tipo: 'Industrial', estado: 'Consultar',
      precioDesde: 0, precioTexto: 'Consulta precios y disponibilidad',
      resumen: 'Lotes industriales en el eje logístico de Chancay.',
      descripcion: 'Lotes industriales en el KM 101, Chancay. Escríbenos para conocer precios y disponibilidad.',
      precios: [], usos: [], area: '', partida: '', entrega: '', lat: -11.54, lng: -77.25,
      portada: '', galeria: [], plano: '', docs: [], extras: [], video: '', totalLotes: '', disponibles: '', destacado: false, publico: true, orden: 5, perfiles: ['invertir','emprender'], caracteristicas: [], faqs: []
    }
  ];

  // ---------- Equipos y aliados (EJEMPLO) ----------
  const equipos = [
    { id: 'e-norte', nombre: 'Equipo Norte Chico', tipo: 'Equipo interno', liderId: 'u-a1', zona: 'Huaral · Chancay', descripcion: 'Equipo de oficina Lima.', comision: '', demo: true },
    { id: 'e-amazonia', nombre: 'Equipo Amazonía', tipo: 'Equipo interno', liderId: 'u-a4', zona: 'Pucallpa', descripcion: 'Asesores en campo, Pucallpa.', comision: '', demo: true },
    { id: 'e-aliado1', nombre: 'Aliados Selva Inversiones', tipo: 'Aliado estratégico', liderId: 'u-al1', zona: 'Tingo María', descripcion: 'Inmobiliaria aliada.', comision: 6, demo: true }
  ];

  // ---------- Usuarios ----------
  // Contraseña de todos los usuarios de ejemplo: demo1234 (ver LEEME.md)
  const users = [
    { id: 'u-ceo', nombre: 'Magaly Bermúdez', email: 'ceo@infinitygroupmb.pe', pass: 'demo1234', rol: 'ceo', estado: 'activo', foto: 'img/magaly.jpg', telefono: '51925375153', zona: 'Lima', equipoId: '', comision: 0, bio: 'CEO de Infinity Group MB', publico: false, fecha: fechaHace(400) },
    { id: 'u-a1', nombre: 'Carla Mendoza', email: 'carla@demo.pe', pass: 'demo1234', rol: 'asesor', estado: 'activo', foto: '', telefono: '51900000001', zona: 'Huaral', equipoId: 'e-norte', comision: 8, bio: 'Especialista en lotes del Norte Chico.', publico: true, demo: true, fecha: fechaHace(300) },
    { id: 'u-a2', nombre: 'Luis Paredes', email: 'luis@demo.pe', pass: 'demo1234', rol: 'asesor', estado: 'activo', foto: '', telefono: '51900000002', zona: 'Chancay', equipoId: 'e-norte', comision: 7, bio: 'Asesor de hectáreas y terrenos industriales.', publico: true, demo: true, fecha: fechaHace(250) },
    { id: 'u-a3', nombre: 'Rosa Quispe', email: 'rosa@demo.pe', pass: 'demo1234', rol: 'asesor', estado: 'activo', foto: '', telefono: '51900000003', zona: 'Lima', equipoId: 'e-norte', comision: 7, bio: 'Acompaño a familias en su primera inversión.', publico: true, demo: true, fecha: fechaHace(200) },
    { id: 'u-a4', nombre: 'Jorge Ríos', email: 'jorge@demo.pe', pass: 'demo1234', rol: 'asesor', estado: 'activo', foto: '', telefono: '51900000004', zona: 'Pucallpa', equipoId: 'e-amazonia', comision: 10, bio: 'Te muestro El Encanto de Pucallpa en persona.', publico: true, demo: true, fecha: fechaHace(120) },
    { id: 'u-a5', nombre: 'Daniela Torres', email: 'daniela@demo.pe', pass: 'demo1234', rol: 'asesor', estado: 'activo', foto: '', telefono: '51900000005', zona: 'Pucallpa', equipoId: 'e-amazonia', comision: 8, bio: 'Hectáreas para emprender en la Amazonía.', publico: true, demo: true, fecha: fechaHace(90) },
    { id: 'u-a6', nombre: 'Miguel Salas', email: 'miguel@demo.pe', pass: 'demo1234', rol: 'asesor', estado: 'activo', foto: '', telefono: '51900000006', zona: 'Lima', equipoId: '', comision: 7, bio: 'Inversión en tierra con documentos en regla.', publico: true, demo: true, fecha: fechaHace(60) },
    { id: 'u-al1', nombre: 'Selva Inversiones (Aliado)', email: 'aliado@demo.pe', pass: 'demo1234', rol: 'aliado', estado: 'activo', foto: '', telefono: '51900000007', zona: 'Tingo María', equipoId: 'e-aliado1', comision: 6, bio: 'Inmobiliaria aliada en Tingo María.', publico: false, demo: true, fecha: fechaHace(45) },
    { id: 'u-p1', nombre: 'Ana Gutiérrez', email: 'ana@demo.pe', pass: 'demo1234', rol: 'asesor', estado: 'pendiente', foto: '', telefono: '51900000008', zona: 'Pucallpa', equipoId: '', comision: 7, bio: 'Quiero unirme al equipo de Pucallpa.', publico: true, demo: true, fecha: fechaHace(1) }
  ];

  // ---------- Ventas (EJEMPLO) ----------
  const ventas = [];
  const asesores = ['u-a1', 'u-a2', 'u-a3', 'u-a4', 'u-a5', 'u-a6', 'u-al1'];
  const peso = [6, 4, 3, 7, 5, 2, 3];
  const proys = [['p-pucallpa', 14900, 'Lote 1,000 m²'], ['p-pucallpa', 69000, 'Hectárea'], ['p-palacio-verde', 32000, 'Lote'], ['p-km98', 85000, 'Hectárea'], ['p-los-sauces', 28000, 'Lote']];
  let n = 1;
  asesores.forEach((aid, i) => {
    const u = users.find((x) => x.id === aid);
    for (let k = 0; k < peso[i]; k++) {
      const p = proys[(i + k) % proys.length];
      const dias = Math.floor(((k * 37 + i * 23) % 170) + 2);
      const precio = p[1];
      const pct = u.comision;
      const abonada = dias > 45;
      ventas.push({
        id: 'v-' + n, fecha: fechaHace(dias), proyectoId: p[0], lote: p[2] + ' · Mz ' + String.fromCharCode(65 + (k % 6)) + ' – ' + (k + 3 + i),
        cliente: 'Cliente ' + n, precio, asesorId: aid, comisionPct: pct, comisionMonto: Math.round(precio * pct) / 100,
        estado: dias < 4 && k % 2 ? 'reportada' : 'confirmada',
        comisionEstado: abonada ? 'abonada' : 'pendiente', fechaAbono: abonada ? fechaHace(dias - 15) : '', demo: true
      });
      n++;
    }
  });

  // ---------- Muro de contenido ----------
  const posts = [
    { id: 'post-1', autorId: 'u-ceo', fecha: fechaHace(1), texto: 'Las obras no paran en El Encanto de Pucallpa. Calles de 10 metros abiertas con maquinaria propia. 🚜\n\nAsesores: descarguen el video y publíquenlo hoy en sus redes.', tipo: 'video', src: 'videos/AD04_maquinas.mp4', poster: 'videos/AD04_maquinas.jpg', publico: true, proyectoId: 'p-pucallpa', likes: ['u-a1', 'u-a4'], descargas: 12, comentarios: [{ autorId: 'u-a4', texto: '¡Ya lo publiqué en mi Facebook!', fecha: fechaHace(1) }] },
    { id: 'post-2', autorId: 'u-ceo', fecha: fechaHace(3), texto: '¿Cuánto se tarda en llegar al KM 44? Te lo mostramos manejando desde Pucallpa. 📍', tipo: 'video', src: 'videos/AD07_maneja_44km.mp4', poster: 'videos/AD07_maneja_44km.jpg', publico: true, proyectoId: 'p-pucallpa', likes: ['u-a2'], descargas: 8, comentarios: [] },
    { id: 'post-3', autorId: 'u-ceo', fecha: fechaHace(5), texto: 'Así firman nuestras familias: en notaría y con partida registral. La confianza se demuestra con documentos. ✍️', tipo: 'video', src: 'videos/10_asi_firman.mp4', poster: 'videos/10_asi_firman.jpg', publico: true, proyectoId: 'p-pucallpa', likes: ['u-a1', 'u-a3', 'u-a5'], descargas: 15, comentarios: [] },
    { id: 'post-4', autorId: 'u-ceo', fecha: fechaHace(7), texto: 'Esto era selva. Hoy ya tiene calles. 🌿', tipo: 'video', src: 'videos/AD_neon_11_esto_era_selva.mp4', poster: 'videos/AD_neon_11_esto_era_selva.jpg', publico: true, proyectoId: 'p-pucallpa', likes: [], descargas: 4, comentarios: [] },
    { id: 'post-5', autorId: 'u-ceo', fecha: fechaHace(9), texto: 'Flyer oficial del gran lanzamiento. Úsenlo en sus estados de WhatsApp. 📲', tipo: 'imagen', src: 'img/flyer.jpg', poster: '', publico: false, proyectoId: 'p-pucallpa', likes: ['u-a5'], descargas: 21, comentarios: [] }
  ];

  // ---------- Trayectoria de la CEO (editable en Ajustes) ----------
  settings.hitos = [
    { t: 'Los inicios en el Norte Chico', d: 'Magaly empieza a desarrollar proyectos de lotes en Huaral, con una regla que hasta hoy se cumple: todo con documentos.' },
    { t: 'Palacio Verde y Los Sauces', d: 'Proyectos de lotes en Huaral que consolidan la marca en la zona.' },
    { t: 'Chancay: KM 98 y KM 101', d: 'Hectáreas y lotes industriales en el eje del megapuerto de Chancay.' },
    { t: 'Más de 7,000 lotes vendidos', d: '17 proyectos desarrollados y miles de familias con un terreno propio.' },
    { t: '2026 · Expansión a la Amazonía', d: 'Nace El Encanto de Pucallpa: independización ingresada a SUNARP el 26 de octubre y gran lanzamiento el 28 de noviembre.' }
  ];
  settings.audiencias = {
    invertir: { titulo: 'Invierte en tierra', texto: 'La tierra no se devalúa con la inflación. Hectáreas y lotes en zonas con proyección, con partida registral y precio de prelanzamiento.' },
    vivir: { titulo: 'Un lugar para tu familia', texto: 'Lotes para construir tu casa o tu casa de campo, con cuotas sin intereses y entrega inmediata del terreno.' },
    emprender: { titulo: 'Emprende en tu terreno', texto: 'Cacao, piscigranja, frutales o bungalows ecológicos: tu hectárea puede ser un negocio.' }
  };

  // ---------- Eventos y prensa (carrusel) ----------
  const eventos = [
    { id: 'ev-1', tipo: 'Evento', titulo: 'Gran lanzamiento de El Encanto de Pucallpa', texto: '28 de noviembre · Viaje todo pagado para conocer el terreno.', imagen: 'img/flyer.jpg', fecha: '2026-11-28', link: '#/proyecto/p-pucallpa' },
    { id: 'ev-2', tipo: 'Beneficio', titulo: 'Viaje todo pagado a Pucallpa', texto: 'Conoce tu terreno en el lanzamiento. Además, sorteo de un auto 0 km el 20 de diciembre.', imagen: 'img/viaje.jpg', fecha: '2026-11-28', link: '#/proyecto/p-pucallpa' },
    { id: 'ev-3', tipo: 'Documentación', titulo: 'Independización ingresada a SUNARP', texto: 'Partida registral N° 11008305 a favor de Infinity Group.', imagen: 'img/docs.jpg', fecha: '2026-10-26', link: '#/guia' },
    { id: 'ev-4', tipo: 'Avance de obra', titulo: 'Las obras no paran', texto: 'Calles de 10 metros abiertas con maquinaria propia en el KM 44.', imagen: 'img/cargador.jpg', fecha: '2026-11-14', link: '#/contenido' },
    { id: 'ev-5', tipo: 'Foro', titulo: 'Foro de inversionistas', texto: 'Presentamos la proyección de la Amazonía a inversionistas de Lima.', imagen: 'img/visita.jpg', fecha: '2026-11-07', link: '#/invertir' }
  ];

  // ---------- Perfil público de los asesores (EJEMPLO) ----------
  const perfilDemo = {
    'u-a4': { titulo: 'Asesor senior · Especialista en hectáreas', anios: 6, especialidad: 'Hectáreas en la Amazonía', portada: 'img/monte.jpg', frase: 'No te vendo un terreno: te acompaño a construir tu patrimonio.', logros: [{ t: 'Top vendedor del mes', d: 'Noviembre 2026', i: 'trophy' }, { t: 'Certificación en venta consultiva', d: 'Academia Infinity', i: 'award' }], fotos: [{ src: 'img/visita.jpg', t: 'Visita guiada al KM 44 con una familia de Lima' }, { src: 'img/plaza.jpg', t: 'Recibiendo a clientes en Pucallpa' }] },
    'u-a1': { titulo: 'Asesora senior · Norte Chico', anios: 8, especialidad: 'Lotes para vivir en Huaral', portada: 'img/jardin.jpg', frase: 'Cada familia merece comprar con tranquilidad.', logros: [{ t: '+50 familias atendidas', d: '2026', i: 'users' }], fotos: [] },
    'u-a5': { titulo: 'Asesora · Inversión y emprendimiento', anios: 3, especialidad: 'Hectáreas para emprender', portada: 'img/selva.jpg', frase: 'Tu hectárea puede ser tu negocio.', logros: [{ t: 'Asesora revelación', d: 'Octubre 2026', i: 'star' }], fotos: [] }
  };
  users.forEach((u) => Object.assign(u, { titulo: '', anios: '', especialidad: '', portada: '', frase: '', logros: [], fotos: [] }, perfilDemo[u.id] || {}));

  const testimonios = [
    { id: 't-demo1', nombre: 'Familia Rojas', ciudad: 'Lima', proyectoId: 'p-pucallpa', asesorId: 'u-a4', texto: 'Jorge nos llevó al terreno, nos mostró la partida y resolvió todas nuestras dudas. Compramos con total tranquilidad.', foto: '', estado: 'aprobado', fecha: fechaHace(12), demo: true },
    { id: 't-demo2', nombre: 'Sr. Ramírez', ciudad: 'Huaral', proyectoId: 'p-palacio-verde', asesorId: 'u-a1', texto: 'Muy buena atención de Carla. Firmamos en notaría y todo fue claro desde el inicio.', foto: '', estado: 'aprobado', fecha: fechaHace(40), demo: true }
  ];

  // ---------- Contactos (EJEMPLO) para el embudo de ventas ----------
  const leads = [];
  const origenes = ['Meta Ads', 'Meta Ads', 'Meta Ads', 'TikTok', 'Google', 'Referido', 'Web'];
  const etapas = ['nuevo', 'contactado', 'contactado', 'contactado', 'visita', 'visita', 'separacion', 'venta', 'descartado', 'descartado'];
  for (let i = 0; i < 140; i++) {
    const et = etapas[(i * 7) % etapas.length];
    leads.push({ id: 'l-' + i, nombre: 'Contacto ' + (i + 1), telefono: '9' + String(10000000 + i * 7919).slice(0, 8), interes: i % 3 ? 'El Encanto de Pucallpa' : 'Palacio Verde', proyectoId: i % 3 ? 'p-pucallpa' : 'p-palacio-verde', mensaje: '', fecha: fechaHace((i * 3) % 150), estado: et, asesorId: asesores[i % 6], origen: origenes[i % origenes.length], demo: true });
  }


  // ================= v3: organización, rangos, metas, visitas, marketing =================
  const fechaEn = (dias) => new Date(hoy.getTime() + dias * 864e5).toISOString().slice(0, 10);

  // Rangos del asesor (por lotes vendidos confirmados) y bono de comisión que suman
  settings.rangos = [
    { n: 'Asesor', min: 0, bono: 0, i: 'sprout', d: 'Punto de partida en Infinity.' },
    { n: 'Plata', min: 5, bono: 0.5, i: 'award', d: '+0.5 % de comisión en cada venta.' },
    { n: 'Oro', min: 10, bono: 1, i: 'trophy', d: '+1 % de comisión y prioridad en visitas.' },
    { n: 'Infinity Elite', min: 20, bono: 1.5, i: 'star', d: '+1.5 % de comisión, puede liderar equipo y participa en el viaje anual.' }
  ];
  settings.bonoEquipo = 1; // % que gana el líder por cada venta de su red directa
  settings.puntosEncuentro = ['Oficina Lima · Av. Alfredo Mendiola 267, SMP', 'Plaza de Armas de Pucallpa', 'Directo en el proyecto'];

  // Área de marketing (EJEMPLO)
  users.push({ id: 'u-mk', nombre: 'Área de Marketing', email: 'marketing@demo.pe', pass: 'demo1234', rol: 'marketing', estado: 'activo', foto: '', telefono: '51900000009', zona: 'Lima', equipoId: '', comision: 0, bio: 'Publicidad, contenido y agenda de visitas.', publico: false, demo: true, fecha: fechaHace(200), titulo: 'Marketing y atención', anios: '', especialidad: '', portada: '', frase: '', logros: [], fotos: [] });

  // Red: quién trajo a quién (patrocinador / líder directo)
  const red = { 'u-a2': 'u-a1', 'u-a3': 'u-a1', 'u-a6': 'u-a1', 'u-a5': 'u-a4', 'u-p1': 'u-a4' };
  users.forEach((u) => { u.patrocinadorId = red[u.id] || ''; });
  ventas.forEach((v) => { v.bonoEstado = v.comisionEstado; });

  // Metas con fechas
  const metas = [
    { id: 'm-1', titulo: 'Gran lanzamiento El Encanto de Pucallpa', alcance: 'empresa', targetId: '', tipo: 'lotes', objetivo: 40, desde: fechaHace(20), hasta: fechaEn(29), proyectoId: 'p-pucallpa', premio: 'Viaje de integración para todo el equipo', demo: true },
    { id: 'm-2', titulo: 'Meta individual del mes', alcance: 'cada', targetId: '', tipo: 'lotes', objetivo: 4, desde: fechaHace(20), hasta: fechaEn(9), proyectoId: '', premio: 'Bono de S/ 500 a quien la cumpla', demo: true },
    { id: 'm-3', titulo: 'Equipo Amazonía: S/ 500,000 en ventas', alcance: 'equipo', targetId: 'e-amazonia', tipo: 'soles', objetivo: 500000, desde: fechaHace(50), hasta: fechaEn(39), proyectoId: '', premio: 'Cena de equipo + reconocimiento en la web', demo: true }
  ];

  // Visitas agendadas desde la web (EJEMPLO)
  const nombresV = ['Familia Torres', 'Sr. Huamán', 'Sra. Vela', 'Familia Ruiz', 'Sr. Paredes', 'Sra. Linares', 'Familia Cárdenas', 'Sr. Ramos'];
  const visitas = nombresV.map((n, i) => ({
    id: 'vi-' + i, codigo: 'VIS-' + (4810 + i), nombre: n, telefono: '9' + String(20000000 + i * 3571).slice(0, 8), proyectoId: i % 4 === 3 ? 'p-palacio-verde' : 'p-pucallpa',
    fecha: fechaEn(i % 7), turno: i % 2 ? 'Tarde · 3:00 p. m.' : 'Mañana · 9:00 a. m.', personas: (i % 4) + 1, punto: settings.puntosEncuentro[i % 3],
    comentario: i % 3 ? '' : 'Vamos con mis hijos', asesorId: ['', 'u-a4', 'u-a5'][i % 3], estado: i < 2 ? 'confirmada' : 'pendiente', origen: i % 2 ? 'Meta Ads' : 'Web', creado: fechaHace(i % 3), demo: true
  }));
  visitas.push({ id: 'vi-old', codigo: 'VIS-4790', nombre: 'Familia Rojas', telefono: '987654321', proyectoId: 'p-pucallpa', fecha: fechaHace(6), turno: 'Mañana · 9:00 a. m.', personas: 3, punto: settings.puntosEncuentro[1], comentario: '', asesorId: 'u-a4', estado: 'separo', origen: 'Web', creado: fechaHace(9), demo: true });

  // Tablero de tareas del equipo (EJEMPLO)
  const tareas = [
    { id: 'ta-1', titulo: 'Grabar recorrido con dron del KM 44', area: 'Marketing', responsableId: 'u-mk', vence: fechaEn(2), estado: 'pendiente', prioridad: 'alta', demo: true },
    { id: 'ta-2', titulo: 'Llamar a los contactos nuevos de Meta Ads', area: 'Comercial', responsableId: 'u-a4', vence: fechaEn(0), estado: 'curso', prioridad: 'alta', demo: true },
    { id: 'ta-3', titulo: 'Preparar contratos del lanzamiento', area: 'Operaciones', responsableId: 'u-ceo', vence: fechaEn(5), estado: 'curso', prioridad: 'media', demo: true },
    { id: 'ta-4', titulo: 'Confirmar bus para la visita del sábado', area: 'Operaciones', responsableId: 'u-a5', vence: fechaEn(1), estado: 'pendiente', prioridad: 'media', demo: true },
    { id: 'ta-5', titulo: 'Publicar video "Las obras no paran"', area: 'Marketing', responsableId: 'u-mk', vence: fechaHace(1), estado: 'hecho', prioridad: 'baja', demo: true },
    { id: 'ta-6', titulo: 'Capacitación: cómo presentar la hectárea', area: 'Comercial', responsableId: 'u-a1', vence: fechaEn(4), estado: 'pendiente', prioridad: 'media', demo: true }
  ];

  // Publicidad (EJEMPLO, basado en las campañas de noviembre)
  const campanas = [
    { id: 'ca-1', nombre: 'EEP · Hectáreas 69K · Visitas por WhatsApp', plataforma: 'Meta Ads', proyectoId: 'p-pucallpa', presupuestoDia: 22, desde: fechaHace(5), hasta: fechaEn(7), gasto: 118, contactos: 34, ventas: 1, estado: 'activa', demo: true },
    { id: 'ca-2', nombre: 'Lotes 1,000 m² desde S/ 14,900', plataforma: 'Meta Ads', proyectoId: 'p-pucallpa', presupuestoDia: 10, desde: fechaHace(10), hasta: fechaEn(7), gasto: 96, contactos: 41, ventas: 2, estado: 'activa', demo: true },
    { id: 'ca-3', nombre: 'Reclutamiento de asesores Pucallpa', plataforma: 'Meta Ads', proyectoId: '', presupuestoDia: 8, desde: fechaHace(1), hasta: fechaEn(13), gasto: 8, contactos: 5, ventas: 0, estado: 'activa', demo: true },
    { id: 'ca-4', nombre: 'Esto era selva · video corto', plataforma: 'TikTok', proyectoId: 'p-pucallpa', presupuestoDia: 15, desde: fechaEn(3), hasta: fechaEn(20), gasto: 0, contactos: 0, ventas: 0, estado: 'programada', demo: true }
  ];

  // Calendario de grabaciones y producción (EJEMPLO)
  const producciones = [
    { id: 'pr-1', titulo: 'Recorrido con dron del KM 44', tipo: 'Dron', fecha: fechaEn(2), lugar: 'KM 44, Campo Verde', responsableId: 'u-mk', proyectoId: 'p-pucallpa', estado: 'programado', notas: 'Salir 6:30 a. m. por la luz.', demo: true },
    { id: 'pr-2', titulo: 'Testimonio de familia en notaría', tipo: 'Testimonio', fecha: fechaEn(5), lugar: 'Notaría, Lima', responsableId: 'u-mk', proyectoId: 'p-pucallpa', estado: 'programado', notas: 'Pedir autorización firmada.', demo: true },
    { id: 'pr-3', titulo: 'Guion: 3 cosas antes de comprar un terreno', tipo: 'Guion', fecha: fechaEn(1), lugar: 'Oficina', responsableId: 'u-mk', proyectoId: '', estado: 'edicion', notas: '', demo: true },
    { id: 'pr-4', titulo: 'Magaly en obra: avance de calles', tipo: 'Video', fecha: fechaHace(3), lugar: 'KM 44', responsableId: 'u-ceo', proyectoId: 'p-pucallpa', estado: 'publicado', notas: '', demo: true }
  ];

  return {
    version: 3,
    metas, visitas, tareas, campanas, producciones,
    settings, proyectos, equipos, users, ventas, posts, eventos,
    testimonios,
    leads
  };
})();
