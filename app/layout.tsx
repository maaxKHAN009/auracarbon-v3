import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'AuraCarbon',
  description: 'Industrial Carbon Accounting and Green Credit Management Platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[var(--bg-base)] text-[var(--text-base)] font-sans antialiased selection:bg-aura-accent selection:text-aura-dark" suppressHydrationWarning>
        <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-aura-dark via-black to-zinc-900 opacity-100 dark:opacity-100" />
        {children}
      </body>
    </html>
  );
}
