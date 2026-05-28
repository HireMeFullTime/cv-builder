"use client";

import { useState } from "react";
import { LanguageForm } from "@/components/features/LanguageForm";
import { deleteLanguage } from "@/actions/language";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages, Edit, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { type Language } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function LanguageSection({ initialLanguages }: { initialLanguages: Language[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    toast("Are you sure you want to delete this language?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteLanguage(id);
            toast.success("Language deleted");
          } catch (error) {
            toast.error("Failed to delete language");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Languages</h3>
          <p className="text-sm text-muted-foreground">List the languages you speak and your proficiency level.</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Language
          </Button>
        )}
      </div>

      {isAdding && (
        <LanguageForm 
          onClose={() => setIsAdding(false)} 
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {initialLanguages.map((lang) => {
          if (editingId === lang.id) {
            return (
              <div key={lang.id} className="col-span-1 sm:col-span-2">
                <LanguageForm 
                  initialData={lang} 
                  onClose={() => setEditingId(null)} 
                />
              </div>
            );
          }

          return (
            <Card key={lang.id} className="col-span-1">
              <CardHeader className="pb-3 pt-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                      <Languages className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{lang.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{lang.proficiency}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(lang.id)}>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(lang.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}

        {initialLanguages.length === 0 && !isAdding && (
          <div className="col-span-1 sm:col-span-2 p-8 border border-dashed rounded-md text-center">
            <Languages className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium text-foreground mb-1">No languages added yet</h4>
            <p className="text-sm text-muted-foreground mb-4">Add the languages you know to show your communication skills.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Language
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
