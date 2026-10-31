'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { pushAbout, type AboutData } from './services/push-about'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { EditToolbar } from '@/components/edit-toolbar'
import LikeButton from '@/components/like-button'
import { Github } from 'lucide-react'
import initialData from './list.json'

export default function Page() {
	const [data, setData] = useState<AboutData>(initialData as AboutData)
	const [originalData, setOriginalData] = useState<AboutData>(initialData as AboutData)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPreviewMode, setIsPreviewMode] = useState(false)

	const { siteContent } = useConfigStore()
	const { content, loading } = useMarkdownRender(data.content)
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleEnterEditMode = () => {
		setIsEditMode(true)
		setIsPreviewMode(false)
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushAbout(data)

			setOriginalData(data)
			setIsEditMode(false)
			setIsPreviewMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setData(originalData)
		setIsEditMode(false)
		setIsPreviewMode(false)
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
				setIsPreviewMode(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<>
			<EditToolbar
				editing={isEditMode}
				saving={isSaving}
				hideEditButton={hideEditButton}
				onEdit={handleEnterEditMode}
				onCancel={handleCancel}
				onSave={handleSave}
				extra={
					<Button size='sm' onClick={() => setIsPreviewMode(prev => !prev)} disabled={isSaving}>
						{isPreviewMode ? '继续编辑' : '预览'}
					</Button>
				}
			/>

			<Container className='pb-20'>
				<div className='mx-auto w-full max-w-[716px] pt-14'>
					{/* 标题区：编辑态下直接可改 */}
					<header className='mb-10'>
						<div className='text-faint mb-4 flex items-center gap-2 font-mono text-[11.5px] tracking-[0.14em] uppercase'>
							<span className='bg-hair2 block h-px w-5' />
							关于
						</div>

						{isEditMode && !isPreviewMode ? (
							<div className='space-y-3'>
								<input
									type='text'
									placeholder='标题'
									aria-label='标题'
									className='text-ink border-hair bg-surface2 w-full rounded-[12px] border px-4 py-3 text-[28px] font-semibold tracking-[-0.02em]'
									value={data.title}
									onChange={e => setData({ ...data, title: e.target.value })}
								/>
								<input
									type='text'
									placeholder='描述'
									aria-label='描述'
									className='text-ink2 border-hair bg-surface2 w-full rounded-[12px] border px-4 py-2.5 text-[15px]'
									value={data.description}
									onChange={e => setData({ ...data, description: e.target.value })}
								/>
							</div>
						) : (
							<>
								<h1 className='text-ink mb-3 text-[32px] font-semibold tracking-[-0.028em] sm:text-[38px]'>
									{data.title || '标题预览'}
								</h1>
								<p className='text-muted text-[15px]'>{data.description || '描述预览'}</p>
							</>
						)}
					</header>

					{isEditMode && !isPreviewMode ? (
						<textarea
							placeholder='Markdown 内容'
							aria-label='Markdown 内容'
							className='border-hair bg-surface2 min-h-[460px] w-full resize-none rounded-[14px] border p-5 font-mono text-[13.5px] leading-[1.8]'
							value={data.content}
							onChange={e => setData({ ...data, content: e.target.value })}
						/>
					) : loading ? (
						<div className='space-y-3'>
							{[0, 1, 2, 3, 4].map(index => (
								<div key={index} className='bg-surface2 h-4 animate-pulse rounded' style={{ width: `${92 - index * 6}%` }} />
							))}
						</div>
					) : (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='prose'>
							{content}
						</motion.div>
					)}

					<footer className='border-hair mt-14 flex items-center justify-between gap-4 border-t pt-8'>
						<div className='flex flex-wrap items-center gap-3'>
							<a
								href='https://github.com/SUERYET/2025-blog-public'
								target='_blank'
								rel='noreferrer'
								className='border-hair bg-surface text-ink2 hover:border-brand/40 hover:text-brand-ink inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-colors'>
								<Github className='size-4' aria-hidden />
								GitHub 开源仓库
							</a>
							<span className='text-faint text-[12.5px]'>这个站的所有代码和内容都在上面</span>
						</div>
						<LikeButton slug='open-source' delay={0} />
					</footer>
				</div>
			</Container>
		</>
	)
}
