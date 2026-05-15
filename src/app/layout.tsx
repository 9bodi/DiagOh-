import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'OHé Diag',
  description: 'Diagnostic en orthographe et français',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'inherit',
            },
          }}
        />
      </body>
    </html>
  );
}
