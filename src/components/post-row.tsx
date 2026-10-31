'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlogIndexItem } from '@/app/blog/types'

export function formatPostDate(date: string) {
	const value = dayjs(date)
	return { day: value.format('MM-DD'), year: value.format('YYYY'), full: value.format('YYYY-MM-DD') }
}

export function tagHref(tag: string) {
	return `/tags/${encodeURIComponent(tag)}`
}

export function PostTags({ item, className, link = true }: { item: BlogIndexItem; className?: string; link?: boolean }) {
	const tags = item.tags ?? []
	if (tags.length === 0) return null

	return (
		<div className={cn('text-faint flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px]', className)}>
			{tags.slice(0, 4).map(tag =>
				link ? (
					<Link key={tag} href={tagHref(tag)} className='hover:text-brand-ink transition-colors' onClick={event => event.stopPropagation()}>
						#{tag}
					</Link>
				) : (
					// 整行已经是 <a>，这里再套 <a> 会形成非法嵌套 → hydration 报错
					<span key={tag}>#{tag}</span>
				)
			)}
		</div>
	)
}

interface PostRowProps {
	item: BlogIndexItem
	/** 编辑模式：整行变成可勾选的选择项 */
	editMode?: boolean
	selected?: boolean
	onSelect?: (slug: string) => void
	read?: boolean
}

export function PostRow({ item, editMode = false, selected = false, onSelect, read = false }: PostRowProps) {
	const { day, year } = formatPostDate(item.date)

	const content = (
		<>
			{editMode && (
				<span
					aria-hidden
					className={cn(
						'flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
						selected ? 'border-brand bg-brand text-white' : 'border-hair2 text-transparent'
					)}>
					✓
				</span>
			)}

			<span className='text-faint font-mono text-[12.5px] tabular-nums md:pt-1.5'>
				<strong className='text-muted block text-[13px] font-medium'>{day}</strong>
				{year}
			</span>

			<span className='min-w-0'>
				<h3 className='text-ink group-hover:text-brand-ink mb-1.5 flex items-center gap-2 text-[17px] leading-[1.5] font-[550] tracking-[-0.012em] transition-colors duration-150'>
					{item.title || item.slug}
					{read && <span className='text-faint shrink-0 font-mono text-[10.5px] font-normal'>[已读]</span>}
					<ArrowRight className='text-brand size-4 shrink-0 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100' aria-hidden />
				</h3>
				{item.summary && <p className='text-muted mb-2.5 line-clamp-2 text-[14px] leading-[1.7]'>{item.summary}</p>}
				<PostTags item={item} link={false} />
			</span>

			{item.cover ? (
				<span className='border-hair bg-surface2 hidden aspect-16/10 overflow-hidden rounded-[12px] border md:block'>
					<img src={item.cover} alt='' loading='lazy' decoding='async' className='size-full object-cover' />
				</span>
			) : (
				<span aria-hidden className='hidden md:block' />
			)}
		</>
	)

	const shared = cn(
		'group border-hair hover:bg-surface/60 relative grid items-start gap-x-6 gap-y-2 border-t px-3 py-5 transition-colors duration-150 md:px-0',
		editMode ? 'md:grid-cols-[16px_88px_1fr_116px] cursor-pointer' : 'md:grid-cols-[88px_1fr_116px]',
		editMode && selected && 'bg-brandsoft'
	)

	if (editMode) {
		return (
			<div role='button' tabIndex={0} onClick={() => onSelect?.(item.slug)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect?.(item.slug)} className={shared}>
				{content}
			</div>
		)
	}

	return (
		<Link href={`/blog/${item.slug}`} className={shared}>
			<span className='bg-brand absolute top-0 bottom-0 -left-5 w-0.5 rounded opacity-0 transition-opacity duration-150 group-hover:opacity-60' />
			{content}
		</Link>
	)
}
