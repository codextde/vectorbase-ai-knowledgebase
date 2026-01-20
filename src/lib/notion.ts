import { Client } from '@notionhq/client'
import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints'
import crypto from 'crypto'

const NOTION_OAUTH_CLIENT_ID = process.env.NOTION_CLIENT_ID!
const NOTION_OAUTH_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/callback`

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

export function getNotionAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: NOTION_OAUTH_CLIENT_ID,
    redirect_uri: NOTION_REDIRECT_URI,
    response_type: 'code',
    owner: 'user',
    state,
  })

  return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  workspace_id: string
  workspace_name: string
  bot_id: string
}> {
  const credentials = Buffer.from(`${NOTION_OAUTH_CLIENT_ID}:${NOTION_OAUTH_CLIENT_SECRET}`).toString('base64')

  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: NOTION_REDIRECT_URI,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Notion OAuth error: ${error}`)
  }

  const data = await response.json()

  return {
    access_token: data.access_token,
    workspace_id: data.workspace_id,
    workspace_name: data.workspace_name || 'Notion Workspace',
    bot_id: data.bot_id,
  }
}

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, encrypted] = encryptedToken.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export function createNotionClient(accessToken: string): Client {
  return new Client({ auth: accessToken })
}

export interface NotionPageInfo {
  id: string
  title: string
  type: 'page' | 'database'
  lastEditedTime: string
  url: string
  icon?: string
}

export async function getAccessiblePages(accessToken: string): Promise<NotionPageInfo[]> {
  const notion = createNotionClient(accessToken)
  const pages: NotionPageInfo[] = []

  const response = await notion.search({
    page_size: 100,
  })

  for (const result of response.results) {
    if ('properties' in result && 'url' in result) {
      if ('parent' in result) {
        const page = result as PageObjectResponse
        pages.push({
          id: page.id,
          title: getPageTitle(page),
          type: 'page',
          lastEditedTime: page.last_edited_time,
          url: page.url,
          icon: getPageIcon(page),
        })
      } else {
        const db = result as DatabaseObjectResponse
        pages.push({
          id: db.id,
          title: getDatabaseTitle(db),
          type: 'database',
          lastEditedTime: db.last_edited_time,
          url: db.url,
          icon: getDatabaseIcon(db),
        })
      }
    }
  }

  return pages
}

function getPageTitle(page: PageObjectResponse): string {
  const properties = page.properties
  for (const key of Object.keys(properties)) {
    const prop = properties[key]
    if (prop.type === 'title' && prop.title.length > 0) {
      return prop.title.map((t: RichTextItemResponse) => t.plain_text).join('')
    }
  }
  return 'Untitled'
}

function getDatabaseTitle(db: DatabaseObjectResponse): string {
  if (db.title && db.title.length > 0) {
    return db.title.map((t: RichTextItemResponse) => t.plain_text).join('')
  }
  return 'Untitled Database'
}

function getPageIcon(page: PageObjectResponse): string | undefined {
  if (!page.icon) return undefined
  if (page.icon.type === 'emoji') return page.icon.emoji
  return undefined
}

function getDatabaseIcon(db: DatabaseObjectResponse): string | undefined {
  if (!db.icon) return undefined
  if (db.icon.type === 'emoji') return db.icon.emoji
  return undefined
}

export async function fetchPageContent(accessToken: string, pageId: string): Promise<{
  title: string
  content: string
  lastEditedTime: string
}> {
  const notion = createNotionClient(accessToken)

  const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse
  const title = getPageTitle(page)

  const blocks = await getAllBlocks(notion, pageId)
  const content = blocksToMarkdown(blocks)

  return {
    title,
    content,
    lastEditedTime: page.last_edited_time,
  }
}

export async function fetchDatabaseContent(accessToken: string, databaseId: string): Promise<{
  title: string
  content: string
  lastEditedTime: string
}> {
  const notion = createNotionClient(accessToken)

  const db = await notion.databases.retrieve({ database_id: databaseId }) as DatabaseObjectResponse
  const title = getDatabaseTitle(db)

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  })

  if (!response.ok) {
    throw new Error('Failed to query database')
  }

  const data = await response.json()
  let content = `# ${title}\n\n`

  for (const page of data.results) {
    if (page.object === 'page') {
      const p = page as PageObjectResponse
      const pageTitle = getPageTitle(p)
      content += `## ${pageTitle}\n\n`

      const blocks = await getAllBlocks(notion, p.id)
      content += blocksToMarkdown(blocks)
      content += '\n\n---\n\n'
    }
  }

  return {
    title,
    content,
    lastEditedTime: db.last_edited_time,
  }
}

async function getAllBlocks(notion: Client, blockId: string): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = []
  let cursor: string | undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })

    for (const block of response.results) {
      if ('type' in block) {
        blocks.push(block as BlockObjectResponse)

        if ((block as BlockObjectResponse).has_children) {
          const children = await getAllBlocks(notion, block.id)
          blocks.push(...children)
        }
      }
    }

    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return blocks
}

function blocksToMarkdown(blocks: BlockObjectResponse[]): string {
  return blocks.map(blockToMarkdown).filter(Boolean).join('\n')
}

function blockToMarkdown(block: BlockObjectResponse): string {
  switch (block.type) {
    case 'paragraph':
      return richTextToMarkdown(block.paragraph.rich_text) + '\n'

    case 'heading_1':
      return `# ${richTextToMarkdown(block.heading_1.rich_text)}\n`

    case 'heading_2':
      return `## ${richTextToMarkdown(block.heading_2.rich_text)}\n`

    case 'heading_3':
      return `### ${richTextToMarkdown(block.heading_3.rich_text)}\n`

    case 'bulleted_list_item':
      return `- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}`

    case 'numbered_list_item':
      return `1. ${richTextToMarkdown(block.numbered_list_item.rich_text)}`

    case 'to_do':
      const checked = block.to_do.checked ? '[x]' : '[ ]'
      return `- ${checked} ${richTextToMarkdown(block.to_do.rich_text)}`

    case 'toggle':
      return `> ${richTextToMarkdown(block.toggle.rich_text)}`

    case 'quote':
      return `> ${richTextToMarkdown(block.quote.rich_text)}\n`

    case 'callout':
      const icon = block.callout.icon?.type === 'emoji' ? block.callout.icon.emoji + ' ' : ''
      return `> ${icon}${richTextToMarkdown(block.callout.rich_text)}\n`

    case 'code':
      const lang = block.code.language || ''
      return `\`\`\`${lang}\n${richTextToMarkdown(block.code.rich_text)}\n\`\`\`\n`

    case 'divider':
      return '---\n'

    case 'table_of_contents':
      return ''

    case 'bookmark':
      return block.bookmark.url ? `[Bookmark](${block.bookmark.url})\n` : ''

    case 'link_preview':
      return block.link_preview.url ? `[Link](${block.link_preview.url})\n` : ''

    case 'image':
      if (block.image.type === 'external') {
        return `![Image](${block.image.external.url})\n`
      } else if (block.image.type === 'file') {
        return `![Image](${block.image.file.url})\n`
      }
      return ''

    default:
      return ''
  }
}

function richTextToMarkdown(richText: RichTextItemResponse[]): string {
  return richText.map((text) => {
    let content = text.plain_text

    if (text.annotations.bold) content = `**${content}**`
    if (text.annotations.italic) content = `*${content}*`
    if (text.annotations.strikethrough) content = `~~${content}~~`
    if (text.annotations.code) content = `\`${content}\``

    if (text.type === 'text' && text.text.link) {
      content = `[${content}](${text.text.link.url})`
    }

    return content
  }).join('')
}
