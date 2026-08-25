-- Курсы с уроками становятся постами (docs/decisions/0010).
--
-- Двухуровневая структура «курс → уроки» ушла: единица контента — один пост,
-- одна страница, одна строка в базе. Содержание переезжает из lessons.blocks
-- в posts.blocks, склеенное по порядку уроков.
--
-- Миграция необратима: старые таблицы удаляются в конце. Резервная копия
-- контента лежит в репозитории — supabase/seed-*.sql.

begin;

-- ───────────────────────────── Новая таблица ─────────────────────────────

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text not null default '',
  category_id text not null references public.categories (id) on delete restrict,
  -- {"from":"#F04A1E","to":"#2A0E0A","pattern":"grid","imageUrl":"https://…"}
  cover jsonb not null default '{"from":"#F04A1E","to":"#2A0E0A","pattern":"grid"}'::jsonb,
  badges text[] not null default '{}',
  blocks jsonb not null default '[]'::jsonb,
  -- Время чтения считает приложение при сохранении: в SQL считать слова
  -- по вложенному jsonb дороже, чем оно того стоит.
  read_min integer not null default 1 check (read_min > 0),
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_category_idx on public.posts (category_id);
create index if not exists posts_published_idx on public.posts (published);

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- ──────────────────────────── Перенос данных ─────────────────────────────

-- Уроки склеиваются в один массив блоков в порядке position. Название урока
-- становится заголовком: без него границы частей в сплошном тексте теряются.
insert into public.posts (
  slug, title, subtitle, category_id, cover, badges, blocks, read_min,
  published, sort_order, created_at
)
select
  c.slug,
  c.title,
  c.subtitle,
  c.category_id,
  c.cover,
  c.badges,
  coalesce(
    (
      select jsonb_agg(block order by l.position, block_index)
      from public.lessons l
      cross join lateral jsonb_array_elements(
        jsonb_build_array(jsonb_build_object('type', 'heading', 'text', l.title)) || l.blocks
      ) with ordinality as elem(block, block_index)
      where l.course_id = c.id
    ),
    '[]'::jsonb
  ),
  -- Стартовая оценка — прежняя длительность курса. Уточнится при первом
  -- сохранении поста в админке.
  greatest(1, coalesce((select sum(l.duration_min) from public.lessons l where l.course_id = c.id), 1)),
  c.published,
  c.sort_order,
  c.created_at
from public.courses c
on conflict (slug) do nothing;

-- ────────────────────────────── Доступ ───────────────────────────────────

alter table public.posts enable row level security;

-- Опубликованные посты видны всем; черновики — только админу.
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select using (published or public.is_admin());

drop policy if exists posts_write on public.posts;
create policy posts_write on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ──────────────────────── Старая структура уходит ────────────────────────

drop view if exists public.course_with_stats;
drop table if exists public.lessons;
drop table if exists public.courses;

commit;
