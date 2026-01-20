export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
      }
      organization_invites: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: 'admin' | 'member'
          invited_by: string
          token: string
          status: 'pending' | 'accepted' | 'expired' | 'cancelled'
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: 'admin' | 'member'
          invited_by: string
          token: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: 'admin' | 'member'
          invited_by?: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          expires_at?: string
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_monthly: number
          price_yearly: number
          limits: Json
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number
          limits?: Json
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number
          limits?: Json
          features?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          plan_id: string
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          project_id: string
          name: string
          key_hash: string
          key_prefix: string
          permissions: Json
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          key_hash: string
          key_prefix: string
          permissions?: Json
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          permissions?: Json
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      sources: {
        Row: {
          id: string
          project_id: string
          type: 'document' | 'text' | 'qa' | 'website' | 'notion'
          name: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          metadata: Json
          chunks_count: number
          tokens_count: number
          auto_retrain: boolean
          last_retrained_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'document' | 'text' | 'qa' | 'website' | 'notion'
          name: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          metadata?: Json
          chunks_count?: number
          tokens_count?: number
          auto_retrain?: boolean
          last_retrained_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'document' | 'text' | 'qa' | 'website' | 'notion'
          name?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          metadata?: Json
          chunks_count?: number
          tokens_count?: number
          auto_retrain?: boolean
          last_retrained_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      source_documents: {
        Row: {
          id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          original_name: string
        }
        Insert: {
          id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          original_name: string
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          original_name?: string
        }
      }
      source_texts: {
        Row: {
          id: string
          content: string
        }
        Insert: {
          id: string
          content: string
        }
        Update: {
          id?: string
          content?: string
        }
      }
      source_qa: {
        Row: {
          id: string
          question: string
          answer: string
        }
        Insert: {
          id: string
          question: string
          answer: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
        }
      }
      source_websites: {
        Row: {
          id: string
          url: string
          crawl_type: 'sitemap' | 'single' | 'crawl'
          include_paths: string[]
          exclude_paths: string[]
          pages_crawled: number
          last_crawled_at: string | null
          slow_scraping: boolean
        }
        Insert: {
          id: string
          url: string
          crawl_type?: 'sitemap' | 'single' | 'crawl'
          include_paths?: string[]
          exclude_paths?: string[]
          pages_crawled?: number
          last_crawled_at?: string | null
          slow_scraping?: boolean
        }
        Update: {
          id?: string
          url?: string
          crawl_type?: 'sitemap' | 'single' | 'crawl'
          include_paths?: string[]
          exclude_paths?: string[]
          pages_crawled?: number
          last_crawled_at?: string | null
          slow_scraping?: boolean
        }
      }
      website_links: {
        Row: {
          id: string
          source_website_id: string
          url: string
          title: string | null
          content_size: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          is_excluded: boolean
          error_message: string | null
          last_crawled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_website_id: string
          url: string
          title?: string | null
          content_size?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          is_excluded?: boolean
          error_message?: string | null
          last_crawled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_website_id?: string
          url?: string
          title?: string | null
          content_size?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          is_excluded?: boolean
          error_message?: string | null
          last_crawled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      source_notion: {
        Row: {
          id: string
          notion_workspace_id: string | null
          notion_workspace_name: string | null
          access_token_encrypted: string | null
          last_synced_at: string | null
          sync_status: string
          pages?: {
            id: string
            notion_page_id: string
            title: string | null
            page_type: string
            status: string
            is_excluded: boolean
          }[]
        }
        Insert: {
          id: string
          notion_workspace_id?: string | null
          notion_workspace_name?: string | null
          access_token_encrypted?: string | null
          last_synced_at?: string | null
          sync_status?: string
        }
        Update: {
          id?: string
          notion_workspace_id?: string | null
          notion_workspace_name?: string | null
          access_token_encrypted?: string | null
          last_synced_at?: string | null
          sync_status?: string
        }
      }
      notion_pages: {
        Row: {
          id: string
          source_notion_id: string
          notion_page_id: string
          title: string | null
          page_type: string
          content_size: number | null
          status: string
          is_excluded: boolean
          error_message: string | null
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_notion_id: string
          notion_page_id: string
          title?: string | null
          page_type?: string
          content_size?: number | null
          status?: string
          is_excluded?: boolean
          error_message?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_notion_id?: string
          notion_page_id?: string
          title?: string | null
          page_type?: string
          content_size?: number | null
          status?: string
          is_excluded?: boolean
          error_message?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chunks: {
        Row: {
          id: string
          source_id: string
          project_id: string
          content: string
          metadata: Json
          embedding_model: string
          embedding: number[] | null
          tokens_count: number
          created_at: string
        }
        Insert: {
          id?: string
          source_id: string
          project_id: string
          content: string
          metadata?: Json
          embedding_model?: string
          embedding?: number[] | null
          tokens_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          project_id?: string
          content?: string
          metadata?: Json
          embedding_model?: string
          embedding?: number[] | null
          tokens_count?: number
          created_at?: string
        }
      }
      usage_records: {
        Row: {
          id: string
          organization_id: string
          project_id: string | null
          type: 'message' | 'embedding' | 'storage'
          amount: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          project_id?: string | null
          type: 'message' | 'embedding' | 'storage'
          amount?: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          project_id?: string | null
          type?: 'message' | 'embedding' | 'storage'
          amount?: number
          metadata?: Json
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          session_id: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_id: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_id?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          sources_used: Json
          tokens_used: number
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          sources_used?: Json
          tokens_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          sources_used?: Json
          tokens_used?: number
          created_at?: string
        }
      }
    }
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[]
          match_project_id: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          source_id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Organization = Tables<'organizations'>
export type OrganizationMember = Tables<'organization_members'>
export type OrganizationInvite = Tables<'organization_invites'>
export type Plan = Tables<'plans'>
export type Subscription = Tables<'subscriptions'>
export type Project = Tables<'projects'>
export type ApiKey = Tables<'api_keys'>
export type Source = Tables<'sources'>
export type SourceDocument = Tables<'source_documents'>
export type SourceText = Tables<'source_texts'>
export type SourceQA = Tables<'source_qa'>
export type SourceWebsite = Tables<'source_websites'>
export type WebsiteLink = Tables<'website_links'>
export type SourceNotion = Tables<'source_notion'>
export type Chunk = Tables<'chunks'>
export type UsageRecord = Tables<'usage_records'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>

export interface ProjectSettings {
  embedding_model: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002'
  embedding_dimensions: number
  chat_model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo'
  temperature: number
  max_tokens: number
  system_prompt: string
}

export interface PlanLimits {
  projects: number
  documents_per_project: number
  websites_per_project: number
  message_credits_monthly: number
  storage_mb: number
  team_members: number
}

export interface ChunkDebug {
  id: string
  content: string
  contentPreview: string
  metadata: Json
  tokensCount: number
  embeddingModel: string
  embeddingStats?: {
    dimension: number | null
    magnitude: number | null
    hasEmbedding: boolean
  }
  createdAt: string
}

export interface ChunksPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ChunksDebugResponse {
  chunks: ChunkDebug[]
  pagination: ChunksPagination
  summary: {
    totalChunks: number
    totalTokens: number
  }
}
