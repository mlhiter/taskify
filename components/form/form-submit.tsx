'use client'

import { useFormStatus } from 'react-dom'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

interface FormSubmitProps {
  disabled?: boolean
  children: React.ReactNode
  className?: string
  variant?:
    | 'primary'
    | 'secondary'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'ghost'
    | 'link'
}

export const FormSubmit = ({
  children,
  disabled,
  className,
  variant,
}: FormSubmitProps) => {
  const { pending } = useFormStatus()

  return (
    <Button
      disabled={pending || disabled}
      type="submit"
      variant={variant}
      size="sm"
      className={cn(className)}>
      {children}
    </Button>
  )
}
