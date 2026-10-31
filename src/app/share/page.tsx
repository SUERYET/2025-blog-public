'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import GridView from './grid-view'
import CreateDialog from './components/create-dialog'
import { pushShares } from './services/push-shares'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { EditToolbar } from '@/components/edit-toolbar'
import initialList from './list.json'
import type { Share } from './components/share-card'
import type { LogoItem } from './components/logo-upload-dialog'

export default function Page() {
	const [shares, setShares] = useState<Share[]>(initialList as Share[])
	const [originalShares, setOriginalShares] = useState<Share[]>(initialList as Share[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingShare, setEditingShare] = useState<Share | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [logoItems, setLogoItems] = useState<Map<string, LogoItem>>(new Map())

	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUpdate = (updatedShare: Share, oldShare: Share, logoItem?: LogoItem) => {
		setShares(prev => prev.map(s => (s.url === oldShare.url ? updatedShare : s)))
		if (logoItem) {
			setLogoItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedShare.url, logoItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingShare(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveShare = (updatedShare: Share) => {
		if (editingShare) {
			const updated = shares.map(s => (s.url === editingShare.url ? updatedShare : s))
			setShares(updated)
		} else {
			setShares([...shares, updatedShare])
		}
	}

	const handleDelete = (share: Share) => {
		if (confirm(`确定要删除 ${share.name} 吗？`)) {
			setShares(shares.filter(s => s.url !== share.url))
		}
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushShares({
				shares,
				logoItems
			})

			setOriginalShares(shares)
			setLogoItems(new Map())
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
		setShares(originalShares)
		setLogoItems(new Map())
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
						推荐分享
					</div>
					<h1 className='text-ink mb-3 text-[32px] font-semibold tracking-[-0.028em] sm:text-[38px]'>值得一试的站点</h1>
					<p className='text-muted text-[15px]'>{shares.length} 个收藏 · 按星标排序</p>
				</header>

				<GridView shares={shares} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />
			</Container>

			{isCreateDialogOpen && <CreateDialog share={editingShare} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveShare} />}
		</>
	)
}
