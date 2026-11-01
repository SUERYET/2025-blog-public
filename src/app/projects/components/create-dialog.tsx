'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ImagePlus, Link2, Loader2, Plus, Sparkles } from 'lucide-react'
import ImageUploadDialog, { type ImageItem } from './image-upload-dialog'
import type { Project } from './project-card'
import { DialogModal } from '@/components/dialog-modal'
import { cn } from '@/lib/utils'

interface CreateDialogProps {
	project: Project | null
	onClose: () => void
	/** 第二个参数是该项目的封面文件，页面层要登记进 imageItems，否则提交时不会上传图片 */
	onSave: (project: Project, imageItem?: ImageItem) => void
}

/** 补全协议，方便用户只输 example.com */
function normalizeUrl(raw: string) {
	const value = raw.trim()
	if (!value) return ''
	return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function validateUrl(raw: string) {
	const value = raw.trim()
	if (!value) return ''
	try {
		const url = new URL(normalizeUrl(value))
		if (!/^https?:$/.test(url.protocol)) return '只支持 http / https 链接'
		if (!url.hostname.includes('.')) return '域名看起来不完整'
		return ''
	} catch {
		return '链接格式不对，例如 https://example.com'
	}
}

/** 用 Google 的 favicon 服务，比直接猜 /favicon.ico 命中率高得多 */
function faviconOf(raw: string) {
	try {
		const url = new URL(normalizeUrl(raw))
		return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`
	} catch {
		return ''
	}
}

const emptyForm: Project = {
	name: '',
	year: new Date().getFullYear(),
	image: '',
	url: '',
	description: '',
	tags: [],
	github: undefined,
	npm: undefined
}

export default function CreateDialog({ project, onClose, onSave }: CreateDialogProps) {
	const [formData, setFormData] = useState<Project>(emptyForm)
	const [tagsInput, setTagsInput] = useState('')
	const [showImageDialog, setShowImageDialog] = useState(false)
	const [coverItem, setCoverItem] = useState<ImageItem | undefined>(undefined)
	const [dragging, setDragging] = useState(false)
	const [fetchingIcon, setFetchingIcon] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (project) {
			setFormData(project)
			setTagsInput(project.tags.join(', '))
			setCoverItem(undefined)
		} else {
			setFormData({ ...emptyForm, year: new Date().getFullYear() })
			setTagsInput('')
			setCoverItem(undefined)
		}
	}, [project])

	const urlError = useMemo(() => validateUrl(formData.url), [formData.url])

	const patch = (updates: Partial<Project>) => setFormData(prev => ({ ...prev, ...updates }))

	/** 接手一个本地文件，做成本地预览 + 记录到 coverItem，提交时一起上传 */
	const acceptFile = (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('请选择图片文件')
			return
		}
		const item: ImageItem = {
			type: 'file',
			file,
			previewUrl: URL.createObjectURL(file)
		}
		setCoverItem(item)
		patch({ image: item.previewUrl })
	}

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault()
		setDragging(false)
		const file = event.dataTransfer.files?.[0]
		if (file) acceptFile(file)
	}

	const handleUrlBlur = () => {
		const normalized = normalizeUrl(formData.url)
		if (normalized && normalized !== formData.url) patch({ url: normalized })

		// 没设封面时自动抓站点图标
		if (!formData.image.trim() && !validateUrl(normalized)) {
			const icon = faviconOf(normalized)
			if (icon) patch({ image: icon })
		}
	}

	const handleFetchIcon = () => {
		if (urlError) {
			toast.error('先把项目链接填对')
			return
		}
		const icon = faviconOf(formData.url)
		if (!icon) {
			toast.error('抓不到图标')
			return
		}
		setFetchingIcon(true)
		patch({ image: icon })
		setCoverItem(undefined)
		window.setTimeout(() => setFetchingIcon(false), 400)
		toast.success('已用站点图标作为封面')
	}

	const handleTagsChange = (value: string) => {
		setTagsInput(value)
		patch({
			tags: value
				.split(',')
				.map(tag => tag.trim())
				.filter(Boolean)
		})
	}

	const handleSubmit = () => {
		if (!formData.name.trim()) return toast.error('请填写项目名称')
		if (!formData.description.trim()) return toast.error('请写一句项目介绍')
		if (urlError) return toast.error(urlError)
		if (!formData.url.trim()) return toast.error('请填写项目链接')
		if (!formData.image.trim()) return toast.error('请选择封面，或点「抓取站点图标」')
		if (formData.tags.length === 0) return toast.error('请至少添加一个标签')

		onSave({ ...formData, url: normalizeUrl(formData.url) }, coverItem)
		onClose()
		toast.success(project ? '更新成功' : '添加成功')
	}

	return (
		<DialogModal open onClose={onClose} className='card static w-md max-sm:w-full' label='添加项目'>
			<div>
				<div className='flex items-start gap-4'>
					{/* 封面：点击选图，也可以直接把图片拖进来 */}
					<div
						role='button'
						tabIndex={0}
						onClick={() => fileInputRef.current?.click()}
						onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
						onDragOver={e => {
							e.preventDefault()
							setDragging(true)
						}}
						onDragLeave={() => setDragging(false)}
						onDrop={handleDrop}
						aria-label='上传项目封面'
						className={cn(
							'group border-hair bg-surface2 relative grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-[16px] border border-dashed transition-colors',
							dragging ? 'border-brand bg-brandsoft' : 'hover:border-hair2'
						)}>
						{formData.image ? (
							<>
								<img src={formData.image} alt='' className='size-full object-cover' />
								<span className='bg-canvas/70 absolute inset-0 grid place-items-center text-[11px] opacity-0 transition-opacity group-hover:opacity-100'>
									更换
								</span>
							</>
						) : (
							<div className='text-faint flex flex-col items-center gap-1'>
								<ImagePlus className='size-5' aria-hidden />
								<span className='text-[10.5px]'>拖入 / 点击</span>
							</div>
						)}

						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							className='hidden'
							onChange={e => {
								const file = e.target.files?.[0]
								if (file) acceptFile(file)
								if (e.currentTarget) e.currentTarget.value = ''
							}}
						/>
					</div>

					<div className='min-w-0 flex-1'>
						<input
							type='text'
							value={formData.name}
							onChange={e => patch({ name: e.target.value })}
							placeholder='项目名称'
							aria-label='项目名称'
							className='w-full text-lg font-bold focus:outline-none'
						/>

						<div className='mt-2 flex items-center gap-2'>
							<input
								type='number'
								value={formData.year || ''}
								onChange={e => patch({ year: parseInt(e.target.value) || 0 })}
								placeholder='年份'
								aria-label='年份'
								className='border-hair bg-surface2 w-[76px] rounded-lg border px-2 py-1 text-xs focus:outline-none'
							/>
							<input
								type='text'
								value={formData.url}
								onChange={e => patch({ url: e.target.value })}
								onBlur={handleUrlBlur}
								placeholder='example.com 或 https://…'
								aria-label='项目链接'
								aria-invalid={Boolean(urlError)}
								className={cn(
									'min-w-0 flex-1 rounded-lg border bg-surface2 px-2.5 py-1 text-xs focus:outline-none',
									urlError ? 'border-red-400' : 'border-hair'
								)}
							/>
						</div>

						{urlError && <p className='mt-1 text-[11px] text-red-500'>{urlError}</p>}

						<div className='mt-2 flex flex-wrap gap-1.5'>
							<button
								type='button'
								onClick={handleFetchIcon}
								className='text-muted hover:text-brand-ink border-hair hover:border-brand/40 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] transition-colors'>
								{fetchingIcon ? <Loader2 className='size-3 animate-spin' aria-hidden /> : <Sparkles className='size-3' aria-hidden />}
								抓取站点图标
							</button>
							<button
								type='button'
								onClick={() => setShowImageDialog(true)}
								className='text-muted hover:text-brand-ink border-hair hover:border-brand/40 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] transition-colors'>
								<Link2 className='size-3' aria-hidden />
								用图片链接
							</button>
						</div>
					</div>
				</div>

				<div className='mt-4'>
					<input
						type='text'
						value={tagsInput}
						onChange={e => handleTagsChange(e.target.value)}
						placeholder='标签，用逗号分隔（如：React, 工具）'
						aria-label='标签'
						className='border-hair bg-surface2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none'
					/>
					{formData.tags.length > 0 && (
						<div className='mt-2 flex flex-wrap gap-1.5'>
							{formData.tags.map(tag => (
								<span key={tag} className='bg-brandsoft text-brand-ink rounded-full px-2.5 py-0.5 text-xs'>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				<textarea
					value={formData.description}
					onChange={e => patch({ description: e.target.value })}
					placeholder='一句话说清它解决什么问题…'
					aria-label='项目介绍'
					className='border-hair bg-surface2 mt-3 w-full resize-none rounded-lg border p-3 text-sm leading-relaxed focus:outline-none'
					rows={3}
				/>

				<div className='mt-3 space-y-2'>
					<input
						type='text'
						value={formData.github || ''}
						onChange={e => patch({ github: e.target.value || undefined })}
						placeholder='GitHub 地址（可选）'
						aria-label='GitHub 地址'
						className='border-hair bg-surface2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none'
					/>
					<input
						type='text'
						value={formData.npm || ''}
						onChange={e => patch({ npm: e.target.value || undefined })}
						placeholder='NPM 地址（可选）'
						aria-label='NPM 地址'
						className='border-hair bg-surface2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none'
					/>
				</div>
			</div>

			<div className='mt-6 flex gap-3'>
				<button onClick={onClose} className='border-hair bg-surface hover:bg-surface2 flex-1 rounded-lg border px-4 py-2 text-sm transition-colors'>
					取消
				</button>
				<button onClick={handleSubmit} className='brand-btn flex-1 justify-center px-4'>
					{project ? '保存' : '添加'}
				</button>
			</div>

			{showImageDialog && (
				<ImageUploadDialog
					currentImage={formData.image}
					onClose={() => setShowImageDialog(false)}
					onSubmit={(image: ImageItem) => {
						setCoverItem(image.type === 'file' ? image : undefined)
						patch({ image: image.type === 'url' ? image.url : image.previewUrl })
					}}
				/>
			)}
		</DialogModal>
	)
}
