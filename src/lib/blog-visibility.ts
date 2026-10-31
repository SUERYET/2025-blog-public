import type { BlogIndexItem } from '@/app/blog/types'

/**
 * 「一篇文章是否对公众可见」的唯一定义。
 *
 * 之前这条规则只在 use-blog-index 里用 `!isAuth` 实现了客户端过滤，
 * 结果 RSS 和 sitemap 两个聚合出口完全没过滤 —— hidden 文章会直接从订阅源和
 * 搜索引擎泄露。以后所有对外出口都走这里，不要再各写一遍。
 */
export function isPublicPost(item: BlogIndexItem | null | undefined): item is BlogIndexItem {
	if (!item || !item.slug) return false
	return item.hidden !== true
}

export function publicPosts(items: BlogIndexItem[] | null | undefined): BlogIndexItem[] {
	return (items ?? []).filter(isPublicPost)
}
