import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center max-w-md text-center gap-6 p-8 border border-border rounded-xl shadow-sm bg-card text-card-foreground">
        <div className="rounded-full bg-muted p-6">
          <h1 className="text-6xl font-extrabold tracking-tighter text-muted-foreground/50">404</h1>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
        <p className="text-muted-foreground text-sm">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="w-full mt-2">
          <Link href="/dashboard" className={buttonVariants({ variant: "default", className: "w-full" })}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
