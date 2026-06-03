import { TailoredCVData } from '@/types';
import { formatPreviewDate } from '@/lib/utils';

interface CVPreviewExperienceProps {
  experiences?: TailoredCVData['selectedExperiences'];
  hiddenExperienceIds?: string[];
  itemSpace: string;
}

export function CVPreviewExperience({ experiences, hiddenExperienceIds, itemSpace }: CVPreviewExperienceProps) {
  if (!experiences || experiences.length === 0) return null;
  const visibleExperiences = experiences.filter(
    exp => !hiddenExperienceIds?.includes(exp.id) && (exp.jobTitle || exp.company)
  );
  if (visibleExperiences.length === 0) return null;

  return (
    <section>
      <h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb) break-after-avoid'>
        Experience
      </h3>
      <div className={itemSpace}>
        {visibleExperiences.map(exp => (
          <div key={exp.id} className="break-inside-avoid">
            <div className='flex justify-between items-baseline mb-1'>
              <h4 className='font-bold text-black'>{exp.jobTitle}</h4>
              <span className='text-(length:--cv-text-xs) font-bold text-black whitespace-nowrap'>
                {[formatPreviewDate(exp.startDate), exp.isCurrent ? 'Present' : formatPreviewDate(exp.endDate)]
                  .filter(Boolean)
                  .join(' - ')}
              </span>
            </div>
            <div className='text-(length:--cv-text-sm) font-medium text-black mb-2'>
              {exp.company}
              {exp.location ? ` | ${exp.location}` : ''}
            </div>
            {exp.accomplishments && exp.accomplishments.filter(acc => acc.value).length > 0 && (
              <ul className='list-disc list-outside ml-4 space-y-1 text-(length:--cv-text-sm) text-black'>
                {exp.accomplishments
                  .filter(acc => acc.value)
                  .map((acc, idx) => (
                    <li key={idx} className='pl-1'>
                      {acc.value}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
