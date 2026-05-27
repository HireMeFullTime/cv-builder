"use client";

import { useState } from "react";
import { ExperienceForm } from "./ExperienceForm";
import { deleteExperience } from "@/actions/experience";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, MapPin, Edit, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { type ExperienceData } from "@/types";

export function ExperienceSection({ initialExperiences }: { initialExperiences: ExperienceData[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    
    try {
      await deleteExperience(id);
      toast.success("Experience deleted");
    } catch (error) {
      toast.error("Failed to delete experience");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Work Experience</h3>
          <p className="text-sm text-muted-foreground">Manage your work history.</p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Experience
          </Button>
        )}
      </div>

      {isAdding && (
        <ExperienceForm 
          onClose={() => setIsAdding(false)} 
        />
      )}

      <div className="space-y-4">
        {initialExperiences.map((exp) => {
          if (editingId === exp.id) {
            return (
              <ExperienceForm 
                key={exp.id} 
                initialData={exp} 
                onClose={() => setEditingId(null)} 
              />
            );
          }

          return (
            <Card key={exp.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      {exp.jobTitle}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-foreground mt-1">
                      {exp.company}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(exp.id!)}>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id!)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
                  </div>
                  {exp.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </div>
                  )}
                </div>
                
                {exp.description && (
                  <p className="text-sm mb-4">{exp.description}</p>
                )}

                {exp.accomplishments && exp.accomplishments.length > 0 && (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {exp.accomplishments.map((acc: { value: string }, i: number) => (
                      <li key={i} className="text-muted-foreground">
                        <span className="text-foreground">{acc.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}

        {initialExperiences.length === 0 && !isAdding && (
          <div className="p-8 border border-dashed rounded-md text-center">
            <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium text-foreground mb-1">No experience added yet</h4>
            <p className="text-sm text-muted-foreground mb-4">Add your past work experience to build your CV.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Experience
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
