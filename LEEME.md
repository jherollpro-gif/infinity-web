# Infinity Group MB — Página web + Plataforma del equipo

## Cómo abrirla
- En tu compu: abre una terminal en esta carpeta y ejecuta `python -m http.server 8765`. Luego entra a http://localhost:8765
- Para publicarla en internet: súbela a GitHub Pages, Netlify o Vercel (es una página estática, sin instalar nada).

## Qué tiene
**Página pública**
- Inicio con video del terreno, anuncio de lanzamiento, cifras (+7,000 lotes, 17 proyectos, proyectos en venta y asesores, que se cuentan solos).
- Proyectos con filtros y una ficha completa de cada uno: precios, formas de pago, galería, video, plano, documentos, mapa y WhatsApp.
- Nosotros: historia, CEO y socio, misión, visión y valores.
- Asesores con foto, ranking y botón directo a su WhatsApp.
- Familias: testimonios (los envían los clientes y la CEO los aprueba) y galería de confianza.
- Contenido: muro tipo Facebook con videos para ver, descargar y compartir.
- Registro de asesores y aliados (la CEO los aprueba) e ingreso del equipo.
- SEO: título, descripción, datos de empresa para Google (schema.org) y vista previa al compartir.

**Plataforma privada**
- **CEO (acceso total):** resumen con ventas del mes, ranking, ventas por proyecto y pendientes. Además: proyectos (crear, editar, subir fotos, plano y video), asesores, equipos y aliados, ventas, comisiones (abonar una por una o todas), muro de contenido, contactos de la web, testimonios, solicitudes de registro y ajustes de toda la web (textos, CEO, redes, anuncio, comisión por defecto).
- **Asesor:** sus lotes vendidos, sus comisiones por abonar y las ya abonadas, su meta del mes, el ranking, cómo reportar una venta, contenido para descargar y publicar, y catálogo de proyectos.
- **Enlace personal del asesor:** si comparte un proyecto con su enlace (`?ref=`), el cliente ve su foto, le escribe a él y el contacto queda a su nombre.
- **Aliado:** lo mismo que el asesor, más "Mi equipo".


## Versión 2 (rediseño)
- **Diseño con la esencia del logo:** el trazo del infinito se dibuja en las portadas, la flecha dorada marca el crecimiento y se combinan verde, dorado y plata. Los títulos mezclan letra fina y gruesa (Plus Jakarta Sans) con acentos en dorado itálico (Cormorant).
- **Espacios por tipo de cliente:** Invertir, Vivir y Emprender, cada uno con sus razones, proyectos recomendados y preguntas frecuentes.
- **Ficha de proyecto:**
  - Barra flotante con los datos clave y menú propio del proyecto.
  - Características con íconos, tarjetas de precios y simulador de cuotas.
  - Galería por categorías, video, plano y mapa con botones de Google Maps y Waze.
  - Documentos, asesores que venden ese proyecto, preguntas frecuentes y formulario de cotización.
- **Página de cada asesor** (`#/asesor/ID`):
  - Portada, foto, cifras, frase y "Sobre mí".
  - Logros (los que agrega el asesor y los que gana solo con sus resultados).
  - Fotos con sus clientes, testimonios de sus clientes y proyectos que vende.
  - El asesor la edita en **Panel → Mi página pública**.
- **Espacio de la CEO** (`#/lider/ID`): trayectoria en línea de tiempo, cifras, eventos y galería.
- **Novedades y eventos:** carrusel en el inicio. La CEO los maneja en **Panel → Eventos y prensa**.
- **Embudo comercial:** contactos → contactados → visitas → separaciones → ventas, con el % de conversión de cada paso y de dónde llega cada contacto. La CEO ve el de todo el equipo; cada asesor, el suyo.
- **Guía gratuita** "7 cosas que revisar antes de comprar un terreno": sirve para captar contactos.
- **Pasos de compra** y preguntas frecuentes, que también ayudan a salir en Google.


## Versión 3 (la inmobiliaria completa)
**Recibir al visitante**
- **Bienvenida** la primera vez: "¿Qué te trae por aquí?", con las opciones Invertir, Vivir, Emprender y Ayúdame a elegir.
- **Encuentra tu terreno** (`#/encuentra`): 4 preguntas que recomiendan el proyecto ideal.
- **Agenda tu visita** (`#/visita`): el cliente elige proyecto, día, turno, personas y punto de encuentro. Recibe un código, un botón de WhatsApp y otro para "añadir a mi calendario". La visita llega a la agenda interna y también entra al embudo.

**Asesores**
- **Rangos:** Asesor, Plata (5 lotes), Oro (10) e Infinity Elite (20). Cada rango suma un bono a la comisión de las ventas nuevas. Se ven en la web y en el panel.
- **Mi red:** las personas que trajo el asesor (con su enlace de invitación) y el **bono de equipo** (1 % de sus ventas).
- **Metas con fechas:** de toda la empresa, de cada asesor, de un equipo o de una persona. Muestran el avance, los días que quedan y el premio.

**Trabajo en equipo**
- **Tablero de tareas** por área (Dirección, Comercial, Marketing, Operaciones), con responsable, fecha límite y prioridad.
- **Áreas y organigrama.**
- **Agenda de visitas:** marketing o la CEO asignan cada visita a un asesor, o el asesor la toma con "Atender esta visita". Cada visita lleva su estado: confirmada, realizada, separó o no asistió.

**Marketing** (nuevo rol, con su propio panel)
- **Publicidad:** cada campaña con su inversión, contactos, costo por contacto y ventas atribuidas.
- **Grabaciones y producción:** calendario con los estados Idea → Programado → Grabado → En edición → Publicado.
- Acceso a la agenda de visitas, los contactos, el muro de contenido y los eventos. Sin acceso a ventas ni comisiones.

**Permisos por rol**
- CEO: todo.
- Marketing: publicidad, visitas, contactos y contenido.
- Asesor o aliado: solo lo suyo.

## Modo demostración
- En "Ingresar" hay botones para entrar como CEO, como asesor, como aliado y como marketing.
- Los usuarios de ejemplo usan la contraseña `demo1234`. CEO: `ceo@infinitygroupmb.pe`.
- Los asesores, aliados y ventas de ejemplo dicen "Ejemplo". La CEO los borra en **Ajustes → Borrar datos de ejemplo**.
- **Antes de publicar:** cambia el correo y la contraseña de la CEO en "Mi perfil" y en Asesores → Editar.

## Importante: dónde se guardan los datos
Hoy todo se guarda **en el navegador de cada persona**. Sirve para probar y presentar. Para que la CEO vea en su celular lo que registra un asesor en el suyo, hay que conectar una base de datos en la nube. Está preparada para Supabase (gratis): `supabase/schema.sql`.
Pasos: crear el proyecto en supabase.com → ejecutar el `schema.sql` → reemplazar `js/store.js` por la versión con Supabase. Las pantallas no cambian.

## Datos por confirmar
- Cargo y biografía de Giuseppe Benavides.
- Misión, visión y valores: son una propuesta.
- WhatsApp principal de la web: hoy es 925 375 153.
- Fotos, precios y disponibilidad de Palacio Verde, Los Sauces, KM 98 y KM 101.
- Asesores reales, con su foto y su % de comisión.
- Usuario de TikTok y de YouTube, si tienen.
