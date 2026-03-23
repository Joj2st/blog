import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// Date formatting
export function formatDate(date: string | Date | number, formatStr = 'yyyy-MM-dd'): string {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, formatStr, { locale: zhCN })
  } catch {
    return '-'
  }
}

export function formatDateTime(date: string | Date | number): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}

export function formatRelativeTime(date: string | Date | number): string {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return formatDistanceToNow(d, { addSuffix: true, locale: zhCN })
  } catch {
    return '-'
  }
}

// Number formatting
export function formatNumber(num: number | string, decimals = 0): string {
  if (num === null || num === undefined) return '-'
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n)) return '-'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatCurrency(amount: number | string, currency = '¥'): string {
  if (amount === null || amount === undefined) return '-'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '-'
  return `${currency}${n.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatPercent(value: number | string, decimals = 2): string {
  if (value === null || value === undefined) return '-'
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(n)) return '-'
  return `${(n * 100).toFixed(decimals)}%`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Text formatting
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

export function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Phone and ID formatting
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length !== 18) return idCard
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [name, domain] = email.split('@')
  const maskedName = name.length > 2 ? name.slice(0, 2) + '***' : '***'
  return `${maskedName}@${domain}`
}
