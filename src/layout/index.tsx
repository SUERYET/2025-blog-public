'use client'
import { PropsWithChildren } from 'react'
import { usePathname } from 'next/navigation'
import { useCenterInit } from '@/hooks/use-center'
import BlurredBubblesBackground from './backgrounds/blurred-bubbles'
import NavCard from '@/components/nav-card'
import { Toaster } from 'sonner'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { useSize, useSizeInit } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { ScrollTopButton } from '@/components/scroll-top-button'
import MusicCard from '@/components/music-card'
import { SiteShell } from '@/components/site-shell'
import { useThemeInit } from '@/hooks/use-theme'
import { useHomeViewInit, useHomeViewStore } from '@/app/(home)/stores/view-store'

export default function Layout({ children }: PropsWithChildren) {
	useCenterInit()
	useSizeInit()
	useThemeInit()
	useHomeViewInit()

	const pathname = usePathname()
	const view = useHomeViewStore(state => state.view)
	const { cardStyles, siteContent, regenerateKey } = useConfigStore()
	const { maxSM, init } = useSize()

	/** 桌面模式是「全屏画布」，不吃顶栏/页脚/气泡背景 */
	const isDesktopHome = pathname === '/' && view === 'desktop'

	const backgroundImages = (siteContent.backgroundImages ?? []) as Array<{ id: string; url: string }>
	const currentBackgroundImageId = siteContent.currentBackgroundImageId
	const currentBackgroundImage =
		currentBackgroundImageId && currentBackgroundImageId.trim() ? backgroundImages.find(item => item.id === currentBackgroundImageId) : null

	return (
		<>
			<Toaster
				position='bottom-right'
				richColors
				icons={{
					success: <CircleCheckIcon className='size-4' />,
					info: <InfoIcon className='size-4' />,
					warning: <TriangleAlertIcon className='size-4' />,
					error: <OctagonXIcon className='size-4' />,
					loading: <Loader2Icon className='size-4 animate-spin' />
				}}
				style={
					{
						'--border-radius': '12px'
					} as React.CSSProperties
				}
			/>

			{isDesktopHome && currentBackgroundImage && (
				<div
					className='fixed inset-0 z-0 overflow-hidden'
					style={{
						backgroundImage: `url(${currentBackgroundImage.url})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
				/>
			)}

			{isDesktopHome && <BlurredBubblesBackground colors={siteContent.backgroundColors} regenerateKey={regenerateKey} />}

			<main className='relative z-10 min-h-[100dvh]'>
				{isDesktopHome ? (
					<>
						{children}
						<NavCard />
						{!maxSM && cardStyles.musicCard?.enabled !== false && <MusicCard />}
					</>
				) : (
					<SiteShell>{children}</SiteShell>
				)}
			</main>

			{maxSM && init && <ScrollTopButton className='bg-brand/20 fixed right-6 bottom-8 z-50 shadow-md' />}
		</>
	)
}
