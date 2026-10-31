import { commitFiles, type CommitEntry } from '@/lib/commit'
import { hashFileSHA256 } from '@/lib/file-utils'
import type { Project } from '../components/project-card'
import type { ImageItem } from '../components/image-upload-dialog'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'

export type PushProjectsParams = {
	projects: Project[]
	imageItems?: Map<string, ImageItem>
}

export async function pushProjects(params: PushProjectsParams): Promise<void> {
	const { projects, imageItems } = params

	const entries: CommitEntry[] = []
	const uploadedHashes = new Set<string>()
	let updatedProjects = [...projects]

	if (imageItems && imageItems.size > 0) {
		toast.info('正在上传图片...')
		for (const [url, imageItem] of imageItems.entries()) {
			if (imageItem.type !== 'file') continue

			const hash = imageItem.hash || (await hashFileSHA256(imageItem.file))
			const ext = getFileExt(imageItem.file.name)
			const filename = `${hash}${ext}`
			const publicPath = `/images/project/${filename}`

			if (!uploadedHashes.has(hash)) {
				entries.push({ kind: 'file', path: `public/images/project/${filename}`, file: imageItem.file })
				uploadedHashes.add(hash)
			}

			updatedProjects = updatedProjects.map(p => (p.url === url ? { ...p, image: publicPath } : p))
		}
	}

	entries.push({ kind: 'text', path: 'src/app/projects/list.json', content: JSON.stringify(updatedProjects, null, '\t') })

	await commitFiles(entries, '更新项目列表')

	toast.success('发布成功！')
}
