import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Archivo_Black, IBM_Plex_Mono, Inter } from 'next/font/google';

import './globals.css';
import Nav from '@/components/nav';
import Footer from '@/components/footer';
import { ToastProvider } from '@/components/toast-provider';
import CookieConsent from '@/components/cookie-consent';
import { getCurrentProfile } from '@/lib/auth/guards';
import { CONSENT_COOKIE, parseConsent } from '@/lib/cookies/registry';

// Self-hosted via next/font: no render-blocking request to Google, no
// third-party font cookie, and the exact same three faces as before.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });
const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-disp', display: 'swap' });
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://twomilerunclub.com'),
  title: { default: 'Two Mile Run Club', template: '%s · Two Mile Run Club' },
  description:
    'Two Mile Run Club (TMR) — an Atlanta running community making running accessible, consistent, and inclusive. Weekly 2-mile runs, leaderboard, routes, and club merch.',
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'Two Mile Run Club',
    description: 'Accessible. Consistent. Inclusive. Weekly 2-mile runs in Atlanta.',
    type: 'website',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = { themeColor: '#0a0a0a' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const consent = parseConsent(cookies().get(CONSENT_COOKIE)?.value);

  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable} ${plex.variable}`}>
      <body>
        <ToastProvider>
          <Nav profile={profile} />
          {children}
          <Footer />
          <CookieConsent initialConsent={consent} />
        </ToastProvider>
      </body>
    </html>
  );
}
