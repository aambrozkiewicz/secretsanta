import type { Metadata } from 'next';
import Link from 'next/link';
import '@fontsource/noto-sans/latin-ext-400.css';
import '@fontsource/noto-sans/latin-ext-500.css';
import '@fontsource/noto-sans/latin-ext-600.css';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/latin-500.css';
import '@fontsource/noto-sans/latin-600.css';
import './globals.css';
import Image from 'next/image';
export const metadata: Metadata = {
  title: 'Secret Santa — małe sekrety, dużo radości',
  description:
    'Zorganizuj świąteczne losowanie i napisz list do swojego Mikołaja.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body className="min-h-screen font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-7 sm:px-10">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
            >
              <Image src="/gift.svg" width={30} height={30} alt="" />
              Secret Santa
            </Link>
            <span className="text-xs text-muted">
              Małe sekrety. Dużo radości.
            </span>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-10 sm:py-10">
            {children}
          </main>
          {/* <footer className="flex flex-wrap justify-center gap-3 border-t border-line px-6 py-5 text-xs text-muted sm:px-10">
            <span>Z odrobiną świątecznej magii.</span>
          </footer> */}
        </div>
      </body>
    </html>
  );
}
