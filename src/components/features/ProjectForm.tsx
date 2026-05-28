"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validations";
import { upsertProject } from "@/actions/project";
import { type ProjectData } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2 } from "lucide-react";
import { TechStackInput } from "@/components/features/TechStackInput";
import { toast } from "sonner";
import { type Project } from "@prisma/client";


export function ProjectForm({ 
  initialData,
  onClose,
}: { 
  initialData?: Project;
  onClose?: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues: Partial<ProjectData> = {
    id: initialData?.id ?? undefined,
    title: initialData?.title || "",
    shortDescription: initialData?.shortDescription || "",
    role: initialData?.role ?? undefined,
    linkUrl: initialData?.linkUrl ?? undefined,
    githubUrl: initialData?.githubUrl ?? undefined,
    isCurrent: initialData?.isCurrent || false,
    techStack: initialData?.techStack || [],
    accomplishments: Array.isArray(initialData?.accomplishments) 
      ? (initialData?.accomplishments as { value: string }[]) 
      : [],
  };

  const form = useForm<ProjectData>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const { fields: accomplishmentFields, append: appendAccomplishment, remove: removeAccomplishment } = useFieldArray({
    name: "accomplishments",
    control: form.control,
  });

  async function onSubmit(data: ProjectData) {
    setIsSaving(true);
    try {
      await upsertProject(data);
      toast.success(initialData ? "Project updated successfully!" : "Project added successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle>{initialData ? "Edit Project" : "Add New Project"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. E-commerce Dashboard" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Lead Frontend Developer" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe what this project is and what problem it solves..." 
                      className="min-h-[80px]"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack *</FormLabel>
                  <FormControl>
                    <TechStackInput 
                      value={field.value || []} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="linkUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isCurrent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Current Project</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel className="text-base">Key Accomplishments / Features</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => appendAccomplishment({ value: "" })}
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Bullet Point
                </Button>
              </div>
              
              {accomplishmentFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`accomplishments.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-2">
                      <div className="flex-1">
                        <FormControl>
                          <Input placeholder="e.g. Implemented CI/CD pipeline reducing build time by 50%" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="mt-0"
                        onClick={() => removeAccomplishment(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </FormItem>
                  )}
                />
              ))}
              {accomplishmentFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                  No accomplishments added. Click "Add Bullet Point" to list your achievements.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {onClose && (
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
