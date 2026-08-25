/** «7 мин» / «1 ч 8 мин» */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} ч` : `${h} ч ${m} мин`
}

/** «7 мин чтения» — для карточек и шапки поста. */
export function formatReadTime(minutes: number): string {
  return `${formatDuration(minutes)} чтения`
}

/** «13 постов» с правильным окончанием */
export function pluralPosts(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} пост`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} поста`
  return `${count} постов`
}
