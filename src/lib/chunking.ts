export interface ChunkOptions {
  chunkSize?: number
  chunkOverlap?: number
  separator?: string
}

export interface Chunk {
  content: string
  metadata: {
    chunkIndex: number
    startChar: number
    endChar: number
  }
}

const DEFAULT_CHUNK_SIZE = 1000
const DEFAULT_CHUNK_OVERLAP = 200

export function splitTextIntoChunks(
  text: string,
  options: ChunkOptions = {}
): Chunk[] {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
    separator = '\n\n',
  } = options

  if (!text || text.trim().length === 0) {
    return []
  }

  const normalizedText = text.replace(/\r\n/g, '\n').trim()
  
  if (normalizedText.length <= chunkSize) {
    return [{
      content: normalizedText,
      metadata: {
        chunkIndex: 0,
        startChar: 0,
        endChar: normalizedText.length,
      },
    }]
  }

  const paragraphs = normalizedText.split(separator).filter(p => p.trim().length > 0)
  const chunks: Chunk[] = []
  
  let currentChunk = ''
  let currentStart = 0
  let charPosition = 0

  for (const paragraph of paragraphs) {
    const paragraphWithSeparator = paragraph + separator
    
    if (currentChunk.length + paragraphWithSeparator.length <= chunkSize) {
      currentChunk += paragraphWithSeparator
    } else {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            chunkIndex: chunks.length,
            startChar: currentStart,
            endChar: currentStart + currentChunk.length,
          },
        })
        
        const overlapText = getOverlapText(currentChunk, chunkOverlap)
        currentStart = currentStart + currentChunk.length - overlapText.length
        currentChunk = overlapText
      }
      
      if (paragraphWithSeparator.length > chunkSize) {
        const subChunks = splitLongParagraph(paragraph, chunkSize, chunkOverlap)
        for (const subChunk of subChunks) {
          chunks.push({
            content: subChunk.trim(),
            metadata: {
              chunkIndex: chunks.length,
              startChar: charPosition,
              endChar: charPosition + subChunk.length,
            },
          })
        }
        currentChunk = ''
        currentStart = charPosition + paragraph.length + separator.length
      } else {
        currentChunk += paragraphWithSeparator
      }
    }
    
    charPosition += paragraph.length + separator.length
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: {
        chunkIndex: chunks.length,
        startChar: currentStart,
        endChar: currentStart + currentChunk.length,
      },
    })
  }

  return chunks
}

function getOverlapText(text: string, overlapSize: number): string {
  if (text.length <= overlapSize) {
    return text
  }
  
  const overlapStart = text.length - overlapSize
  const sentenceBreak = text.lastIndexOf('. ', text.length - 1)
  
  if (sentenceBreak > overlapStart) {
    return text.slice(sentenceBreak + 2)
  }
  
  const wordBreak = text.lastIndexOf(' ', text.length - overlapSize)
  if (wordBreak > overlapStart) {
    return text.slice(wordBreak + 1)
  }
  
  return text.slice(overlapStart)
}

function splitLongParagraph(
  text: string,
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length)
    
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('. ', end)
      if (sentenceEnd > start + chunkSize / 2) {
        end = sentenceEnd + 1
      } else {
        const wordEnd = text.lastIndexOf(' ', end)
        if (wordEnd > start + chunkSize / 2) {
          end = wordEnd
        }
      }
    }

    chunks.push(text.slice(start, end).trim())
    start = end - chunkOverlap
    
    if (start >= text.length - chunkOverlap) {
      break
    }
  }

  return chunks
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}
