import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://app.kcwpro.com'),
  title: {
    default: 'KCW Construction & Plumbing Inc.',
    template: '%s | KCW Construction & Plumbing Inc.',
  },
  description:
    'Licensed plumbing and construction service in Greater Los Angeles. Fast response for water heaters, drain cleaning, main water lines, gas lines, leak repair, and general plumbing. English / 中文服务.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en"><body style={{ margin: 0, background: '#f3f4f6' }}>{children}</body></html>;
}