import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Setting up database functions...')

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION match_chunks(
      query_embedding vector(1536),
      match_project_id uuid,
      match_threshold float DEFAULT 0.7,
      match_count int DEFAULT 5
    )
    RETURNS TABLE (
      id uuid,
      content text,
      metadata jsonb,
      similarity float,
      source_id uuid
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        chunks.id,
        chunks.content,
        chunks.metadata,
        (1 - (chunks.embedding <=> query_embedding))::float as similarity,
        chunks.source_id
      FROM chunks
      WHERE chunks.project_id = match_project_id
        AND chunks.embedding IS NOT NULL
        AND 1 - (chunks.embedding <=> query_embedding) > match_threshold
      ORDER BY chunks.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$;
  `)

  console.log('Created match_chunks function')

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS chunks_embedding_idx 
    ON chunks 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
  `)

  console.log('Created vector index')
  console.log('Database setup complete!')
}

main()
  .catch(console.error)
  .finally(() => {
    pool.end()
    process.exit(0)
  })
