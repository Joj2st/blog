import { cn } from '@/lib'
import { Badge, BadgeProps } from '@/components/ui/badge'

interface StatusBadgeProps extends BadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'info' | string
  text?: string
}

const statusConfig: Record<string, { variant: BadgeProps['variant']; className: string }> = {
  active: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100',
  },
  inactive: {
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100',
  },
  pending: {
    variant: 'outline',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100',
  },
  success: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100',
  },
  error: {
    variant: 'destructive',
    className: '',
  },
  warning: {
    variant: 'outline',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-100',
  },
  info: {
    variant: 'outline',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100',
  },
}

const statusTextMap: Record<string, string> = {
  active: '启用',
  inactive: '禁用',
  pending: '待处理',
  success: '成功',
  error: '失败',
  warning: '警告',
  info: '信息',
}

export function StatusBadge({ status, text, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.info
  const displayText = text || statusTextMap[status] || status

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
      {...props}
    >
      {displayText}
    </Badge>
  )
}

interface BooleanBadgeProps extends Omit<BadgeProps, 'variant'> {
  value: boolean
  trueText?: string
  falseText?: string
}

export function BooleanBadge({
  value,
  trueText = '是',
  falseText = '否',
  className,
  ...props
}: BooleanBadgeProps) {
  return (
    <Badge
      variant={value ? 'default' : 'secondary'}
      className={cn(
        value
          ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {value ? trueText : falseText}
    </Badge>
  )
}
