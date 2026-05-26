"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "./ProfileForm";
import { ExperienceSection } from "./ExperienceSection";
import { useRouter, useSearchParams } from "next/navigation";

export function DashboardTabs({ profile, experiences }: { profile: any; experiences: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(val) => router.push(`/dashboard?tab=${val}`, { scroll: false })} 
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1 bg-muted/50 rounded-lg gap-1">
        <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
        <TabsTrigger value="experience" className="text-xs sm:text-sm">Experience</TabsTrigger>
        <TabsTrigger value="projects" className="text-xs sm:text-sm">Projects</TabsTrigger>
        <TabsTrigger value="education" className="text-xs sm:text-sm">Education</TabsTrigger>
        <TabsTrigger value="skills" className="text-xs sm:text-sm">Skills</TabsTrigger>
        <TabsTrigger value="languages" className="text-xs sm:text-sm">Languages</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="mt-6">
        <ProfileForm initialData={profile} />
      </TabsContent>
      
      <TabsContent value="experience" className="mt-6">
        <ExperienceSection initialExperiences={experiences} />
      </TabsContent>
      
      <TabsContent value="projects" className="mt-6">
        <div className="p-8 border border-dashed rounded-md text-center text-muted-foreground">
          Projects form coming soon
        </div>
      </TabsContent>
      
      <TabsContent value="education" className="mt-6">
        <div className="p-8 border border-dashed rounded-md text-center text-muted-foreground">
          Education form coming soon
        </div>
      </TabsContent>
      
      <TabsContent value="skills" className="mt-6">
        <div className="p-8 border border-dashed rounded-md text-center text-muted-foreground">
          Skills form coming soon
        </div>
      </TabsContent>
      
      <TabsContent value="languages" className="mt-6">
        <div className="p-8 border border-dashed rounded-md text-center text-muted-foreground">
          Languages form coming soon
        </div>
      </TabsContent>
    </Tabs>
  );
}
