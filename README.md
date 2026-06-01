# CV & Portfolio Builder

## Table of contents
- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [AI-First Methodology](#ai-first-methodology)
- [Links](#links)
- [Process](#process)
  - [Built with](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
  - [Running Tests](#running-tests)
- [Important Decisions](#important-decisions)
  - [Key Aspects](#key-aspects)
  - [Security & Validation](#security--validation)
  - [PDF Generation Note](#pdf-generation-note)
- [Future Features & Ideas](#future-features--ideas)
- [Screenshots](#screenshots)

## Overview
This project is a dedicated **CV & Portfolio Builder tailored specifically for software developers and IT professionals**. It goes beyond standard CV templates by focusing on technical skills, project portfolios, and dynamic AI-driven tailoring for specific tech roles.
### The challenge

Users can:
- **Manage Professional Data:** Add, edit, and organize their personal profile, skills, education, experience, languages, and technical projects.
- **Dynamic CV Generation:** Input a target job title and description to dynamically generate a tailored CV. The system uses AI to filter and highlight relevant projects and skills for specific job offers.
- **Secure Authentication:** Sign in securely using OAuth providers (GitHub, Google) via NextAuth.
- **Real-time Feedback:** Experience immediate feedback via toast notifications (e.g., login errors, save successes) and skeleton loaders during data fetching.
- **Export to PDF:** Generate a clean, A4-optimized CV view and export it seamlessly to PDF.
- **Other:**
  - **Responsive Design:** Optimized for both mobile and desktop viewports, following a strict mobile-first approach.
  - **Error Handling:** Robust handling of OAuth linking errors and runtime validation.
  - **Performance:** Optimized data fetching with parallel queries (`Promise.all`) avoiding N+1 problems.

### AI-First Methodology

This project was developed using an **AI-First methodology**. Instead of traditional solo coding, I closely collaborated with an advanced AI agent throughout the entire software development lifecycle. 

- **Architectural Consultation:** The AI was consulted regarding the choice of technology stack, state management, and database schemas.
- **Rule Enforcement:** A strict set of guidelines (`AGENTS.md`) was established, outlining coding standards (Functional Programming, strict Zod validation, Server Actions). The AI was responsible for adhering to these rules while generating code.
- **Code Review & Iteration:** I actively reviewed the AI-generated code, requested corrections, pointed out UX/UI flaws, and supervised security audits to ensure the final product met high-quality engineering standards.

## Links

- [Live Demo](https://cv-builder-alpha-dun.vercel.app/)

### Demo Account (for recruiters & reviewers)
If you just want to see the app in action without creating an account or using OAuth, feel free to log in with these test credentials:
- **Email:** `test@wp.pl`
- **Password:** `Testtest1234`


## Process

### Built with

- **Next.js** (App Router, Server Actions, Server and Client components)
- **TypeScript**
- **Tailwind CSS & shadcn/ui** (Clean, mobile-first styling)
- **Prisma ORM & Vercel Postgres** (Robust database architecture)
- **NextAuth.js / Auth.js v5** (Authentication)
- **Vercel AI SDK** (Generative AI integration with Gemini)
- **Zod & React Hook Form** (Strict runtime validation and form handling)

## Getting Started

### Prerequisites

- Node.js (version 18.x or higher recommended)
- npm (or yarn/pnpm/bun)
- A PostgreSQL database (e.g., Vercel Postgres)
- Gemini API Key for the CV generation

### Installation

Clone the repository:
```bash
git clone [https://github.com/your-username/cv-builder.git]
```

Navigate to the project directory:
```bash
cd cv-builder
```

Install dependencies:
```bash
npm install
```

### Running Locally

Before starting the development server, ensure you have the required environment variables set in a `.env` file at the root of the project:

```env
# Database
POSTGRES_PRISMA_URL="your_database_url_here"

# Authentication
AUTH_SECRET="your_nextauth_secret_here"
AUTH_GITHUB_ID="your_github_id_here"
AUTH_GITHUB_SECRET="your_github_secret_here"
AUTH_GOOGLE_ID="your_google_id_here"
AUTH_GOOGLE_SECRET="your_google_secret_here"

# AI Integration
GEMINI_API_KEY="your_gemini_api_key_here"
```

Sync the database schema:
```bash
npx prisma db push
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running Tests

To run the full test suite (Jest & React Testing Library):

```bash
npm test
```
*(Note: Tests are currently in the implementation phase.)*

## Important Decisions

### Key Aspects

- **Server Actions for Mutations:** All database interactions (CRUD) and AI generations are handled securely via Next.js Server Actions. No direct database queries are made from Client Components.
- **Component Colocation:** Zod schemas and TypeScript interfaces are strictly decoupled from UI components, residing in dedicated `src/lib/` and `src/types/` directories.

### Security & Validation

- **Data Isolation:** Every single database operation enforcing data retrieval or mutation strictly checks the user's session (`where: { userId: session.user.id }`). This guarantees absolute data isolation between users.
- **Runtime JSON Validation:** The data generated by the AI is stored as JSON in the database. To ensure structural integrity, the payload is parsed and validated at runtime using `Zod` *before* hitting the Prisma client.

### PDF Generation Note

> **Tip**
> **Why CSS over heavy libraries?** For the MVP phase, I intentionally avoided heavy PDF generation libraries. Instead, PDF exporting is implemented purely via CSS print media queries (`@media print`). This ensures the generated CV is optimized for A4 size, hides UI controls during printing, and correctly handles page breaks without bloating the application bundle.

## Future Features & Ideas

While the MVP is fully functional, here are some ideas planned for future iterations:

- **Multiple CV Templates:** Add more diverse visual templates (e.g., Creative, Minimalist, Corporate) beyond the default layout.
- **Native PDF Generation:** Transition from browser-based printing to a dedicated backend PDF generation service (e.g., `@react-pdf/renderer`) for pixel-perfect exports across all devices.
- **Drag & Drop Reordering:** Implement a drag-and-drop interface allowing users to easily reorder sections and items within their generated CVs before exporting.
- **Public Portfolio View:** Generate a unique, shareable link for each CV to act as a live web portfolio.
- **CV Duplication:** Allow users to duplicate existing generated CVs to quickly iterate or create slight variations.
- **DOCX Export:** Provide the ability to export the tailored CV to Microsoft Word (.docx) and PDF format.
- **Smart JSON Import:** Allow users to upload their existing CV data in JSON format, automatically mapping and populating the app's internal profile structure.
- **Account Deletion:** Provide users with a self-service option to permanently delete their account and all associated data, ensuring full privacy and GDPR compliance.


## Screenshots

*(Add screenshots of your application here)*
