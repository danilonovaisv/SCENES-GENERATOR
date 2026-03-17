import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Scene Generator | Art Director Workspace',
  description: 'Generate realistic contextual mockups for advertising pieces.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-zinc-50 text-zinc-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
