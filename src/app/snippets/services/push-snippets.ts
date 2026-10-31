import { commitFiles } from '@/lib/commit'
import { toast } from 'sonner'

export type PushSnippetsParams = {
	snippets: string[]
}

export async function pushSnippets(params: PushSnippetsParams): Promise<void> {
	const { snippets } = params

	await commitFiles([{ kind: 'text', path: 'src/app/snippets/list.json', content: JSON.stringify(snippets, null, '\t') }], '更新句子列表')

	toast.success('发布成功！')
}
