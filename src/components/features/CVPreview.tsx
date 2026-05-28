"use client";

import { TailoredCVData } from "@/types";
import { Profile, Education } from "@prisma/client";
import { MapPin, Mail, Phone, Link as LinkIcon, ExternalLink, Globe } from "lucide-react";

export function CVPreview({ data, profile, jobTitle, educations }: { data: TailoredCVData, profile: Profile | null, jobTitle: string, educations?: Education[] }) {
  return (
    <div className="flex flex-col min-h-full font-sans text-slate-800 bg-white">
      {/* Header section with Personal Info */}
      <header className="mb-8 border-b-2 border-slate-800 pb-6">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase">
          {profile ? `${profile.firstName} ${profile.lastName}` : "John Doe"}
        </h1>
        <h2 className="text-xl font-medium text-slate-600 mt-2">
          {jobTitle || profile?.title || "Professional"}
        </h2>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-slate-500">
          {profile?.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile?.linkedinUrl && (
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4" />
              <span>{profile.linkedinUrl.replace('https://www.', '').replace('https://', '')}</span>
            </div>
          )}
          {profile?.githubUrl && (
            <div className="flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" />
              <span>{profile.githubUrl.replace('https://', '')}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-8 print:space-y-6">
        
        {/* Professional Summary */}
        <section>
          <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-3">Professional Summary</h3>
          <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{data.professionalSummary}</p>
        </section>

        {/* Relevant Skills */}
        {data.relevantSkills && data.relevantSkills.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-3">Key Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.relevantSkills.map((skill, index) => (
                <span key={index} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {data.selectedExperiences && data.selectedExperiences.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-3">Experience</h3>
            <div className="space-y-5">
              {data.selectedExperiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-slate-900">{exp.jobTitle}</h4>
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">
                      {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - 
                      {exp.isCurrent ? " Present" : exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ""}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-2">
                    {exp.company}{exp.location ? ` | ${exp.location}` : ""}
                  </div>
                  {exp.accomplishments && exp.accomplishments.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm text-slate-600">
                      {exp.accomplishments.map((acc, idx) => (
                        <li key={idx} className="pl-1">{acc.value}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-3">Education</h3>
            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-slate-900">{edu.institution}</h4>
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">
                      {new Date(edu.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - 
                      {edu.isCurrent ? " Present" : edu.endDate ? ` ${new Date(edu.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ""}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                  </div>
                  {edu.description && (
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.selectedProjects && data.selectedProjects.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-3">Selected Projects</h3>
            <div className="grid grid-cols-1 gap-5">
              {data.selectedProjects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      {proj.title}
                      {proj.linkUrl && (
                        <a href={proj.linkUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors">
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </h4>
                    {proj.role && <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{proj.role}</span>}
                  </div>
                  <p className="text-sm text-slate-600 mb-2 leading-relaxed">{proj.shortDescription}</p>
                  
                  {proj.accomplishments && proj.accomplishments.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-slate-600 mb-2">
                      {proj.accomplishments.map((acc, idx) => (
                        <li key={idx} className="pl-1">{acc.value}</li>
                      ))}
                    </ul>
                  )}
                  
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {proj.techStack.map((tech, idx) => (
                        <span key={idx} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer / GDPR Clause */}
      {profile?.gdprClause && (
        <footer className="mt-12 pt-6 border-t border-slate-200 text-[10px] text-slate-400 text-justify leading-tight">
          {profile.gdprClause}
        </footer>
      )}
    </div>
  );
}
