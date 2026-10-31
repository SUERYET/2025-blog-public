'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowRight, Github, Link2 as LinkIcon, Mail, Rss } from 'lucide-react'
import { cn } from '@/lib/utils'
import siteContent from '@/config/site-content.json'
import { useBlogIndex, type BlogIndexItem } from '@/hooks/use-blog-index'
import { useCategories } from '@/hooks/use-categories'
import { Container } from '@/components/ui/container'
import { PostRow, PostTags, formatPostDate } from '@/components/post-row'

const ALL = 'all'

function FeaturedPost({ item }: { item: BlogIndexItem }) {
	const { day, year } = formatPostDate(item.date)

	return (
		<Link
			href={`/blog/${item.slug}`}
			className='group border-hair bg-surface hover:border-hair2 grid overflow-hidden rounded-[24px] border shadow-[var(--shadow-md)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] md:grid-cols-[1.12fr_0.88fr]'>
			<div className='flex flex-col justify-center p-7 sm:p-9'>
				<div className='text-brand-ink mb-3.5 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase'>
					<span className='bg-brand size-1.5 rounded-full' />
					{item.category && <span>{item.category} · </span>}
					<span>
						{year}-{day}
					</span>
				</div>
				<h3 className='text-ink mb-3 text-[22px] leading-[1.35] font-semibold tracking-[-0.02em] sm:text-[25px]'>{item.title || item.slug}</h3>
				{item.summary && <p className='text-muted mb-5 line-clamp-3 text-[14.5px] leading-[1.7]'>{item.summary}</p>}
				<PostTags item={item} link={false} />
			</div>

			<div className='bg-surface2 relative aspect-16/10 overflow-hidden md:aspect-auto md:min-h-[240px]'>
				{item.cover ? (
					<img
						src={item.cover}
						alt=''
						loading='lazy'
						decoding='async'
						className='absolute inset-0 size-full object-cover transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[1.04]'
					/>
				) : (
					<div className='from-brand/15 to-brand-2/10 absolute inset-0 bg-gradient-to-br' />
				)}
			</div>
		</Link>
	)
}

function Skeleton() {
	return (
		<div className='space-y-3' aria-label='加载中'>
			{[0, 1, 2, 3].map(index => (
				<div key={index} className='border-hair animate-pulse border-t py-5'>
					<div className='bg-surface2 mb-3 h-4 w-2/5 rounded' />
					<div className='bg-surface2 h-3 w-4/5 rounded' />
				</div>
			))}
		</div>
	)
}

export function FlowHome() {
	const { items, loading } = useBlogIndex()
	const { categories } = useCategories()
	const [active, setActive] = useState<string>(ALL)

	const { featured, rest, counts } = useMemo(() => {
		const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		const first = sorted.find(item => item.cover) ?? sorted[0]
		const remaining = sorted.filter(item => item.slug !== first?.slug)

		const counts = new Map<string, number>()
		for (const item of sorted) {
			const key = item.category?.trim() || '未分类'
			counts.set(key, (counts.get(key) ?? 0) + 1)
		}

		return { featured: first, rest: remaining, counts }
	}, [items])

	const filters = useMemo(() => {
		const fromData = Array.from(new Set(items.map(item => item.category?.trim() || '未分类')))
		const ordered = [...categories.map(c => c.trim()).filter(Boolean), ...fromData].filter((value, index, array) => array.indexOf(value) === index)
		// 只显示确实有文章的分类，否则会出现一堆「0 篇」的空标签
		return ordered.filter(value => (counts.get(value) ?? 0) > 0)
	}, [items, categories, counts])

	const visible = active === ALL ? rest : rest.filter(item => (item.category?.trim() || '未分类') === active)

	/**
	 * 首页顶部的联系方式，直接读 site-content.json 里配置好的社交按钮 ——
	 * 和桌面模式的「联系」卡片同一份数据。以前这里写死了 GitHub 地址（还是模板作者的），
	 * 用户改了卡片上的账户，文章流这边对不上。
	 */
	type SocialLink = { key: string; href?: string; copy?: string; label: string; icon: ReactNode }

	// 展示顺序固定为 GitHub → bilibili → 邮箱 → RSS，不跟配置里的 order 走
	const ORDER: Record<string, number> = { github: 0, bilibili: 1, email: 2 }

	const socialLinks: SocialLink[] = []
	for (const button of [...(siteContent.socialButtons ?? [])].sort((a, b) => (ORDER[a.type] ?? 9) - (ORDER[b.type] ?? 9))) {
		const value = (button.value || '').trim()
		// value 是本地图片路径的（比如二维码）不是链接，跳过
		if (!value || value.startsWith('/')) continue

		const isEmail = button.type === 'email' || value.includes('@')

		socialLinks.push({
			key: button.id,
			// 邮箱不跳 mailto（会弹出系统邮件客户端），改成复制到剪贴板
			...(isEmail ? { copy: value, label: button.label?.trim() || '邮箱' } : { href: value, label: button.label?.trim() || button.type }),
			icon: isEmail ? (
				<Mail className='size-3.5' aria-hidden />
			) : button.type === 'github' ? (
				<Github className='size-3.5' aria-hidden />
			) : (
				<LinkIcon className='size-3.5' aria-hidden />
			)
		})
	}
	socialLinks.push({ key: 'rss', href: '/rss.xml', label: 'RSS', icon: <Rss className='size-3.5' aria-hidden /> })

	const chipClass =
		'border-hair bg-surface text-ink2 hover:border-brand/40 hover:text-brand-ink inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-[border-color,color,transform] hover:-translate-y-px'

	const copyEmail = async (email: string) => {
		try {
			await navigator.clipboard.writeText(email)
			toast.success(`已复制 ${email}`)
		} catch {
			toast.error('复制失败，请手动选择')
		}
	}

	return (
		<div data-flow-home>
			<Container>
				{/* Hero */}
				<section className='max-w-[716px] pt-16 pb-12 sm:pt-20 sm:pb-14'>
					<div className='text-faint mb-5 flex items-center gap-2 font-mono text-[11.5px] tracking-[0.14em] uppercase'>
						<span className='bg-hair2 block h-px w-5' />
						{siteContent.meta.username} · 个人博客
					</div>

					<h1 className='text-ink mb-4 text-[34px] leading-[1.18] font-semibold tracking-[-0.028em] sm:text-[44px]'>
						写点代码，
						<br />
						也记点
						<span className='from-brand to-brand-secondary bg-gradient-to-r bg-clip-text text-transparent'>想明白的事</span>。
					</h1>

					<p className='text-muted max-w-[56ch] text-[15px] leading-[1.75] sm:text-base'>{siteContent.meta.description}</p>

					<div className='mt-6 flex flex-wrap items-center gap-2.5'>
						{socialLinks.map(link =>
							link.copy ? (
								<button key={link.key} type='button' onClick={() => copyEmail(link.copy!)} className={chipClass} title={link.copy}>
									{link.icon}
									{link.label}
								</button>
							) : (
								<a
									key={link.key}
									href={link.href}
									target={link.href?.startsWith('/') ? undefined : '_blank'}
									rel='noreferrer'
									className={chipClass}>
									{link.icon}
									{link.label}
								</a>
							)
						)}
					</div>
				</section>

				{/* 精选 */}
				{featured && (
					<section className='mb-14'>
						<SectionHead title='精选' />
						<FeaturedPost item={featured} />
					</section>
				)}

				{/* 归档 */}
				<section className='pb-4'>
					<SectionHead title='全部文章' />

					{filters.length > 0 && (
						<div className='mb-2 flex flex-wrap gap-1.5' role='group' aria-label='按分类筛选'>
							<FilterChip label={`全部 ${items.length}`} active={active === ALL} onClick={() => setActive(ALL)} />
							{filters.map(filter => (
								<FilterChip
									key={filter}
									label={`${filter} ${counts.get(filter) ?? 0}`}
									active={active === filter}
									onClick={() => setActive(filter)}
								/>
							))}
						</div>
					)}

					{loading && <Skeleton />}

					{!loading && items.length === 0 && (
						<p className='text-muted border-hair border-t py-10 text-center text-sm'>还没有文章</p>
					)}

					<div className='mt-1'>
						{visible.map(item => (
							<PostRow key={item.slug} item={item} />
						))}
					</div>

					{!loading && items.length > 0 && (
						<Link
							href='/blog'
							className='text-brand-ink mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium'>
							查看全部 {items.length} 篇
							<ArrowRight className='size-4 transition-transform duration-150 hover:translate-x-0.5' aria-hidden />
						</Link>
					)}
				</section>
			</Container>
		</div>
	)
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
	return (
		<div className='mb-4 flex items-baseline gap-3'>
			<h2 className='text-faint font-mono text-[12px] font-semibold tracking-[0.13em] uppercase'>{title}</h2>
			<div className='bg-hair h-px flex-1' />
			{action}
		</div>
	)
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
	return (
		<button
			type='button'
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				'rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150',
				active
					? 'border-brand/30 bg-brandsoft text-brand-ink font-medium'
					: 'text-muted hover:bg-surface2 hover:text-ink border-transparent'
			)}>
			{label}
		</button>
	)
}
