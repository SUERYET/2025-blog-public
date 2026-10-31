'use client'

import { useHomeViewStore } from './stores/view-store'
import { FlowHome } from './flow-home'
import { DesktopHome } from './desktop-home'

export default function Home() {
	const view = useHomeViewStore(state => state.view)

	// 桌面模式在 layout 里会去掉顶栏/页脚，这里只负责选渲染哪个视图
	return view === 'desktop' ? <DesktopHome /> : <FlowHome />
}
