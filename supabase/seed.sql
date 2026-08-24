-- Начальные данные каталога. Сгенерировано scripts/generate-seed.ts —
-- править этот файл руками бессмысленно, он перезаписывается.

begin;

-- ── категории ──
insert into public.categories (id, title, chip, accent, icon, description, sort_order) values (
  'code', 'Код', 'Код', 'blue',
  'Code2', 'Разработка без академизма: то, что пригодится в первый же день.', 0
) on conflict (id) do update set
  title = excluded.title, chip = excluded.chip, accent = excluded.accent,
  icon = excluded.icon, description = excluded.description, sort_order = excluded.sort_order;

insert into public.categories (id, title, chip, accent, icon, description, sort_order) values (
  'ai', 'AI', 'AI', 'purple',
  'Sparkles', 'Нейросети как инструмент, а не как магия.', 1
) on conflict (id) do update set
  title = excluded.title, chip = excluded.chip, accent = excluded.accent,
  icon = excluded.icon, description = excluded.description, sort_order = excluded.sort_order;

insert into public.categories (id, title, chip, accent, icon, description, sort_order) values (
  'business', 'Бизнес', 'Бизнес', 'green',
  'Briefcase', 'Деньги, клиенты и решения, которые видно в отчёте.', 2
) on conflict (id) do update set
  title = excluded.title, chip = excluded.chip, accent = excluded.accent,
  icon = excluded.icon, description = excluded.description, sort_order = excluded.sort_order;

insert into public.categories (id, title, chip, accent, icon, description, sort_order) values (
  'craft', 'Ремесло', 'Ремесло', 'orange',
  'Hammer', 'Работа руками: дерево, кофе, вещи, которые остаются.', 3
) on conflict (id) do update set
  title = excluded.title, chip = excluded.chip, accent = excluded.accent,
  icon = excluded.icon, description = excluded.description, sort_order = excluded.sort_order;

insert into public.categories (id, title, chip, accent, icon, description, sort_order) values (
  'tips', 'Фишки', 'Фишки', 'blue',
  'Zap', 'Мелочи, которые экономят часы каждую неделю.', 4
) on conflict (id) do update set
  title = excluded.title, chip = excluded.chip, accent = excluded.accent,
  icon = excluded.icon, description = excluded.description, sort_order = excluded.sort_order;

-- ── курсы и уроки ──
insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'git-bez-straha', 'Git без страха', 'Ветки, откаты и конфликты на понятном языке', 'code',
  '{"from":"#3B9EFF","to":"#1E3A8A","pattern":"grid"}'::jsonb, 'beginner', array['new', 'free'],
  'Артём Ковалёв', 'Шесть уроков про то, как перестать бояться коммитов. Разберём, что происходит внутри репозитория, научимся откатывать ошибки и переживать конфликты без потери работы.', true, 0
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'git-bez-straha');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Что вообще делает Git', 6, '[{"type":"text","text":"Git — это машина времени для папки с файлами. Он не следит за папкой сам: вы каждый раз говорите ему «запомни, как выглядит проект прямо сейчас». Такой снимок называется коммитом."},{"type":"heading","text":"Три состояния файла"},{"type":"list","items":["Изменён — вы что-то поправили, Git это видит, но пока не собирается запоминать.","Подготовлен — вы сказали git add, файл попал в список на следующий снимок.","Зафиксирован — снимок сделан, состояние сохранено навсегда."]},{"type":"callout","tone":"info","text":"Пока изменения не зафиксированы коммитом, Git не сможет их вернуть. Это самая частая причина потерянной работы у новичков."},{"type":"heading","text":"Первый коммит"},{"type":"code","lang":"bash","code":"git init\ngit add .\ngit commit -m \"Начало проекта\""},{"type":"text","text":"Три команды — и у проекта появилась точка, к которой можно вернуться из любого будущего. Дальше вся работа с Git будет вариацией на эту тему."}]'::jsonb),
  (2, 'Ветки: работать, не ломая', 8, '[{"type":"text","text":"Ветка — это не копия проекта. Это просто закладка, которая указывает на определённый коммит. Поэтому создание ветки происходит мгновенно, даже если проект весит гигабайты."},{"type":"image","cover":{"from":"#3B9EFF","to":"#1E3A8A","pattern":"grid"},"caption":"Ветка отходит от общей истории и живёт своей жизнью, пока её не вольют обратно"},{"type":"code","lang":"bash","code":"git switch -c feature/login\n# ...работаем, коммитим...\ngit switch main\ngit merge feature/login"},{"type":"quote","text":"Ветка стоит ноль. Если сомневаетесь, стоит ли ответвляться — ответвляйтесь.","author":"Правило, которое экономит нервы"}]'::jsonb),
  (3, 'Откатить то, что сломал', 7, '[{"type":"text","text":"У Git есть три разные операции, которые в разговоре одинаково называют «откатить». Путаница между ними и приводит к потере работы."},{"type":"list","ordered":true,"items":["git restore — вернуть файл к последнему коммиту. Изменения пропадут безвозвратно.","git revert — создать новый коммит, отменяющий старый. История сохраняется, ничего не теряется.","git reset — сдвинуть закладку ветки назад. Опасно на общих ветках."]},{"type":"callout","tone":"warning","text":"На ветке, которую вы уже отправили другим, используйте только revert. Reset перепишет историю, и у коллег всё разъедется."}]'::jsonb),
  (4, 'Конфликты без паники', 7, '[{"type":"text","text":"Конфликт возникает, когда две ветки поменяли одну и ту же строку по-разному. Git не угадывает, чья версия правильная, и честно спрашивает вас."},{"type":"code","lang":"text","code":"<<<<<<< HEAD\nконстанта = 10\n=======\nконстанта = 42\n>>>>>>> feature/tuning"},{"type":"text","text":"Сверху — то, что было у вас. Снизу — то, что пришло. Ваша задача: оставить нужный вариант, стереть маркеры и зафиксировать результат."},{"type":"callout","tone":"success","text":"Конфликт — это не ошибка и не поломка. Это вопрос, на который нужно ответить один раз."}]'::jsonb),
  (5, 'Работа с удалённым репозиторием', 7, '[{"type":"text","text":"Удалённый репозиторий — такой же Git, только на сервере. Он не «главнее» вашего: связь между ними вы настраиваете сами."},{"type":"code","lang":"bash","code":"git remote add origin <адрес>\ngit push -u origin main\ngit pull"},{"type":"list","items":["push — отправить свои коммиты на сервер.","pull — забрать чужие и влить в свою ветку.","fetch — забрать, но пока не вливать. Полезно, когда хочется сначала посмотреть."]}]'::jsonb),
  (6, 'Привычки, которые спасают', 7, '[{"type":"heading","text":"Пять правил на каждый день"},{"type":"list","ordered":true,"items":["Коммитьте маленькими кусками — так проще найти, где сломалось.","Пишите в сообщении, зачем изменение, а не что вы поменяли.","Перед push всегда делайте pull.","Не держите ветку живой дольше нескольких дней.","Не коммитьте пароли. Совсем никогда."]},{"type":"quote","text":"Хорошая история коммитов — это не аккуратность ради аккуратности. Это письмо себе будущему, который будет искать баг в три часа ночи."}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'git-bez-straha';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'react-za-vyhodnye', 'React за выходные', 'От пустой папки до рабочего интерфейса', 'code',
  '{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"}'::jsonb, 'beginner', '{}',
  'Артём Ковалёв', 'Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению.', true, 1
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'react-za-vyhodnye');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Урок 1', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «React за выходные» — Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению."},{"type":"image","cover":{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (2, 'Урок 2', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «React за выходные» — Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению."},{"type":"image","cover":{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (3, 'Урок 3', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «React за выходные» — Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению."},{"type":"image","cover":{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (4, 'Урок 4', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «React за выходные» — Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению."},{"type":"image","cover":{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (5, 'Урок 5', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «React за выходные» — Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению."},{"type":"image","cover":{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (6, 'Урок 6', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «React за выходные» — Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению."},{"type":"image","cover":{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (7, 'Урок 7', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «React за выходные» — Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению."},{"type":"image","cover":{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (8, 'Урок 8', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «React за выходные» — Компоненты, состояние, события и работа с данными. Без теории ради теории: каждый урок добавляет кусок к одному живому приложению."},{"type":"image","cover":{"from":"#38BDF8","to":"#0F2A4A","pattern":"rings"},"caption":"Место для иллюстрации урока"}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'react-za-vyhodnye';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'sql-dlya-netehnicheskih', 'SQL для нетехнических', 'Достать цифры из базы самому', 'code',
  '{"from":"#60A5FA","to":"#1E293B","pattern":"waves"}'::jsonb, 'beginner', array['free'],
  'Нина Барс', 'Пять запросов, которые закрывают восемьдесят процентов задач менеджера. Никакой оптимизации и индексов — только как спросить у базы то, что нужно.', true, 2
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'sql-dlya-netehnicheskih');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Урок 1', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «SQL для нетехнических» — Пять запросов, которые закрывают восемьдесят процентов задач менеджера. Никакой оптимизации и индексов — только как спросить у базы то, что нужно."},{"type":"image","cover":{"from":"#60A5FA","to":"#1E293B","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (2, 'Урок 2', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «SQL для нетехнических» — Пять запросов, которые закрывают восемьдесят процентов задач менеджера. Никакой оптимизации и индексов — только как спросить у базы то, что нужно."},{"type":"image","cover":{"from":"#60A5FA","to":"#1E293B","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (3, 'Урок 3', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «SQL для нетехнических» — Пять запросов, которые закрывают восемьдесят процентов задач менеджера. Никакой оптимизации и индексов — только как спросить у базы то, что нужно."},{"type":"image","cover":{"from":"#60A5FA","to":"#1E293B","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (4, 'Урок 4', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «SQL для нетехнических» — Пять запросов, которые закрывают восемьдесят процентов задач менеджера. Никакой оптимизации и индексов — только как спросить у базы то, что нужно."},{"type":"image","cover":{"from":"#60A5FA","to":"#1E293B","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (5, 'Урок 5', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «SQL для нетехнических» — Пять запросов, которые закрывают восемьдесят процентов задач менеджера. Никакой оптимизации и индексов — только как спросить у базы то, что нужно."},{"type":"image","cover":{"from":"#60A5FA","to":"#1E293B","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'sql-dlya-netehnicheskih';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'prompty-kotorye-rabotayut', 'Промпты, которые работают', 'Почему одна и та же просьба даёт разный ответ', 'ai',
  '{"from":"#C77DFF","to":"#3B1D57","pattern":"rings"}'::jsonb, 'any', array['new'],
  'Лиза Гордеева', 'Разбираем структуру запроса по частям: роль, контекст, формат, примеры. К концу курса у вас будет свой набор шаблонов под рабочие задачи.', true, 3
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'prompty-kotorye-rabotayut');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Почему ответы разные', 6, '[{"type":"text","text":"Модель не хранит правильный ответ и не ищет его в базе. Она продолжает текст — слово за словом, выбирая наиболее вероятное продолжение. Отсюда следует всё остальное."},{"type":"callout","tone":"info","text":"Если ответ вышел плохим, чаще виновата не модель, а недостаток контекста в запросе."}]'::jsonb),
  (2, 'Четыре части хорошего запроса', 7, '[{"type":"list","ordered":true,"items":["Роль — кем должна быть модель в этом разговоре.","Контекст — что она обязана знать о задаче.","Задача — что конкретно сделать.","Формат — как должен выглядеть ответ."]},{"type":"text","text":"Уберите любую из четырёх частей — и качество просядет предсказуемым образом. Чаще всего забывают последнюю, а потом вручную переделывают формат."}]'::jsonb),
  (3, 'Примеры вместо объяснений', 7, '[{"type":"text","text":"Два-три примера «вход → выход» работают лучше, чем абзац описания. Модель хорошо улавливает закономерность и плохо — абстрактные требования."},{"type":"quote","text":"Покажи, а не объясняй. Это правило работает и с людьми, и с моделями."}]'::jsonb),
  (4, 'Как чинить плохой ответ', 8, '[{"type":"text","text":"Не переписывайте запрос целиком. Найдите, какая из четырёх частей оказалась слабой, и усильте только её — так вы поймёте, что именно повлияло."},{"type":"callout","tone":"warning","text":"Менять сразу несколько вещей — верный способ не узнать, что помогло."}]'::jsonb),
  (5, 'Своя библиотека шаблонов', 6, '[{"type":"text","text":"Промпт, который сработал, нужно сохранить. Через месяц вы не вспомните формулировку, а заново подбирать её — те же двадцать минут."}]'::jsonb),
  (6, 'Где модель врёт', 6, '[{"type":"text","text":"Уверенный тон не связан с правильностью. Даты, цифры, цитаты и ссылки нужно проверять всегда — именно там модель ошибается чаще всего."},{"type":"callout","tone":"warning","text":"Чем уже и специфичнее область, тем выше шанс красивой выдумки."}]'::jsonb),
  (7, 'Рабочий процесс целиком', 6, '[{"type":"text","text":"Соберём всё вместе: заготовка под задачу, быстрый прогон, точечная правка одной части, сохранение результата в библиотеку."},{"type":"callout","tone":"success","text":"На этом этапе у вас должно быть три-четыре своих шаблона под задачи, которые повторяются каждую неделю."}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'prompty-kotorye-rabotayut';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'ai-assistent-bez-koda', 'Свой AI-ассистент без кода', 'Собрать помощника из готовых кубиков', 'ai',
  '{"from":"#A78BFA","to":"#2E1065","pattern":"dots"}'::jsonb, 'any', array['free'],
  'Лиза Гордеева', 'Что такое база знаний, зачем ассистенту инструменты и как не сломать всё одной формулировкой. Собираем помощника для реальной задачи.', true, 4
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'ai-assistent-bez-koda');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Урок 1', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Свой AI-ассистент без кода» — Что такое база знаний, зачем ассистенту инструменты и как не сломать всё одной формулировкой. Собираем помощника для реальной задачи."},{"type":"image","cover":{"from":"#A78BFA","to":"#2E1065","pattern":"dots"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (2, 'Урок 2', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Свой AI-ассистент без кода» — Что такое база знаний, зачем ассистенту инструменты и как не сломать всё одной формулировкой. Собираем помощника для реальной задачи."},{"type":"image","cover":{"from":"#A78BFA","to":"#2E1065","pattern":"dots"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (3, 'Урок 3', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Свой AI-ассистент без кода» — Что такое база знаний, зачем ассистенту инструменты и как не сломать всё одной формулировкой. Собираем помощника для реальной задачи."},{"type":"image","cover":{"from":"#A78BFA","to":"#2E1065","pattern":"dots"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (4, 'Урок 4', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Свой AI-ассистент без кода» — Что такое база знаний, зачем ассистенту инструменты и как не сломать всё одной формулировкой. Собираем помощника для реальной задачи."},{"type":"image","cover":{"from":"#A78BFA","to":"#2E1065","pattern":"dots"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (5, 'Урок 5', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Свой AI-ассистент без кода» — Что такое база знаний, зачем ассистенту инструменты и как не сломать всё одной формулировкой. Собираем помощника для реальной задачи."},{"type":"image","cover":{"from":"#A78BFA","to":"#2E1065","pattern":"dots"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (6, 'Урок 6', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Свой AI-ассистент без кода» — Что такое база знаний, зачем ассистенту инструменты и как не сломать всё одной формулировкой. Собираем помощника для реальной задачи."},{"type":"image","cover":{"from":"#A78BFA","to":"#2E1065","pattern":"dots"},"caption":"Место для иллюстрации урока"}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'ai-assistent-bez-koda';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'neyroseti-dlya-kartinok', 'Нейросети для картинок', 'Как получить то, что задумал, а не то, что вышло', 'ai',
  '{"from":"#D8B4FE","to":"#4C1D95","pattern":"waves"}'::jsonb, 'beginner', '{}',
  'Ким Соколов', 'Композиция, свет, стиль и референсы. Учимся описывать картинку словами так, чтобы результат совпадал с задумкой.', true, 5
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'neyroseti-dlya-kartinok');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Урок 1', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Нейросети для картинок» — Композиция, свет, стиль и референсы. Учимся описывать картинку словами так, чтобы результат совпадал с задумкой."},{"type":"image","cover":{"from":"#D8B4FE","to":"#4C1D95","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (2, 'Урок 2', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Нейросети для картинок» — Композиция, свет, стиль и референсы. Учимся описывать картинку словами так, чтобы результат совпадал с задумкой."},{"type":"image","cover":{"from":"#D8B4FE","to":"#4C1D95","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (3, 'Урок 3', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Нейросети для картинок» — Композиция, свет, стиль и референсы. Учимся описывать картинку словами так, чтобы результат совпадал с задумкой."},{"type":"image","cover":{"from":"#D8B4FE","to":"#4C1D95","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (4, 'Урок 4', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Нейросети для картинок» — Композиция, свет, стиль и референсы. Учимся описывать картинку словами так, чтобы результат совпадал с задумкой."},{"type":"image","cover":{"from":"#D8B4FE","to":"#4C1D95","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (5, 'Урок 5', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Нейросети для картинок» — Композиция, свет, стиль и референсы. Учимся описывать картинку словами так, чтобы результат совпадал с задумкой."},{"type":"image","cover":{"from":"#D8B4FE","to":"#4C1D95","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'neyroseti-dlya-kartinok';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'pervye-sto-klientov', 'Первые 100 клиентов', 'Что делать, когда бюджета на рекламу нет', 'business',
  '{"from":"#34C759","to":"#14532D","pattern":"grid"}'::jsonb, 'any', array['new'],
  'Марк Ильин', 'Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт.', true, 6
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'pervye-sto-klientov');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Урок 1', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Первые 100 клиентов» — Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт."},{"type":"image","cover":{"from":"#34C759","to":"#14532D","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (2, 'Урок 2', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Первые 100 клиентов» — Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт."},{"type":"image","cover":{"from":"#34C759","to":"#14532D","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (3, 'Урок 3', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Первые 100 клиентов» — Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт."},{"type":"image","cover":{"from":"#34C759","to":"#14532D","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (4, 'Урок 4', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Первые 100 клиентов» — Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт."},{"type":"image","cover":{"from":"#34C759","to":"#14532D","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (5, 'Урок 5', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Первые 100 клиентов» — Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт."},{"type":"image","cover":{"from":"#34C759","to":"#14532D","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (6, 'Урок 6', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Первые 100 клиентов» — Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт."},{"type":"image","cover":{"from":"#34C759","to":"#14532D","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (7, 'Урок 7', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Первые 100 клиентов» — Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт."},{"type":"image","cover":{"from":"#34C759","to":"#14532D","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (8, 'Урок 8', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Первые 100 клиентов» — Восемь способов найти первых клиентов руками. Каждый урок — один канал, честная оценка усилий и разбор, кому он не подойдёт."},{"type":"image","cover":{"from":"#34C759","to":"#14532D","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'pervye-sto-klientov';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'yunit-ekonomika-na-salfetke', 'Юнит-экономика на салфетке', 'Понять, зарабатываете вы или нет', 'business',
  '{"from":"#4ADE80","to":"#0F3D26","pattern":"dots"}'::jsonb, 'beginner', array['free'],
  'Марк Ильин', 'Пять чисел, которые нужно знать про свой продукт. Считаем на салфетке, без таблиц на сорок листов.', true, 7
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'yunit-ekonomika-na-salfetke');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Что считать юнитом', 5, '[{"type":"text","text":"Юнит — это одна повторяющаяся штука, на которой вы зарабатываете или теряете. Для кофейни это чашка, для сервиса по подписке — один клиент за месяц, для мастера — один заказ."},{"type":"callout","tone":"info","text":"Выбор юнита определяет весь дальнейший счёт. Если считать «в среднем по бизнесу», убыточное направление спрячется за прибыльным."},{"type":"text","text":"Правило простое: юнит должен масштабироваться. Если сделать таких юнитов вдвое больше — прибыль тоже должна вырасти примерно вдвое. Если не растёт, вы выбрали не тот юнит."}]'::jsonb),
  (2, 'Пять чисел, которые нужно знать', 6, '[{"type":"list","ordered":true,"items":["Цена — сколько платит клиент за один юнит.","Переменные расходы — что вы тратите именно на этот юнит: материалы, комиссия, доставка.","Стоимость привлечения — сколько стоило привести этого клиента.","Число повторов — сколько раз в среднем клиент возвращается.","Постоянные расходы — аренда, подписки, зарплаты. В юнит не входят, но их нужно чем-то закрыть."]},{"type":"callout","tone":"warning","text":"Самая частая ошибка — забыть комиссию площадки и эквайринг. На маленькой марже эти проценты решают, есть прибыль или нет."}]'::jsonb),
  (3, 'Считаем на салфетке', 6, '[{"type":"text","text":"Возьмём мастерскую, которая делает полки на заказ. Полка стоит 6000 рублей. Материал и фурнитура — 2200. Доставка — 500. Комиссия площадки — 10 процентов, это ещё 600."},{"type":"code","lang":"text","code":"Цена                6000\n− материал          2200\n− доставка           500\n− комиссия           600\n= маржа с заказа    2700"},{"type":"text","text":"Реклама приводит одного покупателя за 1800 рублей. Значит с первого заказа остаётся 900 рублей — и из них ещё нужно оплатить аренду мастерской."},{"type":"callout","tone":"success","text":"Если тот же клиент вернётся за второй полкой без рекламы, маржа со второго заказа будет уже полные 2700. Именно поэтому повторные покупки важнее скидок на первую."}]'::jsonb),
  (4, 'Когда реклама не окупается', 6, '[{"type":"text","text":"Сравнивать нужно две величины: сколько стоит привести клиента и сколько он принесёт за всё время. Первое — стоимость привлечения, второе — суммарная маржа со всех его покупок."},{"type":"quote","text":"Если клиент приносит меньше, чем стоил, — увеличение рекламного бюджета ускоряет не рост, а разорение."},{"type":"text","text":"Здоровым обычно считают трёхкратный запас: клиент приносит втрое больше, чем стоило его привлечь. Двукратный — терпимо. Меньше — повод останавливать рекламу и разбираться."}]'::jsonb),
  (5, 'Что делать, если не сходится', 5, '[{"type":"list","items":["Поднять цену. Самый быстрый рычаг и самый недооценённый: маржа растёт сразу.","Убрать из юнита лишнее — пересмотреть поставщика, упаковку, способ доставки.","Добиться повторных покупок: второй заказ почти всегда выгоднее первого.","Отказаться от канала, который приводит дорогих клиентов, даже если он приносит много заявок."]},{"type":"callout","tone":"info","text":"Считайте заново после каждого изменения. Юнит-экономика — не отчёт раз в год, а инструмент, к которому возвращаются при любом решении о цене."}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'yunit-ekonomika-na-salfetke';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'peregovory-o-tsene', 'Переговоры о цене', 'Назвать сумму и не начать оправдываться', 'business',
  '{"from":"#86EFAC","to":"#134E33","pattern":"waves"}'::jsonb, 'any', '{}',
  'Нина Барс', 'Как готовиться к разговору, что отвечать на «дорого» и когда лучше отказаться от сделки. С разборами реальных диалогов.', true, 8
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'peregovory-o-tsene');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Урок 1', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Переговоры о цене» — Как готовиться к разговору, что отвечать на «дорого» и когда лучше отказаться от сделки. С разборами реальных диалогов."},{"type":"image","cover":{"from":"#86EFAC","to":"#134E33","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (2, 'Урок 2', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Переговоры о цене» — Как готовиться к разговору, что отвечать на «дорого» и когда лучше отказаться от сделки. С разборами реальных диалогов."},{"type":"image","cover":{"from":"#86EFAC","to":"#134E33","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (3, 'Урок 3', 7, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Переговоры о цене» — Как готовиться к разговору, что отвечать на «дорого» и когда лучше отказаться от сделки. С разборами реальных диалогов."},{"type":"image","cover":{"from":"#86EFAC","to":"#134E33","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (4, 'Урок 4', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Переговоры о цене» — Как готовиться к разговору, что отвечать на «дорого» и когда лучше отказаться от сделки. С разборами реальных диалогов."},{"type":"image","cover":{"from":"#86EFAC","to":"#134E33","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (5, 'Урок 5', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Переговоры о цене» — Как готовиться к разговору, что отвечать на «дорого» и когда лучше отказаться от сделки. С разборами реальных диалогов."},{"type":"image","cover":{"from":"#86EFAC","to":"#134E33","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (6, 'Урок 6', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Переговоры о цене» — Как готовиться к разговору, что отвечать на «дорого» и когда лучше отказаться от сделки. С разборами реальных диалогов."},{"type":"image","cover":{"from":"#86EFAC","to":"#134E33","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'peregovory-o-tsene';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'derevo-pervaya-polka', 'Дерево: первая полка', 'Инструмент, материал и прямые руки', 'craft',
  '{"from":"#FF9F0A","to":"#5A2E05","pattern":"grid"}'::jsonb, 'beginner', array['free'],
  'Пётр Дым', 'Полный путь от доски до готовой полки на стене. Что купить в первый раз, как не испортить заготовку и чем закончить поверхность.', true, 9
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'derevo-pervaya-polka');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Урок 1', 9, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Дерево: первая полка» — Полный путь от доски до готовой полки на стене. Что купить в первый раз, как не испортить заготовку и чем закончить поверхность."},{"type":"image","cover":{"from":"#FF9F0A","to":"#5A2E05","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (2, 'Урок 2', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Дерево: первая полка» — Полный путь от доски до готовой полки на стене. Что купить в первый раз, как не испортить заготовку и чем закончить поверхность."},{"type":"image","cover":{"from":"#FF9F0A","to":"#5A2E05","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (3, 'Урок 3', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Дерево: первая полка» — Полный путь от доски до готовой полки на стене. Что купить в первый раз, как не испортить заготовку и чем закончить поверхность."},{"type":"image","cover":{"from":"#FF9F0A","to":"#5A2E05","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (4, 'Урок 4', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Дерево: первая полка» — Полный путь от доски до готовой полки на стене. Что купить в первый раз, как не испортить заготовку и чем закончить поверхность."},{"type":"image","cover":{"from":"#FF9F0A","to":"#5A2E05","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (5, 'Урок 5', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Дерево: первая полка» — Полный путь от доски до готовой полки на стене. Что купить в первый раз, как не испортить заготовку и чем закончить поверхность."},{"type":"image","cover":{"from":"#FF9F0A","to":"#5A2E05","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (6, 'Урок 6', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Дерево: первая полка» — Полный путь от доски до готовой полки на стене. Что купить в первый раз, как не испортить заготовку и чем закончить поверхность."},{"type":"image","cover":{"from":"#FF9F0A","to":"#5A2E05","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (7, 'Урок 7', 8, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Дерево: первая полка» — Полный путь от доски до готовой полки на стене. Что купить в первый раз, как не испортить заготовку и чем закончить поверхность."},{"type":"image","cover":{"from":"#FF9F0A","to":"#5A2E05","pattern":"grid"},"caption":"Место для иллюстрации урока"}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'derevo-pervaya-polka';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'kofe-kak-v-speshelti', 'Кофе как в спешелти', 'Одна воронка и приличная чашка', 'craft',
  '{"from":"#FBBF24","to":"#4A2606","pattern":"rings"}'::jsonb, 'beginner', array['new'],
  'Пётр Дым', 'Помол, вода, время и температура. Четыре переменные, которые отделяют горькую бурду от чашки, ради которой встаёшь раньше.', true, 10
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'kofe-kak-v-speshelti');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Четыре переменные', 5, '[{"type":"text","text":"Между горькой бурдой и чашкой, ради которой встаёшь раньше, стоят всего четыре вещи: помол, вода, температура и время. Зёрна важны, но их вы уже купили — а эти четыре настраиваются каждое утро."},{"type":"list","items":["Помол — насколько мелко смолот кофе.","Вода — её состав и количество.","Температура — насколько горячая вода.","Время — сколько длится пролив."]},{"type":"callout","tone":"info","text":"Меняйте по одной переменной за раз. Иначе вы не поймёте, что именно улучшило вкус, и не сможете это повторить."}]'::jsonb),
  (2, 'Помол решает почти всё', 5, '[{"type":"text","text":"Чем мельче помол, тем больше поверхности контактирует с водой и тем быстрее кофе отдаёт вкус. Слишком мелкий — вода идёт медленно, вымывает лишнее, получается горечь. Слишком крупный — вода проскакивает, чашка выходит кислой и пустой."},{"type":"image","cover":{"from":"#FBBF24","to":"#4A2606","pattern":"dots"},"caption":"Для воронки ориентир — крупный столовый сахар"},{"type":"callout","tone":"warning","text":"Лезвийная кофемолка рубит зерно на куски разного размера. Часть перезаварится, часть недозаварится — и это не исправить ничем другим."}]'::jsonb),
  (3, 'Вода и температура', 5, '[{"type":"text","text":"Чашка на девяносто восемь процентов состоит из воды. Дистиллированная даёт плоский вкус, слишком жёсткая — глушит кислотность. Подходит обычная питьевая с умеренной минерализацией."},{"type":"text","text":"Температура — 92–96 градусов. Если чайник без термометра, вскипятите и подождите тридцать-сорок секунд: этого хватает."},{"type":"callout","tone":"success","text":"Пропорция для старта: 60 граммов кофе на литр воды. Для одной чашки — 15 граммов на 250 миллилитров."}]'::jsonb),
  (4, 'Пролив по шагам', 6, '[{"type":"list","ordered":true,"items":["Промойте фильтр горячей водой — уйдёт бумажный привкус, прогреется воронка.","Засыпьте кофе, разровняйте, встряхните воронку.","Налейте вдвое больше воды, чем взяли кофе, и подождите тридцать секунд: гуща вспенится и выпустит газ.","Долейте остальную воду по спирали в два-три захода, не попадая на стенки фильтра.","Весь пролив должен уложиться в два с половиной — три минуты."]},{"type":"quote","text":"Ровная поверхность гущи в конце — признак того, что вода прошла через весь кофе, а не по кратеру сбоку."}]'::jsonb),
  (5, 'Если получилось невкусно', 5, '[{"type":"callout","tone":"warning","text":"Горчит и вяжет во рту — кофе перезаварен. Сделайте помол крупнее или сократите время пролива."},{"type":"callout","tone":"info","text":"Кисло, пусто, вкус как у воды — недозаварен. Помол мельче, вода горячее, лейте медленнее."},{"type":"text","text":"Записывайте параметры каждой удачной чашки: граммы, помол, время. Через неделю у вас будет свой рецепт под конкретное зерно — и его не придётся подбирать заново."}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'kofe-kak-v-speshelti';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'goryachie-klavishi-macos', 'Горячие клавиши macOS', 'Убрать руку с мыши и не возвращать', 'tips',
  '{"from":"#3B9EFF","to":"#111827","pattern":"dots"}'::jsonb, 'any', array['free'],
  'Ким Соколов', 'Четыре коротких урока про сочетания, которые действительно используешь каждый день. Остальные пятьсот можно забыть.', true, 11
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'goryachie-klavishi-macos');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Окна и приложения', 4, '[{"type":"text","text":"Восемьдесят процентов времени за компьютером уходит на переключение между окнами. Три сочетания закрывают почти все случаи."},{"type":"list","items":["Cmd + Tab — переключение между приложениями. Удерживайте Cmd и жмите Tab, чтобы пройти дальше по списку.","Cmd + ` — переключение между окнами одного приложения. Незаменимо, когда открыто три окна браузера.","Cmd + W закрывает вкладку или окно, Cmd + Q — приложение целиком. Путать их дорого."]},{"type":"callout","tone":"info","text":"Если Cmd + Tab «перепрыгивает» нужное приложение — вероятно, оно свёрнуто. Свёрнутые окна из этого списка не поднимаются, поэтому лучше прятать приложение через Cmd + H, а не сворачивать."}]'::jsonb),
  (2, 'Spotlight вместо мыши', 4, '[{"type":"text","text":"Cmd + Space открывает поиск. Дальше можно набрать название приложения, имя файла, посчитать выражение или перевести валюту — и всё это не отрывая рук от клавиатуры."},{"type":"list","items":["Наберите первые две-три буквы приложения и нажмите Enter — быстрее, чем искать иконку.","Введите «1250 usd» — увидите сумму в рублях по текущему курсу.","Введите выражение вроде «18 * 4.5» — Spotlight посчитает."]}]'::jsonb),
  (3, 'Работа с текстом', 4, '[{"type":"text","text":"Курсор не обязательно двигать по одной букве. Модификаторы меняют шаг перемещения, а Shift к ним добавляет выделение."},{"type":"code","lang":"text","code":"Option + ←/→     на слово\nCmd + ←/→        в начало/конец строки\nCmd + ↑/↓        в начало/конец документа\n+ Shift          то же самое, но с выделением"},{"type":"callout","tone":"success","text":"Option + Backspace удаляет слово целиком, Cmd + Backspace — всю строку до начала. После этого стирать по букве уже не захочется."}]'::jsonb),
  (4, 'Скриншоты и окна', 4, '[{"type":"list","items":["Cmd + Shift + 4 — снимок выделенной области.","Cmd + Shift + 4, затем Space — снимок одного окна вместе с тенью.","Cmd + Shift + 5 — панель со всеми режимами, включая запись видео.","Добавьте Control к любому из них — снимок уйдёт в буфер обмена вместо файла на рабочем столе."]},{"type":"quote","text":"Сочетаний в системе несколько сотен. Выучите эти десять — остальные можно спокойно забыть."}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'goryachie-klavishi-macos';

insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (
  'telefon-kak-studiya', 'Телефон как студия', 'Снимать так, чтобы не было стыдно', 'tips',
  '{"from":"#7DD3FC","to":"#0C2A3E","pattern":"waves"}'::jsonb, 'beginner', '{}',
  'Ким Соколов', 'Свет, кадр, звук и стабилизация без штатива за сто тысяч. Разбираем на примере съёмки товара и говорящей головы.', true, 12
) on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,
  cover = excluded.cover, level = excluded.level, badges = excluded.badges,
  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;

delete from public.lessons where course_id = (select id from public.courses where slug = 'telefon-kak-studiya');
insert into public.lessons (course_id, position, title, duration_min, blocks)
select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,
(values
  (1, 'Урок 1', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Телефон как студия» — Свет, кадр, звук и стабилизация без штатива за сто тысяч. Разбираем на примере съёмки товара и говорящей головы."},{"type":"image","cover":{"from":"#7DD3FC","to":"#0C2A3E","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (2, 'Урок 2', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Телефон как студия» — Свет, кадр, звук и стабилизация без штатива за сто тысяч. Разбираем на примере съёмки товара и говорящей головы."},{"type":"image","cover":{"from":"#7DD3FC","to":"#0C2A3E","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (3, 'Урок 3', 6, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Телефон как студия» — Свет, кадр, звук и стабилизация без штатива за сто тысяч. Разбираем на примере съёмки товара и говорящей головы."},{"type":"image","cover":{"from":"#7DD3FC","to":"#0C2A3E","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (4, 'Урок 4', 5, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Телефон как студия» — Свет, кадр, звук и стабилизация без штатива за сто тысяч. Разбираем на примере съёмки товара и говорящей головы."},{"type":"image","cover":{"from":"#7DD3FC","to":"#0C2A3E","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (5, 'Урок 5', 5, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Телефон как студия» — Свет, кадр, звук и стабилизация без штатива за сто тысяч. Разбираем на примере съёмки товара и говорящей головы."},{"type":"image","cover":{"from":"#7DD3FC","to":"#0C2A3E","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb),
  (6, 'Урок 6', 5, '[{"type":"callout","tone":"info","text":"Этот урок ещё готовится. Текст и иллюстрации появятся здесь в ближайшем обновлении."},{"type":"text","text":"Курс «Телефон как студия» — Свет, кадр, звук и стабилизация без штатива за сто тысяч. Разбираем на примере съёмки товара и говорящей головы."},{"type":"image","cover":{"from":"#7DD3FC","to":"#0C2A3E","pattern":"waves"},"caption":"Место для иллюстрации урока"}]'::jsonb)
) as v(position, title, duration_min, blocks)
where c.slug = 'telefon-kak-studiya';

commit;
