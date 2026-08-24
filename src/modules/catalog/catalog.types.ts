import type { AccentName } from '@/app/colors'

export type CategoryId = 'code' | 'ai' | 'business' | 'craft' | 'tips'

export type CourseLevel = 'beginner' | 'middle' | 'any'

export type CourseBadge = 'new' | 'free'

/** Название иконки lucide-react. Держим строкой, чтобы данные оставались данными. */
export type IconName = 'Code2' | 'Sparkles' | 'Briefcase' | 'Hammer' | 'Zap'

export interface Category {
  id: CategoryId
  /** Полное название для заголовков каталога */
  title: string
  /** Короткая подпись для чипа-фильтра */
  chip: string
  accent: AccentName
  icon: IconName
  description: string
}

/**
 * Обложка курса. Градиент есть всегда — он служит и самостоятельной
 * обложкой, и запасным вариантом, если картинка не загрузилась.
 */
export interface CourseCover {
  from: string
  to: string
  pattern: 'rings' | 'grid' | 'waves' | 'dots'
  /** Загруженная в админку картинка. Если задана — показываем её поверх градиента. */
  imageUrl?: string
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string
  categoryId: CategoryId
  cover: CourseCover
  level: CourseLevel
  /** Суммарное время чтения всех уроков, минуты */
  durationMin: number
  lessonsCount: number
  badges: CourseBadge[]
  author: string
  description: string
}

export type LessonBlock =
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'image'; cover: CourseCover; caption?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success'; text: string }
  | { type: 'code'; lang: string; code: string }

export interface Lesson {
  id: string
  courseId: string
  order: number
  title: string
  /** Время чтения, минуты */
  durationMin: number
  blocks: LessonBlock[]
}

/** Курс вместе с личным прогрессом — то, что нужно карточке на экране. */
export interface CourseWithProgress extends Course {
  completedLessons: number
  /** 0…1 */
  progress: number
}
