import { getTailoredCVs } from "@/actions/cv";
import { CVBuilderSection } from "@/components/features/CVBuilderSection";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEducations } from "@/actions/education";
import { getLanguages } from "@/actions/language";

export default async function CVBuilderPage() {
  const pastCVs = await getTailoredCVs();
  const { getProfile } = await import("@/actions/profile");
  const profile = await getProfile();
  const educations = await getEducations();
  const languages = await getLanguages();

  return (
    <div className="mx-auto w-full max-w-350 space-y-6">
      <div className="space-y-4 print:hidden">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 text-muted-foreground w-fit")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI CV Builder</h2>
          <p className="text-muted-foreground">
            Tailor your CV to a specific job description using AI. Paste the target job details below.
          </p>
        </div>
      </div>

      <CVBuilderSection initialCVs={pastCVs} profile={profile} educations={educations} languages={languages} />
    </div>
  );
}
