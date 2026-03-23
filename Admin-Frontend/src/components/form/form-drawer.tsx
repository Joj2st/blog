import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const widthMap = {
  sm: 'w-[400px]',
  md: 'w-[500px]',
  lg: 'w-[600px]',
  xl: 'w-[800px]',
  full: 'w-full',
}

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  width = 'md',
}: FormDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn('flex flex-col p-0', widthMap[width])}>
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{title}</SheetTitle>
              {description && (
                <SheetDescription className="mt-1">{description}</SheetDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          <div className={className}>{children}</div>
        </ScrollArea>
        {footer && (
          <div className="border-t px-6 py-4">{footer}</div>
        )}
      </SheetContent>
    </Sheet>
  )
}

interface FormDrawerFooterProps {
  children: ReactNode
  className?: string
}

export function FormDrawerFooter({ children, className }: FormDrawerFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  )
}
