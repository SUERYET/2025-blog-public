import { hashFileSHA256 } from '@/lib/file-utils'
import { getAuthToken } from '@/lib/auth'
import { commitFiles, type CommitEntry } from '@/lib/commit'
import type { Share } from '../components/share-card'
import type { LogoItem } from '../components/logo-upload-dialog'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'

export type PushSharesParams = {
	shares: Share[]
	logoItems?: Map<string, LogoItem>
}

export async function pushShares(params: PushSharesParams): Promise<void> {
	const { shares, logoItems } = params

	const token = await getAuthToken()
	const entries: CommitEntry[] = []
	const uploadedHashes = new Set<string>()
	let updatedShares = [...shares]

	if (logoItems && logoItems.size > 0) {
		toast.info('正在上传图标...')
		for (const [url, logoItem] of logoItems.entries()) {
			if (logoItem.type !== 'file') continue

			const hash = logoItem.hash || (await hashFileSHA256(logoItem.file))
			const ext = getFileExt(logoItem.file.name)
			const filename = `${hash}${ext}`
			const publicPath = `/images/share/${filename}`

			if (!uploadedHashes.has(hash)) {
				entries.push({ kind: 'file', path: `public/images/share/${filename}`, file: logoItem.file })
				uploadedHashes.add(hash)
			}

			updatedShares = updatedShares.map(s => (s.url === url ? { ...s, logo: publicPath } : s))
		}
	}

	entries.push({ kind: 'text', path: 'src/app/share/list.json', content: JSON.stringify(updatedShares, null, '\t') })

	await commitFiles(entries, '更新分享列表', { token })

	toast.success('发布成功！')
}
