# Project Context

We are building a CV and Portfolio Builder for developers. The application allows users to manage their projects and dynamically generate CV views (summaries, project lists) tailored to specific job roles.

The primary goal is not just creating a static file, but collecting structured data (JSON) via the UI (forms) and leveraging AI to filter and highlight relevant projects and skills for specific job offers.

---

# Tech Stack & Conventions

Primary language is english!
As an AI assistant, you must strictly adhere to the following rules when generating code:

1. **Framework & Paradigms:**
   - Use Next.js with the App Router.
   - Write code exclusively in JavaScript / TypeScript.
   - **Strictly use the functional programming approach.** Do not write or use Class Components. All logic and components must be based on functions and hooks.
   - All components rendering UI interactions must include the `"use client"` directive. Prefer Server Components for data fetching.

2. **Dependency Management (NPM / Terminal):**
   - **Do not install any packages autonomously.** You must ask the user for explicit permission before introducing a new dependency.
   - When suggesting a new package, provide the installation command explicitly and **always use the latest versions** (e.g., `npm install package-name@latest`). Wait for the user's approval.
   - Before proposing a new library, verify if the problem can be solved more simply using native React/JS features.

3. **Forms & Validation:**
   - ALWAYS use `React Hook Form` for form handling.
   - ALWAYS use `Zod` for data validation.
   - Use `useFieldArray` for managing dynamic lists (e.g., adding multiple tech stack tags or achievements).

4. **Styling & UI:**
   - Use **Tailwind CSS** and **shadcn/ui**.
   - Prefer implementing standard `shadcn/ui` components over building custom UI elements from scratch.
   - Do not use inline styles (`style={{ ... }}`).
   - **Always use Mobile First approach.** Design and style UI for mobile devices first, then use responsive Tailwind prefixes (e.g., `sm:`, `md:`, `lg:`) to adjust layouts for larger screens.

5. **Data Architecture (JSON):**
   - The project object must contain flexible yet strictly defined fields.
   - Remember that data collected from the UI will ultimately serve as the prompt payload for the CV Agent.

6. **Directory Structure & File Placement (Strictly inside `src/`):**
   - All application code must be placed inside the `src/` directory to keep the root folder clean.
   - `src/app/` - exclusively for Next.js App Router routing (`page.tsx`, `layout.tsx`). Keep these files lean; do not place heavy business logic here.
   - `src/components/ui/` - exclusively for generic, reusable `shadcn/ui` components.
   - `src/components/features/` - for domain-specific UI components (e.g., `ProjectForm`, `TechStackSelect`).
   - `src/components/...` - for UI components. **NEVER define Zod schemas or TypeScript types in these files.**
   - `src/types/` - dedicated directory for TypeScript types. All types and interfaces MUST be exported from here. Do not leave random interfaces floating in component files.
   - `src/lib/` - for utility functions, configuration setups, and Zod schemas (e.g., `src/lib/validations.ts`).
   - `src/hooks/` - for custom, reusable React hooks.
   - `src/actions/` - exclusively for Next.js Server Actions (e.g., database mutations, interactions with AI APIs). All files here must use the `"use server"` directive.

7. **Database & ORM:**
   - Use Prisma ORM with **Vercel Postgres** as the database provider.
   - The Prisma schema (`schema.prisma`) must be configured to use Vercel's standard environment variables (e.g., `env("POSTGRES_PRISMA_URL")` for the connection and `env("POSTGRES_URL_NON_POOLING")` for the direct URL).
   - The Prisma client must be instantiated as a singleton in `src/lib/prisma.ts` to prevent multiple connections during hot-reloading in development.
   - Database operations (CRUD) must ONLY be executed inside Server Actions (`src/actions/`). NEVER attempt to query the database directly from Client Components.

8. **Authentication & Authorization:**
   - Use `NextAuth.js` (Auth.js v5) for user authentication.
   - All Server Actions interacting with the database must first verify the user's session. Unauthenticated requests must throw an error.
   - User data must be strictly isolated. Users can only fetch, update, or delete their own projects and CVs based on their `userId`.

9. **AI Integration (LLM):**
   - Use the official `Vercel AI SDK` (the `ai` package) for interacting with LLMs.
   - Do not write custom fetch implementations for AI APIs.
   - Keep AI streaming logic inside Server Actions or dedicated API Route Handlers.

10. **PDF Generation / Exporting:**

- Do NOT use heavy PDF generation libraries like `@react-pdf/renderer` or `Puppeteer` for the MVP phase.
- Implement PDF exporting purely via CSS print media queries (`@media print`).
- Ensure the generated CV view is optimized for A4 size, hides UI controls (like buttons/navbars) during printing, and correctly handles page breaks.

11. **Complex Form State Management:**

- For multi-step wizards (e.g., building a CV step-by-step), prefer using `Zustand` for client-side global state, or save intermediate "drafts" directly to the database via Server Actions.

12. **Data Structure Truth & i18n:**

- Do not hallucinate data structures. The single source of truth for the JSON shape of a candidate's profile is the Zod schemas located in `src/lib/validations.ts`.
- **Do not implement internationalization (i18n).** Build the MVP assuming a single language layout to reduce unnecessary complexity.

13. **Git Workflow & Branching:**
    - NEVER write implementation code or make changes directly on the `main` branch.
    - Before starting any new feature, database schema update, or bug fix, you MUST analyze the request and propose a proper git branch creation command (e.g., `git checkout -b feature/user-auth` or `git checkout -b database/prisma-schema`).
    - Wait for the user to confirm that they have created and switched to the new branch before generating any code.
    - **Context over Terminal:** Do NOT run unnecessary terminal commands like `git status`, `git diff`, `ls`, or `cat` to check the project state or modified files. You must read the file contents and changes directly using your internal IDE workspace context.
    - **Smart Commits:** When helping with commits, always analyze the ACTUAL changes introduced in the files. Generate precise, meaningful commit messages using the Conventional Commits format (e.g., `feat: added experience sorting`, `fix: resolved Prisma null type mismatch`).

---

# CV Agent Instructions (AI Logic)

When tasked with generating logic for the AI Agent (CV Builder), act as an IT technical recruitment expert.

**CV Agent Workflow:**

1. **Input:** You receive the candidate's profile data in JSON format (projects, tech stack, achievements) and a string specifying the target job role or job description.
2. **Filtering:** Select only the projects and technologies that align with the target role.
3. **View Generation:**
   - If the target is Frontend: highlight UI, React, state management, and rendering optimization.
   - If the target is Fullstack/Backend: highlight architecture, databases, APIs, and system design.
4. **Output:** Return a structured JSON response containing the filtered experience and a tailored professional summary, ready to be rendered by the UI.

---

# Anti-patterns (What NOT to do):

- **Do not co-locate types/schemas with components:** NEVER define Zod schemas, TypeScript interfaces, or API payload types inside the same file as a React component. You MUST always extract them to their dedicated files (`src/lib/validations.ts` and `src/types/`).
- **No redundant React imports:** Do not use `import React from 'react'` in components. Modern Next.js handles JSX automatically. Only import specific hooks (e.g., `import { useState } from 'react'`) when explicitly needed.
- **Redundant UI imports:** Do not import icons from random libraries (e.g., `react-icons`). Use the `lucide-react` library or simple SVG markup as defined in the project's design system.
- Do not introduce outdated libraries and **do not write classes**.
- Do not invent abstract TS types — always infer types directly from Zod schemas (`z.infer<typeof schema>`).
- Do not modify global configuration files (like `tailwind.config.ts` or `next.config.mjs`) without explicit instruction from the user.
- Do not hallucinate standard component names or functions that do not exist in the project structure.

