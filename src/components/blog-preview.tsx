'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { Container } from '@/components/ui/container'
import { ArticleToc, useActiveHeading, readingStats } from '@/components/article-chrome'
import { tagHref } from '@/components/post-row'
import LikeButton from '@/components/like-button'

type BlogPreviewProps = {
	markdown: string
	title: string
	tags: string[]
	date: string
	slug?: string
	/** 文章底部的上一篇/下一篇，写作预览里不传 */
	footer?: ReactNode
	backHref?: string
}

export function ArticleSkeleton() {
	return (
		<Container className='pb-20'>
			<div className='mx-auto w-full max-w-[716px] pt-16'>
				<div className='bg-surface2 mb-4 h-9 w-3/4 animate-pulse rounded' />
				<div className='bg-surface2 mb-10 h-4 w-1/3 animate-pulse rounded' />
				<div className='space-y-3'>
					{[0, 1, 2, 3, 4].map(index => (
						<div key={index} className='bg-surface2 h-4 animate-pulse rounded' style={{ width: `${92 - index * 6}%` }} />
					))}
				</div>
			</div>
		</Container>
	)
}

export function BlogPreview({ markdown, title, tags, date, slug, footer, backHref }: BlogPreviewProps) {
	const { content, toc, loading } = useMarkdownRender(markdown)
	const activeId = useActiveHeading(toc)
	const { minutes, chars } = readingStats(markdown)

	if (loading) return <ArticleSkeleton />

	return (
		<Container className='pb-20'>
			<div className='mx-auto flex w-full max-w-[1010px] gap-14 pt-10'>
				<aside className='hidden w-[188px] shrink-0 lg:block'>
					<ArticleToc toc={toc} activeId={activeId} />
				</aside>

				<motion.article
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className='min-w-0 flex-1 lg:max-w-[716px]'>
					{backHref && (
						<Link href={backHref} className='text-muted hover:text-brand-ink mb-6 inline-flex items-center gap-1.5 text-[13px] transition-colors'>
							<ArrowLeft className='size-3.5' aria-hidden />
							全部文章
						</Link>
					)}

					<header>
						<h1 className='text-ink mb-5 text-[30px] leading-[1.32] font-semibold tracking-[-0.026em] sm:text-[36px]'>{title}</h1>

						<div className='text-faint border-hair flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-6 font-mono text-[12px]'>
							<span>{date}</span>
							<span aria-hidden>·</span>
							<span>约 {minutes} 分钟</span>
							<span aria-hidden>·</span>
							<span>{chars.toLocaleString()} 字</span>

							{tags.length > 0 && (
								<div className='ml-auto flex flex-wrap gap-2.5'>
									{tags.map(tag => (
										<Link key={tag} href={tagHref(tag)} className='text-brand-ink hover:underline'>
											#{tag}
										</Link>
									))}
								</div>
							)}
						</div>

					</header>

					<div id='article-body' className='prose mt-9'>
						{content}
					</div>

					{slug && (
						<div className='border-hair mt-12 flex justify-end border-t pt-7'>
							<LikeButton slug={slug} delay={600} />
						</div>
					)}

					{footer}
				</motion.article>
			</div>
		</Container>
	)
}
