'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
	BookOpen,
	Clock,
	Github,
	Grid2x2,
	Image as ImageIcon,
	LayoutList,
	Link2,
	Mail,
	Menu as MenuIcon,
	Moon,
	Rss,
	Shapes,
	Sparkles,
	Sun,
	Wand2,
	X
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import siteContent from '@/config/site-content.json'
import { IconButton } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { Menu } from '@/components/ui/menu'
import { Container } from '@/components/ui/container'
import { useThemeStore } from '@/hooks/use-theme'
import { useHomeViewStore, type HomeView } from '@/app/(home)/stores/view-store'
import { MusicPlayer } from '@/components/music-player'
import { buildSocialLinks } from '@/lib/social-links'

const PRIMARY_NAV = [
	{ href: '/blog', label: '文章' },
	{ href: '/projects', label: '项目' },
	{ href: '/about', label: '关于' },
	{ href: '/share', label: '分享' },
	{ href: '/bloggers', label: '博客' }
]

const MORE_ITEMS = [
	{ href: '/tags', label: '标签', hint: 'tags' },
	{ href: '/write', label: '写文章', hint: 'write' },
	{ href: '/snippets', label: '一句话', hint: 'snippets' },
	{ href: '/pictures', label: '图集', hint: 'pictures' },
	{ href: '/image-toolbox', label: '图片工具箱', hint: 'toolbox' },
	{ href: '/clock', label: '时钟', hint: 'clock' },
	{ href: '/svgs', label: '图标库', hint: 'svgs' },
	{ href: '/live2d', label: 'Live2D', hint: 'live2d' },
	{ href: '/wuthering-waves', label: '鸣潮抽卡', hint: 'wuwa' }
]

const MOBILE_ONLY_ICONS: Record<string, typeof Clock> = {
	'/write': Sparkles,
	'/snippets': BookOpen,
	'/pictures': ImageIcon,
	'/image-toolbox': Wand2,
	'/clock': Clock,
	'/svgs': Shapes,
	'/live2d': Sparkles,
	'/wuthering-waves': Sparkles
}

function Logo() {
	return (
		<Link href='/' className='flex items-center gap-2.5' aria-label='返回首页'>
			<Image src='/images/avatar.png' alt='' width={28} height={28} className='rounded-[9px]' />
			<span className='text-ink text-[15px] font-semibold tracking-tight'>{siteContent.meta.username || 'Blog'}</span>
		</Link>
	)
}

function ThemeToggle() {
	const { theme, toggle } = useThemeStore()
	return (
		<IconButton aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'} onClick={toggle}>
			{theme === 'dark' ? <Sun /> : <Moon />}
		</IconButton>
	)
}

/** 顶栏实时时钟：避免 hydration 不一致，首帧留空、挂载后再走 */
function LiveClock() {
	const [now, setNow] = useState<Date | null>(null)

	useEffect(() => {
		const tick = () => setNow(new Date())
		tick()
		const timer = window.setInterval(tick, 1000)
		return () => window.clearInterval(timer)
	}, [])

	const text = now ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}` : '--:--:--'

	return (
		<time
			dateTime={now?.toISOString()}
			className='text-faint w-[52px] text-right font-mono text-[12px] tabular-nums max-md:hidden'
			title='当前时间'>
			{text}
		</time>
	)
}

function ViewToggle({ className }: { className?: string }) {
	const { view, setView } = useHomeViewStore()
	return (
		<Segmented<HomeView>
			label='首页视图'
			value={view}
			onChange={setView}
			className={className}
			options={[
				{ value: 'flow', label: '文章流', icon: <LayoutList aria-hidden /> },
				{ value: 'desktop', label: '桌面', icon: <Grid2x2 aria-hidden /> }
			]}
		/>
	)
}

function MobileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
	const pathname = usePathname()

	useEffect(() => {
		if (!open) return
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = ''
		}
	}, [open, onClose])

	if (!open) return null

	return (
		<div className='fixed inset-0 z-[60] md:hidden'>
			<button aria-label='关闭菜单' className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
			<div className='bg-canvas absolute inset-y-0 right-0 flex w-[82%] max-w-[320px] flex-col overflow-y-auto p-5 shadow-2xl'>
				<div className='mb-6 flex items-center justify-between'>
					<Logo />
					<IconButton aria-label='关闭菜单' onClick={onClose}>
						<X />
					</IconButton>
				</div>

				<nav className='flex flex-col'>
					{PRIMARY_NAV.map(item => (
						<Link
							key={item.href}
							href={item.href}
							onClick={onClose}
							className={cn(
								'rounded-[10px] px-3 py-2.5 text-[15px]',
								pathname === item.href ? 'bg-surface2 text-ink font-medium' : 'text-ink2 hover:bg-surface2'
							)}>
							{item.label}
						</Link>
					))}
				</nav>

				<div className='text-faint mt-6 mb-2 px-3 font-mono text-[10.5px] tracking-[0.13em] uppercase'>更多</div>
				<nav className='flex flex-col'>
					{MORE_ITEMS.map(item => {
						const Icon = MOBILE_ONLY_ICONS[item.href] ?? Sparkles
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={onClose}
								className='text-ink2 hover:bg-surface2 flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[14px]'>
								<Icon className='size-4 opacity-60' aria-hidden />
								{item.label}
							</Link>
						)
					})}
				</nav>

				<div className='border-hair mt-6 flex items-center gap-2 border-t pt-4'>
					<ThemeToggle />
					<ViewToggle />
				</div>
			</div>
		</div>
	)
}

export function SiteHeader() {
	const pathname = usePathname()
	const [scrolled, setScrolled] = useState(false)
	const [sheetOpen, setSheetOpen] = useState(false)
	const isHome = pathname === '/'

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8)
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	return (
		<>
			<header
				className={cn(
					'sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200',
					scrolled ? 'border-hair bg-canvas/85 backdrop-blur-xl' : 'border-transparent bg-canvas/60 backdrop-blur-md'
				)}>
				<Container className='flex h-16 items-center gap-6'>
					<Logo />

					<nav className='ml-1 hidden items-center gap-0.5 md:flex' aria-label='主导航'>
						{PRIMARY_NAV.map(item => {
							const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
							return (
								<Link
									key={item.href}
									href={item.href}
									aria-current={active ? 'page' : undefined}
									className={cn(
										'rounded-[10px] px-3 py-1.5 text-sm transition-colors duration-150',
										active ? 'bg-surface2 text-ink font-medium' : 'text-muted hover:bg-surface2 hover:text-ink'
									)}>
									{item.label}
								</Link>
							)
						})}
						<Menu
							label='更多'
							items={MORE_ITEMS}
						/>
					</nav>

					<div className='ml-auto flex items-center gap-2'>
						<LiveClock />
						{isHome && <ViewToggle className='max-md:hidden' />}
						<div className='max-md:hidden'>
							<ThemeToggle />
						</div>
						<IconButton aria-label='打开导航菜单' className='md:hidden' onClick={() => setSheetOpen(true)}>
							<MenuIcon />
						</IconButton>
					</div>
				</Container>
			</header>

			<MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
		</>
	)
}

export function SiteFooter() {
	const links = buildSocialLinks(siteContent.socialButtons)

	const copyEmail = async (email: string) => {
		try {
			await navigator.clipboard.writeText(email)
			toast.success(`已复制 ${email}`)
		} catch {
			toast.error('复制失败，请手动选择')
		}
	}

	const iconFor = (type: string) =>
		type === 'github' ? <Github className='size-3.5' aria-hidden /> : type === 'rss' ? <Rss className='size-3.5' aria-hidden /> : type === 'email' ? <Mail className='size-3.5' aria-hidden /> : <Link2 className='size-3.5' aria-hidden />

	return (
		<footer className='border-hair mt-20 border-t'>
			<Container className='text-faint flex flex-wrap items-center justify-between gap-4 py-9 text-[13px]'>
				<div>
					© {new Date().getFullYear()} {siteContent.meta.username}
				</div>

				<div className='flex flex-wrap items-center gap-5'>
					{links.map(link =>
						link.copy ? (
							<button
								key={link.key}
								type='button'
								onClick={() => copyEmail(link.copy!)}
								title={link.copy}
								className='hover:text-brand-ink flex items-center gap-1.5 transition-colors'>
								{iconFor(link.type)}
								{link.label}
							</button>
						) : (
							<a
								key={link.key}
								href={link.href}
								target={link.href?.startsWith('/') ? undefined : '_blank'}
								rel='noreferrer'
								className='hover:text-brand-ink flex items-center gap-1.5 transition-colors'>
								{iconFor(link.type)}
								{link.label}
							</a>
						)
					)}
				</div>
			</Container>
		</footer>
	)
}

/** 全站外壳：顶栏 + 内容 + 页脚。主题/视图 store 在 layout 里初始化。 */
export function SiteShell({ children, footer = true }: { children: React.ReactNode; footer?: boolean }) {
	return (
		<>
			<SiteHeader />
			{children}
			{footer && <SiteFooter />}
			<MusicPlayer />
		</>
	)
}
