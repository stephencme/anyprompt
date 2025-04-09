export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompt_version: {
        Row: {
          id: string
          prompt_id: string
          version: string
          prompt: string
          template_variables: string[]
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          version: string
          prompt: string
          template_variables: string[]
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          version?: string
          prompt?: string
          template_variables?: string[]
          created_at?: string
        }
      }
    }
  }
} 