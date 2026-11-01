'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * mermaid 图表块。
 *
 * mermaid 压缩后约 300KB，所以只在正文里真的出现 ```mermaid 时才动态 import，
 * 其它文章完全不受影响。
 */

let mermaidModule: any = null
let renderSeq = 0

async function loadMermaid() {
	if (mermaidModule) return mermaidModule
	const mod: any = await import('mermaid')
	mermaidModule = mod?.default ?? mod
	return mermaidModule
}

export function MermaidBlock({ source }: { source: string }) {
	const [svg, setSvg] = useState('')
	const [error, setError] = useState('')
	const [themeVersion, setThemeVersion] = useState(0)
	const idRef = useRef(`mermaid-${++renderSeq}`)

	// 深浅色切换要重新渲染，否则图表的配色会和页面脱节
	useEffect(() => {
		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'data-theme') setThemeVersion(version => version + 1)
			}
		})
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		let cancelled = false

		const run = async () => {
			try {
				const mermaid = await loadMermaid()
				const isDark = document.documentElement.dataset.theme === 'dark'

				mermaid.initialize({
					startOnLoad: false,
					securityLevel: 'strict',
					theme: isDark ? 'dark' : 'default',
					fontFamily: 'inherit'
				})

				// 每次用新 id，避免 mermaid 复用旧图导致的渲染残留
				const id = `${idRef.current}-${themeVersion}`
				const result = await mermaid.render(id, source)
				if (!cancelled) {
					setSvg(result?.svg || '')
					setError('')
				}
			} catch (err: any) {
				if (!cancelled) {
					setSvg('')
					setError(err?.message ? String(err.message).split('\n')[0] : '图表渲染失败')
				}
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [source, themeVersion])

	if (error) {
		return (
			<div className='mermaid-block'>
				<pre data-code={source}>
					<code>{source}</code>
				</pre>
				<p className='mermaid-error'>图表语法有误：{error}</p>
			</div>
		)
	}

	return (
		<div className='mermaid-block'>
			{svg ? (
				<div className='mermaid-svg' dangerouslySetInnerHTML={{ __html: svg }} />
			) : (
				<div className='mermaid-loading'>图表渲染中…</div>
			)}
		</div>
	)
}
