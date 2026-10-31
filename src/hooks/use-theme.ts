'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

export type Theme = 'light' | 'dark'

type ThemeStore = {
	theme: Theme
	/** 用户是否手动选过；没选过就跟随系统 */
	isManual: boolean
	mounted: boolean
	setTheme: (theme: Theme, manual?: boolean) => void
	toggle: () => void
	sync: () => void
}

const STORAGE_KEY = 'theme'

function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return
	const root = document.documentElement
	root.dataset.theme = theme
	// 只在切换瞬间开颜色过渡，首屏不做动画
	root.classList.add('theme-transition')
	window.setTimeout(() => root.classList.remove('theme-transition'), 240)
}

export const useThemeStore = create<ThemeStore>(set => ({
	theme: 'light',
	isManual: false,
	mounted: false,

	setTheme: (theme, manual = true) => {
		applyTheme(theme)
		if (manual) {
			try {
				localStorage.setItem(STORAGE_KEY, theme)
			} catch {
				/* 隐私模式忽略 */
			}
		}
		set({ theme, isManual: manual ? true : useThemeStore.getState().isManual })
	},

	toggle: () => {
		const next: Theme = useThemeStore.getState().theme === 'dark' ? 'light' : 'dark'
		useThemeStore.getState().setTheme(next, true)
	},

	/** 与首帧脚本结果对齐，避免 hydration 不一致 */
	sync: () => {
		if (typeof window === 'undefined') return
		const current = (document.documentElement.dataset.theme as Theme) || 'light'
		let stored: string | null = null
		try {
			stored = localStorage.getItem(STORAGE_KEY)
		} catch {
			stored = null
		}
		set({ theme: current, isManual: stored === 'light' || stored === 'dark', mounted: true })
	}
}))

/**
 * 在 SiteShell 里调用一次：
 * 1. 首次挂载时把 store 和 DOM 对齐
 * 2. 用户没手动选过时，跟随系统切换
 */
export function useThemeInit() {
	useEffect(() => {
		// 先与首帧脚本的结果对齐（这里会写入 isManual）
		useThemeStore.getState().sync()

		const media = window.matchMedia('(prefers-color-scheme: dark)')

		// 只有用户没手动选过时才跟随系统变化。
		// 注意：必须每次重新读 store，不能用 useEffect 一开始解构出来的旧值 —— 那是 sync 之前的快照。
		const onChange = (event: MediaQueryListEvent) => {
			const state = useThemeStore.getState()
			if (state.isManual) return
			state.setTheme(event.matches ? 'dark' : 'light', false)
		}

		media.addEventListener('change', onChange)
		return () => media.removeEventListener('change', onChange)
	}, [])
}
