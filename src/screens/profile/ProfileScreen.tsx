import { AtSign, Bell, Globe, Info, MessageCircle, Sparkles, Trash2 } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { APP_VERSION, AUTHOR } from '@/data/profile'
import { useLibraryStore } from '@/modules/library'
import { useSettingsStore } from '@/modules/settings/settings.store'
import { getTelegramUser, openLink } from '@/platform/telegram'
import { ConfirmRow, LinkRow, RowGroup, ToggleRow } from './ProfileRows'

const LINK_ICONS: Record<string, React.ReactNode> = {
  channel: <MessageCircle size={17} />,
  chat: <AtSign size={17} />,
}

export function ProfileScreen() {
  const user = getTelegramUser()
  const clearSaved = useLibraryStore((s) => s.clearSaved)

  const reminders = useSettingsStore((s) => s.reminders)
  const toggleReminders = useSettingsStore((s) => s.toggleReminders)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)
  const toggleReducedMotion = useSettingsStore((s) => s.toggleReducedMotion)

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : 'Гость'

  return (
    <Screen title="профиль">
      {/* — кто вошёл — */}
      <section className="mb-7 px-5">
        <div className="flex items-center gap-4">
          {user?.photo_url ? (
            <div className="crt size-16 shrink-0 overflow-hidden rounded-avatar border border-red/30">
              <img src={user.photo_url} alt="" className="size-full object-cover grayscale" />
              {/* Тонирование: аватар тоже остаётся в палитре */}
              <div className="absolute inset-0 bg-red mix-blend-color" />
            </div>
          ) : (
            <div className="crt flex size-16 shrink-0 items-center justify-center rounded-avatar border border-red/30 bg-inset text-[22px] font-bold text-red-bright">
              {displayName.charAt(0)}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold tracking-[0.08em]">{displayName}</p>
            <p className="label mt-2 truncate text-dim">
              {user?.username ? `@${user.username}` : 'откройте в telegram, чтобы войти'}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-7">
        <RowGroup title="настройки">
          <LinkRow
            icon={<Globe size={17} />}
            label="Язык"
            value="Русский"
            onClick={() => {
              // Второго языка пока нет — см. решение по мультиязычности.
            }}
          />
          <ToggleRow
            icon={<Bell size={17} />}
            label="Напоминания"
            hint="Раз в неделю подтолкнём вернуться к сохранённому"
            checked={reminders}
            onChange={toggleReminders}
          />
          <ToggleRow
            icon={<Sparkles size={17} />}
            label="Меньше анимации"
            hint="Переходы станут мгновенными"
            checked={reducedMotion}
            onChange={toggleReducedMotion}
          />
        </RowGroup>

        <RowGroup title="про нас">
          {AUTHOR.links.map((link) => (
            <LinkRow
              key={link.id}
              icon={LINK_ICONS[link.id]}
              label={link.label}
              value={link.value}
              onClick={() => openLink(link.href)}
            />
          ))}
        </RowGroup>

        <section className="px-5">
          <div className="glass rounded-card p-4">
            <div className="mb-3 flex items-center gap-2 text-red">
              <Info size={15} />
              <h2 className="label">
                {AUTHOR.name} — {AUTHOR.tagline}
              </h2>
            </div>
            <p className="text-[13px] leading-[1.8] tracking-[0.01em] text-dim">{AUTHOR.about}</p>
          </div>
        </section>

        <RowGroup>
          <ConfirmRow
            icon={<Trash2 size={17} />}
            label="Очистить закладки"
            confirmLabel="Удалить все закладки?"
            onConfirm={clearSaved}
          />
        </RowGroup>

        <p className="label px-5 text-center text-dim">версия {APP_VERSION}</p>
      </div>
    </Screen>
  )
}
