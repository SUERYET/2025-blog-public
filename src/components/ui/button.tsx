import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

const BASE =
	'inline-flex items-center justify-center gap-1.5 rounded-[10px] font-medium whitespace-nowrap ' +
	'transition-[background-color,border-color,color,transform] duration-150 ease-[var(--ease)] ' +
	'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]'

const VARIANTS: Record<Variant, string> = {
	primary: 'bg-brand text-white border border-transparent shadow-[0_4px_14px_-6px_var(--color-brand)] hover:brightness-110',
	outline: 'border border-hair bg-surface text-ink2 hover:border-hair2 hover:text-ink',
	ghost: 'text-muted hover:bg-surface2 hover:text-ink',
	subtle: 'bg-surface2 text-ink2 hover:text-ink',
	danger: 'border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-400'
}

const SIZES: Record<Size, string> = {
	sm: 'h-8 px-3 text-[13px]',
	md: 'h-9 px-4 text-sm',
	lg: 'h-11 px-5 text-[15px]'
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant
	size?: Size
}

export function Button({ variant = 'outline', size = 'md', className, ...props }: ButtonProps) {
	return <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />
}

const ICON_BASE =
	'grid place-items-center rounded-[10px] text-muted ' +
	'transition-[background-color,color] duration-150 ease-[var(--ease)] ' +
	'hover:bg-surface2 hover:text-ink disabled:pointer-events-none disabled:opacity-50'

const ICON_SIZES: Record<Size, string> = {
	sm: 'size-7 [&>svg]:size-3.5',
	md: 'size-9 [&>svg]:size-[17px]',
	lg: 'size-11 [&>svg]:size-5'
}

/** 图标按钮：aria-label 强制必填 —— 这是可访问性的底线，不靠自觉 */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
	/** 屏幕阅读器读到的名字，必填 */
	'aria-label': string
	size?: Size
	children: ReactNode
}

export function IconButton({ size = 'md', className, children, ...props }: IconButtonProps) {
	return (
		<button className={cn(ICON_BASE, ICON_SIZES[size], className)} {...props}>
			{children}
		</button>
	)
}
