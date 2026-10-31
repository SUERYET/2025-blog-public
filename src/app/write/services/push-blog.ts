import { hashFileSHA256 } from '@/lib/file-utils'
import { prepareBlogsIndex } from '@/lib/blog-index'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import { commitFiles, type CommitEntry } from '@/lib/commit'
import type { ImageItem } from '../types'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDateTimeLocal } from '../stores/write-store'

export type PushBlogParams = {
	form: {
		slug: string
		title: string
		md: string
		tags: string[]
		date?: string
		summary?: string
		hidden?: boolean
		category?: string
	}
	cover?: ImageItem | null
	images?: ImageItem[]
	mode?: 'create' | 'edit'
	originalSlug?: string | null
}

export async function pushBlog(params: PushBlogParams): Promise<void> {
	const { form, cover, images, mode = 'create', originalSlug } = params

	if (!form?.slug) throw new Error('需要 slug')

	if (mode === 'edit' && originalSlug && originalSlug !== form.slug) {
		throw new Error('编辑模式下不支持修改 slug，请保持原 slug 不变')
	}

	const token = await getAuthToken()
	const { OWNER, REPO, BRANCH } = GITHUB_CONFIG
	const basePath = `public/blogs/${form.slug}`
	const commitMessage = mode === 'edit' ? `更新文章: ${form.slug}` : `新增文章: ${form.slug}`

	// 收集所有本地图片（正文图 + 封面）
	const allLocalImages: Array<{ img: Extract<ImageItem, { type: 'file' }>; id: string }> = []
	for (const img of images || []) {
		if (img.type === 'file') allLocalImages.push({ img, id: img.id })
	}
	if (cover?.type === 'file') allLocalImages.push({ img: cover, id: cover.id })

	const uploadedHashes = new Set<string>()
	let mdToUpload = form.md
	let coverPath: string | undefined

	const entries: CommitEntry[] = []

	if (allLocalImages.length > 0) {
		toast.info('正在上传图片...')
		for (const { img, id } of allLocalImages) {
			const hash = img.hash || (await hashFileSHA256(img.file))
			const ext = getFileExt(img.file.name)
			const filename = `${hash}${ext}`
			const publicPath = `/blogs/${form.slug}/${filename}`

			if (!uploadedHashes.has(hash)) {
				entries.push({ kind: 'file', path: `${basePath}/${filename}`, file: img.file })
				uploadedHashes.add(hash)
			}

			// 把正文里的 local-image 占位符换成真实路径
			const placeholder = `local-image:${id}`
			mdToUpload = mdToUpload.split(`(${placeholder})`).join(`(${publicPath})`)

			if (cover?.type === 'file' && cover.id === id) coverPath = publicPath
		}
	}

	if (cover?.type === 'url') coverPath = cover.url

	toast.info('正在准备文件...')

	const dateStr = form.date || formatDateTimeLocal()
	const config = {
		title: form.title,
		tags: form.tags,
		date: dateStr,
		summary: form.summary,
		cover: coverPath,
		hidden: form.hidden,
		category: form.category
	}

	entries.push({ kind: 'text', path: `${basePath}/index.md`, content: mdToUpload })
	entries.push({ kind: 'text', path: `${basePath}/config.json`, content: JSON.stringify(config, null, 2) })

	const indexJson = await prepareBlogsIndex(token, OWNER, REPO, { slug: form.slug, ...config }, BRANCH)
	entries.push({ kind: 'text', path: 'public/blogs/index.json', content: indexJson })

	toast.info('正在提交...')
	await commitFiles(entries, commitMessage, { token })

	toast.success('发布成功！')
}
