import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ADMIN_SEGMENT } from '@/screens/admin/adminPath'
import { CatalogScreen } from '@/screens/catalog/CatalogScreen'
import { ErrorScreen } from '@/screens/error/ErrorScreen'
import { HomeScreen } from '@/screens/home/HomeScreen'
import { PostScreen } from '@/screens/post/PostScreen'
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
 * на посте: из чтения всегда можно уйти одним нажатием.
 */
/*
 * Админка грузится отдельным файлом и только по своему адресу: обычному
 * читателю незачем скачивать редактор и клиент базы — это больше половины
 * веса приложения.
 */
const AdminGate = lazy(() =>
  import('@/screens/admin/AdminGate').then((m) => ({ default: m.AdminGate })),
)
const AdminLayout = lazy(() =>
  import('@/screens/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminPostsScreen = lazy(() =>
  import('@/screens/admin/AdminPostsScreen').then((m) => ({ default: m.AdminPostsScreen })),
)
const AdminPostScreen = lazy(() =>
  import('@/screens/admin/AdminPostScreen').then((m) => ({ default: m.AdminPostScreen })),
)

function AdminChunk({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="px-5 py-20 text-center text-[15px] text-muted">Загрузка…</div>}
    >
      {children}
    </Suspense>
  )
}

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
      { path: 'p/:slug', element: <PostScreen /> },
      { path: '*', element: <ErrorScreen /> },
    ],
  },
  {
    /*
     * Админка живёт по отдельному адресу и без таб-бара приложения.
     * Адрес задаётся VITE_ADMIN_PATH — но это только от случайных гостей:
     * доступ решают вход и политики базы, а не секретность ссылки.
     */
    path: `/${ADMIN_SEGMENT}`,
    element: (
      <AdminChunk>
        <AdminGate>
          <AdminLayout />
        </AdminGate>
      </AdminChunk>
    ),
    errorElement: <ErrorScreen />,
    children: [
      {
        index: true,
        element: (
          <AdminChunk>
            <AdminPostsScreen />
          </AdminChunk>
        ),
      },
      {
        path: 'post/:id',
        element: (
          <AdminChunk>
            <AdminPostScreen />
          </AdminChunk>
        ),
      },
    ],
  },
])
