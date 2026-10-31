import { toast } from 'sonner'
import { GITHUB_CONFIG } from '@/consts'
import { getAuthToken } from '@/lib/auth'
import { listRepoFilesRecursive } from '@/lib/github-client'
import { commitFiles, type CommitEntry } from '@/lib/commit'
import type { BlogIndexItem } from '@/lib/blog-index'

export async function saveBlogEdits(originalItems: BlogIndexItem[], nextItems: BlogIndexItem[], categories: string[]): Promise<void> {
	const removedSlugs = originalItems.filter(item => !nextItems.some(next => next.slug === item.slug)).map(item => item.slug)
	const uniqueRemoved = Array.from(new Set(removedSlugs.filter(Boolean)))

	const token = await getAuthToken()
	const { OWNER, REPO, BRANCH } = GITHUB_CONFIG
	const entries: CommitEntry[] = []

	for (const slug of uniqueRemoved) {
		toast.info(`正在收集 ${slug} 文件...`)
		const files = await listRepoFilesRecursive(token, OWNER, REPO, `public/blogs/${slug}`, BRANCH)
		for (const path of files) entries.push({ kind: 'delete', path })
	}

	toast.info('正在更新索引...')
	const sortedItems = [...nextItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	entries.push({ kind: 'text', path: 'public/blogs/index.json', content: JSON.stringify(sortedItems, null, 2) })

	toast.info('正在更新分类...')
	const uniqueCategories = Array.from(new Set(categories.map(c => c.trim()).filter(Boolean)))
	entries.push({ kind: 'text', path: 'public/blogs/categories.json', content: JSON.stringify({ categories: uniqueCategories }, null, 2) })

	const actionLabels: string[] = []
	if (uniqueRemoved.length > 0) actionLabels.push(`删除:${uniqueRemoved.join(',')}`)
	actionLabels.push('更新索引')
	if (uniqueCategories.length > 0) actionLabels.push('更新分类')

	toast.info('正在提交...')
	await commitFiles(entries, actionLabels.join(' | '), { token })

	toast.success('保存成功！请等待页面部署后刷新')
}
