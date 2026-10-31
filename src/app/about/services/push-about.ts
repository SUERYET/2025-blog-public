import { commitFiles } from '@/lib/commit'
import { toast } from 'sonner'

export type AboutData = {
	title: string
	description: string
	content: string
}

export async function pushAbout(data: AboutData): Promise<void> {
	await commitFiles([{ kind: 'text', path: 'src/app/about/list.json', content: JSON.stringify(data, null, '\t') }], '更新关于页面')

	toast.success('发布成功！')
}
