import { getAuthToken } from '@/lib/auth'
import { commitFiles, type CommitEntry } from '@/lib/commit'
import { toast } from 'sonner'
import type { SiteContent, CardStyles } from '../stores/config-store'
import type { FileItem, ArtImageUploads, SocialButtonImageUploads, BackgroundImageUploads } from '../config-dialog/site-settings'

type ArtImageConfig = SiteContent['artImages'][number]
type BackgroundImageConfig = SiteContent['backgroundImages'][number]

/** 把站内 URL（/images/xxx）换算成仓库路径（public/images/xxx） */
function toRepoPath(url: string): string {
	return `public${url.startsWith('/') ? url : `/${url}`}`
}

export async function pushSiteContent(
	siteContent: SiteContent,
	cardStyles: CardStyles,
	faviconItem?: FileItem | null,
	avatarItem?: FileItem | null,
	artImageUploads?: ArtImageUploads,
	removedArtImages?: ArtImageConfig[],
	backgroundImageUploads?: BackgroundImageUploads,
	removedBackgroundImages?: BackgroundImageConfig[],
	socialButtonImageUploads?: SocialButtonImageUploads
): Promise<void> {
	const token = await getAuthToken()
	const entries: CommitEntry[] = []

	if (faviconItem?.type === 'file') {
		toast.info('正在上传 Favicon...')
		entries.push({ kind: 'file', path: 'public/favicon.png', file: faviconItem.file })
	}

	if (avatarItem?.type === 'file') {
		toast.info('正在上传 Avatar...')
		entries.push({ kind: 'file', path: 'public/images/avatar.png', file: avatarItem.file })
	}

	if (artImageUploads) {
		for (const [id, item] of Object.entries(artImageUploads)) {
			if (item.type !== 'file') continue

			const artConfig = siteContent.artImages?.find(art => art.id === id)
			if (!artConfig?.url) continue

			toast.info(`正在上传 Art 图片 ${id}...`)
			entries.push({ kind: 'file', path: toRepoPath(artConfig.url), file: item.file })
		}
	}

	for (const art of removedArtImages ?? []) {
		if (!art.url) continue
		entries.push({ kind: 'delete', path: toRepoPath(art.url) })
	}

	if (backgroundImageUploads) {
		for (const [id, item] of Object.entries(backgroundImageUploads)) {
			if (item.type !== 'file') continue

			const bgConfig = siteContent.backgroundImages?.find(bg => bg.id === id)
			if (!bgConfig?.url) continue

			// 只处理站内背景图，外链不动
			if (!bgConfig.url.startsWith('/images/background/')) continue

			toast.info(`正在上传背景图片 ${id}...`)
			entries.push({ kind: 'file', path: toRepoPath(bgConfig.url), file: item.file })
		}
	}

	for (const bg of removedBackgroundImages ?? []) {
		if (!bg.url?.startsWith('/images/background/')) continue
		entries.push({ kind: 'delete', path: toRepoPath(bg.url) })
	}

	if (socialButtonImageUploads) {
		for (const [buttonId, item] of Object.entries(socialButtonImageUploads)) {
			if (item.type !== 'file') continue

			const button = siteContent.socialButtons?.find(btn => btn.id === buttonId)
			if (!button?.value) continue

			if (!button.value.startsWith('/images/social-buttons/')) continue

			toast.info(`正在上传社交按钮图片 ${buttonId}...`)
			entries.push({ kind: 'file', path: toRepoPath(button.value), file: item.file })
		}
	}

	entries.push({ kind: 'text', path: 'src/config/site-content.json', content: JSON.stringify(siteContent, null, '\t') })
	entries.push({ kind: 'text', path: 'src/config/card-styles.json', content: JSON.stringify(cardStyles, null, '\t') })

	toast.info('正在提交...')
	await commitFiles(entries, '更新站点配置', { token })

	toast.success('保存成功！')
}
