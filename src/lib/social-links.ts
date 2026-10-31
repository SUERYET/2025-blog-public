/**
 * 首页 hero 与页脚的社交链接，都从 site-content.json 的 socialButtons 生成。
 *
 * 顺序是写死的（GitHub → bilibili → 邮箱 → RSS），成员和地址来自配置：
 * 以后在配置面板里加按钮，它会排在最后，不会打乱这四个的位置。
 */

export type SocialLinkData = {
	key: string
	type: string
	label: string
	/** 可跳转的地址 */
	href?: string
	/** 要复制到剪贴板的内容（邮箱走这条，不跳 mailto） */
	copy?: string
}

type SocialButton = {
	id: string
	type: string
	value: string
	label?: string
	order?: number
}

const ORDER: Record<string, number> = { github: 0, bilibili: 1, email: 2 }

export function buildSocialLinks(buttons: SocialButton[] | undefined, options: { rss?: boolean } = {}): SocialLinkData[] {
	const { rss = true } = options
	const links: SocialLinkData[] = []

	for (const button of [...(buttons ?? [])].sort((a, b) => (ORDER[a.type] ?? 9) - (ORDER[b.type] ?? 9))) {
		const value = (button.value || '').trim()
		// value 是本地图片路径的（比如二维码）不是链接，跳过
		if (!value || value.startsWith('/')) continue

		const isEmail = button.type === 'email' || value.includes('@')

		links.push({
			key: button.id,
			type: button.type,
			label: button.label?.trim() || (isEmail ? '邮箱' : button.type),
			...(isEmail ? { copy: value } : { href: value })
		})
	}

	if (rss) links.push({ key: 'rss', type: 'rss', label: 'RSS', href: '/rss.xml' })

	return links
}
