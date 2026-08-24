/** «42 мин» / «1 ч 8 мин» */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} ч` : `${h} ч ${m} мин`
}

/** «6 уроков» с правильным окончанием */
export function pluralLessons(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} урок`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} урока`
  return `${count} уроков`
}

/** Только слово: «урок» / «урока» / «уроков» — для плиток статистики. */
export function lessonWord(count: number): string {
  return pluralLessons(count).split(' ')[1]
}

export function formatLevel(level: 'beginner' | 'middle' | 'any'): string {
  switch (level) {
    case 'beginner':
      return 'С нуля'
    case 'middle':
      return 'Средний'
    case 'any':
      return 'Любой уровень'
  }
}
