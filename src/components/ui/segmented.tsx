import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface SegmentedOption<T extends string> {
	value: T
	label: string
	icon?: ReactNode
	title?: string
}

interface SegmentedProps<T extends string> {
	value: T
	options: SegmentedOption<T>[]
	onChange: (value: T) => void
	/** 供无障碍读取的分组名称 */
	label: string
	className?: string
}

/** 分段控件：主题切换、视图切换共用，避免各写一套 */
export function Segmented<T extends string>({ value, options, onChange, label, className }: SegmentedProps<T>) {
	return (
		<div role='group' aria-label={label} className={cn('bg-surface2 border-hair flex gap-0.5 rounded-[11px] border p-[3px]', className)}>
			{options.map(option => {
				const active = option.value === value
				return (
					<button
						key={option.value}
						type='button'
						aria-pressed={active}
						title={option.title ?? option.label}
						onClick={() => onChange(option.value)}
						className={cn(
							'flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[12.5px] transition-[background-color,color,box-shadow] duration-150',
							active ? 'bg-surface text-ink font-medium shadow-[var(--shadow-sm)]' : 'text-muted hover:text-ink'
						)}>
						{option.icon}
						<span className='max-sm:hidden'>{option.label}</span>
					</button>
				)
			})}
		</div>
	)
}
