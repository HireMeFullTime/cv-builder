import {
  profileSchema,
  skillSchema,
  skillsFormSchema,
  projectSchema,
  experienceSchema,
  educationSchema,
  languageSchema,
  loginSchema,
  registerSchema,
  cvBuilderFormSchema,
} from '../validations';

// ─── profileSchema ───────────────────────────────────────────

describe('profileSchema', () => {
  const validProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  it('accepts valid minimal profile', () => {
    expect(() => profileSchema.parse(validProfile)).not.toThrow();
  });

  it('accepts valid full profile', () => {
    const full = {
      ...validProfile,
      title: 'Senior Developer',
      phone: '+48 123 456 789',
      location: 'Warsaw, Poland',
      githubUrl: 'https://github.com/johndoe',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      bio: 'A passionate developer.',
      gdprClause: 'I agree to processing...',
    };
    expect(() => profileSchema.parse(full)).not.toThrow();
  });

  it('rejects firstName shorter than 2 chars', () => {
    const result = profileSchema.safeParse({ ...validProfile, firstName: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects firstName longer than 50 chars', () => {
    const result = profileSchema.safeParse({ ...validProfile, firstName: 'A'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = profileSchema.safeParse({ ...validProfile, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects email longer than 255 chars', () => {
    const longEmail = 'a'.repeat(250) + '@b.com';
    const result = profileSchema.safeParse({ ...validProfile, email: longEmail });
    expect(result.success).toBe(false);
  });

  it('rejects invalid githubUrl', () => {
    const result = profileSchema.safeParse({ ...validProfile, githubUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('allows empty string for githubUrl', () => {
    const result = profileSchema.safeParse({ ...validProfile, githubUrl: '' });
    expect(result.success).toBe(true);
  });

  it('rejects bio longer than 2000 chars', () => {
    const result = profileSchema.safeParse({ ...validProfile, bio: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});

// ─── skillSchema ─────────────────────────────────────────────

describe('skillSchema', () => {
  it('accepts valid skill', () => {
    expect(() => skillSchema.parse({ name: 'React' })).not.toThrow();
  });

  it('rejects empty skill name', () => {
    const result = skillSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects skill name longer than 50 chars', () => {
    const result = skillSchema.safeParse({ name: 'x'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('accepts skill with optional category', () => {
    const result = skillSchema.safeParse({ name: 'TypeScript', category: 'Languages' });
    expect(result.success).toBe(true);
  });
});

// ─── skillsFormSchema ────────────────────────────────────────

describe('skillsFormSchema', () => {
  it('accepts valid skills form data', () => {
    const result = skillsFormSchema.safeParse({
      category: 'Frontend',
      skills: ['React', 'Vue'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty skills array', () => {
    const result = skillsFormSchema.safeParse({
      category: 'Frontend',
      skills: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects skill name longer than 50 chars in array', () => {
    const result = skillsFormSchema.safeParse({
      skills: ['x'.repeat(51)],
    });
    expect(result.success).toBe(false);
  });
});

// ─── projectSchema ───────────────────────────────────────────

describe('projectSchema', () => {
  const validProject = {
    title: 'My Project',
    shortDescription: 'A cool project that does stuff',
    techStack: ['React', 'Node.js'],
    isCurrent: false,
  };

  it('accepts valid project', () => {
    expect(() => projectSchema.parse(validProject)).not.toThrow();
  });

  it('rejects title shorter than 2 chars', () => {
    const result = projectSchema.safeParse({ ...validProject, title: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects shortDescription shorter than 10 chars', () => {
    const result = projectSchema.safeParse({ ...validProject, shortDescription: 'Short' });
    expect(result.success).toBe(false);
  });

  it('rejects shortDescription longer than 500 chars', () => {
    const result = projectSchema.safeParse({ ...validProject, shortDescription: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejects empty techStack', () => {
    const result = projectSchema.safeParse({ ...validProject, techStack: [] });
    expect(result.success).toBe(false);
  });

  it('accepts project with optional URLs', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      linkUrl: 'https://example.com',
      githubUrl: 'https://github.com/user/repo',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid linkUrl', () => {
    const result = projectSchema.safeParse({ ...validProject, linkUrl: 'not-url' });
    expect(result.success).toBe(false);
  });

  it('allows empty string for linkUrl', () => {
    const result = projectSchema.safeParse({ ...validProject, linkUrl: '' });
    expect(result.success).toBe(true);
  });

  it('accepts project with accomplishments', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      accomplishments: [{ value: 'Built a feature' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects accomplishment shorter than 3 chars', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      accomplishments: [{ value: 'AB' }],
    });
    expect(result.success).toBe(false);
  });
});

// ─── experienceSchema ────────────────────────────────────────

describe('experienceSchema', () => {
  const validExperience = {
    jobTitle: 'Frontend Developer',
    company: 'TechCorp',
    startDate: new Date('2022-01-01'),
    isCurrent: true,
  };

  it('accepts valid experience', () => {
    expect(() => experienceSchema.parse(validExperience)).not.toThrow();
  });

  it('rejects jobTitle shorter than 2 chars', () => {
    const result = experienceSchema.safeParse({ ...validExperience, jobTitle: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects company shorter than 2 chars', () => {
    const result = experienceSchema.safeParse({ ...validExperience, company: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects endDate before startDate', () => {
    const result = experienceSchema.safeParse({
      ...validExperience,
      isCurrent: false,
      endDate: new Date('2021-06-01'), // before startDate
    });
    expect(result.success).toBe(false);
  });

  it('accepts endDate equal to startDate', () => {
    const result = experienceSchema.safeParse({
      ...validExperience,
      isCurrent: false,
      endDate: new Date('2022-01-01'),
    });
    expect(result.success).toBe(true);
  });

  it('accepts endDate after startDate', () => {
    const result = experienceSchema.safeParse({
      ...validExperience,
      isCurrent: false,
      endDate: new Date('2023-06-01'),
    });
    expect(result.success).toBe(true);
  });

  it('rejects description longer than 2000 chars', () => {
    const result = experienceSchema.safeParse({
      ...validExperience,
      description: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ─── educationSchema ─────────────────────────────────────────

describe('educationSchema', () => {
  const validEducation = {
    institution: 'MIT',
    degree: 'Computer Science',
    startDate: new Date('2018-09-01'),
    isCurrent: false,
    endDate: new Date('2022-06-01'),
  };

  it('accepts valid education', () => {
    expect(() => educationSchema.parse(validEducation)).not.toThrow();
  });

  it('rejects institution shorter than 2 chars', () => {
    const result = educationSchema.safeParse({ ...validEducation, institution: 'M' });
    expect(result.success).toBe(false);
  });

  it('rejects degree shorter than 2 chars', () => {
    const result = educationSchema.safeParse({ ...validEducation, degree: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects endDate before startDate', () => {
    const result = educationSchema.safeParse({
      ...validEducation,
      endDate: new Date('2017-01-01'),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid URL', () => {
    const result = educationSchema.safeParse({ ...validEducation, url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('allows empty string for url', () => {
    const result = educationSchema.safeParse({ ...validEducation, url: '' });
    expect(result.success).toBe(true);
  });

  it('rejects description longer than 1000 chars', () => {
    const result = educationSchema.safeParse({
      ...validEducation,
      description: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

// ─── languageSchema ──────────────────────────────────────────

describe('languageSchema', () => {
  it('accepts valid language', () => {
    const result = languageSchema.safeParse({ name: 'English', proficiency: 'C2' });
    expect(result.success).toBe(true);
  });

  it('accepts Native proficiency', () => {
    const result = languageSchema.safeParse({ name: 'Polish', proficiency: 'Native' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid proficiency level', () => {
    const result = languageSchema.safeParse({ name: 'English', proficiency: 'X1' });
    expect(result.success).toBe(false);
  });

  it('rejects name shorter than 2 chars', () => {
    const result = languageSchema.safeParse({ name: 'E', proficiency: 'B2' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 50 chars', () => {
    const result = languageSchema.safeParse({ name: 'x'.repeat(51), proficiency: 'B2' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid proficiency levels', () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'] as const;
    for (const level of levels) {
      const result = languageSchema.safeParse({ name: 'Test', proficiency: level });
      expect(result.success).toBe(true);
    }
  });
});

// ─── loginSchema ─────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects password longer than 100 chars', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects email longer than 255 chars', () => {
    const longEmail = 'a'.repeat(250) + '@b.com';
    const result = loginSchema.safeParse({ email: longEmail, password: 'secret123' });
    expect(result.success).toBe(false);
  });
});

// ─── registerSchema ──────────────────────────────────────────

describe('registerSchema', () => {
  const validRegister = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('accepts valid registration data', () => {
    expect(() => registerSchema.parse(validRegister)).not.toThrow();
  });

  it('rejects name shorter than 2 chars', () => {
    const result = registerSchema.safeParse({ ...validRegister, name: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'Passwordd',
      confirmPassword: 'Passwordd',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: 'DifferentPassword1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password longer than 100 chars', () => {
    const longPass = 'A1' + 'x'.repeat(99);
    const result = registerSchema.safeParse({
      ...validRegister,
      password: longPass,
      confirmPassword: longPass,
    });
    expect(result.success).toBe(false);
  });
});

// ─── cvBuilderFormSchema ─────────────────────────────────────

describe('cvBuilderFormSchema', () => {
  const validForm = {
    jobTitle: 'Frontend Developer',
    jobDescription: 'We are looking for an experienced developer with React skills.',
  };

  it('accepts valid CV builder form data', () => {
    expect(() => cvBuilderFormSchema.parse(validForm)).not.toThrow();
  });

  it('rejects jobTitle shorter than 3 chars', () => {
    const result = cvBuilderFormSchema.safeParse({ ...validForm, jobTitle: 'FE' });
    expect(result.success).toBe(false);
  });

  it('rejects jobTitle longer than 100 chars', () => {
    const result = cvBuilderFormSchema.safeParse({ ...validForm, jobTitle: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects jobDescription shorter than 20 chars', () => {
    const result = cvBuilderFormSchema.safeParse({ ...validForm, jobDescription: 'Too short' });
    expect(result.success).toBe(false);
  });

  it('rejects jobDescription longer than 10000 chars', () => {
    const result = cvBuilderFormSchema.safeParse({ ...validForm, jobDescription: 'x'.repeat(10001) });
    expect(result.success).toBe(false);
  });

  it('accepts optional useDemoData flag', () => {
    const result = cvBuilderFormSchema.safeParse({ ...validForm, useDemoData: true });
    expect(result.success).toBe(true);
  });
});
