import { toast } from 'sonner'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import { listRepoFilesRecursive } from '@/lib/github-client'
import { commitFiles, type CommitEntry } from '@/lib/commit'
import { removeBlogFromIndex } from '@/lib/blog-index'

export async function deleteBlog(slug: string): Promise<void> {
	if (!slug) throw new Error('需要 slug')

	const token = await getAuthToken()
	const { OWNER, REPO, BRANCH } = GITHUB_CONFIG

	toast.info('正在收集文章文件...')
	const files = await listRepoFilesRecursive(token, OWNER, REPO, `public/blogs/${slug}`, BRANCH)
	if (files.length === 0) {
		throw new Error('文章不存在或已删除')
	}

	const entries: CommitEntry[] = files.map(path => ({ kind: 'delete', path }))

	toast.info('正在更新索引...')
	const indexJson = await removeBlogFromIndex(token, OWNER, REPO, slug, BRANCH)
	entries.push({ kind: 'text', path: 'public/blogs/index.json', content: indexJson })

	toast.info('正在提交...')
	await commitFiles(entries, `删除文章: ${slug}`, { token })

	toast.success('删除成功！请等待页面部署后刷新')
}
