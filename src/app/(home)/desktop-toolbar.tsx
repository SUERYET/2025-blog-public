'use client'

import { LayoutList, Moon, Settings2, Sun } from 'lucide-react'
import { useThemeStore } from '@/hooks/use-theme'
import { useHomeViewStore } from './stores/view-store'
import { useConfigStore } from './stores/config-store'

/**
 * 桌面模式的浮动工具条。
 *
 * 桌面模式是全屏画布，不渲染 SiteShell（顶栏），所以顶栏上的「视图切换 / 主题切换」
 * 在这里必须另给一份，否则切进来就出不去了。
 */
export function DesktopToolbar() {
	const { theme, toggle } = useThemeStore()
	const setView = useHomeViewStore(state => state.setView)
	const setConfigDialogOpen = useConfigStore(state => state.setConfigDialogOpen)

	return (
		<div className='border-hair fixed top-4 right-4 z-[70] flex items-center gap-0.5 rounded-full border bg-[var(--glass)] p-1 shadow-[var(--shadow-md)] backdrop-blur-xl sm:top-6 sm:right-6'>
			<button
				type='button'
				onClick={() => setView('flow')}
				className='text-ink2 hover:bg-surface2 hover:text-ink flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150'
				title='切换回文章流'>
				<LayoutList className='size-3.5' aria-hidden />
				文章流
			</button>

			<span className='bg-hair mx-0.5 h-4 w-px' aria-hidden />

			<button
				type='button'
				onClick={toggle}
				aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
				className='text-ink2 hover:bg-surface2 hover:text-ink grid size-8 place-items-center rounded-full transition-colors duration-150'>
				{theme === 'dark' ? <Sun className='size-4' aria-hidden /> : <Moon className='size-4' aria-hidden />}
			</button>

			<button
				type='button'
				onClick={() => setConfigDialogOpen(true)}
				aria-label='打开站点设置'
				title='站点设置（Ctrl + ,）'
				className='text-ink2 hover:bg-surface2 hover:text-ink grid size-8 place-items-center rounded-full transition-colors duration-150'>
				<Settings2 className='size-4' aria-hidden />
			</button>
		</div>
	)
}
