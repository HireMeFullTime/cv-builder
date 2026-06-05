
import { formatPreviewDate } from '@/lib/utils';

import { CVPreviewEducationProps } from '@/types';

export function CVPreviewEducation({ selectedEducations, educations, itemSpace }: CVPreviewEducationProps) {
  const educationList = selectedEducations && selectedEducations.length > 0 ? selectedEducations : educations;
  if (!educationList || educationList.length === 0) return null;
  const visibleEducations = educationList.filter(edu => edu.institution || edu.degree);
  if (visibleEducations.length === 0) return null;

  return (
    <section>
      <h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb) break-after-avoid'>
        Education
      </h3>
      <div className={itemSpace}>
        {visibleEducations.map(edu => (
          <div key={edu.id} className="break-inside-avoid">
            <div className='flex justify-between items-baseline mb-1'>
              <h4 className='font-bold text-black'>{edu.institution}</h4>
              <span className='text-(length:--cv-text-xs) font-bold text-black whitespace-nowrap'>
                {[formatPreviewDate(edu.startDate), edu.isCurrent ? 'Present' : formatPreviewDate(edu.endDate)]
                  .filter(Boolean)
                  .join(' - ')}
              </span>
            </div>
            <div className='text-(length:--cv-text-sm) font-medium text-black'>
              {edu.degree}
              {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
            </div>
            {edu.description && (
              <p className='text-(length:--cv-text-sm) text-black mt-1.5 leading-relaxed'>{edu.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
