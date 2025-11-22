import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Liquidaciones Médicas | Grow Labs',
  description: 'Sistema profesional de liquidaciones médicas para todas las obras sociales y gestión de instrumentadores - Powered by Grow Labs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
