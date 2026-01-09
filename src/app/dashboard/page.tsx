import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import RichTextEditor from "@/components/ui/editor";
import PageHeader from "@/components/ui/header";
import { PagesProvider } from "@/context/pages";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <PagesProvider>
        <div className="flex h-screen w-[95vw]">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex flex-col items-center p-8">
              <PageHeader />
              <div className="mt-6 w-full max-w-3xl">
                <RichTextEditor />
              </div>
            </div>
          </div>
        </div>
      </PagesProvider>
    </SidebarProvider>
  );
}
