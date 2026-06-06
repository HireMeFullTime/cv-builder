'use client';

import {useState} from 'react';
import {ProjectForm} from '@/components/features/ProjectForm';
import {deleteProject} from '@/actions/project';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {FolderGit2, Link as LinkIcon, Edit, Trash2, PlusCircle, Code2} from 'lucide-react';
import {toast} from 'sonner';
import {type Project} from '@prisma/client';
import {Badge} from '@/components/ui/badge';
import Link from 'next/link';

export function ProjectSection({initialProjects}: {initialProjects: Project[]}) {
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const handleDelete = (id: string) => {
		toast('Are you sure you want to delete this project?', {
			action: {
				label: 'Delete',
				onClick: async () => {
					try {
						await deleteProject(id);
						toast.success('Project deleted');
					} catch {
						toast.error('Failed to delete project');
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
			<div className='flex flex-wrap justify-between items-center gap-4'>
				<div>
					<h3 className='text-xl font-bold'>Projects</h3>
					<p className='text-sm text-muted-foreground'>Manage your portfolio projects and technical achievements.</p>
				</div>
				{!isAdding && !editingId && (
					<Button onClick={() => setIsAdding(true)}>
						<PlusCircle className='w-4 h-4 mr-2' /> Add Project
					</Button>
				)}
			</div>

			{isAdding && <ProjectForm onClose={() => setIsAdding(false)} />}

			<div className='space-y-4'>
				{initialProjects.map(project => {
					if (editingId === project.id) {
						return <ProjectForm key={project.id} initialData={project} onClose={() => setEditingId(null)} />;
					}

					return (
						<Card key={project.id}>
							<CardHeader className='pb-3'>
								<div className='flex justify-between items-start'>
									<div>
										<CardTitle className='text-lg flex items-center gap-2'>
											<FolderGit2 className='w-5 h-5 text-primary' />
											{project.title}
											{project.isCurrent && (
												<Badge variant='outline' className='ml-2 text-[10px] font-normal uppercase tracking-wider'>
													Current
												</Badge>
											)}
										</CardTitle>
										{project.role && (
											<CardDescription className='text-base font-medium text-foreground mt-1'>
												{project.role}
											</CardDescription>
										)}
									</div>
									<div className='flex gap-2'>
										<Button
											variant='ghost'
											size='icon'
											aria-label='Edit project'
											onClick={() => setEditingId(project.id)}
										>
											<Edit className='w-4 h-4 text-muted-foreground' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											aria-label='Delete project'
											onClick={() => handleDelete(project.id)}
										>
											<Trash2 className='w-4 h-4 text-destructive' />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className='pb-4'>
								<p className='text-sm text-muted-foreground mb-4'>{project.shortDescription}</p>

								<div className='flex flex-wrap gap-2 mb-4'>
									{project.techStack.map(tech => (
										<Badge key={tech} variant='secondary' className='px-2 py-0.5 text-xs font-normal lowercase'>
											{tech}
										</Badge>
									))}
								</div>

								{project.accomplishments &&
									Array.isArray(project.accomplishments) &&
									project.accomplishments.length > 0 && (
										<div className='mb-4'>
											<ul className='list-disc list-inside text-sm space-y-1'>
												{(project.accomplishments as {value: string}[]).map((acc, i) => (
													<li key={i} className='text-muted-foreground'>
														<span className='text-foreground'>{acc.value}</span>
													</li>
												))}
											</ul>
										</div>
									)}

								<div className='flex gap-4 mt-2'>
									{project.linkUrl && (
										<Link
											href={project.linkUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='flex items-center text-sm text-primary hover:underline'
										>
											<LinkIcon className='w-4 h-4 mr-1' /> Live Preview
										</Link>
									)}
									{project.githubUrl && (
										<Link
											href={project.githubUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='flex items-center text-sm text-primary hover:underline'
										>
											<Code2 className='w-4 h-4 mr-1' /> Source Code
										</Link>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}

				{initialProjects.length === 0 && !isAdding && (
					<div className='p-8 border border-dashed rounded-md text-center'>
						<FolderGit2 className='w-8 h-8 text-muted-foreground mx-auto mb-3' />
						<h4 className='font-medium text-foreground mb-1'>No projects added yet</h4>
						<p className='text-sm text-muted-foreground mb-4'>Add your technical projects to showcase your skills.</p>
						<Button onClick={() => setIsAdding(true)} variant='outline'>
							<PlusCircle className='w-4 h-4 mr-2' /> Add Project
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
