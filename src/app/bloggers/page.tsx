'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import GridView, { type Blogger } from './grid-view'
import CreateDialog from './components/create-dialog'
import { pushBloggers } from './services/push-bloggers'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { EditToolbar } from '@/components/edit-toolbar'
import initialList from './list.json'
import type { AvatarItem } from './components/avatar-upload-dialog'

export default function Page() {
	const [bloggers, setBloggers] = useState<Blogger[]>(initialList as Blogger[])
	const [originalBloggers, setOriginalBloggers] = useState<Blogger[]>(initialList as Blogger[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingBlogger, setEditingBlogger] = useState<Blogger | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [avatarItems, setAvatarItems] = useState<Map<string, AvatarItem>>(new Map())

	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUpdate = (updatedBlogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => {
		setBloggers(prev => prev.map(b => (b.url === oldBlogger.url ? updatedBlogger : b)))
		if (avatarItem) {
			setAvatarItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedBlogger.url, avatarItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingBlogger(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveBlogger = (updatedBlogger: Blogger) => {
		if (editingBlogger) {
			const updated = bloggers.map(b => (b.url === editingBlogger.url ? updatedBlogger : b))
			setBloggers(updated)
		} else {
			setBloggers([...bloggers, updatedBlogger])
		}
	}

	const handleDelete = (blogger: Blogger) => {
		if (confirm(`确定要删除 ${blogger.name} 吗？`)) {
			setBloggers(bloggers.filter(b => b.url !== blogger.url))
		}
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushBloggers({
				bloggers,
				avatarItems
			})

			setOriginalBloggers(bloggers)
			setAvatarItems(new Map())
			setIsEditMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setBloggers(originalBloggers)
		setAvatarItems(new Map())
		setIsEditMode(false)
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
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
				onEdit={() => setIsEditMode(true)}
				onCancel={handleCancel}
				onSave={handleSave}
				extra={
					<Button size='sm' onClick={handleAdd}>
						添加
					</Button>
				}
			/>

			<Container className='pb-20'>
				<header className='max-w-[716px] pt-14 pb-8'>
					<div className='text-faint mb-4 flex items-center gap-2 font-mono text-[11.5px] tracking-[0.14em] uppercase'>
						<span className='bg-hair2 block h-px w-5' />
						优秀博客
					</div>
					<h1 className='text-ink mb-3 text-[32px] font-semibold tracking-[-0.028em] sm:text-[38px]'>值得订阅的人</h1>
					<p className='text-muted text-[15px]'>{bloggers.length} 个长期在更新的博客</p>
				</header>

				<GridView bloggers={bloggers} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />
			</Container>

			{isCreateDialogOpen && <CreateDialog blogger={editingBlogger} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveBlogger} />}
		</>
	)
}
