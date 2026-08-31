import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://shenghen-wuwa-analysis.frankyknarf.chatgpt.site',
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
