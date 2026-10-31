import { toast } from 'sonner'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import { listRepoFilesRecursive } from '@/lib/github-client'
import { commitFiles, type CommitEntry } from '@/lib/commit'
import { removeBlogsFromIndex } from '@/lib/blog-index'

export async function batchDeleteBlogs(slugs: string[]): Promise<void> {
	const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)))
	if (uniqueSlugs.length === 0) {
		throw new Error('需要至少选择一篇文章')
	}

	const token = await getAuthToken()
	const { OWNER, REPO, BRANCH } = GITHUB_CONFIG
	const entries: CommitEntry[] = []

	for (const slug of uniqueSlugs) {
		toast.info(`正在收集 ${slug} 文件...`)
		const files = await listRepoFilesRecursive(token, OWNER, REPO, `public/blogs/${slug}`, BRANCH)
		for (const path of files) entries.push({ kind: 'delete', path })
	}

	toast.info('正在更新索引...')
	const indexJson = await removeBlogsFromIndex(token, OWNER, REPO, uniqueSlugs, BRANCH)
	entries.push({ kind: 'text', path: 'public/blogs/index.json', content: indexJson })

	const commitLabel = uniqueSlugs.length === 1 ? `删除文章: ${uniqueSlugs[0]}` : `批量删除文章: ${uniqueSlugs.join(', ')}`

	toast.info('正在提交...')
	await commitFiles(entries, commitLabel, { token })

	toast.success('删除成功！请等待页面部署后刷新')
}
