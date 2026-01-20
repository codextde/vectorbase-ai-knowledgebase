# Contributing to VectorBase

First off, thank you for considering contributing to VectorBase! It's people like you that make VectorBase such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [VectorBase Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples to demonstrate the steps**.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** if possible.
- **Include your environment details** (OS, Node.js version, Bun version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title** for the issue.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Provide specific examples to demonstrate the steps** or provide mockups/wireframes.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- **Explain why this enhancement would be useful** to most VectorBase users.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [PostgreSQL](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector) extension
- [Supabase](https://supabase.com/) account (or self-hosted instance)
- [OpenAI API Key](https://platform.openai.com/)

### Local Development

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vectorbase.git
   cd vectorbase
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in `.env`

5. Set up the database:
   ```bash
   bun run db:push
   bun run db:seed
   ```

6. Start the development server:
   ```bash
   bun run dev
   ```

### Project Structure

```
vectorbase/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   ├── components/       # React components
│   ├── lib/              # Utility functions and shared code
│   └── types/            # TypeScript type definitions
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
- `feat: add Notion integration support`
- `fix: resolve embedding generation timeout`
- `docs: update API documentation`
- `refactor: simplify chunking algorithm`

### TypeScript Styleguide

- Use TypeScript for all new code
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` if type is truly unknown
- Use meaningful variable names

### Code Formatting

This project uses ESLint for linting. Run before committing:

```bash
bun run lint
```

## Database Migrations

When making changes to the Prisma schema:

1. Make your changes in `prisma/schema.prisma`
2. Generate a migration:
   ```bash
   bun run db:migrate
   ```
3. Apply to your local database:
   ```bash
   bun run db:push
   ```

## Testing

Currently, we're building out our test suite. Contributions to testing infrastructure are especially welcome!

## Documentation

- Keep README.md updated with any new features
- Document all API endpoints
- Add JSDoc comments to public functions
- Update environment variable documentation when adding new variables

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing!
