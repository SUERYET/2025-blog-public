import { cn } from '@/lib/utils'
import type { PropsWithChildren } from 'react'

/** 统一的内容宽度与左右留白 */
export function Container({ children, className }: PropsWithChildren<{ className?: string }>) {
	return <div className={cn('mx-auto w-full max-w-[1120px] px-5 sm:px-7', className)}>{children}</div>
}

/** 阅读正文列（约 68ch），单独抽出来方便文章页/关于页复用 */
export function ProseColumn({ children, className }: PropsWithChildren<{ className?: string }>) {
	return <div className={cn('mx-auto w-full max-w-[716px]', className)}>{children}</div>
}
