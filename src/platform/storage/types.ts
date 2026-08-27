/**
 * Асинхронное key-value хранилище. Сигнатура намеренно совпадает с StateStorage
 * из zustand/persist, чтобы стор подключался без переходника.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>
  /** false — значение не записано: не влезло в лимит или хранилище отказало. */
  setItem(key: string, value: string): Promise<boolean>
  /** Тоже булев: zustand требует одинаковый тип ответа у всех трёх методов. */
  removeItem(key: string): Promise<boolean>
}
