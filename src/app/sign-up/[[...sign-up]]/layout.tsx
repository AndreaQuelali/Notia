import { ClerkProvider } from '@clerk/nextjs';
import './globals.css'; // Asegúrate de tener este archivo o crea uno básico
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Notia',
  description: 'Tu espacio para organizar ideas, inspirado en Notion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );

  if (publishableKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
