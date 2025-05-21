import { ModeToggle } from "@/components/ui/mode-toggle";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import type { ReactNode } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = {
  title: "Notia",
  description: "Aplicación web de notas con IA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <head />
        <body className="min-h-screen bg-background text-foreground antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
              <div className="flex">

                <main className="flex-1">
                  <header className="flex items-center justify-end p-4 space-x-4">
                    <SignedOut>
                      <Link href="/sign-in" className="text-sm font-medium hover:underline">
                        Sign In
                      </Link>
                      <Link href="/sign-up" className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md">
                        Sign Up
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                    <ModeToggle />
                  </header>
                  <section className="px-4 pb-8">
                    {children}
                  </section>
                </main>
              </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
