import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Provider from '@/components/Provider';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { UserBalanceProvider } from '@/components/UserBalanceProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tuliskan AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Provider>
        <UserBalanceProvider>
          <html lang="en">
            <body className={inter.className}>
              {children}
              <Toaster />
              <SonnerToaster />
            </body>
          </html>
        </UserBalanceProvider>
      </Provider>
    </ClerkProvider>
  );
}
