type StorageType = 'local' | 'session'

interface StorageOptions {
  type?: StorageType
  expire?: number // Expiration time in milliseconds
}

interface StorageData<T> {
  value: T
  expire?: number
}

export function setStorage<T>(key: string, value: T, options: StorageOptions = {}): void {
  const { type = 'local', expire } = options
  const storage = type === 'local' ? localStorage : sessionStorage

  const data: StorageData<T> = {
    value,
    expire: expire ? Date.now() + expire : undefined,
  }

  try {
    storage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Storage set error:', error)
  }
}

export function getStorage<T>(key: string, type: StorageType = 'local'): T | null {
  const storage = type === 'local' ? localStorage : sessionStorage

  try {
    const item = storage.getItem(key)
    if (!item) return null

    const data: StorageData<T> = JSON.parse(item)

    if (data.expire && Date.now() > data.expire) {
      storage.removeItem(key)
      return null
    }

    return data.value
  } catch (error) {
    console.error('Storage get error:', error)
    return null
  }
}

export function removeStorage(key: string, type: StorageType = 'local'): void {
  const storage = type === 'local' ? localStorage : sessionStorage
  storage.removeItem(key)
}

export function clearStorage(type?: StorageType): void {
  if (type) {
    const storage = type === 'local' ? localStorage : sessionStorage
    storage.clear()
  } else {
    localStorage.clear()
    sessionStorage.clear()
  }
}
