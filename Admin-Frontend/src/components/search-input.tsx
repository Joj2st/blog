import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks'

interface SearchInputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  debounce?: number
  clearable?: boolean
  loading?: boolean
}

export function SearchInput({
  value,
  defaultValue = '',
  onChange,
  onSearch,
  placeholder = '搜索...',
  className,
  inputClassName,
  debounce = 300,
  clearable = true,
  loading = false,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value ?? defaultValue)
  const debouncedValue = useDebounce(inputValue, debounce)

  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value)
    }
  }, [value])

  useEffect(() => {
    onChange?.(debouncedValue)
  }, [debouncedValue, onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (value === undefined) {
      onChange?.(newValue)
    }
  }

  const handleClear = () => {
    setInputValue('')
    onChange?.('')
    onSearch?.('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(inputValue)
    }
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn('pl-9 pr-9', inputClassName)}
      />
      {clearable && inputValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 h-6 w-6"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {loading && (
        <div className="absolute right-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}
