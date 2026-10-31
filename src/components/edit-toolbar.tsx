'use client'

import { useCallback, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { readFileAsText } from '@/lib/file-utils'
import { useAuthStore } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

interface EditToolbarProps {
	editing: boolean
	saving?: boolean
	/** 非编辑态下要不要隐藏「编辑」入口 */
	hideEditButton?: boolean
	onEdit: () => void
	onCancel: () => void
	/** 真正的提交动作；没导入密钥时会先弹密钥选择，选完自动执行这次保存 */
	onSave: () => Promise<void> | void
	/** 编辑态下的额外按钮，例如「分类」「管理」 */
	extra?: ReactNode
	saveLabel?: string
	className?: string
	position?: 'fixed' | 'inline'
}

/**
 * 全站统一的「编辑 → 取消 / 保存」工具条。
 *
 * 之前 about / projects / share / bloggers / snippets / pictures / blog 七个页面
 * 各复制了一遍：隐藏的 .pem input + isAuth 判断 + 选完密钥再 save。
 * 现在密钥流程收在这里，页面只需要提供 onSave。
 */
export function EditToolbar({
	editing,
	saving = false,
	hideEditButton = false,
	onEdit,
	onCancel,
	onSave,
	extra,
	saveLabel = '保存',
	className,
	position = 'fixed'
}: EditToolbarProps) {
	const isAuth = useAuthStore(state => state.isAuth)
	const setPrivateKey = useAuthStore(state => state.setPrivateKey)
	const fileRef = useRef<HTMLInputElement>(null)

	const handlePemFile = useCallback(
		async (file: File) => {
			try {
				const pem = await readFileAsText(file)
				await setPrivateKey(pem)
				toast.success('密钥已导入')
				await onSave()
			} catch {
				toast.error('读取密钥失败')
			}
		},
		[setPrivateKey, onSave]
	)

	const handlePrimary = useCallback(async () => {
		if (!isAuth) {
			fileRef.current?.click()
			return
		}
		await onSave()
	}, [isAuth, onSave])

	return (
		<>
			<input
				ref={fileRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async event => {
					const file = event.target.files?.[0]
					if (file) await handlePemFile(file)
					if (event.currentTarget) event.currentTarget.value = ''
				}}
			/>

			<div
				className={cn(
					'flex items-center gap-2',
					position === 'fixed' && 'fixed top-[78px] right-6 z-30 max-sm:hidden',
					position === 'inline' && 'justify-end',
					className
				)}>
				{editing ? (
					<>
						{extra}
						<Button size='sm' onClick={onCancel} disabled={saving}>
							取消
						</Button>
						<Button size='sm' variant='primary' onClick={handlePrimary} disabled={saving}>
							{saving ? '保存中...' : isAuth ? saveLabel : '导入密钥'}
						</Button>
					</>
				) : (
					!hideEditButton && (
						<Button size='sm' onClick={onEdit}>
							编辑
						</Button>
					)
				)}
			</div>
		</>
	)
}
