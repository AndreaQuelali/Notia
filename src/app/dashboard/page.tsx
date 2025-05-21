import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-[95vw]">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex justify-between items-center p-4 border-b border-gray-800">
            <h1 className="text-2xl font-bold m-0">Notia</h1>
            <UserButton afterSignOutUrl="/" />
          </header>
          <div className="flex flex-1">
            <main className="flex-1 p-8 flex flex-col items-center">
              <textarea
                placeholder="Escribe tu idea...."
                className="w-full max-w-2xl min-h-[200px] text-lg p-4 border border-gray-700 rounded-lg resize-y bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
