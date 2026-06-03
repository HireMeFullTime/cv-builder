interface CVPreviewSummaryProps {
  summary?: string;
  professionalSummary?: string;
}

export function CVPreviewSummary({ summary, professionalSummary }: CVPreviewSummaryProps) {
  const summaryContent = summary || professionalSummary;
  if (!summaryContent) return null;
  return (
    <section>
      <h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb) break-after-avoid'>
        Summary
      </h3>
      <p className='text-black leading-relaxed text-(length:--cv-text-sm) whitespace-pre-wrap'>
        {summaryContent}
      </p>
    </section>
  );
}
