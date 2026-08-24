import { createHashRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CatalogScreen } from '@/screens/catalog/CatalogScreen'
import { CourseScreen } from '@/screens/course/CourseScreen'
import { HomeScreen } from '@/screens/home/HomeScreen'
import { LessonScreen } from '@/screens/lesson/LessonScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
import { SavedScreen } from '@/screens/saved/SavedScreen'

/**
 * HashRouter: WebView Telegram перезагружает страницу по своему усмотрению,
 * и путь без хеша потребовал бы rewrite-правил на хостинге (docs/decisions/0001).
 *
 * Все экраны лежат под общим layout — таб-бар виден всегда, в том числе
 * на курсе и уроке: из чтения всегда можно уйти одним нажатием.
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'catalog', element: <CatalogScreen /> },
      { path: 'saved', element: <SavedScreen /> },
      { path: 'profile', element: <ProfileScreen /> },
      { path: 'course/:slug', element: <CourseScreen /> },
      { path: 'course/:slug/lesson/:lessonId', element: <LessonScreen /> },
    ],
  },
])
