
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles } from 'lucide-react';

import { CVGeneratorFormProps } from '@/types';

export function CVGeneratorForm({ form, onSubmit, isGenerating, profile }: CVGeneratorFormProps) {
  const useDemoData = form.watch('useDemoData');

  const renderSubmitButtonContent = () => {
    if (isGenerating) {
      return (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Generating (Takes ~10-20s)
        </>
      );
    }
    if (!profile && !useDemoData) return 'Profile Required';
    return 'Generate Tailored CV';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Role</CardTitle>
        <CardDescription>Paste the job details to generate a tailored CV.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4'>
          <Sparkles className='w-5 h-5 text-primary shrink-0 mt-0.5' />
          <div className='text-xs text-foreground space-y-1'>
            <p className='font-semibold'>AI-Powered CV Generation</p>
            <p className='opacity-90 leading-relaxed'>
              Our AI analyzes the job description and your profile data to automatically select the most relevant experience, skills, and projects. It also tailors descriptions and generates a professional summary matched to the role.
            </p>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='jobTitle'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Senior Frontend Developer' disabled={isGenerating} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='jobDescription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Paste the full job description here...'
                      className='h-48 resize-none'
                      disabled={isGenerating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='useDemoData'
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isGenerating}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Use Demo Profile Data (Test Drive)</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Generates the CV using a pre-filled Senior Frontend Developer profile instead of your actual database records.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isGenerating || (!profile && !useDemoData)}>
              {renderSubmitButtonContent()}
            </Button>
            {!profile && !useDemoData && (
              <p className='text-sm text-destructive text-center mt-2'>
                You must complete your basic profile before generating a CV.
              </p>
            )}
            <p className='text-[11px] text-muted-foreground text-center mt-3'>
              Generated content is AI-assisted. You can review and edit all sections after generation.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
