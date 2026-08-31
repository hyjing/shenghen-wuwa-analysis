import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://shenghen-wuwa-analysis.frankyknarf.chatgpt.site/sitemap.xml',
  };
}
