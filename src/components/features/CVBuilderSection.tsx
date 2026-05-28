"use client";

import { useState } from "react";
import { TailoredCV, Profile, Education } from "@prisma/client";
import { generateTailoredCV, deleteTailoredCV } from "@/actions/cv";
import { CVPreview } from "./CVPreview";
import { CVLayoutControls } from "./CVLayoutControls";
import { CVBuilderFormData, TailoredCVData, ColumnLayout } from "@/types";
import { cvBuilderFormSchema } from "@/lib/validations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Trash2, ArrowLeft, Printer } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export function CVBuilderSection({ initialCVs, profile, educations }: { initialCVs: TailoredCV[], profile: Profile | null, educations: Education[] }) {
  const [cvs, setCvs] = useState<TailoredCV[]>(initialCVs);
  const [selectedCv, setSelectedCv] = useState<TailoredCV | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [layout, setLayout] = useState<ColumnLayout>({
    mode: "single",
    leftColumn: ["summary", "skills", "experience", "education", "projects"],
    rightColumn: [],
    ratio: "left-narrow",
  });
  
  const router = useRouter();

  const form = useForm<CVBuilderFormData>({
    resolver: zodResolver(cvBuilderFormSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
    },
  });

  async function onSubmit(data: CVBuilderFormData) {
    setIsGenerating(true);
    try {
      await generateTailoredCV(data.jobTitle, data.jobDescription);
      toast.success("CV Generated Successfully!");
      
      form.reset();
      router.refresh();
      
      // To immediately reflect without waiting for props refresh
      // we can do a full reload, or trust next.js router.refresh
      // In this specific case, window.location.reload() ensures initialCVs are updated instantly.
      window.location.reload(); 
    } catch (error: any) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate CV. Make sure your profile is complete.";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this CV?")) return;
    
    try {
      await deleteTailoredCV(id);
      setCvs(prev => prev.filter(cv => cv.id !== id));
      if (selectedCv?.id === id) {
        setSelectedCv(null);
      }
      toast.success("CV Deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete CV");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* LEFT PANE: CONTROLS & FORM */}
      <div className="lg:col-span-4 space-y-6 flex flex-col h-full print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Target Role</CardTitle>
            <CardDescription>Paste the job details to generate a tailored CV.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Frontend Developer" disabled={isGenerating} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste the full job description here..." 
                          className="h-48 resize-none"
                          disabled={isGenerating} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating (Takes ~10-20s)
                    </>
                  ) : (
                    "Generate Tailored CV"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex-1 overflow-auto">
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>Your previously generated CVs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cvs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No CVs generated yet.</p>
            ) : (
              cvs.map((cv) => (
                <div
                  key={cv.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCv?.id === cv.id ? "bg-muted border-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedCv(cv)}
                >
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{cv.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cv.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANE: CV PREVIEW */}
      <div className="lg:col-span-8 bg-background border rounded-lg shadow-sm min-h-[800px] flex flex-col print:border-none print:shadow-none print:col-span-12">
        {selectedCv ? (
          <>
            <div className="border-b p-4 flex items-center justify-between bg-muted/20 print:hidden">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedCv(null)} className="lg:hidden">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <h3 className="font-semibold">Preview: {selectedCv.jobTitle}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" /> Print / Export PDF
              </Button>
            </div>
            <div className="p-8 md:p-12 print:p-0 flex-1 overflow-y-auto print:overflow-visible bg-white text-black print:bg-transparent">
              <CVLayoutControls layout={layout} onChange={setLayout} />
              <CVPreview 
                data={selectedCv.generatedContent as unknown as TailoredCVData} 
                profile={profile} 
                jobTitle={selectedCv.jobTitle} 
                educations={educations} 
                layout={layout}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center print:hidden">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Printer className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No CV Selected</h3>
            <p className="max-w-sm">
              Select a previously generated CV from the history list, or paste a job description on the left to generate a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
