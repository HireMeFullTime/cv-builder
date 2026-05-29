import { auth } from "@/auth";
import { RegisterForm } from "@/components/features/RegisterForm";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center max-w-md w-full p-8 border border-border rounded-xl shadow-sm bg-card text-card-foreground gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-center">Create an Account</h1>
        
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-muted-foreground text-center">Sign up to start building your CV</p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
