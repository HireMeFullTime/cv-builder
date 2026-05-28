"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema } from "@/lib/validations";
import { upsertEducation } from "@/actions/education";
import { type EducationData } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MonthYearPicker } from "@/components/features/MonthYearPicker";
import { toast } from "sonner";
import { type Education } from "@prisma/client";

export function EducationForm({ 
  initialData,
  onClose,
}: { 
  initialData?: Education;
  onClose?: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues: Partial<EducationData> = {
    id: initialData?.id ?? undefined,
    institution: initialData?.institution || "",
    degree: initialData?.degree || "",
    fieldOfStudy: initialData?.fieldOfStudy ?? undefined,
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate ?? undefined,
    isCurrent: initialData?.isCurrent || false,
    description: initialData?.description ?? undefined,
    url: initialData?.url ?? undefined,
  };

  const form = useForm<EducationData>({
    resolver: zodResolver(educationSchema),
    defaultValues,
  });

  const isCurrent = form.watch("isCurrent");

  async function onSubmit(data: EducationData) {
    setIsSaving(true);
    try {
      await upsertEducation(data);
      toast.success(initialData ? "Education updated successfully!" : "Education added successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save education. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle>{initialData ? "Edit Education" : "Add Education"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution / Provider (e.g. Udemy, University) *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Warsaw University of Technology or Coursera" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree / Course Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bachelor of Science or React Bootcamp" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Computer Science" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <MonthYearPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date {isCurrent ? "(Expected)" : "*"}</FormLabel>
                    <FormControl>
                      <MonthYearPicker value={field.value} onChange={field.onChange} />
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
                    <FormLabel>I am currently studying here</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate / Program URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Thesis Topic (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe what you learned, your thesis topic, or key coursework..." 
                      className="min-h-[80px]"
                      {...field} 
                      value={field.value || ""}
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
                {isSaving ? "Saving..." : "Save Education"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
