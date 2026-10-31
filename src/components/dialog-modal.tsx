'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface DialogModalProps {
	open: boolean
	onClose: () => void
	children: ReactNode
	className?: string
	overlayClassName?: string
	disableCloseOnOverlay?: boolean
	lockScroll?: boolean
	closeOnEsc?: boolean
	/** 对话框标题；没有可见标题时也建议传，供屏幕阅读器播报 */
	label?: string
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function DialogModal({
	open,
	onClose,
	children,
	className,
	disableCloseOnOverlay = false,
	lockScroll = true,
	closeOnEsc = true,
	label
}: DialogModalProps) {
	const [mounted, setMounted] = useState(false)
	const panelRef = useRef<HTMLDivElement>(null)
	const onCloseRef = useRef(onClose)
	onCloseRef.current = onClose

	useEffect(() => {
		setMounted(true)
	}, [])

	// 锁定背景滚动
	useEffect(() => {
		if (!lockScroll || !open) return
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [lockScroll, open])

	// ESC 关闭
	useEffect(() => {
		if (!closeOnEsc || !open) return
		const handler = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onCloseRef.current()
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [closeOnEsc, open])

	// 焦点管理：打开时移入面板，Tab 在面板内循环，关闭后还给原来的元素
	useEffect(() => {
		if (!open) return

		const previousActive = document.activeElement as HTMLElement | null

		const focusables = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(el => el.offsetParent !== null)

		const timer = window.setTimeout(() => focusables()[0]?.focus(), 0)

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Tab') return
			const items = focusables()
			if (items.length === 0) return

			const first = items[0]
			const last = items[items.length - 1]
			const active = document.activeElement

			if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && active === last) {
				event.preventDefault()
				first.focus()
			}
		}

		document.addEventListener('keydown', onKeyDown)
		return () => {
			window.clearTimeout(timer)
			document.removeEventListener('keydown', onKeyDown)
			previousActive?.focus?.()
		}
	}, [open])

	if (!mounted) return null

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='bg-card fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl'
					onClick={disableCloseOnOverlay ? undefined : onClose}>
					<motion.div
						ref={panelRef}
						role='dialog'
						aria-modal='true'
						aria-label={label ?? '对话框'}
						initial={{ opacity: 0, scale: 0.8, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: 20 }}
						className={cn('static', className)}
						onClick={event => event.stopPropagation()}>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
