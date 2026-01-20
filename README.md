<img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/f4b1219c-3579-4afb-a57a-dafb1e48c642" />

# VectorBase

**Developer-friendly AI Knowledge Base SaaS**

Build intelligent, context-aware AI assistants powered by your own data. VectorBase provides a complete RAG (Retrieval-Augmented Generation) infrastructure that integrates seamlessly with automation tools like n8n.

<img width="500"  alt="localhost_3000_dashboard_projects_f1444e0d-be21-4d84-b0ad-d07c0e49c698" src="https://github.com/user-attachments/assets/c4626b4c-a50e-4a2a-aa37-54653f7248ef" />
<img width="500"  alt="localhost_3000_dashboard_projects_f1444e0d-be21-4d84-b0ad-d07c0e49c698 (1)" src="https://github.com/user-attachments/assets/d2b1a111-c3e4-4d16-86ec-e6ac4182375c" />

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E)](https://supabase.com/)

---

## Overview

VectorBase is designed specifically for developers who need programmatic access to AI-powered knowledge bases. Upload documents, crawl websites, sync Notion pages, and query your knowledge base through a simple REST API.

**Key Use Cases:**

- Build customer support chatbots with your documentation
- Create internal knowledge assistants for your team
- Power AI features in your applications via API
- Integrate with n8n, Make, or Zapier for automation workflows

---

## Features

- **Multiple Source Types** - Import from documents (PDF, DOCX, TXT), plain text, Q&A pairs, websites, and Notion
- **Website Crawling** - Automatic sitemap.xml discovery and JavaScript-rendered page support via Playwright
- **Notion Integration** - Connect your Notion workspace and sync pages automatically
- **Vector Similarity Search** - Fast semantic search powered by pgvector with cosine distance
- **RAG-Powered Chat** - Context-aware AI responses with source citations
- **Streaming Responses** - Real-time streaming for chat completions
- **Multi-Tenancy** - Organizations, projects, and team member management
- **API-First Design** - RESTful API with Bearer token authentication
- **Rate Limiting** - Built-in rate limiting (60 requests/minute per project)
- **Auto-Retrain** - Scheduled daily retraining for website and Notion sources
- **Usage Analytics** - Track API usage, tokens consumed, and conversation history
- **Subscription Management** - Stripe integration for billing (Free, Pro, Enterprise plans)

---

## Quick Start

### Requirements

- [Bun](https://bun.sh/) (v1.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v15+ with pgvector extension)
- [Supabase](https://supabase.com/) account (for auth and database)
- [OpenAI](https://platform.openai.com/) API key
- [Stripe](https://stripe.com/) account (optional, for billing)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/vectorbase.git
cd vectorbase

# Install dependencies
bun install
```

### Environment Setup

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/database

# Application
NEXT_PUBLIC_APP_NAME=VectorBase
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SELF_HOSTED=false

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Notion (optional)
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret
NOTION_REDIRECT_URI=http://localhost:3000/api/notion/callback

# Stripe (optional, for billing)
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### Database Setup

```bash
# Push schema to database
bun run db:push

# Or run migrations for production
bun run db:migrate

# Seed initial data (plans, etc.)
bun run db:seed

# Open Prisma Studio to view data
bun run db:studio
```

### Running

```bash
# Development mode
bun run dev

# Production build
bun run build
bun run start
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

---

## Self-Hosted vs Cloud

| Feature           | Self-Hosted                | Cloud                   |
| ----------------- | -------------------------- | ----------------------- |
| **Pricing**       | Free (your infrastructure) | Free tier + paid plans  |
| **Data Location** | Your servers               | Managed infrastructure  |
| **Setup**         | Manual configuration       | Instant                 |
| **Updates**       | Manual                     | Automatic               |
| **Support**       | Community                  | Priority support (Pro+) |

**Self-Hosted Configuration:**

Set `NEXT_PUBLIC_SELF_HOSTED=true` in your environment to enable self-hosted mode. This disables Stripe billing integration and removes plan restrictions.

**Cloud Plans:**

| Plan       | Price    | Projects  | Documents | Messages/Month |
| ---------- | -------- | --------- | --------- | -------------- |
| Free       | $0/mo    | 1         | 10        | 20             |
| Starter    | $19/mo   | 3         | 100 each  | 1,000          |
| Pro        | $49/mo   | 10        | 500 each  | 10,000         |
| Enterprise | $199/mo  | Unlimited | Unlimited | Unlimited      |

---

## API Documentation

All API endpoints require authentication via Bearer token. Generate API keys from the project dashboard.

```bash
Authorization: Bearer vb_your-api-key
```

### Rate Limiting

API requests are rate-limited to **60 requests per minute** per project. Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1704067200
```

---

### POST /api/v1/query

Perform vector similarity search across your knowledge base.

**Request:**

```bash
curl -X POST https://your-domain.com/api/v1/query \
  -H "Authorization: Bearer vb_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I reset my password?",
    "top_k": 5,
    "threshold": 0.5
  }'
```

**Parameters:**

| Parameter   | Type   | Default  | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| `query`     | string | required | The search query (max 10,000 characters) |
| `top_k`     | number | 5        | Number of results to return (max 20)     |
| `threshold` | number | 0.5      | Minimum similarity score (0-1)           |

**Response:**

```json
{
  "results": [
    {
      "id": "chunk-uuid",
      "content": "To reset your password, go to Settings > Security...",
      "metadata": {},
      "similarity": 0.87,
      "source_id": "source-uuid"
    }
  ],
  "query": "How do I reset my password?",
  "project_id": "project-uuid"
}
```

---

### POST /api/v1/chat

RAG-powered chat with streaming support. The endpoint automatically retrieves relevant context from your knowledge base and augments the AI response.

**Request:**

```bash
curl -X POST https://your-domain.com/api/v1/chat \
  -H "Authorization: Bearer vb_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What are the pricing plans?"}
    ],
    "session_id": "user-session-123",
    "stream": true,
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

**Parameters:**

| Parameter     | Type    | Default     | Description                                        |
| ------------- | ------- | ----------- | -------------------------------------------------- |
| `messages`    | array   | required    | Array of message objects with `role` and `content` |
| `session_id`  | string  | optional    | Session ID for conversation tracking               |
| `stream`      | boolean | true        | Enable streaming response                          |
| `model`       | string  | gpt-4o-mini | OpenAI model to use                                |
| `temperature` | number  | 0.7         | Response randomness (0-2)                          |
| `max_tokens`  | number  | 1000        | Maximum tokens in response                         |

**Streaming Response:**

When `stream: true`, the response is a Server-Sent Events stream:

```
data: {"content": "The"}
data: {"content": " pricing"}
data: {"content": " plans"}
...
```

**Non-Streaming Response:**

```json
{
  "message": "Based on the documentation, VectorBase offers three pricing plans...",
  "sources": [
    {
      "id": "chunk-uuid",
      "content": "VectorBase pricing: Free tier includes...",
      "similarity": 0.92
    }
  ]
}
```

---

### GET /api/v1/sources

List all sources in your project.

**Request:**

```bash
curl -X GET "https://your-domain.com/api/v1/sources?status=completed&limit=10" \
  -H "Authorization: Bearer vb_your-api-key"
```

**Query Parameters:**

| Parameter | Type   | Default  | Description                                               |
| --------- | ------ | -------- | --------------------------------------------------------- |
| `status`  | string | optional | Filter by status (pending, processing, completed, failed) |
| `type`    | string | optional | Filter by type (text, qa, website, document, notion)      |
| `limit`   | number | 50       | Number of results (max 100)                               |
| `offset`  | number | 0        | Pagination offset                                         |

**Response:**

```json
{
  "sources": [
    {
      "id": "source-uuid",
      "name": "Product Documentation",
      "type": "website",
      "status": "completed",
      "chunks_count": 150,
      "tokens_count": 45000,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

---

### POST /api/v1/sources

Create a new source.

**Text Source:**

```bash
curl -X POST https://your-domain.com/api/v1/sources \
  -H "Authorization: Bearer vb_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "name": "Company FAQ",
    "content": "Your text content here..."
  }'
```

**Q&A Source:**

```bash
curl -X POST https://your-domain.com/api/v1/sources \
  -H "Authorization: Bearer vb_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "qa",
    "question": "What is VectorBase?",
    "answer": "VectorBase is a developer-friendly AI knowledge base..."
  }'
```

**Website Source:**

```bash
curl -X POST https://your-domain.com/api/v1/sources \
  -H "Authorization: Bearer vb_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "website",
    "name": "Documentation Site",
    "url": "https://docs.example.com"
  }'
```

**Response:**

```json
{
  "source": {
    "id": "source-uuid",
    "name": "Company FAQ",
    "type": "text",
    "status": "pending"
  },
  "message": "Source created. Use /api/v1/sources/{id}/process to process it."
}
```

---

### GET /api/v1/sources/{sourceId}

Get details of a specific source.

**Response:**

```json
{
  "source": {
    "id": "source-uuid",
    "name": "Product Documentation",
    "type": "website",
    "status": "completed",
    "chunks_count": 150,
    "tokens_count": 45000,
    "error_message": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### POST /api/v1/sources/{sourceId}

Process a pending source (chunk and embed content).

**Response:**

```json
{
  "success": true,
  "chunks_created": 150,
  "tokens_count": 45000
}
```

---

### DELETE /api/v1/sources/{sourceId}

Delete a source and all its associated chunks.

**Response:**

```json
{
  "success": true,
  "message": "Source deleted"
}
```

---

## Tech Stack

| Category              | Technology                                   |
| --------------------- | -------------------------------------------- |
| **Framework**         | Next.js 16 (App Router)                      |
| **Language**          | TypeScript                                   |
| **Runtime**           | Bun                                          |
| **Database**          | PostgreSQL + pgvector                        |
| **ORM**               | Prisma                                       |
| **Auth & DB Hosting** | Supabase                                     |
| **AI/LLM**            | OpenAI (gpt-4o-mini, text-embedding-3-small) |
| **RAG Framework**     | LangChain.js                                 |
| **Billing**           | Stripe                                       |
| **UI**                | Tailwind CSS + shadcn/ui                     |
| **Web Scraping**      | Playwright (for JS-heavy sites)              |

---

## Project Structure

```
vectorbase/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/        # Public API endpoints
│   │   │   │   ├── chat/
│   │   │   │   ├── query/
│   │   │   │   └── sources/
│   │   │   ├── cron/      # Scheduled jobs
│   │   │   ├── stripe/    # Billing webhooks
│   │   │   └── notion/    # Notion OAuth
│   │   ├── auth/          # Authentication pages
│   │   └── dashboard/     # Dashboard pages
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── billing/
│   └── lib/
│       ├── api-auth.ts    # API key authentication
│       ├── embeddings.ts  # OpenAI embeddings
│       ├── chunking.ts    # Text chunking logic
│       ├── crawler.ts     # Website crawler
│       ├── prisma.ts      # Prisma client
│       ├── rate-limit.ts  # Rate limiting
│       ├── stripe.ts      # Stripe integration
│       └── supabase/      # Supabase clients
├── Dockerfile             # Production Docker image
└── package.json
```

---

## Environment Variables

| Variable                        | Required | Description                                 |
| ------------------------------- | -------- | ------------------------------------------- |
| `DATABASE_URL`                  | Yes      | PostgreSQL connection string (pooled)       |
| `DIRECT_URL`                    | Yes      | PostgreSQL direct connection string         |
| `NEXT_PUBLIC_APP_NAME`          | Yes      | Application name displayed in UI            |
| `NEXT_PUBLIC_APP_URL`           | Yes      | Public URL of the application               |
| `NEXT_PUBLIC_SELF_HOSTED`       | Yes      | Enable self-hosted mode (true/false)        |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service role key                   |
| `OPENAI_API_KEY`                | Yes      | OpenAI API key for embeddings and chat      |
| `NOTION_CLIENT_ID`              | No       | Notion OAuth client ID                      |
| `NOTION_CLIENT_SECRET`          | No       | Notion OAuth client secret                  |
| `NOTION_REDIRECT_URI`           | No       | Notion OAuth redirect URI                   |
| `STRIPE_SECRET_KEY`             | No       | Stripe secret key for billing               |
| `STRIPE_WEBHOOK_SECRET`         | No       | Stripe webhook signing secret               |
| `CRON_SECRET`                   | No       | Secret for authenticating cron job requests |

---

## Docker Deployment

### Build the Image

```bash
docker build -t vectorbase .
```

### Run the Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e DIRECT_URL="postgresql://..." \
  -e NEXT_PUBLIC_APP_NAME="VectorBase" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  -e NEXT_PUBLIC_SELF_HOSTED="true" \
  -e NEXT_PUBLIC_SUPABASE_URL="https://..." \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
  -e SUPABASE_SERVICE_ROLE_KEY="..." \
  -e OPENAI_API_KEY="sk-..." \
  vectorbase
```

### Docker Compose Example

```yaml
version: "3.8"
services:
  vectorbase:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - NEXT_PUBLIC_APP_NAME=VectorBase
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      - NEXT_PUBLIC_SELF_HOSTED=true
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

---

## Development Scripts

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `bun install`        | Install dependencies            |
| `bun run dev`        | Start development server        |
| `bun run build`      | Build for production            |
| `bun run start`      | Start production server         |
| `bun run db:push`    | Push schema changes to database |
| `bun run db:migrate` | Run database migrations         |
| `bun run db:seed`    | Seed database with initial data |
| `bun run db:studio`  | Open Prisma Studio              |
| `bun run lint`       | Run ESLint                      |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:

- Follows the existing code style
- Includes appropriate tests
- Updates documentation as needed

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: [docs.vectorbase.dev](https://docs.vectorbase.dev)
- **Issues**: [GitHub Issues](https://github.com/your-org/vectorbase/issues)
- **Discord**: [Join our community](https://discord.gg/vectorbase)
