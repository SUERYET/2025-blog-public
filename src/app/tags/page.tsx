'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useBlogIndex } from '@/hooks/use-blog-index'
import { tagHref } from '@/components/post-row'
import { Container } from '@/components/ui/container'

export default function TagsIndexPage() {
	const { items, loading } = useBlogIndex()

	const tags = useMemo(() => {
		const counts = new Map<string, number>()
		for (const item of items) {
			for (const tag of item.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1)
		}
		return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
	}, [items])

	return (
		<Container className='pb-20'>
			<header className='max-w-[716px] pt-14 pb-8'>
				<h1 className='text-ink mb-3 text-[32px] font-semibold tracking-[-0.028em] sm:text-[38px]'>标签</h1>
				<p className='text-muted text-[15px]'>{loading ? '加载中…' : `${tags.length} 个标签`}</p>
			</header>

			<div className='flex flex-wrap gap-2'>
				{tags.map(([name, count]) => (
					<Link
						key={name}
						href={tagHref(name)}
						className='hover:border-brand/40 hover:text-brand-ink text-ink2 border-hair flex items-baseline gap-2 rounded-full border px-4 py-2 text-[14px] transition-colors'>
						#{name}
						<span className='text-faint font-mono text-[11px]'>{count}</span>
					</Link>
				))}
			</div>

			{!loading && tags.length === 0 && <p className='text-muted py-16 text-center text-sm'>还没有任何标签</p>}
		</Container>
	)
}
