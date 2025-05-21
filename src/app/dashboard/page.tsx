import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { MyEmojiPicker } from "@/components/ui/emojis";

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
          </header>
              <div className="flex flex-col justify-start max-w-4xl">
            <main className="flex-1 p-8 flex flex-col items-center">
            <MyEmojiPicker />        
              <textarea
                placeholder="Escribe tu idea...."
                className="w-full min-h-[200px] text-5xl p-4 rounded-lg resize-y bg-background text-foreground focus:outline-none font-sans font-bold "
              />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
