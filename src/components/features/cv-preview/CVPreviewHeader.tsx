import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { GithubIcon } from '@/components/ui/icons';

import { CVPreviewHeaderProps } from '@/types';

export function CVPreviewHeader({ personalInfo, profile, jobTitleOverride, jobTitle }: CVPreviewHeaderProps) {
  const firstName = personalInfo?.firstName || profile?.firstName;
  const lastName = personalInfo?.lastName || profile?.lastName;
  const title = jobTitleOverride || jobTitle || personalInfo?.title || profile?.title || 'Professional';
  const email = personalInfo?.email || profile?.email;
  const phone = personalInfo?.phone || profile?.phone;
  const location = personalInfo?.location || profile?.location;
  const linkedinUrl = personalInfo?.linkedinUrl || profile?.linkedinUrl;
  const githubUrl = personalInfo?.githubUrl || profile?.githubUrl;

  return (
    <header className='border-b-2 border-black pb-4 mb-(--sec-spacing)'>
      <h1 className='text-(length:--cv-text-4xl) leading-none font-bold text-black tracking-tight uppercase'>
        {firstName} {lastName}
      </h1>
      <h2 className='text-(length:--cv-text-xl) font-medium text-black mt-2'>
        {title}
      </h2>

      <div className='flex flex-wrap gap-x-4 gap-y-2 mt-4 text-(length:--cv-text-sm) text-black'>
        {email && (
          <div className='flex items-center gap-1.5'>
            <Mail className='w-4 h-4' />
            <Link href={`mailto:${email}`} className='hover:underline text-black'>
              {email}
            </Link>
          </div>
        )}
        {phone && (
          <div className='flex items-center gap-1.5'>
            <Phone className='w-4 h-4' />
            <Link href={`tel:${phone}`} className='hover:underline text-black'>
              {phone}
            </Link>
          </div>
        )}
        {location && (
          <div className='flex items-center gap-1.5'>
            <MapPin className='w-4 h-4' />
            <span>{location}</span>
          </div>
        )}
        {linkedinUrl && (
          <div className='flex items-center gap-1.5'>
            <LinkIcon className='w-4 h-4' />
            <Link
              href={linkedinUrl}
              target='_blank'
              rel='noreferrer'
              className='hover:underline text-black'
            >
              {linkedinUrl
                .replace('https://www.', '')
                .replace('https://', '')}
            </Link>
          </div>
        )}
        {githubUrl && (
          <div className='flex items-center gap-1.5'>
            <GithubIcon className='w-4 h-4' />
            <Link
              href={githubUrl}
              target='_blank'
              rel='noreferrer'
              className='hover:underline text-black'
            >
              {githubUrl.replace('https://', '')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
