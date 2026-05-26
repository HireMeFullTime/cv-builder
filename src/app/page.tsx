import { auth, signOut } from "../auth";
import { LoginForm } from "../components/features/LoginForm";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center max-w-md w-full p-8 border border-border rounded-xl shadow-sm bg-card text-card-foreground gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-center">CV & Portfolio Builder</h1>
        
        {session?.user ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Successfully logged in!</p>
              {session.user.image && (
                <img src={session.user.image} alt="User Avatar" className="w-16 h-16 rounded-full border-2 border-border" />
              )}
              <h2 className="text-xl font-semibold">{session.user.name || session.user.email}</h2>
              <p className="text-xs text-muted-foreground font-mono">ID: {session.user.id}</p>
            </div>
            
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
              className="w-full"
            >
              <Button
                type="submit"
                variant="destructive"
                className="w-full"
              >
                Sign Out
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-muted-foreground text-center">You are not logged in.</p>
            <LoginForm />
          </div>
        )}
      </div>
    </div>
  );
}
