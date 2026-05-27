"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillsFormSchema } from "@/lib/validations";
import { upsertSkillCategory } from "@/actions/skill";
import { type SkillsFormData } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TechStackInput } from "./TechStackInput";
import { toast } from "sonner";

export function SkillForm({ 
  initialCategory,
  initialSkills = [],
  onClose,
}: { 
  initialCategory?: string;
  initialSkills?: string[];
  onClose?: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues: Partial<SkillsFormData> = {
    oldCategory: initialCategory ?? undefined,
    category: initialCategory ?? undefined,
    skills: initialSkills,
  };

  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues,
  });

  async function onSubmit(data: SkillsFormData) {
    setIsSaving(true);
    try {
      await upsertSkillCategory(data);
      toast.success(initialCategory ? "Skill category updated!" : "Skills added successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save skills. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle>{initialCategory ? `Edit: ${initialCategory || "Uncategorized"}` : "Add Skills"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Frontend, Soft Skills, Languages..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills *</FormLabel>
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              {onClose && (
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Skills"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
