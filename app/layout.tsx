import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Liquidaciones Médicas | Grow Labs',
  description: 'Sistema profesional de liquidaciones médicas para todas las obras sociales y gestión de instrumentadores - Powered by Grow Labs',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body 
        className={`${inter.className} min-h-screen relative`}
        style={{
          backgroundImage: 'url(/fondogrow.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay oscuro para mejor legibilidad */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/97 to-black/95 pointer-events-none z-0"
          style={{ backdropFilter: 'blur(2px)' }}
        />
        
        {/* Contenido */}
        <div className="relative z-10">
          {children}
        </div>
        
        <Toaster />
      </body>
    </html>
  );
}
