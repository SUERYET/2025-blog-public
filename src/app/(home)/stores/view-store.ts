'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

export type HomeView = 'flow' | 'desktop'

const STORAGE_KEY = 'home-view'

type ViewStore = {
	view: HomeView
	mounted: boolean
	setView: (view: HomeView) => void
	sync: () => void
}

export const useHomeViewStore = create<ViewStore>(set => ({
	view: 'flow',
	mounted: false,

	setView: view => {
		if (typeof document !== 'undefined') document.documentElement.dataset.view = view
		try {
			localStorage.setItem(STORAGE_KEY, view)
		} catch {
			/* 忽略 */
		}
		set({ view, mounted: true })
	},

	sync: () => {
		if (typeof window === 'undefined') return
		let stored: string | null = null
		try {
			stored = localStorage.getItem(STORAGE_KEY)
		} catch {
			stored = null
		}
		set({ view: stored === 'desktop' ? 'desktop' : 'flow', mounted: true })
	}
}))

export function useHomeViewInit() {
	useEffect(() => {
		useHomeViewStore.getState().sync()
	}, [])
}
