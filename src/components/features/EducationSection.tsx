"use client";

import { useState } from "react";
import { EducationForm } from "@/components/features/EducationForm";
import { deleteEducation } from "@/actions/education";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Edit, Trash2, PlusCircle, Calendar, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { type Education } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function EducationSection({ initialEducations }: { initialEducations: Education[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    toast("Are you sure you want to delete this education record?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteEducation(id);
            toast.success("Education deleted");
          } catch (error) {
            toast.error("Failed to delete education");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold">Education</h3>
          <p className="text-sm text-muted-foreground">Add your academic background and degrees.</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Education
          </Button>
        )}
      </div>

      {isAdding && (
        <EducationForm 
          onClose={() => setIsAdding(false)} 
        />
      )}

      <div className="space-y-4">
        {initialEducations.map((edu) => {
          if (editingId === edu.id) {
            return (
              <EducationForm 
                key={edu.id} 
                initialData={edu} 
                onClose={() => setEditingId(null)} 
              />
            );
          }

          return (
            <Card key={edu.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                      {edu.isCurrent && (
                        <Badge variant="outline" className="ml-2 text-[10px] font-normal uppercase tracking-wider shrink-0">
                          Current
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-foreground mt-1">
                      {edu.institution}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(edu.id)}>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4 mr-2 shrink-0" />
                  {formatDate(edu.startDate)} - {edu.isCurrent ? "Present" : formatDate(edu.endDate)}
                </div>
                
                {edu.description && (
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                    {edu.description}
                  </p>
                )}

                {edu.url && (
                  <div className="mt-2">
                    <Link href={edu.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-primary hover:underline">
                      <LinkIcon className="w-4 h-4 mr-1 shrink-0" /> View Certificate/Program
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {initialEducations.length === 0 && !isAdding && (
          <div className="p-8 border border-dashed rounded-md text-center">
            <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium text-foreground mb-1">No education added yet</h4>
            <p className="text-sm text-muted-foreground mb-4">Add your academic background to strengthen your profile.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Education
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
