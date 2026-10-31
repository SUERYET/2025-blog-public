'use client'

import { toast } from 'sonner'
import { GITHUB_CONFIG } from '@/consts'
import { getAuthToken } from './auth'
import { createBlob, createCommit, createTree, getRef, toBase64Utf8, updateRef, type TreeItem } from './github-client'
import { fileToBase64NoPrefix } from './file-utils'

/**
 * 统一的「一次提交写多个文件」管线。
 *
 * 之前这套 getRef → createBlob → createTree → createCommit → updateRef
 * 在 11 个 service 里各写了一遍，改任何一处都要改 11 遍。
 *
 * 现在所有写入都走这里，附带两个以前完全没有的能力：
 *   1. 分支被别处更新时自动重取 ref 重试一次（旧实现是 422 之后报"操作太快了"）
 *   2. blob 只建一次，重试时复用（blob 是内容寻址的，天然幂等）
 */

export type CommitEntry =
	/** 文本文件，会自动做 UTF-8 → base64 */
	| { kind: 'text'; path: string; content: string }
	/** 已经是 base64 的内容 */
	| { kind: 'base64'; path: string; content: string }
	/** 本地 File，会读成 base64 */
	| { kind: 'file'; path: string; file: File }
	/** 删除仓库里的这个路径 */
	| { kind: 'delete'; path: string }

export type CommitResult = {
	sha: string
	files: number
}

export type CommitOptions = {
	/** 复用调用方已经拿到的 token，避免重复签发/重复提示 */
	token?: string
}

const MAX_ATTEMPTS = 2

export async function commitFiles(entries: CommitEntry[], message: string, options: CommitOptions = {}): Promise<CommitResult> {
	if (entries.length === 0) throw new Error('没有需要提交的文件')

	const { OWNER, REPO, BRANCH } = GITHUB_CONFIG
	const branchRef = `heads/${BRANCH}`

	const token = options.token ?? (await getAuthToken())

	// blob 与分支无关，只建一次；重试时直接复用
	const treeItems: TreeItem[] = await Promise.all(
		entries.map(async (entry): Promise<TreeItem> => {
			if (entry.kind === 'delete') {
				return { path: entry.path, mode: '100644', type: 'blob', sha: null }
			}

			const content =
				entry.kind === 'text' ? toBase64Utf8(entry.content) : entry.kind === 'base64' ? entry.content : await fileToBase64NoPrefix(entry.file)

			const blob = await createBlob(token, OWNER, REPO, content, 'base64')
			return { path: entry.path, mode: '100644', type: 'blob', sha: blob.sha }
		})
	)

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		const base = await getRef(token, OWNER, REPO, branchRef)
		const tree = await createTree(token, OWNER, REPO, treeItems, base.sha)
		const commit = await createCommit(token, OWNER, REPO, message, tree.sha, [base.sha])

		try {
			await updateRef(token, OWNER, REPO, branchRef, commit.sha)
			return { sha: commit.sha, files: entries.length }
		} catch (error) {
			if (attempt >= MAX_ATTEMPTS) throw error
			// 多半是分支在读取 ref 之后被别人推了新提交（非快进）
			toast.info('分支刚刚有更新，正在用最新提交重试…')
			// 下一轮会重新 getRef，并用新的 base_tree 重建，保住对方那次提交
			await new Promise(resolve => setTimeout(resolve, 400))
		}
	}

	// 理论上不可达
	throw new Error('提交失败')
}
