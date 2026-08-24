/** Данные владельца площадки — то, что показываем в блоке «Про меня». */
export const AUTHOR = {
  name: 'Цех',
  tagline: 'Короткие курсы по делу',
  about:
    'Цех — небольшая мастерская коротких курсов. Мы делаем уроки, которые читаются за перекур и применяются в тот же день: без вступлений на двадцать минут и без воды. Пять направлений, живые примеры, честные оговорки о том, где метод не работает.',
  links: [
    { id: 'channel', label: 'Канал в Telegram', value: '@tseh', href: 'https://t.me/tseh' },
    { id: 'chat', label: 'Чат учеников', value: '@tseh_chat', href: 'https://t.me/tseh_chat' },
    { id: 'site', label: 'Сайт', value: 'tseh.ru', href: 'https://tseh.ru' },
    { id: 'mail', label: 'Написать нам', value: 'hi@tseh.ru', href: 'mailto:hi@tseh.ru' },
  ],
} as const

export const APP_VERSION = '0.1.0'
