import { chromium, Browser, Page } from 'playwright'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export interface CrawlOptions {
  /** Maximum depth for recursive crawling (0 = single page only) */
  maxDepth?: number
  /** Maximum number of pages to crawl */
  maxPages?: number
  /** Only crawl pages on the same domain */
  sameDomainOnly?: boolean
  /** Timeout per page in milliseconds */
  pageTimeout?: number
  /** Wait for page to be idle before extracting */
  waitForIdle?: boolean
  /** Custom user agent */
  userAgent?: string
  /** Include subdomains when sameDomainOnly is true */
  includeSubdomains?: boolean
}

export interface CrawledPage {
  url: string
  title: string
  content: string
  excerpt?: string
  byline?: string
  siteName?: string
  links: string[]
  depth: number
  crawledAt: Date
}

export interface CrawlResult {
  pages: CrawledPage[]
  errors: { url: string; error: string }[]
  stats: {
    totalPages: number
    successfulPages: number
    failedPages: number
    totalTime: number
  }
}

const DEFAULT_OPTIONS: Required<CrawlOptions> = {
  maxDepth: 2,
  maxPages: 10,
  sameDomainOnly: true,
  pageTimeout: 30000,
  waitForIdle: true,
  userAgent: 'VectorBase-Crawler/1.0 (AI Knowledge Base; +https://vectorbase.dev)',
  includeSubdomains: true,
}

/**
 * Extract domain from URL for comparison
 */
function getDomain(url: string, includeSubdomains: boolean): string {
  try {
    const parsed = new URL(url)
    if (includeSubdomains) {
      // Get root domain (e.g., example.com from sub.example.com)
      const parts = parsed.hostname.split('.')
      if (parts.length >= 2) {
        return parts.slice(-2).join('.')
      }
    }
    return parsed.hostname
  } catch {
    return ''
  }
}

/**
 * Normalize URL to avoid duplicates
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Remove hash, trailing slash, and normalize
    parsed.hash = ''
    let path = parsed.pathname
    if (path.endsWith('/') && path.length > 1) {
      path = path.slice(0, -1)
    }
    parsed.pathname = path
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Check if URL should be crawled (not a file, not external, etc.)
 */
function shouldCrawl(url: string, baseDomain: string, options: Required<CrawlOptions>): boolean {
  try {
    const parsed = new URL(url)
    
    // Only HTTP(S)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    
    // Skip common non-content paths
    const skipExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.css', '.js', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.wav', '.avi', '.mov']
    const path = parsed.pathname.toLowerCase()
    if (skipExtensions.some(ext => path.endsWith(ext))) {
      return false
    }
    
    // Skip common non-content paths
    const skipPaths = ['/login', '/logout', '/signup', '/register', '/cart', '/checkout', '/admin', '/wp-admin', '/api/', '/auth/']
    if (skipPaths.some(p => path.includes(p))) {
      return false
    }
    
    // Check domain
    if (options.sameDomainOnly) {
      const urlDomain = getDomain(url, options.includeSubdomains)
      if (urlDomain !== baseDomain) {
        return false
      }
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Extract clean content from HTML using Mozilla Readability
 */
function extractContent(html: string, url: string): { title: string; content: string; excerpt?: string; byline?: string; siteName?: string } {
  const dom = new JSDOM(html, { url })
  const reader = new Readability(dom.window.document)
  const article = reader.parse()
  
  if (article) {
    return {
      title: article.title || '',
      content: article.textContent || '',
      excerpt: article.excerpt || undefined,
      byline: article.byline || undefined,
      siteName: article.siteName || undefined,
    }
  }
  
  // Fallback: basic text extraction
  const doc = dom.window.document
  const title = doc.title || ''
  
  // Remove script, style, nav, footer, header
  const elementsToRemove = doc.querySelectorAll('script, style, nav, footer, header, aside, [role="navigation"], [role="banner"], [role="contentinfo"]')
  elementsToRemove.forEach(el => el.remove())
  
  // Get main content or body
  const main = doc.querySelector('main, article, [role="main"], .content, #content, .post, .article') || doc.body
  const content = main?.textContent?.replace(/\s+/g, ' ').trim() || ''
  
  return { title, content }
}

/**
 * Extract all links from a page
 */
async function extractLinks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const links: string[] = []
    const anchors = document.querySelectorAll('a[href]')
    anchors.forEach(a => {
      const href = a.getAttribute('href')
      if (href) {
        try {
          // Convert relative to absolute
          const url = new URL(href, window.location.origin)
          links.push(url.toString())
        } catch {
          // Ignore invalid URLs
        }
      }
    })
    return [...new Set(links)]
  })
}

/**
 * Crawl a single page with Playwright
 */
async function crawlPage(
  browser: Browser,
  url: string,
  options: Required<CrawlOptions>
): Promise<{ page: CrawledPage | null; links: string[]; error?: string }> {
  const context = await browser.newContext({
    userAgent: options.userAgent,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  })
  
  const page = await context.newPage()
  
  try {
    // Block unnecessary resources for faster loading
    await page.route('**/*', route => {
      const resourceType = route.request().resourceType()
      if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
        route.abort()
      } else {
        route.continue()
      }
    })
    
    // Navigate to page
    const response = await page.goto(url, {
      timeout: options.pageTimeout,
      waitUntil: options.waitForIdle ? 'networkidle' : 'domcontentloaded',
    })
    
    if (!response) {
      return { page: null, links: [], error: 'No response received' }
    }
    
    const status = response.status()
    if (status >= 400) {
      return { page: null, links: [], error: `HTTP ${status}` }
    }
    
    // Get the final URL after any redirects
    const finalUrl = page.url()
    
    // Extract links before we modify the page
    const links = await extractLinks(page)
    
    // Get HTML content
    const html = await page.content()
    
    // Extract clean content using Readability
    const extracted = extractContent(html, finalUrl)
    
    if (!extracted.content || extracted.content.trim().length < 50) {
      return { page: null, links, error: 'No meaningful content extracted' }
    }
    
    const crawledPage: CrawledPage = {
      url: finalUrl,
      title: extracted.title,
      content: extracted.content,
      excerpt: extracted.excerpt,
      byline: extracted.byline,
      siteName: extracted.siteName,
      links,
      depth: 0, // Will be set by caller
      crawledAt: new Date(),
    }
    
    return { page: crawledPage, links }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { page: null, links: [], error: errorMessage }
  } finally {
    await context.close()
  }
}

/**
 * Crawl a website starting from the given URL
 * Uses BFS (Breadth-First Search) to crawl pages level by level
 */
export async function crawlWebsite(
  startUrl: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const startTime = Date.now()
  
  const result: CrawlResult = {
    pages: [],
    errors: [],
    stats: {
      totalPages: 0,
      successfulPages: 0,
      failedPages: 0,
      totalTime: 0,
    },
  }
  
  // Normalize start URL
  const normalizedStartUrl = normalizeUrl(startUrl)
  const baseDomain = getDomain(normalizedStartUrl, opts.includeSubdomains)
  
  if (!baseDomain) {
    result.errors.push({ url: startUrl, error: 'Invalid URL' })
    result.stats.totalTime = Date.now() - startTime
    return result
  }
  
  // Track visited URLs
  const visited = new Set<string>()
  
  // Queue: [url, depth]
  const queue: [string, number][] = [[normalizedStartUrl, 0]]
  visited.add(normalizedStartUrl)
  
  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--disable-gpu',
    ],
  })
  
  try {
    while (queue.length > 0 && result.pages.length < opts.maxPages) {
      const [url, depth] = queue.shift()!
      result.stats.totalPages++
      
      console.log(`[Crawler] Crawling (depth=${depth}): ${url}`)
      
      const { page, links, error } = await crawlPage(browser, url, opts)
      
      if (error) {
        result.errors.push({ url, error })
        result.stats.failedPages++
        continue
      }
      
      if (page) {
        page.depth = depth
        result.pages.push(page)
        result.stats.successfulPages++
        
        // Add new links to queue if not at max depth
        if (depth < opts.maxDepth) {
          for (const link of links) {
            const normalizedLink = normalizeUrl(link)
            if (!visited.has(normalizedLink) && shouldCrawl(normalizedLink, baseDomain, opts)) {
              visited.add(normalizedLink)
              queue.push([normalizedLink, depth + 1])
              
              // Stop adding to queue if we have enough
              if (visited.size >= opts.maxPages * 2) {
                break
              }
            }
          }
        }
      }
    }
  } finally {
    await browser.close()
  }
  
  result.stats.totalTime = Date.now() - startTime
  
  console.log(`[Crawler] Completed: ${result.stats.successfulPages} pages in ${result.stats.totalTime}ms`)
  
  return result
}

/**
 * Crawl a single page (no recursion)
 * Useful for quick single-page extraction
 */
export async function crawlSinglePage(url: string, options: CrawlOptions = {}): Promise<CrawledPage | null> {
  const result = await crawlWebsite(url, { ...options, maxDepth: 0, maxPages: 1 })
  return result.pages[0] || null
}
