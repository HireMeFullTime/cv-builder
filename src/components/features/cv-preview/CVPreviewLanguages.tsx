import { TailoredCVData, LanguageData } from '@/types';
import { Language } from '@prisma/client';

interface CVPreviewLanguagesProps {
  languagesData?: TailoredCVData['languages'];
  languages?: Language[];
}

export function CVPreviewLanguages({ languagesData, languages }: CVPreviewLanguagesProps) {
  const languageList = languagesData && languagesData.length > 0 ? languagesData : languages;
  if (!languageList || languageList.length === 0) return null;
  const visibleLanguages = languageList.filter((lang: Language | LanguageData) => lang.name);
  if (visibleLanguages.length === 0) return null;

  return (
    <section>
      <h3 className='text-(length:--cv-text-lg) font-bold uppercase tracking-wider text-black mb-(--title-mb) break-after-avoid'>
        Languages
      </h3>
      <div className='flex flex-col gap-1.5'>
        {visibleLanguages.map((lang: Language | LanguageData) => (
          <div key={lang.id} className='text-(length:--cv-text-sm) text-black leading-snug wrap-break-word break-inside-avoid'>
            <span className='font-bold'>{lang.name}</span>
            {lang.proficiency && <span> – {lang.proficiency}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
