'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dayjs from 'dayjs'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { BlogPreview, ArticleSkeleton } from '@/components/blog-preview'
import { ReadingProgress } from '@/components/article-chrome'
import { loadBlog, type BlogConfig } from '@/lib/load-blog'
import { useBlogIndex } from '@/hooks/use-blog-index'
import { useReadArticles } from '@/hooks/use-read-articles'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import type { BlogIndexItem } from '@/app/blog/types'
import LiquidGrass from '@/components/liquid-grass'

function PagerCard({ item, direction }: { item: BlogIndexItem; direction: 'prev' | 'next' }) {
	return (
		<Link
			href={`/blog/${item.slug}`}
			className='group border-hair hover:border-hair2 flex min-w-0 flex-1 flex-col gap-1 rounded-[12px] border p-4 transition-colors'>
			<span className='text-faint flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase'>
				{direction === 'prev' ? <ArrowLeft className='size-3' aria-hidden /> : null}
				{direction === 'prev' ? '上一篇' : '下一篇'}
				{direction === 'next' ? <ArrowRight className='size-3' aria-hidden /> : null}
			</span>
			<span className='text-ink group-hover:text-brand-ink truncate text-[14.5px] font-medium transition-colors'>{item.title || item.slug}</span>
		</Link>
	)
}

export default function Page() {
	const params = useParams() as { id?: string | string[] }
	const slug = Array.isArray(params?.id) ? params.id[0] : params?.id || ''
	const router = useRouter()
	const { markAsRead } = useReadArticles()
	const { items } = useBlogIndex()

	const [blog, setBlog] = useState<{ config: BlogConfig; markdown: string; cover?: string } | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		async function run() {
			if (!slug) return
			try {
				const data = await loadBlog(slug)
				if (cancelled) return
				setBlog(data)
				setError(null)
				markAsRead(slug)
				document.title = `${data.config.title || slug} · SUERYETO`
			} catch (e: any) {
				if (!cancelled) setError(e?.message || '加载失败')
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [slug, markAsRead])

	const { prev, next, related } = useMemo(() => {
		const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		const index = sorted.findIndex(item => item.slug === slug)
		const current = index >= 0 ? sorted[index] : undefined
		const currentTags = new Set(current?.tags ?? [])

		const related = sorted
			.filter(item => item.slug !== slug && (item.tags ?? []).some(tag => currentTags.has(tag)))
			.slice(0, 3)

		return {
			prev: index > 0 ? sorted[index - 1] : undefined,
			next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : undefined,
			related
		}
	}, [items, slug])

	const title = blog?.config.title || slug
	const date = blog?.config.date ? dayjs(blog.config.date).format('YYYY-MM-DD') : ''
	const tags = blog?.config.tags || []

	if (!slug) {
		return <Container className='py-24 text-center text-sm'>无效的链接</Container>
	}

	if (error) {
		return (
			<Container className='py-24 text-center'>
				<p className='text-ink mb-2 text-[15px] font-medium'>文章没有找到</p>
				<p className='text-muted mb-6 text-[13px]'>{error}</p>
				<Button onClick={() => router.push('/blog')}>返回文章列表</Button>
			</Container>
		)
	}

	if (!blog) {
		return <ArticleSkeleton />
	}

	return (
		<>
			<ReadingProgress targetId='article-body' />

			<BlogPreview
				markdown={blog.markdown}
				title={title}
				tags={tags}
				date={date}
				slug={slug}
				backHref='/blog'
				footer={
					<>
						<button
							type='button'
							onClick={() => router.push(`/write/${slug}`)}
							className='text-muted hover:text-brand-ink mt-6 text-[13px] transition-colors max-sm:hidden'>
							编辑这篇文章
						</button>

						{(prev || next) && (
							<div className='mt-8 flex flex-col gap-3 sm:flex-row'>
								{prev ? <PagerCard item={prev} direction='prev' /> : <div className='flex-1' />}
								{next ? <PagerCard item={next} direction='next' /> : <div className='flex-1' />}
							</div>
						)}

						{related.length > 0 && (
							<motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className='mt-14'>
								<h2 className='text-faint mb-4 font-mono text-[12px] font-semibold tracking-[0.13em] uppercase'>相关文章</h2>
								<ul className='divide-hair divide-y'>
									{related.map(item => (
										<li key={item.slug}>
											<Link href={`/blog/${item.slug}`} className='group flex items-center gap-3 py-3'>
												<span className='text-faint shrink-0 font-mono text-[12px] tabular-nums'>{dayjs(item.date).format('MM-DD')}</span>
												<span className='text-ink2 group-hover:text-brand-ink min-w-0 flex-1 truncate text-[14.5px] transition-colors'>
													{item.title || item.slug}
												</span>
												<ArrowRight className='text-brand size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100' aria-hidden />
											</Link>
										</li>
									))}
								</ul>
							</motion.section>
						)}
					</>
				}
			/>

			{slug === 'liquid-grass' && <LiquidGrass />}
		</>
	)
}
