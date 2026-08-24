import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CatalogScreen } from '@/screens/catalog/CatalogScreen'
import { CourseScreen } from '@/screens/course/CourseScreen'
import { ErrorScreen } from '@/screens/error/ErrorScreen'
import { HomeScreen } from '@/screens/home/HomeScreen'
import { LessonScreen } from '@/screens/lesson/LessonScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
import { SavedScreen } from '@/screens/saved/SavedScreen'

/**
 * BrowserRouter, а не HashRouter: Telegram передаёт мини-аппу свои данные
 * через фрагмент URL (#tgWebAppData=…). HashRouter принимал этот фрагмент
 * за адрес страницы и показывал 404 при каждом запуске из Telegram
 * (docs/decisions/0008).
 *
 * Взамен хостинг обязан отдавать index.html на любой путь — это настроено
 * в vercel.ts.
 *
 * Все экраны лежат под общим layout — таб-бар виден всегда, в том числе
 * на курсе и уроке: из чтения всегда можно уйти одним нажатием.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorScreen />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'catalog', element: <CatalogScreen /> },
      { path: 'saved', element: <SavedScreen /> },
      { path: 'profile', element: <ProfileScreen /> },
      { path: 'course/:slug', element: <CourseScreen /> },
      { path: 'course/:slug/lesson/:lessonId', element: <LessonScreen /> },
      { path: '*', element: <ErrorScreen /> },
    ],
  },
])
