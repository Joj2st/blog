import { ReactNode } from 'react'
import { cn } from '@/lib'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  actions?: ReactNode
}

export function PageHeader({
  title,
  description,
  children,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-row items-center justify-between w-full', className)}>
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

interface PageContentProps {
  children: ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('mt-6', className)}>
      {children}
    </div>
  )
}

interface PageProps {
  children: ReactNode
  className?: string
}

export function Page({ children, className }: PageProps) {
  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {children}
    </div>
  )
}

interface PageHeaderBarProps {
  children?: ReactNode
  className?: string
}

export function PageHeaderBar({ children, className }: PageHeaderBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'flex items-center gap-3 px-4 sm:px-6 border-b',
        className
      )}
    >
      <SidebarTrigger variant='outline' className='max-md:scale-125' />
      <Separator orientation='vertical' className='h-6' />
      {children}
    </header>
  )
}

interface PageBodyProps {
  children: ReactNode
  className?: string
}

export function PageBody({ children, className }: PageBodyProps) {
  return (
    <div className={cn('flex-1 overflow-auto p-4 md:p-6', className)}>
      {children}
    </div>
  )
}
