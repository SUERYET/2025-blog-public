import { readTextFileFromRepo } from '@/lib/github-client'
import { commitFiles, type CommitEntry } from '@/lib/commit'
import { hashFileSHA256 } from '@/lib/file-utils'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import type { ImageItem } from '../../projects/components/image-upload-dialog'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'
import { Picture } from '../page'

export type PushPicturesParams = {
	pictures: Picture[]
	imageItems?: Map<string, ImageItem>
}

export async function pushPictures(params: PushPicturesParams): Promise<void> {
	const { pictures, imageItems } = params

	const token = await getAuthToken()
	const entries: CommitEntry[] = []
	const uploadedHashes = new Set<string>()
	let updatedPictures = [...pictures]

	if (imageItems && imageItems.size > 0) {
		toast.info('正在上传图片...')
		for (const [key, imageItem] of imageItems.entries()) {
			if (imageItem.type !== 'file') continue

			const hash = imageItem.hash || (await hashFileSHA256(imageItem.file))
			const ext = getFileExt(imageItem.file.name)
			const filename = `${hash}${ext}`
			const publicPath = `/images/pictures/${filename}`

			if (!uploadedHashes.has(hash)) {
				entries.push({ kind: 'file', path: `public/images/pictures/${filename}`, file: imageItem.file })
				uploadedHashes.add(hash)
			}

			const [groupId, indexStr] = key.split('::')
			const imageIndex = Number(indexStr) || 0

			updatedPictures = updatedPictures.map(p => {
				if (p.id !== groupId) return p

				const currentImages = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : []
				const nextImages = currentImages.map((img, idx) => (idx === imageIndex ? publicPath : img))

				return {
					...p,
					image: undefined,
					images: nextImages
				}
			})
		}
	}

	// 收集当前所有使用的图片 URL
	const currentImageUrls = new Set<string>()
	for (const picture of updatedPictures) {
		if (picture.image) currentImageUrls.add(picture.image)
		if (picture.images && picture.images.length > 0) picture.images.forEach(url => currentImageUrls.add(url))
	}

	// 读取之前的 list.json，找出不再使用的图片文件
	toast.info('正在检查需要删除的文件...')
	const previousListJson = await readTextFileFromRepo(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, 'src/app/pictures/list.json', GITHUB_CONFIG.BRANCH)

	if (previousListJson) {
		try {
			const previousPictures: Picture[] = JSON.parse(previousListJson)
			const previousImageUrls = new Set<string>()

			for (const picture of previousPictures) {
				if (picture.image) previousImageUrls.add(picture.image)
				if (picture.images && picture.images.length > 0) picture.images.forEach(url => previousImageUrls.add(url))
			}

			// 找出不再使用的本地图片，从仓库里删掉
			for (const url of previousImageUrls) {
				if (!currentImageUrls.has(url) && url.startsWith('/images/pictures/')) {
					const filename = url.replace('/images/pictures/', '')
					entries.push({ kind: 'delete', path: `public/images/pictures/${filename}` })
				}
			}
		} catch (error) {
			console.error('Failed to parse previous list.json:', error)
		}
	}

	entries.push({ kind: 'text', path: 'src/app/pictures/list.json', content: JSON.stringify(updatedPictures, null, '\t') })

	await commitFiles(entries, '更新图床列表', { token })

	toast.success('发布成功！')
}
