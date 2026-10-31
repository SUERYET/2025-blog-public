import type { Metadata } from 'next'
import blogIndex from '@/../public/blogs/index.json'
import type { BlogIndexItem } from '@/app/blog/types'
import { publicPosts } from '@/lib/blog-visibility'
import siteContent from '@/config/site-content.json'

/**
 * 按文章生成 metadata。
 *
 * 为什么放在 layout 而不是 page：`page.tsx` 是客户端组件（正文靠 loadBlog 在浏览器里拉），
 * 客户端组件不能 export metadata。layout 可以是服务端组件，并且同样支持 generateMetadata ——
 * 这样每篇文章的 title / description / OG 会真实出现在服务端返回的 HTML 里，
 * 爬虫不用执行 JS 也能拿到。
 *
 * 数据直接取自 index.json（构建期就能读到），不需要在服务端读 markdown 文件。
 */
const posts = publicPosts(blogIndex as BlogIndexItem[])

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yysuni.com'

function absoluteUrl(path: string) {
	if (/^https?:\/\//.test(path)) return path
	return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params
	const slug = decodeURIComponent(id)
	const post = posts.find(item => item.slug === slug)

	if (!post) {
		return { title: `文章没有找到 · ${siteContent.meta.username}` }
	}

	const title = post.title || post.slug
	const description = post.summary || siteContent.meta.description
	const images = post.cover ? [absoluteUrl(post.cover)] : undefined

	return {
		title: `${title} · ${siteContent.meta.username}`,
		description,
		keywords: post.tags,
		alternates: { canonical: `${SITE_URL.replace(/\/$/, '')}/blog/${encodeURIComponent(slug)}` },
		openGraph: {
			type: 'article',
			title,
			description,
			url: `${SITE_URL.replace(/\/$/, '')}/blog/${encodeURIComponent(slug)}`,
			publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
			tags: post.tags,
			images
		},
		twitter: {
			card: images ? 'summary_large_image' : 'summary',
			title,
			description,
			images
		}
	}
}

export default function BlogDetailLayout({ children }: { children: React.ReactNode }) {
	return children
}
