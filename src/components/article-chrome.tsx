'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type TocEntry = { id: string; text: string; level: number }

/**
 * 跟踪当前阅读到哪个标题。
 * 用滚动位置而不是 IntersectionObserver：长文章里 IO 的"进入视口"判断
 * 会在快速滚动时跳变，滚动位置更稳。
 */
export function useActiveHeading(toc: TocEntry[]) {
	const [activeId, setActiveId] = useState('')

	useEffect(() => {
		if (toc.length === 0) return

		let frame = 0
		const update = () => {
			const offset = 120
			let current = ''
			for (const item of toc) {
				const element = document.getElementById(item.id)
				if (!element) continue
				if (element.getBoundingClientRect().top - offset <= 0) current = item.id
			}
			setActiveId(current || toc[0]?.id || '')
		}

		const onScroll = () => {
			cancelAnimationFrame(frame)
			frame = requestAnimationFrame(update)
		}

		update()
		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('resize', onScroll)
		return () => {
			cancelAnimationFrame(frame)
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', onScroll)
		}
	}, [toc])

	return activeId
}

export function ArticleToc({ toc, activeId }: { toc: TocEntry[]; activeId: string }) {
	if (toc.length === 0) return null

	return (
		<nav aria-label='本页目录' className='sticky top-24'>
			<div className='text-faint mb-3.5 font-mono text-[10.5px] tracking-[0.13em] uppercase'>本页目录</div>
			<ul className='border-hair border-l'>
				{toc.map(item => (
					<li key={item.id}>
						<a
							href={`#${item.id}`}
							aria-current={activeId === item.id ? 'location' : undefined}
							className={cn(
								'-ml-px block border-l-2 py-1.5 leading-[1.45] transition-colors duration-150',
								item.level >= 3 ? 'pl-6 text-[12.5px]' : 'pl-3.5 text-[13px]',
								activeId === item.id
									? 'border-brand text-brand-ink font-medium'
									: 'text-muted hover:text-ink border-l-transparent'
							)}>
							{item.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}

/** 顶部阅读进度条：用 scaleX 而不是 width，避免每帧触发重排 */
export function ReadingProgress({ targetId }: { targetId: string }) {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		let frame = 0
		const update = () => {
			const element = document.getElementById(targetId)
			if (!element) return

			const start = element.offsetTop
			const height = element.offsetHeight
			const viewport = window.innerHeight
			const scrolled = window.scrollY - start
			const total = Math.max(height - viewport * 0.8, 1)
			setProgress(Math.min(1, Math.max(0, scrolled / total)))
		}

		const onScroll = () => {
			cancelAnimationFrame(frame)
			frame = requestAnimationFrame(update)
		}

		update()
		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('resize', onScroll)
		return () => {
			cancelAnimationFrame(frame)
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', onScroll)
		}
	}, [targetId])

	return (
		<div aria-hidden className='pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5'>
			<div
				className='from-brand to-brand-secondary h-full origin-left bg-gradient-to-r'
				style={{ transform: `scaleX(${progress})`, transition: 'transform 120ms linear' }}
			/>
		</div>
	)
}

/** 中英文混排的字数与阅读时长估算 */
export function readingStats(markdown: string) {
	const withoutCode = markdown.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ')
	const cjk = (withoutCode.match(/[\u4e00-\u9fa5]/g) || []).length
	const latin = (withoutCode.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[A-Za-z0-9_]+/g) || []).length
	const chars = cjk + latin
	// 中文约 350 字/分钟，英文单词按 1.6 字折算
	const minutes = Math.max(1, Math.round((cjk + latin * 1.6) / 350))
	return { chars, minutes }
}
