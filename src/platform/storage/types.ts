/**
 * Асинхронное key-value хранилище. Сигнатура намеренно совпадает с StateStorage
 * из zustand/persist, чтобы стор подключался без переходника.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}
