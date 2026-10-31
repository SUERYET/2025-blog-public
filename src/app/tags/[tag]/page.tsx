'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useBlogIndex } from '@/hooks/use-blog-index'
import { useReadArticles } from '@/hooks/use-read-articles'
import { PostRow, tagHref } from '@/components/post-row'
import { Container } from '@/components/ui/container'

export default function TagPage() {
	const params = useParams() as { tag?: string | string[] }
	const raw = Array.isArray(params?.tag) ? params.tag[0] : params?.tag || ''
	const tag = decodeURIComponent(raw)

	const { items, loading } = useBlogIndex()
	const { isRead } = useReadArticles()

	const { matched, relatedTags } = useMemo(() => {
		const matched = items
			.filter(item => (item.tags ?? []).includes(tag))
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

		const counts = new Map<string, number>()
		for (const item of items) {
			for (const t of item.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1)
		}

		const relatedTags = Array.from(counts.entries())
			.filter(([name]) => name !== tag)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 12)

		return { matched, relatedTags }
	}, [items, tag])

	return (
		<Container className='pb-20'>
			<header className='max-w-[716px] pt-14 pb-8'>
				<Link href='/tags' className='text-muted hover:text-brand-ink mb-6 inline-flex items-center gap-1.5 text-[13px] transition-colors'>
					<ArrowLeft className='size-3.5' aria-hidden />
					全部标签
				</Link>
				<h1 className='text-ink mb-3 text-[32px] font-semibold tracking-[-0.028em] sm:text-[38px]'>
					<span className='text-brand-ink'>#</span>
					{tag}
				</h1>
				<p className='text-muted text-[15px]'>
					{loading ? '加载中…' : `${matched.length} 篇相关文章`}
				</p>
			</header>

			{relatedTags.length > 0 && (
				<div className='flex flex-wrap gap-1.5 pb-6'>
					{relatedTags.map(([name, count]) => (
						<Link
							key={name}
							href={tagHref(name)}
							className='hover:bg-surface2 hover:text-ink text-muted border-hair rounded-full border px-3 py-1.5 text-[12.5px] transition-colors'>
							#{name} <span className='text-faint font-mono text-[10.5px]'>{count}</span>
						</Link>
					))}
				</div>
			)}

			{!loading && matched.length === 0 && <p className='text-muted border-hair border-t py-16 text-center text-sm'>这个标签下还没有文章</p>}

			<div>
				{matched.map(item => (
					<PostRow key={item.slug} item={item} read={isRead(item.slug)} />
				))}
			</div>

			{matched.length > 0 && (
				<Link href='/blog' className='text-brand-ink mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium'>
					查看全部文章
				</Link>
			)}
		</Container>
	)
}
