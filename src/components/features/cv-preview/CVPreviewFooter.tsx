

import { CVPreviewFooterProps } from '@/types';

export function CVPreviewFooter({ personalInfo, profile }: CVPreviewFooterProps) {
  const gdprClause = personalInfo?.gdprClause || profile?.gdprClause;
  if (!gdprClause) return null;

  return (
    <footer className='border-t border-black text-[10px] text-black text-justify leading-tight mt-(--sec-spacing) pt-(--title-mb)'>
      {gdprClause}
    </footer>
  );
}
