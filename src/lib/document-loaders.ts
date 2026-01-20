import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface LoadedDocument {
  content: string
  metadata: {
    fileName: string
    fileType: string
    pageCount?: number
    extractedWithVision?: boolean
  }
}

const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp']

export async function loadDocument(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<LoadedDocument> {
  const normalizedType = fileType.toLowerCase()
  const lowerFileName = fileName.toLowerCase()
  
  if (normalizedType === 'application/pdf' || lowerFileName.endsWith('.pdf')) {
    return loadPDF(buffer, fileName)
  }
  
  if (
    normalizedType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    normalizedType === 'application/msword' ||
    lowerFileName.endsWith('.docx') ||
    lowerFileName.endsWith('.doc')
  ) {
    return loadDOCX(buffer, fileName)
  }
  
  if (normalizedType === 'text/plain' || lowerFileName.endsWith('.txt')) {
    return loadTXT(buffer, fileName)
  }
  
  if (IMAGE_TYPES.includes(normalizedType) || IMAGE_EXTENSIONS.some(ext => lowerFileName.endsWith(ext))) {
    return loadImageWithVision(buffer, fileName, fileType)
  }
  
  throw new Error(`Unsupported file type: ${fileType}`)
}

async function loadPDF(buffer: Buffer, fileName: string): Promise<LoadedDocument> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  const textResult = await parser.getText()
  
  return {
    content: textResult.text,
    metadata: {
      fileName,
      fileType: 'pdf',
      pageCount: textResult.pages.length,
    },
  }
}

async function loadDOCX(buffer: Buffer, fileName: string): Promise<LoadedDocument> {
  const result = await mammoth.extractRawText({ buffer })
  
  return {
    content: result.value,
    metadata: {
      fileName,
      fileType: 'docx',
    },
  }
}

async function loadTXT(buffer: Buffer, fileName: string): Promise<LoadedDocument> {
  const content = buffer.toString('utf-8')
  
  return {
    content,
    metadata: {
      fileName,
      fileType: 'txt',
    },
  }
}

async function loadImageWithVision(
  buffer: Buffer, 
  fileName: string, 
  fileType: string
): Promise<LoadedDocument> {
  const base64Image = buffer.toString('base64')
  const mimeType = fileType.startsWith('image/') ? fileType : `image/${fileName.split('.').pop()}`
  const dataUrl = `data:${mimeType};base64,${base64Image}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are an OCR and document analysis expert. Please analyze this image and extract ALL text content visible in it. 

If this is a document, diagram, or screenshot:
- Extract all visible text exactly as it appears
- Preserve the structure and formatting as much as possible
- Include any headers, labels, captions, or annotations
- If there are tables, represent them in a clear text format
- If there are diagrams or charts, describe them and extract any text/labels

If this is a photo or illustration:
- Describe what's in the image
- Extract any visible text (signs, labels, watermarks, etc.)

Please provide a comprehensive text extraction that captures all the information in this image.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 4096,
  })

  const extractedContent = response.choices[0]?.message?.content || ''
  
  if (!extractedContent.trim()) {
    throw new Error('No content could be extracted from the image')
  }

  return {
    content: extractedContent,
    metadata: {
      fileName,
      fileType: mimeType,
      extractedWithVision: true,
    },
  }
}
