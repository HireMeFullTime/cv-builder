interface CVPreviewSkillsProps {
  relevantSkills?: (string | null | undefined)[];
}

export function CVPreviewSkills({ relevantSkills }: CVPreviewSkillsProps) {
  if (!relevantSkills || relevantSkills.length === 0) return null;
  const visibleSkills = relevantSkills.filter(Boolean);
  if (visibleSkills.length === 0) return null;
  return (
    <section>
      <h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb) break-after-avoid'>
        Key Skills
      </h3>
      <div className='text-(length:--cv-text-sm) font-bold text-black leading-relaxed'>
        {visibleSkills.join(' • ')}
      </div>
    </section>
  );
}
