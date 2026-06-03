import { ParsedTailoredCV } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface CVHistoryListProps {
  cvs: ParsedTailoredCV[];
  onSelectCv: (cv: ParsedTailoredCV) => void;
  onDelete: (id: string) => void;
}

export function CVHistoryList({ cvs, onSelectCv, onDelete }: CVHistoryListProps) {
  return (
    <Card className='flex-1 overflow-auto'>
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>Your previously generated CVs.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        {cvs.length === 0 ? (
          <p className='text-sm text-muted-foreground text-center py-4'>No CVs generated yet.</p>
        ) : (
          cvs.map(cv => (
            <div
              key={cv.id}
              className='flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50'
              onClick={() => onSelectCv(cv)}
            >
              <div className='overflow-hidden'>
                <p className='font-medium truncate'>{cv.jobTitle}</p>
                <p className='text-xs text-muted-foreground'>
                  {new Date(cv.createdAt).toLocaleDateString('en-US')}
                </p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='text-destructive hover:bg-destructive/10 shrink-0 ml-2'
                aria-label='Delete CV'
                onClick={e => {
                  e.stopPropagation();
                  onDelete(cv.id);
                }}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
