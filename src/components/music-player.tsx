'use client'

import { useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 站内常驻音乐播放器（右上下方、标题栏之下）。
 *
 * 和桌面模式的 MusicCard 是两套载体：MusicCard 跟着卡片布局定位，
 * 这个只在普通页面出现，固定在右上角。
 * TODO: 曲目表和 music-card.tsx 里的重复了，等那个组件重构时抽成共用常量。
 */
const TRACKS = [
	{ file: '/music/M1.mp3', title: '花与剑的轮舞', subtitle: 'Rondeau des fleurs et des rapieres' },
	{ file: '/music/M2.mp3', title: '欢荣的奇秘', subtitle: 'Magick Without Tears' },
	{ file: '/music/M3.mp3', title: '水仙的茶会', subtitle: 'Nymphs` Tea Party' },
	{ file: '/music/M4.mp3', title: '水仙十字安眠曲', subtitle: 'A Narcissus Lullaby' }
]

export function MusicPlayer() {
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const [index, setIndex] = useState(0)
	const [playing, setPlaying] = useState(false)
	const [open, setOpen] = useState(false)
	const [progress, setProgress] = useState(0)

	const track = TRACKS[index]

	// 音频事件是唯一真相，避免 play() 被浏览器拒绝后按钮状态和实际不一致
	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return

		const onPlay = () => setPlaying(true)
		const onPause = () => setPlaying(false)
		const onTime = () => {
			if (audio.duration) setProgress(audio.currentTime / audio.duration)
		}
		const onEnded = () => {
			const next = (index + 1) % TRACKS.length
			setIndex(next)
			audio.src = TRACKS[next].file
			void audio.play().catch(() => setPlaying(false))
		}

		audio.addEventListener('play', onPlay)
		audio.addEventListener('pause', onPause)
		audio.addEventListener('timeupdate', onTime)
		audio.addEventListener('ended', onEnded)
		return () => {
			audio.removeEventListener('play', onPlay)
			audio.removeEventListener('pause', onPause)
			audio.removeEventListener('timeupdate', onTime)
			audio.removeEventListener('ended', onEnded)
		}
	}, [index])

	const start = async (target: number) => {
		const audio = audioRef.current
		if (!audio) return
		setIndex(target)
		setOpen(false)
		audio.src = TRACKS[target].file
		try {
			await audio.play()
		} catch {
			setPlaying(false)
		}
	}

	const toggle = async () => {
		const audio = audioRef.current
		if (!audio) return
		if (audio.paused) {
			if (!audio.src) audio.src = track.file
			try {
				await audio.play()
			} catch {
				setPlaying(false)
			}
		} else {
			audio.pause()
		}
	}

	const step = (delta: number) => start((index + delta + TRACKS.length) % TRACKS.length)

	return (
		// top 124px：让开页面右上角的「编辑」工具条（它在 78px，高约 36px），
		// 两者都固定在右侧，贴太近会互相盖住
		<div className='fixed top-[124px] right-4 z-40 max-md:hidden sm:right-6'>
			<audio ref={audioRef} preload='none' />

			<div className='border-hair bg-[var(--glass)] overflow-hidden rounded-full border shadow-[var(--shadow-md)] backdrop-blur-xl'>
				<div className='flex items-center gap-1 py-1 pr-1 pl-1.5'>
					<button
						type='button'
						onClick={toggle}
						aria-label={playing ? '暂停' : '播放'}
						className='bg-brand grid size-7 shrink-0 place-items-center rounded-full text-white transition-transform active:scale-95'>
						{playing ? <Pause className='size-3.5' /> : <Play className='ml-0.5 size-3.5' />}
					</button>

					<button
						type='button'
						onClick={() => setOpen(value => !value)}
						aria-expanded={open}
						className='text-ink2 hover:text-ink flex min-w-0 items-center gap-1.5 px-1 text-left transition-colors'>
						<Music2 className='text-faint size-3.5 shrink-0' aria-hidden />
						<span className='max-w-[112px] truncate text-[12.5px]'>{track.title}</span>
					</button>

					<button
						type='button'
						onClick={() => step(-1)}
						aria-label='上一首'
						className='text-faint hover:text-ink grid size-6 place-items-center rounded-full transition-colors'>
						<SkipBack className='size-3' />
					</button>
					<button
						type='button'
						onClick={() => step(1)}
						aria-label='下一首'
						className='text-faint hover:text-ink grid size-6 place-items-center rounded-full transition-colors'>
						<SkipForward className='size-3' />
					</button>
				</div>

				{/* 进度条贴在胶囊底部 */}
				<div aria-hidden className='bg-hair h-0.5 w-full'>
					<div className='bg-brand h-full origin-left' style={{ transform: `scaleX(${progress})`, transition: 'transform 200ms linear' }} />
				</div>
			</div>

			{open && (
				<div className='border-hair bg-surface absolute right-0 mt-2 w-[240px] overflow-hidden rounded-[14px] border shadow-[var(--shadow-lg)] backdrop-blur-xl'>
					{TRACKS.map((item, i) => (
						<button
							key={item.file}
							type='button'
							onClick={() => start(i)}
							className={cn(
								'flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors',
								i === index ? 'bg-brandsoft' : 'hover:bg-surface2'
							)}>
							<span className={cn('text-[13px]', i === index ? 'text-brand-ink font-medium' : 'text-ink2')}>{item.title}</span>
							<span className='text-faint truncate font-mono text-[10.5px]'>{item.subtitle}</span>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
