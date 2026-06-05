/// <reference types="jest" />

import { getTailoredCVs, getTailoredCVById, deleteTailoredCV, updateTailoredCV, generateTailoredCV } from '../cv';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateText } from 'ai';

// Mocking dependencies
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    tailoredCV: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    profile: { findUnique: jest.fn() },
    experience: { findMany: jest.fn() },
    project: { findMany: jest.fn() },
    skill: { findMany: jest.fn() },
    education: { findMany: jest.fn() },
    language: { findMany: jest.fn() },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('ai', () => ({
  generateText: jest.fn(),
  Output: {
    object: jest.fn(),
  },
}));

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn().mockReturnValue(jest.fn()),
}));

describe('CV Server Actions', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTailoredCVs', () => {
    it('returns empty array if user is not authenticated', async () => {
      // Simulate lack of session
      (auth as jest.Mock).mockResolvedValue(null);
      const result = await getTailoredCVs();
      expect(result).toEqual([]);
    });

    it('returns successfully parsed CVs', async () => {
      // Simulate authenticated user
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      
      const mockDbCVs = [
        {
          id: 'cv-1',
          jobTitle: 'Frontend Dev',
          generatedContent: {
            personalInfo: { firstName: 'John', lastName: 'Doe', email: 'j@d.com' },
            summary: 'A good dev',
            relevantSkills: ['React'],
            selectedExperiences: [],
            projects: [],
            selectedEducations: [],
            languages: []
          }
        },
        {
          id: 'cv-2',
          jobTitle: 'Backend Dev',
          generatedContent: { invalid_content: true } // should fail Zod parsing
        }
      ];

      (prisma.tailoredCV.findMany as jest.Mock).mockResolvedValue(mockDbCVs);

      const result = await getTailoredCVs();

      expect(prisma.tailoredCV.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
      // Should only return the CV that passed Zod validation
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('cv-1');
    });
  });

  describe('getTailoredCVById', () => {
    it('returns null if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      const result = await getTailoredCVById('cv-1');
      expect(result).toBeNull();
    });

    it('returns parsed CV if found', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      const mockCV = {
        id: 'cv-1',
        generatedContent: {
          personalInfo: { firstName: 'John', lastName: 'Doe', email: 'j@d.com' },
          summary: 'A good dev',
          relevantSkills: ['React'],
          selectedExperiences: [],
          projects: [],
          selectedEducations: [],
          languages: []
        }
      };

      (prisma.tailoredCV.findUnique as jest.Mock).mockResolvedValue(mockCV);

      const result = await getTailoredCVById('cv-1');
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe('cv-1');
    });
  });

  describe('deleteTailoredCV', () => {
    it('throws error if unauthorized', async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      await expect(deleteTailoredCV('cv-1')).rejects.toThrow('Failed to delete tailored CV');
    });

    it('deletes CV and revalidates path', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      await deleteTailoredCV('cv-1');
      
      expect(prisma.tailoredCV.delete).toHaveBeenCalledWith({
        where: { id: 'cv-1', userId: 'user-1' }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('updateTailoredCV', () => {
    const validContent = {
      personalInfo: { firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
      summary: 'Updated summary',
      relevantSkills: ['React'],
      selectedExperiences: [],
      projects: [],
      selectedEducations: [],
      languages: []
    };

    it('throws error if unauthorized', async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      await expect(updateTailoredCV('cv-1', validContent)).rejects.toThrow('Failed to update tailored CV');
    });

    it('updates CV when content is valid', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      
      await updateTailoredCV('cv-1', validContent);
      
      expect(prisma.tailoredCV.update).toHaveBeenCalledWith({
        where: { id: 'cv-1', userId: 'user-1' },
        data: expect.objectContaining({
          generatedContent: validContent
        })
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('generateTailoredCV', () => {
    it('returns error if user is unauthorized', async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      await expect(generateTailoredCV('Dev', 'Job Desc')).rejects.toThrow('Unauthorized');
    });

    it('returns rate limit error if user generated a CV recently', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tailoredCV.count as jest.Mock).mockResolvedValue(1); // Already generated in the last minute

      const result = await generateTailoredCV('Dev', 'Desc');
      expect(result).toEqual({
        success: false,
        error: "You're generating CVs too quickly! Please wait a minute before trying again."
      });
    });

    it('returns generic error on fetch timeout or AI failure', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tailoredCV.count as jest.Mock).mockResolvedValue(0);
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue({ firstName: 'Test' });
      (prisma.experience.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.skill.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.education.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.language.findMany as jest.Mock).mockResolvedValue([]);

      (generateText as jest.Mock).mockRejectedValue(new Error('timeout'));

      const result = await generateTailoredCV('Dev', 'Desc');
      expect(result.success).toBe(false);
      expect(result.error).toContain('took too long');
    });

    it('successfully generates CV using AI and saves to DB', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.tailoredCV.count as jest.Mock).mockResolvedValue(0);
      
      // Mock db queries
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue({ 
        firstName: 'John', 
        lastName: 'Doe',
        email: 'j@d.com'
      });
      (prisma.experience.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.skill.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.education.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.language.findMany as jest.Mock).mockResolvedValue([]);

      // Mock AI response
      const mockAiResponse = {
        summary: 'AI Summary',
        relevantSkills: ['AI Skill'],
        selectedExperiences: [],
        projects: [],
        selectedEducations: [],
        languages: []
      };

      (generateText as jest.Mock).mockResolvedValue({ output: mockAiResponse });
      (prisma.tailoredCV.create as jest.Mock).mockResolvedValue({ id: 'new-cv' });

      const result = await generateTailoredCV('Frontend', 'Desc');
      
      expect(generateText).toHaveBeenCalled();
      expect(prisma.tailoredCV.create).toHaveBeenCalled();
      expect(result).toEqual({ success: true, id: 'new-cv' });
    });
  });
});
