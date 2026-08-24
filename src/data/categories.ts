import type { Category } from '@/modules/catalog/catalog.types'

export const CATEGORIES: Category[] = [
  {
    id: 'code',
    title: 'Код',
    chip: 'Код',
    accent: 'blue',
    icon: 'Code2',
    description: 'Разработка без академизма: то, что пригодится в первый же день.',
  },
  {
    id: 'ai',
    title: 'AI',
    chip: 'AI',
    accent: 'purple',
    icon: 'Sparkles',
    description: 'Нейросети как инструмент, а не как магия.',
  },
  {
    id: 'business',
    title: 'Бизнес',
    chip: 'Бизнес',
    accent: 'green',
    icon: 'Briefcase',
    description: 'Деньги, клиенты и решения, которые видно в отчёте.',
  },
  {
    id: 'craft',
    title: 'Ремесло',
    chip: 'Ремесло',
    accent: 'orange',
    icon: 'Hammer',
    description: 'Работа руками: дерево, кофе, вещи, которые остаются.',
  },
  {
    id: 'tips',
    title: 'Фишки',
    chip: 'Фишки',
    accent: 'blue',
    icon: 'Zap',
    description: 'Мелочи, которые экономят часы каждую неделю.',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<Category['id'], Category>
