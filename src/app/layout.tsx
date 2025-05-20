import { ModeToggle } from "@/components/ui/mode-toggle";
import "./globals.css";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ui/theme-provider";
import type { ReactNode } from "react";

export const metadata = {
  title: "Notia",
  description: "Aplicación web de notas con IA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex">
              <AppSidebar />

              <main className="flex-1">
                <header className="flex justify-end p-4">
                  <ModeToggle />
                </header>
                <section className="px-4 pb-8">
                  <SidebarTrigger />
                  {children}
                </section>
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
