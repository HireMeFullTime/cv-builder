import { auth } from "@/auth";
import { signOutAction } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/features/ExportButton";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background print:hidden">
        <div className="mx-auto flex h-16 max-w-300 w-full items-center gap-4 px-4 md:px-6">
          <h1 className="text-xl font-bold tracking-tight">CV Builder</h1>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">
              {session.user.name || session.user.email}
            </span>
            <ExportButton />
            <form
              action={signOutAction}
            >
              <Button type="submit" variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 print:p-0">
        {children}
      </main>
    </div>
  );
}
