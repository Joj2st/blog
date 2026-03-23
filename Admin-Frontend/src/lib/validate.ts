import { z } from 'zod'

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, '邮箱不能为空')
  .email('请输入有效的邮箱地址')

export const phoneSchema = z
  .string()
  .min(1, '手机号不能为空')
  .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')

export const passwordSchema = z
  .string()
  .min(1, '密码不能为空')
  .min(6, '密码至少需要6个字符')
  .max(20, '密码不能超过20个字符')

export const confirmPasswordSchema = (passwordField: string) =>
  z.string().min(1, '请确认密码').refine(
    (val, ctx) => {
      if (val !== (ctx.parent as Record<string, string>)[passwordField]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '两次输入的密码不一致',
        })
        return false
      }
      return true
    },
    { message: '两次输入的密码不一致' }
  )

export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName}不能为空`)

export const optionalString = z.string().optional().or(z.literal(''))

export const positiveNumber = z.number().positive('必须为正数')

export const nonNegativeNumber = z.number().min(0, '不能为负数')

export const urlSchema = z.string().url('请输入有效的URL')

export const idSchema = z.union([z.string(), z.number()])

// Form validation helpers
export function createFormSchema<T extends Record<string, z.ZodTypeAny>>(
  fields: T
) {
  return z.object(fields)
}

export type FormSchema<T extends Record<string, z.ZodTypeAny>> = z.infer<
  ReturnType<typeof createFormSchema<T>>
>

// Custom validators
export function isValidIdCard(idCard: string): boolean {
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  if (!reg.test(idCard)) return false

  // Check checksum
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }

  return checkCodes[sum % 11].toLowerCase() === idCard[17].toLowerCase()
}

export function isValidBankCard(cardNo: string): boolean {
  if (!/^\d{16,19}$/.test(cardNo)) return false

  let sum = 0
  let alternate = false

  for (let i = cardNo.length - 1; i >= 0; i--) {
    let n = parseInt(cardNo.substring(i, i + 1), 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }

  return sum % 10 === 0
}

export function isValidChineseName(name: string): boolean {
  return /^[\u4e00-\u9fa5]{2,8}$/.test(name)
}

export function isValidEnglishName(name: string): boolean {
  return /^[a-zA-Z\s]{2,50}$/.test(name)
}
