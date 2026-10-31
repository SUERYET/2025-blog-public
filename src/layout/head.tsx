import Script from 'next/script'
import siteContent from '@/config/site-content.json'

const { theme } = siteContent

/**
 * 把站点配置里的配色注入到 :root。
 *
 * 注意：这里必须用 <style> 而不是 <html style> 内联。
 * 内联样式的优先级高于任何选择器，会锁死 `html[data-theme='dark']` 的覆盖，
 * 深色模式就永远失效。写成 <style> 后，深色规则靠 (0,1,1) 的选择器权重取胜。
 */
const THEME_VARS = `:root{
--cfg-brand:${theme.colorBrand};
--cfg-brand-2:${theme.colorBrandSecondary};
--color-brand:${theme.colorBrand};
--color-brand-secondary:${theme.colorBrandSecondary};
--color-bg:${theme.colorBg};
--color-card:${theme.colorCard};
--color-border:${theme.colorBorder};
--color-article:${theme.colorArticle};
--color-primary:${theme.colorPrimary};
--color-secondary:${theme.colorSecondary};
}`

export default function Head() {
	return (
		<head>
			<meta name='viewport' content='width=device-width, initial-scale=1.0, viewport-fit=cover' />
			<meta name='color-scheme' content='light dark' />
			<link rel='manifest' href='/manifest.json' />
			<link rel='icon' href='/favicon.png' />

			<link rel='preconnect' href='https://fonts.googleapis.cn' />
			<link rel='preconnect' href='https://fonts.gstatic.cn' crossOrigin='anonymous' />
			<link href='https://fonts.googleapis.cn/css2?family=Averia+Gruesa+Libre&display=swap' rel='stylesheet' />

			<style id='theme-vars' dangerouslySetInnerHTML={{ __html: THEME_VARS }} />

			<Script src='https://www.googletagmanager.com/gtag/js?id=G-ZNSFR7C9PM' strategy='afterInteractive' />
			<Script id='google-analytics' strategy='afterInteractive'>
				{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ZNSFR7C9PM');
        `}
			</Script>
		</head>
	)
}
