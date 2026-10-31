import '@/styles/globals.css'

import type { Metadata } from 'next'
import Layout from '@/layout'
import Head from '@/layout/head'
import siteContent from '@/config/site-content.json'

const {
	meta: { title, description }
} = siteContent

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description
	},
	twitter: {
		title,
		description
	}
}

/**
 * 主题初始化：必须在首帧之前跑，否则深色模式会闪白。
 * 优先级：手动选择 > 跟随系统。
 */
const THEME_INIT = `
(function(){
	try {
		var stored = localStorage.getItem('theme');
		var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
		document.documentElement.dataset.theme = theme;
	} catch (e) {
		document.documentElement.dataset.theme = 'light';
	}
	if (/windows|win32/i.test(navigator.userAgent)) {
		document.documentElement.classList.add('windows');
	}
})();
`

const VIEW_INIT = `
(function(){
	try {
		var stored = localStorage.getItem('home-view');
		document.documentElement.dataset.view = stored === 'desktop' ? 'desktop' : 'flow';
	} catch (e) {
		document.documentElement.dataset.view = 'flow';
	}
})();
`

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='zh-CN' suppressHydrationWarning>
			<Head />

			<body>
				{/* 首帧前决定主题/视图，避免闪白和视图闪烁 */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT + VIEW_INIT }} />
				<Layout>{children}</Layout>
			</body>
		</html>
	)
}
