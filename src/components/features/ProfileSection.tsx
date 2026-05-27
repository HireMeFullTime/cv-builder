"use client";

import { useState } from "react";
import { ProfileForm } from "./ProfileForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Mail, Phone, Edit, PlusCircle, Link as LinkIcon } from "lucide-react";
import { type ProfileData } from "@/types";

export function ProfileSection({ initialProfile }: { initialProfile: Partial<ProfileData> | null }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Personal Profile</h3>
          <p className="text-sm text-muted-foreground">Manage your basic contact and professional information.</p>
        </div>
        {initialProfile && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      {isEditing && (
        <ProfileForm 
          initialData={initialProfile || undefined}
          onClose={() => setIsEditing(false)} 
        />
      )}

      {initialProfile && !isEditing && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {initialProfile.firstName} {initialProfile.lastName}
                </CardTitle>
                {initialProfile.title && (
                  <CardDescription className="text-lg font-medium text-foreground mt-1">
                    {initialProfile.title}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground mb-6">
              {initialProfile.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {initialProfile.email}
                </div>
              )}
              {initialProfile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {initialProfile.phone}
                </div>
              )}
              {initialProfile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {initialProfile.location}
                </div>
              )}
              {initialProfile.githubUrl && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <a href={initialProfile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    GitHub
                  </a>
                </div>
              )}
              {initialProfile.linkedinUrl && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <a href={initialProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
            
            {initialProfile.bio && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2">Professional Summary</h4>
                <p className="text-sm leading-relaxed">{initialProfile.bio}</p>
              </div>
            )}

            {initialProfile.gdprClause && (
              <div>
                <h4 className="text-sm font-semibold mb-2">GDPR Clause</h4>
                <p className="text-xs text-muted-foreground italic">{initialProfile.gdprClause}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!initialProfile && !isEditing && (
        <div className="p-8 border border-dashed rounded-md text-center">
          <User className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-medium text-foreground mb-1">No profile added yet</h4>
          <p className="text-sm text-muted-foreground mb-4">Add your personal information to start building your CV.</p>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" /> Create Profile
          </Button>
        </div>
      )}
    </div>
  );
}
