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
  description: "App web of notes with AI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="en" suppressHydrationWarning>
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
                  {publishableKey ? (
                    <>
                      <SignedOut>
                        <Link href="/sign-in" className="text-sm font-medium hover:underline">
                          Sign In
                        </Link>
                        <Link href="/sign-up" className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md">
                          Sign Up
                        </Link>
                      </SignedOut>
                      <SignedIn>
                        <Link href="/dashboard" className="text-sm font-medium hover:underline">
                          Dashboard
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                      </SignedIn>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-in" className="text-sm font-medium hover:underline">
                        Sign In
                      </Link>
                      <Link href="/sign-up" className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md">
                        Sign Up
                      </Link>
                      <Link href="/dashboard" className="text-sm font-medium hover:underline">
                        Dashboard
                      </Link>
                    </>
                  )}
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
  );

  if (publishableKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
