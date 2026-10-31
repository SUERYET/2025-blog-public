'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface MenuItem {
	href: string
	label: string
	hint?: string
}

interface MenuProps {
	label: ReactNode
	items: MenuItem[]
	align?: 'left' | 'right'
	className?: string
}

/**
 * 顶栏「更多」下拉。
 * 负责：点击外部关闭、ESC 关闭、打开时把焦点移到第一项、aria-expanded/controls。
 */
export function Menu({ label, items, align = 'left', className }: MenuProps) {
	const [open, setOpen] = useState(false)
	const wrapRef = useRef<HTMLDivElement>(null)
	const panelRef = useRef<HTMLDivElement>(null)
	const pathname = usePathname()

	useEffect(() => setOpen(false), [pathname])

	useEffect(() => {
		if (!open) return

		const onPointerDown = (event: PointerEvent) => {
			if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}

		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()

		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<div ref={wrapRef} className={cn('relative', className)}>
			<button
				type='button'
				aria-haspopup='menu'
				aria-expanded={open}
				onClick={() => setOpen(value => !value)}
				className={cn(
					'flex items-center gap-1 rounded-[10px] px-3 py-1.5 text-sm transition-colors duration-150',
					open ? 'bg-surface2 text-ink' : 'text-muted hover:bg-surface2 hover:text-ink'
				)}>
				{label}
				<svg
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth={2}
					aria-hidden
					className={cn('size-3 transition-transform duration-150', open && 'rotate-180')}>
					<path d='m6 9 6 6 6-6' />
				</svg>
			</button>

			{open && (
				<div
					ref={panelRef}
					role='menu'
					className={cn(
						'border-hair bg-surface absolute top-[calc(100%+8px)] z-50 min-w-[190px] rounded-[14px] border p-1.5 shadow-[var(--shadow-lg)] backdrop-blur-xl',
						align === 'right' ? 'right-0' : 'left-0'
					)}>
					{items.map(item => (
						<Link
							key={item.href}
							href={item.href}
							role='menuitem'
							className='text-ink2 hover:bg-surface2 hover:text-ink focus-visible:bg-surface2 flex items-baseline justify-between gap-4 rounded-[9px] px-2.5 py-2 text-[13.5px] outline-none'>
							<span>{item.label}</span>
							{item.hint && <span className='text-faint font-mono text-[10.5px]'>{item.hint}</span>}
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
