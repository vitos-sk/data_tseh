import { AtSign, Bell, Globe, Info, Link2, MessageCircle, Sparkles, Trash2 } from 'lucide-react'
import { COLORS } from '@/app/colors'
import { Screen } from '@/components/layout/Screen'
import { APP_VERSION, AUTHOR } from '@/data/profile'
import { lessonWord } from '@/lib/format'
import { useLibraryStore } from '@/modules/library'
import { useSettingsStore } from '@/modules/settings/settings.store'
import { getTelegramUser, openLink } from '@/platform/telegram'
import { ConfirmRow, LinkRow, RowGroup, StatTile, ToggleRow } from './ProfileRows'

const LINK_ICONS: Record<string, React.ReactNode> = {
  channel: <MessageCircle size={17} />,
  chat: <AtSign size={17} />,
  site: <Link2 size={17} />,
  mail: <Link2 size={17} />,
}

export function ProfileScreen() {
  const user = getTelegramUser()
  const completed = useLibraryStore((s) => s.completed)
  const savedCount = useLibraryStore((s) => s.saved.length)

  const reminders = useSettingsStore((s) => s.reminders)
  const toggleReminders = useSettingsStore((s) => s.toggleReminders)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)
  const toggleReducedMotion = useSettingsStore((s) => s.toggleReducedMotion)

  const lessonsDone = Object.values(completed).reduce((sum, ids) => sum + ids.length, 0)
  const coursesStarted = Object.values(completed).filter((ids) => ids.length > 0).length

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : 'Гость'

  return (
    <Screen title="Профиль">
      {/* — кто вошёл — */}
      <section className="mb-7 px-5">
        <div className="flex items-center gap-4">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt=""
              className="size-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-inset text-[24px] font-bold text-muted">
              {displayName.charAt(0)}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-[20px] font-bold tracking-[-0.02em]">{displayName}</p>
            <p className="mt-0.5 truncate text-[15px] text-muted">
              {user?.username ? `@${user.username}` : 'Откройте в Telegram, чтобы войти'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <StatTile value={String(lessonsDone)} label={lessonWord(lessonsDone)} />
          <StatTile value={String(coursesStarted)} label="курсов начато" />
          <StatTile value={String(savedCount)} label="в закладках" />
        </div>
      </section>

      <div className="flex flex-col gap-7">
        <RowGroup title="Настройки">
          <LinkRow
            icon={<Globe size={17} />}
            label="Язык"
            value="Русский"
            accent={COLORS.blue}
            onClick={() => {
              // Второго языка пока нет — см. решение по мультиязычности.
            }}
          />
          <ToggleRow
            icon={<Bell size={17} />}
            label="Напоминания"
            hint="Раз в неделю подтолкнём вернуться к начатому курсу"
            checked={reminders}
            onChange={toggleReminders}
            accent={COLORS.orange}
          />
          <ToggleRow
            icon={<Sparkles size={17} />}
            label="Меньше анимации"
            hint="Переходы станут мгновенными"
            checked={reducedMotion}
            onChange={toggleReducedMotion}
            accent={COLORS.purple}
          />
        </RowGroup>

        <RowGroup title="Про нас">
          {AUTHOR.links.map((link) => (
            <LinkRow
              key={link.id}
              icon={LINK_ICONS[link.id]}
              label={link.label}
              value={link.value}
              accent={COLORS.green}
              onClick={() => openLink(link.href)}
            />
          ))}
        </RowGroup>

        <section className="px-5">
          <div className="rounded-[var(--radius-card)] bg-surface p-4">
            <div className="mb-2.5 flex items-center gap-2 text-muted">
              <Info size={16} />
              <h2 className="text-[13px] font-semibold tracking-wide uppercase">
                {AUTHOR.name} — {AUTHOR.tagline}
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-muted">{AUTHOR.about}</p>
          </div>
        </section>

        <RowGroup>
          <ConfirmRow
            icon={<Trash2 size={17} />}
            label="Сбросить прогресс"
            confirmLabel="Удалить весь прогресс?"
            accent={COLORS.orange}
            onConfirm={() => useLibraryStore.setState({ completed: {}, lastOpened: null })}
          />
        </RowGroup>

        <p className="px-5 text-center text-[13px] text-muted">Версия {APP_VERSION}</p>
      </div>
    </Screen>
  )
}
