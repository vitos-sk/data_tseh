import { routes, type VercelConfig } from '@vercel/config/v1'

/**
 * Статический фронтенд без серверной части: Vercel собирает `dist/`
 * и раздаёт его с CDN.
 *
 * Заголовки фреймов намеренно НЕ ограничиваем: Telegram Desktop открывает
 * мини-апп в iframe, и любой X-Frame-Options или frame-ancestors его сломает.
 */
export const config: VercelConfig = {
  framework: 'vite',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',

  headers: [
    // Имена файлов в assets содержат хеш содержимого — их можно кэшировать навсегда
    routes.cacheControl('/assets/(.*)', {
      public: true,
      maxAge: '1 year',
      immutable: true,
    }),
  ],
}
