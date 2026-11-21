-- ==========================================================
-- Infinity Group MB · Base de datos en la nube (Supabase / PostgreSQL)
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ==========================================================

create table if not exists perfiles (
  id uuid primary key references auth.users on delete cascade,
  nombre text not null,
  rol text not null default 'asesor' check (rol in ('ceo','asesor','aliado')),
  estado text not null default 'pendiente' check (estado in ('activo','pendiente','inactivo')),
  foto text, telefono text, zona text, bio text,
  equipo_id uuid, comision numeric default 7, publico boolean default true,
  creado timestamptz default now()
);

create table if not exists equipos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, tipo text default 'Equipo interno', lider_id uuid references perfiles(id),
  zona text, descripcion text, comision numeric
);

create table if not exists proyectos (
  id text primary key, nombre text not null, region text, ubicacion text, tipo text, estado text,
  precio_desde numeric, precio_texto text, resumen text, descripcion text,
  precios jsonb default '[]', usos jsonb default '[]', area text, partida text, entrega text,
  lat double precision, lng double precision, portada text, galeria jsonb default '[]',
  plano text, docs jsonb default '[]', extras jsonb default '[]', video text,
  total_lotes text, disponibles text, destacado boolean, publico boolean default true, orden int default 9
);

create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date, proyecto_id text references proyectos(id),
  lote text, cliente text, precio numeric not null,
  asesor_id uuid references perfiles(id), comision_pct numeric, comision_monto numeric,
  estado text default 'reportada' check (estado in ('reportada','confirmada','anulada')),
  comision_estado text default 'pendiente' check (comision_estado in ('pendiente','abonada')),
  fecha_abono date
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(), autor_id uuid references perfiles(id),
  fecha timestamptz default now(), texto text, tipo text, src text, poster text,
  publico boolean default true, proyecto_id text, descargas int default 0
);
create table if not exists likes (post_id uuid references posts on delete cascade, user_id uuid references perfiles on delete cascade, primary key (post_id, user_id));
create table if not exists comentarios (id uuid primary key default gen_random_uuid(), post_id uuid references posts on delete cascade, autor_id uuid references perfiles, texto text, fecha timestamptz default now());

create table if not exists testimonios (id uuid primary key default gen_random_uuid(), nombre text, ciudad text, proyecto_id text, texto text, foto text, estado text default 'pendiente', fecha date default current_date);
create table if not exists leads (id uuid primary key default gen_random_uuid(), nombre text, telefono text, interes text, mensaje text, asesor_id uuid, estado text default 'nuevo', origen text default 'web', fecha timestamptz default now());
create table if not exists ajustes (id int primary key default 1, data jsonb not null);

-- ---------- Seguridad: cada quien ve solo lo suyo, la CEO ve todo ----------
create or replace function es_ceo() returns boolean language sql stable security definer as $$
  select exists(select 1 from perfiles where id = auth.uid() and rol = 'ceo' and estado = 'activo') $$;

alter table perfiles enable row level security;
alter table equipos enable row level security;
alter table proyectos enable row level security;
alter table ventas enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comentarios enable row level security;
alter table testimonios enable row level security;
alter table leads enable row level security;
alter table ajustes enable row level security;

-- Público (web)
create policy "web ve proyectos publicados" on proyectos for select using (publico or es_ceo());
create policy "web ve asesores activos" on perfiles for select using ((estado = 'activo' and publico) or id = auth.uid() or es_ceo());
create policy "web ve posts publicos" on posts for select using (publico or auth.uid() is not null);
create policy "web ve testimonios aprobados" on testimonios for select using (estado = 'aprobado' or es_ceo());
create policy "web ve ajustes" on ajustes for select using (true);
create policy "web envia testimonios" on testimonios for insert with check (estado = 'pendiente');
create policy "web envia contactos" on leads for insert with check (true);
create policy "registro propio" on perfiles for insert with check (id = auth.uid() and estado = 'pendiente' and rol in ('asesor','aliado'));

-- Asesores
create policy "asesor ve sus ventas" on ventas for select using (asesor_id = auth.uid() or es_ceo());
create policy "asesor reporta ventas" on ventas for insert with check (asesor_id = auth.uid() and estado = 'reportada' and comision_estado = 'pendiente');
create policy "asesor ve sus contactos" on leads for select using (asesor_id = auth.uid() or es_ceo());
create policy "asesor actualiza sus contactos" on leads for update using (asesor_id = auth.uid() or es_ceo());
create policy "asesor edita su perfil" on perfiles for update using (id = auth.uid() or es_ceo())
  with check (es_ceo() or (rol = (select rol from perfiles where id = auth.uid()) and estado = 'activo'));
create policy "equipo ve equipos" on equipos for select using (auth.uid() is not null);
create policy "likes del equipo" on likes for all using (user_id = auth.uid() or es_ceo()) with check (user_id = auth.uid());
create policy "ver likes" on likes for select using (true);
create policy "comentar" on comentarios for insert with check (autor_id = auth.uid());
create policy "ver comentarios" on comentarios for select using (auth.uid() is not null);

-- CEO: control total
create policy "ceo proyectos" on proyectos for all using (es_ceo()) with check (es_ceo());
create policy "ceo ventas" on ventas for all using (es_ceo()) with check (es_ceo());
create policy "ceo equipos" on equipos for all using (es_ceo()) with check (es_ceo());
create policy "ceo posts" on posts for all using (es_ceo()) with check (es_ceo());
create policy "ceo testimonios" on testimonios for all using (es_ceo()) with check (es_ceo());
create policy "ceo leads" on leads for delete using (es_ceo());
create policy "ceo perfiles" on perfiles for delete using (es_ceo());
create policy "ceo ajustes" on ajustes for all using (es_ceo()) with check (es_ceo());
create policy "ceo comentarios" on comentarios for delete using (es_ceo() or autor_id = auth.uid());

-- Fotos y videos: crear en Storage un bucket público llamado "media".
