import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './dashboard.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://shenghen-wuwa-analysis.frankyknarf.chatgpt.site'),
  title: '声痕｜鸣潮抽卡分析与唤取记录导出',
  description:
    '免费开源的鸣潮抽卡分析工具：本地导出唤取记录，查看保底进度、五星收藏、小保底不歪率和角色武器平均抽数。无需账号登录，记录不会上传。',
  keywords: [
    '鸣潮抽卡分析',
    '鸣潮抽卡记录',
    '鸣潮唤取记录',
    '鸣潮抽卡导出',
    '鸣潮保底统计',
    'Wuthering Waves gacha tracker',
    'Wuthering Waves convene history',
  ],
  authors: [{ name: 'Shenghen Contributors' }],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    siteName: '声痕',
    title: '声痕｜鸣潮抽卡分析与唤取记录导出',
    description: '本地分析鸣潮唤取记录，隐私优先、免费开源。',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: '声痕鸣潮抽卡分析' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '声痕｜鸣潮抽卡分析与唤取记录导出',
    description: '本地分析鸣潮唤取记录，隐私优先、免费开源。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
