
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

import { CVPreviewProjectsProps } from '@/types';

export function CVPreviewProjects({
  projects,
  selectedProjects,
  hiddenProjectIds,
  itemSpace
}: CVPreviewProjectsProps) {
  const projectsContent = projects || selectedProjects || [];
  const visibleProjects = projectsContent.filter(
    proj => !hiddenProjectIds?.includes(proj.id) && (proj.title || proj.shortDescription)
  );
  if (visibleProjects.length === 0) return null;

  return (
    <section>
      <h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb) break-after-avoid'>
        Projects
      </h3>
      <div className={`grid grid-cols-1 ${itemSpace}`}>
        {visibleProjects.map(proj => (
          <div key={proj.id} className='break-inside-avoid'>
            <div className='flex justify-between items-baseline mb-1'>
              <h4 className='font-bold text-black flex items-center gap-2'>
                {proj.title}
                {proj.linkUrl && (
                  <Link
                    href={proj.linkUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-1 text-[11px] font-normal text-black/60 hover:text-black hover:opacity-100 transition-opacity ml-2'
                    title='Project Website'
                    aria-label={`Visit project website for ${proj.title}`}
                  >
                    <Globe className='w-3 h-3' />
                    <span>Live</span>
                  </Link>
                )}
                {proj.githubUrl && (
                  <Link
                    href={proj.githubUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-1 text-[11px] font-normal text-black/60 hover:text-black hover:opacity-100 transition-opacity ml-2'
                    title='GitHub Repository'
                    aria-label={`View GitHub repository for ${proj.title}`}
                  >
                    <GithubIcon className='w-3 h-3' />
                    <span>GitHub</span>
                  </Link>
                )}
              </h4>
              {proj.role && <span className='text-(length:--cv-text-xs) font-bold text-black'>{proj.role}</span>}
            </div>
            <p className='text-(length:--cv-text-sm) text-black mb-2 leading-relaxed'>{proj.shortDescription}</p>

            {proj.accomplishments && proj.accomplishments.filter(acc => acc.value).length > 0 && (
              <ul className='list-disc list-outside ml-4 space-y-1 text-(length:--cv-text-sm) text-black mb-2'>
                {proj.accomplishments
                  .filter(acc => acc.value)
                  .map((acc, idx) => (
                    <li key={idx} className='pl-1'>
                      {acc.value}
                    </li>
                  ))}
              </ul>
            )}

            {proj.techStack && proj.techStack.filter(Boolean).length > 0 && (
              <div className='text-(length:--cv-text-xs) font-bold text-black mt-2 leading-relaxed'>
                {proj.techStack.filter(Boolean).join(' • ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
