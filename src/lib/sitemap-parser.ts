/**
 * Sitemap Parser Utility
 * Parses XML sitemaps and sitemap indexes to extract URLs
 * Supports nested sitemaps, filtering by include/exclude paths
 */

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

export interface SitemapParseResult {
  urls: SitemapUrl[]
  errors: { url: string; error: string }[]
  sitemapsProcessed: number
}

export interface SitemapFilterOptions {
  includePaths?: string[]
  excludePaths?: string[]
  maxUrls?: number
}

/**
 * Fetch and parse XML content from a URL
 */
async function fetchXml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VectorBase-Crawler/1.0 (AI Knowledge Base; +https://vectorbase.dev)',
      'Accept': 'application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.text()
}

/**
 * Parse XML sitemap content to extract URLs or nested sitemap references
 */
function parseXmlSitemap(xml: string): { urls: SitemapUrl[]; sitemapUrls: string[] } {
  const urls: SitemapUrl[] = []
  const sitemapUrls: string[] = []

  // Check if this is a sitemap index (contains <sitemap> elements)
  const sitemapIndexRegex = /<sitemap>\s*<loc>([^<]+)<\/loc>/gi
  let match: RegExpExecArray | null

  while ((match = sitemapIndexRegex.exec(xml)) !== null) {
    const loc = match[1].trim()
    if (loc) {
      sitemapUrls.push(decodeXmlEntities(loc))
    }
  }

  // If it's not a sitemap index, parse as regular sitemap (contains <url> elements)
  if (sitemapUrls.length === 0) {
    // Match <url> blocks
    const urlBlockRegex = /<url>([\s\S]*?)<\/url>/gi
    
    while ((match = urlBlockRegex.exec(xml)) !== null) {
      const urlBlock = match[1]
      
      // Extract loc (required)
      const locMatch = /<loc>([^<]+)<\/loc>/i.exec(urlBlock)
      if (!locMatch) continue

      const url: SitemapUrl = {
        loc: decodeXmlEntities(locMatch[1].trim()),
      }

      // Extract optional fields
      const lastmodMatch = /<lastmod>([^<]+)<\/lastmod>/i.exec(urlBlock)
      if (lastmodMatch) url.lastmod = lastmodMatch[1].trim()

      const changefreqMatch = /<changefreq>([^<]+)<\/changefreq>/i.exec(urlBlock)
      if (changefreqMatch) url.changefreq = changefreqMatch[1].trim()

      const priorityMatch = /<priority>([^<]+)<\/priority>/i.exec(urlBlock)
      if (priorityMatch) url.priority = priorityMatch[1].trim()

      urls.push(url)
    }
  }

  return { urls, sitemapUrls }
}

/**
 * Decode XML entities in URLs
 */
function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

/**
 * Check if a URL matches a glob-like pattern
 * Supports * for any characters within path segment
 * Example: "blog/*" matches "blog/post-1", "blog/post-2"
 */
function matchesPattern(url: string, pattern: string): boolean {
  try {
    const urlPath = new URL(url).pathname

    // Escape regex special chars except *
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^/]*')

    const regex = new RegExp(`^/?${regexPattern}`, 'i')
    return regex.test(urlPath)
  } catch {
    return false
  }
}

/**
 * Filter URLs based on include/exclude paths
 */
function filterUrls(urls: SitemapUrl[], options: SitemapFilterOptions): SitemapUrl[] {
  const { includePaths = [], excludePaths = [], maxUrls } = options

  let filtered = urls

  // Apply include filter (if any include paths specified, URL must match at least one)
  if (includePaths.length > 0) {
    filtered = filtered.filter(u => 
      includePaths.some(pattern => matchesPattern(u.loc, pattern))
    )
  }

  // Apply exclude filter (URL must not match any exclude pattern)
  if (excludePaths.length > 0) {
    filtered = filtered.filter(u => 
      !excludePaths.some(pattern => matchesPattern(u.loc, pattern))
    )
  }

  // Apply max limit
  if (maxUrls && maxUrls > 0) {
    filtered = filtered.slice(0, maxUrls)
  }

  return filtered
}

/**
 * Fetch and parse a sitemap URL, recursively processing sitemap indexes
 */
export async function fetchSitemapUrls(
  sitemapUrl: string,
  options: SitemapFilterOptions = {}
): Promise<SitemapParseResult> {
  const result: SitemapParseResult = {
    urls: [],
    errors: [],
    sitemapsProcessed: 0,
  }

  const processedSitemaps = new Set<string>()
  const pendingSitemaps: string[] = [sitemapUrl]

  while (pendingSitemaps.length > 0) {
    const currentUrl = pendingSitemaps.shift()!
    
    if (processedSitemaps.has(currentUrl)) continue
    processedSitemaps.add(currentUrl)

    try {
      console.log(`[Sitemap Parser] Fetching: ${currentUrl}`)
      const xml = await fetchXml(currentUrl)
      const parsed = parseXmlSitemap(xml)
      
      result.sitemapsProcessed++

      // If this was a sitemap index, add nested sitemaps to queue
      if (parsed.sitemapUrls.length > 0) {
        for (const nestedUrl of parsed.sitemapUrls) {
          if (!processedSitemaps.has(nestedUrl)) {
            pendingSitemaps.push(nestedUrl)
          }
        }
      }

      // Add found URLs
      result.urls.push(...parsed.urls)

      // Early exit if we have enough URLs and maxUrls is set
      if (options.maxUrls && result.urls.length >= options.maxUrls * 2) {
        break
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push({ url: currentUrl, error: errorMessage })
      console.error(`[Sitemap Parser] Error fetching ${currentUrl}:`, errorMessage)
    }
  }

  // Apply filters after collecting all URLs
  result.urls = filterUrls(result.urls, options)

  // Remove duplicates based on URL
  const seen = new Set<string>()
  result.urls = result.urls.filter(u => {
    if (seen.has(u.loc)) return false
    seen.add(u.loc)
    return true
  })

  console.log(`[Sitemap Parser] Found ${result.urls.length} URLs from ${result.sitemapsProcessed} sitemap(s)`)

  return result
}

/**
 * Try to discover sitemap URL from a website
 * Checks common sitemap locations
 */
export async function discoverSitemapUrl(websiteUrl: string): Promise<string | null> {
  const url = new URL(websiteUrl)
  const baseUrl = `${url.protocol}//${url.host}`

  const commonPaths = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemap-index.xml',
    '/sitemaps/sitemap.xml',
    '/sitemap/sitemap.xml',
  ]

  for (const path of commonPaths) {
    const sitemapUrl = `${baseUrl}${path}`
    try {
      const response = await fetch(sitemapUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'VectorBase-Crawler/1.0 (AI Knowledge Base; +https://vectorbase.dev)',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('xml') || contentType.includes('text/plain')) {
          return sitemapUrl
        }
      }
    } catch {
      // Ignore errors, try next path
    }
  }

  // Try robots.txt as fallback
  try {
    const robotsUrl = `${baseUrl}/robots.txt`
    const response = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'VectorBase-Crawler/1.0 (AI Knowledge Base; +https://vectorbase.dev)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const text = await response.text()
      const sitemapMatch = /Sitemap:\s*(.+)/i.exec(text)
      if (sitemapMatch) {
        return sitemapMatch[1].trim()
      }
    }
  } catch {
    // Ignore errors
  }

  return null
}

/**
 * Validate if a URL looks like a valid sitemap URL
 */
export function isSitemapUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.toLowerCase()
    return path.endsWith('.xml') || path.includes('sitemap')
  } catch {
    return false
  }
}
