import { commitFiles, type CommitEntry } from '@/lib/commit'
import { hashFileSHA256 } from '@/lib/file-utils'
import type { Blogger } from '../grid-view'
import type { AvatarItem } from '../components/avatar-upload-dialog'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'

export type PushBloggersParams = {
	bloggers: Blogger[]
	avatarItems?: Map<string, AvatarItem>
}

export async function pushBloggers(params: PushBloggersParams): Promise<void> {
	const { bloggers, avatarItems } = params

	const entries: CommitEntry[] = []
	const uploadedHashes = new Set<string>()
	let updatedBloggers = [...bloggers]

	if (avatarItems && avatarItems.size > 0) {
		toast.info('正在上传头像...')
		for (const [url, avatarItem] of avatarItems.entries()) {
			if (avatarItem.type !== 'file') continue

			const hash = avatarItem.hash || (await hashFileSHA256(avatarItem.file))
			const ext = getFileExt(avatarItem.file.name)
			const filename = `${hash}${ext}`
			const publicPath = `/images/blogger/${filename}`

			if (!uploadedHashes.has(hash)) {
				entries.push({ kind: 'file', path: `public/images/blogger/${filename}`, file: avatarItem.file })
				uploadedHashes.add(hash)
			}

			updatedBloggers = updatedBloggers.map(b => (b.url === url ? { ...b, avatar: publicPath } : b))
		}
	}

	entries.push({ kind: 'text', path: 'src/app/bloggers/list.json', content: JSON.stringify(updatedBloggers, null, '\t') })

	await commitFiles(entries, '更新博主列表')

	toast.success('发布成功！')
}
