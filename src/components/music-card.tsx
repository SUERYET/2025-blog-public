'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { Pause } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const MUSIC_LIST = [
	{ file: '/music/M1.mp3', title: '花与剑的轮舞 Rondeau des fleurs et des rapieres' },
	{ file: '/music/M2.mp3', title: '欢荣的奇秘 Magick Without Tears' },
	{ file: '/music/M3.mp3', title: '水仙的茶会 Nymphs` Tea Party' },
	{ file: '/music/M4.mp3', title: '水仙十字安眠曲 A Narcissus Lullaby' }
]

export default function MusicCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const [isPlaying, setIsPlaying] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const [showPlaylist, setShowPlaylist] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const currentIndexRef = useRef(0)

	const isHomePage = pathname === '/'

	const position = useMemo(() => {
		const expandedHeight = showPlaylist ? styles.height + MUSIC_LIST.length * 44 + 24 : styles.height

		// If playlist is shown or not on home page, position at bottom-right corner
		if (showPlaylist || (!isHomePage && isPlaying)) {
			return {
				x: center.width - styles.width - 16,
				y: center.height - expandedHeight - 16
			}
		}

		// Default position on home page
		return {
			x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
			y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
		}
	}, [showPlaylist, isPlaying, isHomePage, center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

	const { x, y } = position

	// Initialize audio element
	useEffect(() => {
		if (!audioRef.current) {
			audioRef.current = new Audio()
		}

		const audio = audioRef.current

		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100)
				setCurrentTime(audio.currentTime)
				setDuration(audio.duration)
			}
		}

		const handleEnded = () => {
			const nextIndex = (currentIndexRef.current + 1) % MUSIC_LIST.length
			currentIndexRef.current = nextIndex
			setCurrentIndex(nextIndex)
			setProgress(0)
		}

		const handleTimeUpdate = () => {
			updateProgress()
		}

		const handleLoadedMetadata = () => {
			updateProgress()
		}

		audio.addEventListener('timeupdate', handleTimeUpdate)
		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('loadedmetadata', handleLoadedMetadata)

		return () => {
			audio.removeEventListener('timeupdate', handleTimeUpdate)
			audio.removeEventListener('ended', handleEnded)
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
		}
	}, [])

	// Handle currentIndex change - load new audio
	useEffect(() => {
		currentIndexRef.current = currentIndex
		if (audioRef.current) {
			const wasPlaying = !audioRef.current.paused
			audioRef.current.pause()
			audioRef.current.src = MUSIC_LIST[currentIndex].file
			audioRef.current.loop = false
			setProgress(0)

			if (wasPlaying) {
				audioRef.current.play().catch(console.error)
			}
		}
	}, [currentIndex])

	// Handle play/pause state change
	useEffect(() => {
		if (!audioRef.current) return

		if (isPlaying) {
			audioRef.current.play().catch(console.error)
		} else {
			audioRef.current.pause()
		}
	}, [isPlaying])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current.src = ''
			}
		}
	}, [])
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = Math.floor(seconds % 60)
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying)
	}

	const selectTrack = (index: number) => {
		setCurrentIndex(index)
		setIsPlaying(true)
		setShowPlaylist(false)
	}

	// Hide component if not on home page and not playing
	if (!isHomePage && !isPlaying) {
		return null
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card
				order={styles.order}
				width={styles.width}
				height={showPlaylist ? styles.height + MUSIC_LIST.length * 44 + 24 : styles.height}
				x={x}
				y={y}
				className={clsx(!isHomePage && 'fixed')}>
				<div className={clsx('flex h-full flex-col', showPlaylist ? 'justify-start p-4' : 'items-center justify-center')}>
					{siteContent.enableChristmas && (
						<>
							<img
								src='/images/christmas/snow-10.webp'
								alt='Christmas decoration'
								className='pointer-events-none absolute'
								style={{ width: 120, left: -8, top: -12, opacity: 0.8 }}
							/>
							<img
								src='/images/christmas/snow-11.webp'
								alt='Christmas decoration'
								className='pointer-events-none absolute'
								style={{ width: 80, right: -10, top: -12, opacity: 0.8 }}
							/>
						</>
					)}

					<div className='flex w-full cursor-pointer items-center gap-3' onClick={() => setShowPlaylist(!showPlaylist)}>
						<MusicSVG className='h-8 w-8 flex-shrink-0' />

						<div className='min-w-0 flex-1'>
							<div className='text-secondary truncate text-sm'>{MUSIC_LIST[currentIndex].title}</div>

							<div className='mt-1 h-2 rounded-full bg-white/60'>
								<div className='bg-linear h-full rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
							</div>

							{duration > 0 && (
								<div className='text-secondary/70 mt-1 text-xs'>
									{formatTime(currentTime)} / {formatTime(duration)}
								</div>
							)}
						</div>

						<button
							onClick={e => {
								e.stopPropagation()
								togglePlayPause()
							}}
							className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
							{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <PlaySVG className='text-brand ml-1 h-4 w-4' />}
						</button>
					</div>
					{showPlaylist && (
						<div className='mt-3 w-full space-y-1'>
							{MUSIC_LIST.map((track, index) => (
								<div
									key={index}
									onClick={() => selectTrack(index)}
									className={clsx(
										'cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors',
										currentIndex === index ? 'text-brand bg-white/40 font-medium' : 'text-secondary hover:bg-white/20'
									)}>
									{track.title}
								</div>
							))}
						</div>
					)}
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
