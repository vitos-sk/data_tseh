-- Схема каталога «Цех».
-- Выполняется в SQL Editor проекта Supabase один раз.
--
-- Главный принцип: количество уроков и длительность курса НЕ хранятся.
-- Они считаются из самих уроков представлением course_with_stats —
-- иначе данные неизбежно разъезжаются (это уже случалось на моках).

create extension if not exists "pgcrypto";

-- ─────────────────────────── Кто такой админ ───────────────────────────

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Белый список тех, кому можно править каталог. Строки добавляются только вручную через SQL Editor.';

-- security definer: функция должна видеть таблицу admins независимо от RLS,
-- иначе проверка прав рекурсивно упрётся в собственную политику.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ─────────────────────────────── Данные ────────────────────────────────

create table if not exists public.categories (
  id text primary key,
  title text not null,
  chip text not null,
  accent text not null check (accent in ('green', 'orange', 'blue', 'purple')),
  icon text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text not null default '',
  category_id text not null references public.categories (id) on delete restrict,
  -- {"kind":"gradient","from":"#3B9EFF","to":"#1E3A8A","pattern":"grid"}
  -- либо {"kind":"image","url":"https://..."}
  cover jsonb not null default '{"kind":"gradient","from":"#3B9EFF","to":"#1E3A8A","pattern":"grid"}'::jsonb,
  level text not null default 'any' check (level in ('beginner', 'middle', 'any')),
  badges text[] not null default '{}',
  author text not null default '',
  description text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_category_idx on public.courses (category_id);
create index if not exists courses_published_idx on public.courses (published);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  position integer not null,
  title text not null default '',
  duration_min integer not null default 5 check (duration_min > 0),
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lessons_course_idx on public.lessons (course_id, position);

-- Порядок уроков уникален внутри курса. Ограничение отложенное:
-- перестановка двух уроков временно создаёт дубль позиции внутри транзакции.
alter table public.lessons drop constraint if exists lessons_course_position_key;
alter table public.lessons
  add constraint lessons_course_position_key unique (course_id, position)
  deferrable initially deferred;

-- ──────────────────────── Автообновление updated_at ────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists courses_touch on public.courses;
create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

drop trigger if exists lessons_touch on public.lessons;
create trigger lessons_touch before update on public.lessons
  for each row execute function public.touch_updated_at();

-- ───────────────── Курс вместе со счётчиками по урокам ─────────────────

-- security_invoker: представление обязано соблюдать RLS вызывающего,
-- иначе черновики утекут анонимному читателю.
create or replace view public.course_with_stats
with (security_invoker = on) as
select
  c.*,
  coalesce(l.lessons_count, 0)::integer as lessons_count,
  coalesce(l.duration_min, 0)::integer as duration_min
from public.courses c
left join lateral (
  select count(*) as lessons_count, sum(duration_min) as duration_min
  from public.lessons
  where course_id = c.id
) l on true;

-- ────────────────────────────── Доступ ─────────────────────────────────

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;

-- Свою строку в admins видно, чтобы интерфейс мог показать «вы админ».
drop policy if exists admins_read_self on public.admins;
create policy admins_read_self on public.admins
  for select using (user_id = auth.uid());

-- Категории читают все, правит только админ.
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories
  for select using (true);

drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Опубликованные курсы видны всем; черновики — только админу.
drop policy if exists courses_read on public.courses;
create policy courses_read on public.courses
  for select using (published or public.is_admin());

drop policy if exists courses_write on public.courses;
create policy courses_write on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- Урок виден, если виден его курс.
drop policy if exists lessons_read on public.lessons;
create policy lessons_read on public.lessons
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.published
    )
  );

drop policy if exists lessons_write on public.lessons;
create policy lessons_write on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- ────────────────────── Картинки: bucket «covers» ──────────────────────

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists covers_read on storage.objects;
create policy covers_read on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists covers_write on storage.objects;
create policy covers_write on storage.objects
  for all
  using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());
