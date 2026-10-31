'use client'

import { readTextFileFromRepo } from '@/lib/github-client'

import type { BlogIndexItem } from '@/app/blog/types'

export type { BlogIndexItem } from '@/app/blog/types'

const INDEX_PATH = 'public/blogs/index.json'

async function readIndex(token: string, owner: string, repo: string, branch: string): Promise<BlogIndexItem[]> {
	try {
		const txt = await readTextFileFromRepo(token, owner, repo, INDEX_PATH, branch)
		if (!txt) return []
		const parsed = JSON.parse(txt)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		// 索引损坏或不存在时从空列表开始，不要让整次发布失败
		return []
	}
}

function serialize(list: BlogIndexItem[]): string {
	const sorted = [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
	return JSON.stringify(sorted, null, 2)
}

/**
 * 生成「插入/更新一篇」之后的 index.json 文本。
 * 只算内容不落盘 —— 真正的提交交给 commitFiles 和其它文件合并成一次 commit。
 */
export async function prepareBlogsIndex(token: string, owner: string, repo: string, item: BlogIndexItem, branch: string): Promise<string> {
	const list = await readIndex(token, owner, repo, branch)
	const map = new Map<string, BlogIndexItem>(list.map(entry => [entry.slug, entry]))
	map.set(item.slug, item)
	return serialize(Array.from(map.values()))
}

/** 生成「移除若干篇」之后的 index.json 文本 */
export async function removeBlogsFromIndex(token: string, owner: string, repo: string, slugs: string[], branch: string): Promise<string> {
	const list = await readIndex(token, owner, repo, branch)
	const slugSet = new Set(slugs.filter(Boolean))
	if (slugSet.size === 0) return serialize(list)
	return serialize(list.filter(item => !slugSet.has(item.slug)))
}

export async function removeBlogFromIndex(token: string, owner: string, repo: string, slug: string, branch: string): Promise<string> {
	return removeBlogsFromIndex(token, owner, repo, [slug], branch)
}
