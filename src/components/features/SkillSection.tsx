'use client';

import {useState} from 'react';
import {SkillForm} from '@/components/features/SkillForm';
import {deleteSkillCategory} from '@/actions/skill';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Settings2, Edit, Trash2, PlusCircle} from 'lucide-react';
import {toast} from 'sonner';
import {type Skill} from '@prisma/client';
import {Badge} from '@/components/ui/badge';

export function SkillSection({initialSkills}: {initialSkills: Skill[]}) {
	const [isAdding, setIsAdding] = useState(false);
	const [editingCategory, setEditingCategory] = useState<string | null>(null);

	const [isEditingUncategorized, setIsEditingUncategorized] = useState(false);

	const skillsByCategory = initialSkills.reduce(
		(acc, skill) => {
			const cat = skill.category || '';
			if (!acc[cat]) {
				acc[cat] = [];
			}
			acc[cat].push(skill.name);
			return acc;
		},
		{} as Record<string, string[]>
	);

	const categories = Object.keys(skillsByCategory);

	const handleDelete = (category: string) => {
		toast(`Are you sure you want to delete all skills in "${category || 'Uncategorized'}"?`, {
			action: {
				label: 'Delete',
				onClick: async () => {
					try {
						await deleteSkillCategory(category || null);
						toast.success('Skills deleted');
					} catch {
						toast.error('Failed to delete skills');
					}
				}
			},
			cancel: {
				label: 'Cancel',
				onClick: () => {}
			}
		});
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h3 className='text-xl font-bold'>Skills</h3>
					<p className='text-sm text-muted-foreground'>List your technical and soft skills, grouped by category.</p>
				</div>
				{!isAdding && !editingCategory && !isEditingUncategorized && (
					<Button onClick={() => setIsAdding(true)}>
						<PlusCircle className='w-4 h-4 mr-2' /> Add Skills
					</Button>
				)}
			</div>

			{isAdding && <SkillForm onClose={() => setIsAdding(false)} />}

			<div className='grid grid-cols-1 gap-6'>
				{categories.map(cat => {
					const isCurrentlyEditing = cat === editingCategory || (cat === '' && isEditingUncategorized);

					if (isCurrentlyEditing) {
						return (
							<SkillForm
								key={`edit-${cat}`}
								initialCategory={cat || undefined}
								initialSkills={skillsByCategory[cat]}
								onClose={() => {
									setEditingCategory(null);
									setIsEditingUncategorized(false);
								}}
							/>
						);
					}

					return (
						<Card key={`view-${cat}`}>
							<CardHeader className='pb-3 pt-5'>
								<div className='flex justify-between items-center'>
									<div className='flex items-center gap-3'>
										<div className='p-2 bg-primary/10 rounded-full shrink-0'>
											<Settings2 className='w-4 h-4 text-primary' />
										</div>
										<CardTitle className='text-lg font-bold'>{cat || 'Uncategorized'}</CardTitle>
									</div>
									<div className='flex gap-1 shrink-0'>
										<Button
											variant='ghost'
											size='icon'
											className='h-8 w-8'
											aria-label={`Edit ${cat || 'Uncategorized'} skills`}
											onClick={() => {
												if (cat === '') setIsEditingUncategorized(true);
												else setEditingCategory(cat);
											}}
										>
											<Edit className='w-4 h-4 text-muted-foreground' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											className='h-8 w-8'
											aria-label={`Delete ${cat || 'Uncategorized'} skills`}
											onClick={() => handleDelete(cat)}
										>
											<Trash2 className='w-4 h-4 text-destructive' />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className='flex flex-wrap gap-2'>
									{skillsByCategory[cat].map(skill => (
										<Badge key={skill} variant='secondary' className='px-3 py-1 text-sm font-medium'>
											{skill}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					);
				})}

				{categories.length === 0 && !isAdding && (
					<div className='p-8 border border-dashed rounded-md text-center'>
						<Settings2 className='w-8 h-8 text-muted-foreground mx-auto mb-3' />
						<h4 className='font-medium text-foreground mb-1'>No skills added yet</h4>
						<p className='text-sm text-muted-foreground mb-4'>Add your technical and soft skills to stand out.</p>
						<Button onClick={() => setIsAdding(true)} variant='outline'>
							<PlusCircle className='w-4 h-4 mr-2' /> Add Skills
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
