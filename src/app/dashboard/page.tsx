import { getProfile } from "@/actions/profile";
import { getExperiences } from "@/actions/experience";
import { DashboardTabs } from "@/components/features/DashboardTabs";

export default async function DashboardPage() {
  const profile = await getProfile();
  const experiences = await getExperiences();

  return (
    <div className="mx-auto max-w-[1200px] w-full space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Manage your professional profile and projects here.</p>
      </div>
      
      <DashboardTabs profile={profile} experiences={experiences} />
    </div>
  );
}
