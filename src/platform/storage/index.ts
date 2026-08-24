import { isInsideTelegram } from '@/platform/telegram'
import { cloudStorage } from './cloudStorage'
import { localStore } from './localStorage'
import type { KeyValueStore } from './types'

/**
 * Единственная точка, где решается, куда писать пользовательские данные.
 * Появится сервер — здесь добавится третья реализация (см. docs/decisions/0003).
 */
export const storage: KeyValueStore = isInsideTelegram() ? cloudStorage : localStore

export type { KeyValueStore }
