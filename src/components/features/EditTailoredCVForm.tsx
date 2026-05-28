"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tailoredCVSchema } from "@/lib/validations";
import { TailoredCVData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowUp, ArrowDown, Trash2, Plus, Save, Undo2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { updateTailoredCV } from "@/actions/cv";
import { TailoredCV } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EditTailoredCVForm({
  cv,
  onUpdatePreview,
  onClose,
}: {
  cv: TailoredCV;
  onUpdatePreview: (data: TailoredCVData) => void;
  onClose: () => void;
}) {
  const form = useForm<TailoredCVData>({
    resolver: zodResolver(tailoredCVSchema),
    defaultValues: (cv.generatedContent as unknown as TailoredCVData) || {
      professionalSummary: "",
      relevantSkills: [],
      selectedExperiences: [],
      selectedProjects: [],
    },
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
    move: moveSkill,
  } = useFieldArray({
    control: form.control,
    name: "relevantSkills" as never, // react-hook-form type workaround for string array
  });

  const {
    fields: projectFields,
    move: moveProject,
  } = useFieldArray({
    control: form.control,
    name: "selectedProjects",
  });

  // Watch for real-time preview
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Provide fallback defaults to avoid undefined errors in preview during edit
      const safeValue = {
        professionalSummary: value.professionalSummary || "",
        relevantSkills: value.relevantSkills || [],
        selectedExperiences: value.selectedExperiences || [],
        selectedProjects: value.selectedProjects || [],
      };
      onUpdatePreview(safeValue as TailoredCVData);
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdatePreview]);

  async function onSubmit(data: TailoredCVData) {
    try {
      await updateTailoredCV(cv.id, data);
      toast.success("CV Content saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save CV content.");
    }
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden border-primary/50 shadow-md">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Edit CV Content</CardTitle>
            <CardDescription>Changes preview in real-time</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <Undo2 className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        <Form {...form}>
          <form id="edit-cv-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Professional Summary */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Professional Summary</h3>
              <FormField
                control={form.control}
                name="professionalSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} className="min-h-[120px] text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Key Skills</h3>
              <div className="space-y-2">
                {skillFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`relevantSkills.${index}`}
                      render={({ field: inputField }) => (
                        <FormItem className="flex-1 mb-0 space-y-0">
                          <FormControl>
                            <Input {...inputField} className="h-8 text-sm" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveSkill(index, index - 1)} disabled={index === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveSkill(index, index + 1)} disabled={index === skillFields.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSkill(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendSkill("")} className="mt-2 text-xs h-8">
                  <Plus className="w-3 h-3 mr-1" /> Add Skill
                </Button>
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Selected Projects</h3>
              <div className="space-y-6">
                {projectFields.map((projField, projIndex) => (
                  <div key={projField.id} className="p-4 rounded-lg border bg-muted/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3 mr-4">
                        <FormField
                          control={form.control}
                          name={`selectedProjects.${projIndex}.title`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Project Title</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-8 font-semibold" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`selectedProjects.${projIndex}.shortDescription`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Short Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="h-20 text-sm resize-none" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        {/* Nested Tech Stack for this project */}
                        <ProjectTechStack form={form} projIndex={projIndex} />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Button type="button" variant="secondary" size="icon" className="h-8 w-8" onClick={() => moveProject(projIndex, projIndex - 1)} disabled={projIndex === 0}>
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="secondary" size="icon" className="h-8 w-8" onClick={() => moveProject(projIndex, projIndex + 1)} disabled={projIndex === projectFields.length - 1}>
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </Form>
      </CardContent>
      <div className="p-4 border-t bg-muted/30">
        <Button type="submit" form="edit-cv-form" className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </Card>
  );
}

// Sub-component for nested field array
function ProjectTechStack({ form, projIndex }: { form: any, projIndex: number }) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: `selectedProjects.${projIndex}.techStack` as never,
  });

  return (
    <div className="space-y-2 mt-2">
      <FormLabel className="text-xs">Tech Stack</FormLabel>
      <div className="flex flex-col gap-2">
        {fields.map((field, idx) => (
          <div key={field.id} className="flex items-center gap-1">
            <FormField
              control={form.control}
              name={`selectedProjects.${projIndex}.techStack.${idx}`}
              render={({ field: inputField }) => (
                <FormItem className="flex-1 mb-0 space-y-0">
                  <FormControl>
                    <Input {...inputField} className="h-7 text-xs" />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(idx, idx - 1)} disabled={idx === 0}>
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(idx, idx + 1)} disabled={idx === fields.length - 1}>
                <ArrowDown className="w-3 h-3" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(idx)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={() => append("")} className="w-fit text-[10px] h-6 px-2 mt-1">
          <Plus className="w-3 h-3 mr-1" /> Add Tech
        </Button>
      </div>
    </div>
  );
}
