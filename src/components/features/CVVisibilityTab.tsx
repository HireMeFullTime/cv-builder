import { ColumnLayout } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

interface CVVisibilityTabProps {
  layout: ColumnLayout;
  onChange: (newLayout: ColumnLayout) => void;
  projects?: { id: string; title: string }[];
  experiences?: { id: string; jobTitle: string; company: string }[];
}

export function CVVisibilityTab({ layout, onChange, projects, experiences }: CVVisibilityTabProps) {
  const toggleProjectVisibility = (projectId: string, isVisible: boolean) => {
    const currentHidden = layout.hiddenProjectIds || [];
    let newHidden: string[];

    if (isVisible) {
      newHidden = currentHidden.filter(id => id !== projectId);
    } else {
      newHidden = [...currentHidden, projectId];
    }

    onChange({
      ...layout,
      hiddenProjectIds: newHidden
    });
  };

  const toggleExperienceVisibility = (expId: string, isVisible: boolean) => {
    const currentHidden = layout.hiddenExperienceIds || [];
    let newHidden: string[];

    if (isVisible) {
      newHidden = currentHidden.filter(id => id !== expId);
    } else {
      newHidden = [...currentHidden, expId];
    }

    onChange({
      ...layout,
      hiddenExperienceIds: newHidden
    });
  };

  return (
    <div className='p-4'>
      <div className='text-sm text-muted-foreground mb-4'>
        Select which elements should be visible in the generated CV.
      </div>

      {projects && projects.length > 0 && (
        <div className='mt-2'>
          <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
            Included Projects
          </h4>
          <div className='flex flex-wrap gap-4'>
            {projects.map(proj => {
              const isHidden = layout.hiddenProjectIds?.includes(proj.id) ?? false;
              return (
                <div key={proj.id} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`proj-${proj.id}`}
                    checked={!isHidden}
                    onCheckedChange={checked => toggleProjectVisibility(proj.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`proj-${proj.id}`}
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                  >
                    {proj.title}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {experiences && experiences.length > 0 && (
        <div className={`mt-4 pt-4 ${projects && projects.length > 0 ? 'border-t' : ''}`}>
          <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
            Included Experiences
          </h4>
          <div className='flex flex-wrap gap-4'>
            {experiences.map(exp => {
              const isHidden = layout.hiddenExperienceIds?.includes(exp.id) ?? false;
              return (
                <div key={exp.id} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`exp-${exp.id}`}
                    checked={!isHidden}
                    onCheckedChange={checked => toggleExperienceVisibility(exp.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`exp-${exp.id}`}
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                  >
                    {exp.company}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!projects || projects.length === 0) && (!experiences || experiences.length === 0) && (
        <p className='text-sm text-muted-foreground'>No projects or experiences available to toggle.</p>
      )}
    </div>
  );
}
