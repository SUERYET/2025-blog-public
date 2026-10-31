'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBlogIndex, type BlogIndexItem } from '@/hooks/use-blog-index'
import { useCategories } from '@/hooks/use-categories'
import { useReadArticles } from '@/hooks/use-read-articles'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { readFileAsText } from '@/lib/file-utils'
import { saveBlogEdits } from './services/save-blog-edits'
import { CategoryModal } from './components/category-modal'
import { PostRow } from '@/components/post-row'
import { EditToolbar } from '@/components/edit-toolbar'
import { Container } from '@/components/ui/container'
import { Button, IconButton } from '@/components/ui/button'
import { Segmented, type SegmentedOption } from '@/components/ui/segmented'

type GroupMode = 'year' | 'month' | 'category'

const ALL = 'all'

const GROUP_OPTIONS: SegmentedOption<GroupMode>[] = [
	{ value: 'year', label: '按年' },
	{ value: 'month', label: '按月' },
	{ value: 'category', label: '按分类' }
]

export default function BlogPage() {
	const { items, loading } = useBlogIndex()
	const { categories: categoriesFromServer } = useCategories()
	const { isRead } = useReadArticles()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const [editMode, setEditMode] = useState(false)
	const [editableItems, setEditableItems] = useState<BlogIndexItem[]>([])
	const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
	const [saving, setSaving] = useState(false)

	const [groupMode, setGroupMode] = useState<GroupMode>('year')
	const [activeCategory, setActiveCategory] = useState<string>(ALL)

	const [categoryModalOpen, setCategoryModalOpen] = useState(false)
	const [categoryList, setCategoryList] = useState<string[]>([])
	const [newCategory, setNewCategory] = useState('')

	useEffect(() => {
		if (!editMode) setEditableItems(items)
	}, [items, editMode])

	useEffect(() => {
		setCategoryList(categoriesFromServer || [])
	}, [categoriesFromServer])

	const displayItems = editMode ? editableItems : items

	/** 分类筛选（编辑模式下不筛选，否则选中的项会"消失"） */
	const filteredItems = useMemo(() => {
		if (activeCategory === ALL) return displayItems
		return displayItems.filter(item => (item.category?.trim() || '未分类') === activeCategory)
	}, [displayItems, activeCategory])

	const categories = useMemo(() => {
		const counts = new Map<string, number>()
		for (const item of displayItems) {
			const key = item.category?.trim() || '未分类'
			counts.set(key, (counts.get(key) ?? 0) + 1)
		}
		return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
	}, [displayItems])

	const { groups, groupKeys } = useMemo(() => {
		const sorted = [...filteredItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		const grouped = new Map<string, BlogIndexItem[]>()

		for (const item of sorted) {
			const date = dayjs(item.date)
			const key = groupMode === 'category' ? item.category?.trim() || '未分类' : groupMode === 'month' ? date.format('YYYY-MM') : date.format('YYYY')
			if (!grouped.has(key)) grouped.set(key, [])
			grouped.get(key)!.push(item)
		}

		const keys = Array.from(grouped.keys())
		if (groupMode === 'category') {
			const order = new Map(categoryList.map((name, index) => [name, index]))
			keys.sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999) || a.localeCompare(b))
		} else {
			keys.sort((a, b) => b.localeCompare(a))
		}

		return { groups: grouped, groupKeys: keys }
	}, [filteredItems, groupMode, categoryList])

	const selectedCount = selectedSlugs.size

	const toggleSelect = useCallback((slug: string) => {
		setSelectedSlugs(prev => {
			const next = new Set(prev)
			if (next.has(slug)) next.delete(slug)
			else next.add(slug)
			return next
		})
	}, [])

	const enterEditMode = useCallback(() => {
		setEditableItems(items)
		setSelectedSlugs(new Set())
		setEditMode(true)
	}, [items])

	const exitEditMode = useCallback(() => {
		setEditableItems(items)
		setSelectedSlugs(new Set())
		setEditMode(false)
	}, [items])

	const selectAll = useCallback(() => {
		setSelectedSlugs(new Set(filteredItems.map(item => item.slug)))
	}, [filteredItems])

	const deleteSelected = useCallback(() => {
		if (selectedCount === 0) {
			toast.info('请选择要删除的文章')
			return
		}
		setEditableItems(prev => prev.filter(item => !selectedSlugs.has(item.slug)))
		setSelectedSlugs(new Set())
	}, [selectedCount, selectedSlugs])

	const assignCategory = useCallback((slug: string, category?: string) => {
		setEditableItems(prev =>
			prev.map(item => {
				if (item.slug !== slug) return item
				const next = category?.trim()
				return { ...item, category: next || undefined }
			})
		)
	}, [])

	const addCategory = useCallback(() => {
		const value = newCategory.trim()
		if (!value) {
			toast.info('请输入分类名称')
			return
		}
		setCategoryList(prev => (prev.includes(value) ? prev : [...prev, value]))
		setNewCategory('')
	}, [newCategory])

	const removeCategory = useCallback((category: string) => {
		setCategoryList(prev => prev.filter(item => item !== category))
		setEditableItems(prev => prev.map(item => (item.category === category ? { ...item, category: undefined } : item)))
	}, [])

	const handleSave = useCallback(async () => {
		const removedSlugs = items.filter(item => !editableItems.some(editItem => editItem.slug === item.slug)).map(item => item.slug)
		const normalizedCategoryList = categoryList.map(c => c.trim()).filter(Boolean)
		const categoryListChanged =
			JSON.stringify(normalizedCategoryList) !== JSON.stringify((categoriesFromServer || []).map(c => c.trim()).filter(Boolean))
		const categoryAssignmentChanged = items.some(origin => {
			const next = editableItems.find(editItem => editItem.slug === origin.slug)
			return (origin.category || '') !== (next?.category || '')
		})

		if (removedSlugs.length === 0 && !categoryListChanged && !categoryAssignmentChanged) {
			toast.info('没有需要保存的改动')
			return
		}

		try {
			setSaving(true)
			await saveBlogEdits(items, editableItems, normalizedCategoryList)
			setEditMode(false)
			setSelectedSlugs(new Set())
			setCategoryModalOpen(false)
		} catch (error: any) {
			console.error(error)
			toast.error(error?.message || '保存失败')
		} finally {
			setSaving(false)
		}
	}, [items, editableItems, categoryList, categoriesFromServer])

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!editMode && (event.ctrlKey || event.metaKey) && event.key === ',') {
				event.preventDefault()
				enterEditMode()
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [editMode, enterEditMode])

	return (
		<Container className='pb-20'>
			<header className='max-w-[716px] pt-14 pb-8'>
				<h1 className='text-ink mb-3 text-[32px] font-semibold tracking-[-0.028em] sm:text-[38px]'>全部文章</h1>
				<p className='text-muted text-[15px]'>
					{items.length} 篇 · {categories.length} 个分类
					{editMode && <span className='text-brand-ink ml-2 font-medium'>· 编辑模式</span>}
				</p>
			</header>

			{/* 工具条 */}
			<div className='border-hair mb-2 flex flex-wrap items-center gap-3 border-t py-4'>
				<Segmented label='分组方式' value={groupMode} onChange={setGroupMode} options={GROUP_OPTIONS} />

				<div className='flex flex-wrap gap-1.5'>
					<FilterChip label={`全部 ${displayItems.length}`} active={activeCategory === ALL} onClick={() => setActiveCategory(ALL)} />
					{categories.map(({ name, count }) => (
						<FilterChip
							key={name}
							label={`${name} ${count}`}
							active={activeCategory === name}
							onClick={() => setActiveCategory(name)}
						/>
					))}
				</div>

				<EditToolbar
					position='inline'
					className='ml-auto'
					editing={editMode}
					saving={saving}
					hideEditButton={hideEditButton}
					onEdit={enterEditMode}
					onCancel={exitEditMode}
					onSave={handleSave}
					extra={
						<>
							<Button size='sm' onClick={() => setCategoryModalOpen(true)} disabled={saving}>
								分类
							</Button>
							<Button size='sm' onClick={selectedCount === filteredItems.length ? () => setSelectedSlugs(new Set()) : selectAll}>
								{selectedCount === filteredItems.length ? '取消全选' : '全选'}
							</Button>
							<IconButton aria-label='删除已选文章' size='sm' disabled={selectedCount === 0} onClick={deleteSelected} className='text-red-500'>
								<Trash2 />
							</IconButton>
						</>
					}
				/>
			</div>

			{loading && (
				<div className='space-y-3 pt-4'>
					{[0, 1, 2, 3].map(index => (
						<div key={index} className='border-hair animate-pulse border-t py-5'>
							<div className='bg-surface2 mb-3 h-4 w-2/5 rounded' />
							<div className='bg-surface2 h-3 w-4/5 rounded' />
						</div>
					))}
				</div>
			)}

			{!loading && filteredItems.length === 0 && (
				<p className='text-muted border-hair border-t py-16 text-center text-sm'>这里还没有文章</p>
			)}

			{groupKeys.map(key => {
				const groupItems = groups.get(key) ?? []
				const groupAllSelected = groupItems.length > 0 && groupItems.every(item => selectedSlugs.has(item.slug))
				const label = groupMode === 'month' ? dayjs(`${key}-01`).format('YYYY 年 M 月') : key

				return (
					<section key={key} className='mt-8'>
						<div className='mb-1 flex items-baseline gap-3'>
							<h2 className='text-ink text-[15px] font-semibold tracking-[-0.01em]'>{groupMode === 'year' ? `${label} 年` : label}</h2>
							<span className='text-faint font-mono text-[11.5px]'>{groupItems.length} 篇</span>
							<div className='bg-hair h-px flex-1' />
							{editMode && groupItems.length > 0 && (
								<button
									type='button'
									onClick={() =>
										setSelectedSlugs(prev => {
											const next = new Set(prev)
											if (groupAllSelected) groupItems.forEach(item => next.delete(item.slug))
											else groupItems.forEach(item => next.add(item.slug))
											return next
										})
									}
									className='text-muted hover:text-brand-ink text-[12px] transition-colors'>
									{groupAllSelected ? '取消全选' : '全选本组'}
								</button>
							)}
						</div>

						<div>
							{groupItems.map(item => (
								<PostRow
									key={item.slug}
									item={item}
									editMode={editMode}
									selected={selectedSlugs.has(item.slug)}
									onSelect={toggleSelect}
									read={isRead(item.slug)}
								/>
							))}
						</div>
					</section>
				)
			})}

			<CategoryModal
				open={categoryModalOpen}
				onClose={() => setCategoryModalOpen(false)}
				categoryList={categoryList}
				newCategory={newCategory}
				onNewCategoryChange={setNewCategory}
				onAddCategory={addCategory}
				onRemoveCategory={removeCategory}
				onReorderCategories={setCategoryList}
				editableItems={editableItems}
				onAssignCategory={assignCategory}
			/>
		</Container>
	)
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
	return (
		<button
			type='button'
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				'rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150',
				active ? 'border-brand/30 bg-brandsoft text-brand-ink font-medium' : 'text-muted hover:bg-surface2 hover:text-ink border-transparent'
			)}>
			{label}
		</button>
	)
}
