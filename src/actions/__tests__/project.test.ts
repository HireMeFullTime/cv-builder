/// <reference types="jest" />

import { getProjects, upsertProject, deleteProject } from '../project';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Enable mocking of external modules
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Project Server Actions', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('returns empty array if user is not authenticated', async () => {
      // Simulate lack of session
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getProjects();

      expect(result).toEqual([]);
      expect(prisma.project.findMany).not.toHaveBeenCalled();
    });

    it('returns projects from db for authenticated user', async () => {
      // Simulate authenticated user
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-123' } });
      
      const mockProjects = [{ id: 'proj-1', title: 'Test Project' }];
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await getProjects();

      expect(result).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('deleteProject', () => {
    it('throws error if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(deleteProject('proj-1')).rejects.toThrow('Failed to delete project');
      expect(prisma.project.delete).not.toHaveBeenCalled();
    });

    it('deletes project and revalidates path', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-123' } });
      (prisma.project.delete as jest.Mock).mockResolvedValue({ id: 'proj-1' });

      await deleteProject('proj-1');

      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'proj-1', userId: 'user-123' },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('upsertProject', () => {
    const validData = {
      title: 'New App',
      shortDescription: 'A very cool app with lots of features.',
      techStack: ['React', 'Node'],
      isCurrent: true,
    };

    it('throws Unauthorized if not logged in', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(upsertProject(validData)).rejects.toThrow('Unauthorized');
      expect(prisma.project.create).not.toHaveBeenCalled();
      expect(prisma.project.update).not.toHaveBeenCalled();
    });

    it('throws error if validation fails', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-123' } });
      
      const invalidData = { ...validData, title: '' }; // Title too short
      
      await expect(upsertProject(invalidData)).rejects.toThrow();
      expect(prisma.project.create).not.toHaveBeenCalled();
    });

    it('creates new project if no ID is provided', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-123' } });
      
      const expectedPayload = {
        title: validData.title,
        shortDescription: validData.shortDescription,
        role: null,
        linkUrl: null,
        githubUrl: null,
        isCurrent: validData.isCurrent,
        techStack: validData.techStack,
        accomplishments: undefined,
        userId: 'user-123'
      };

      (prisma.project.create as jest.Mock).mockResolvedValue({ id: 'new-proj', ...expectedPayload });

      const result = await upsertProject(validData);

      expect(prisma.project.create).toHaveBeenCalledWith({ data: expectedPayload });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result.id).toBe('new-proj');
    });

    it('updates existing project if ID is provided', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-123' } });
      
      const updateData = { ...validData, id: 'existing-proj' };
      
      (prisma.project.update as jest.Mock).mockResolvedValue(updateData);

      const result = await upsertProject(updateData);

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'existing-proj', userId: 'user-123' },
        data: expect.objectContaining({
          title: validData.title
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result.id).toBe('existing-proj');
    });
  });
});
