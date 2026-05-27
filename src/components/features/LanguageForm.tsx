"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { languageSchema } from "@/lib/validations";
import { upsertLanguage } from "@/actions/language";
import { type LanguageData } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { type Language } from "@prisma/client";

export function LanguageForm({ 
  initialData,
  onClose,
}: { 
  initialData?: Language;
  onClose?: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues: Partial<LanguageData> = {
    id: initialData?.id ?? undefined,
    name: initialData?.name || "",
    proficiency: (initialData?.proficiency as LanguageData["proficiency"]) || undefined,
  };

  const form = useForm<LanguageData>({
    resolver: zodResolver(languageSchema),
    defaultValues,
  });

  async function onSubmit(data: LanguageData) {
    setIsSaving(true);
    try {
      await upsertLanguage(data);
      toast.success(initialData ? "Language updated successfully!" : "Language added successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save language. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle>{initialData ? "Edit Language" : "Add Language"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. English, Spanish, German" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="proficiency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proficiency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proficiency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A1">A1 - Beginner</SelectItem>
                        <SelectItem value="A2">A2 - Elementary</SelectItem>
                        <SelectItem value="B1">B1 - Intermediate</SelectItem>
                        <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                        <SelectItem value="C1">C1 - Advanced</SelectItem>
                        <SelectItem value="C2">C2 - Proficient</SelectItem>
                        <SelectItem value="Native">Native</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {onClose && (
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Language"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
