export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          approved_by: string | null
          created_at: string | null
          id: string
          manuscript_id: string
          notes: string | null
          purpose: string
          request_type: string
          requested_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          manuscript_id: string
          notes?: string | null
          purpose: string
          request_type: string
          requested_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          manuscript_id?: string
          notes?: string | null
          purpose?: string
          request_type?: string
          requested_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      archiving_logs: {
        Row: {
          action: string
          content_id: string
          content_title: string
          content_type: Database["public"]["Enums"]["content_type"]
          executed_at: string | null
          executed_by: string | null
          id: string
          new_status: Database["public"]["Enums"]["content_status"] | null
          old_status: Database["public"]["Enums"]["content_status"] | null
          reason: string | null
        }
        Insert: {
          action: string
          content_id: string
          content_title: string
          content_type: Database["public"]["Enums"]["content_type"]
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["content_status"] | null
          old_status?: Database["public"]["Enums"]["content_status"] | null
          reason?: string | null
        }
        Update: {
          action?: string
          content_id?: string
          content_title?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["content_status"] | null
          old_status?: Database["public"]["Enums"]["content_status"] | null
          reason?: string | null
        }
        Relationships: []
      }
      archiving_settings: {
        Row: {
          archive_after_days: number | null
          archive_condition: string | null
          auto_archive_enabled: boolean | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          exclude_featured: boolean | null
          id: string
          min_view_count: number | null
          updated_at: string | null
        }
        Insert: {
          archive_after_days?: number | null
          archive_condition?: string | null
          auto_archive_enabled?: boolean | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          exclude_featured?: boolean | null
          id?: string
          min_view_count?: number | null
          updated_at?: string | null
        }
        Update: {
          archive_after_days?: number | null
          archive_condition?: string | null
          auto_archive_enabled?: boolean | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          exclude_featured?: boolean | null
          id?: string
          min_view_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bnrm_parametres: {
        Row: {
          commentaire: string | null
          created_at: string | null
          parametre: string
          updated_at: string | null
          valeur: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          parametre: string
          updated_at?: string | null
          valeur: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          parametre?: string
          updated_at?: string | null
          valeur?: string
        }
        Relationships: []
      }
      bnrm_services: {
        Row: {
          categorie: string
          created_at: string | null
          description: string
          id_service: string
          nom_service: string
          public_cible: string
          reference_legale: string
          updated_at: string | null
        }
        Insert: {
          categorie: string
          created_at?: string | null
          description: string
          id_service: string
          nom_service: string
          public_cible: string
          reference_legale: string
          updated_at?: string | null
        }
        Update: {
          categorie?: string
          created_at?: string | null
          description?: string
          id_service?: string
          nom_service?: string
          public_cible?: string
          reference_legale?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bnrm_tarifs: {
        Row: {
          condition_tarif: string | null
          created_at: string | null
          devise: string
          id_service: string
          id_tarif: string
          is_active: boolean | null
          montant: number
          periode_validite: string
          updated_at: string | null
        }
        Insert: {
          condition_tarif?: string | null
          created_at?: string | null
          devise?: string
          id_service: string
          id_tarif: string
          is_active?: boolean | null
          montant: number
          periode_validite: string
          updated_at?: string | null
        }
        Update: {
          condition_tarif?: string | null
          created_at?: string | null
          devise?: string
          id_service?: string
          id_tarif?: string
          is_active?: boolean | null
          montant?: number
          periode_validite?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bnrm_tarifs_id_service_fkey"
            columns: ["id_service"]
            isOneToOne: false
            referencedRelation: "bnrm_services"
            referencedColumns: ["id_service"]
          },
        ]
      }
      bnrm_tarifs_historique: {
        Row: {
          action: string
          ancienne_valeur: number | null
          commentaire: string | null
          date_modification: string | null
          id: string
          id_tarif: string
          nouvelle_valeur: number | null
          utilisateur_responsable: string | null
        }
        Insert: {
          action: string
          ancienne_valeur?: number | null
          commentaire?: string | null
          date_modification?: string | null
          id?: string
          id_tarif: string
          nouvelle_valeur?: number | null
          utilisateur_responsable?: string | null
        }
        Update: {
          action?: string
          ancienne_valeur?: number | null
          commentaire?: string | null
          date_modification?: string | null
          id?: string
          id_tarif?: string
          nouvelle_valeur?: number | null
          utilisateur_responsable?: string | null
        }
        Relationships: []
      }
      bnrm_wallets: {
        Row: {
          balance: number
          created_at: string | null
          currency: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          currency?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          currency?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      catalog_metadata: {
        Row: {
          access_rights: string | null
          cdu_classification: string | null
          co_authors: string[] | null
          color_mode: string | null
          conservation_notes: string | null
          content_id: string | null
          content_notes: string | null
          copyright_status: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          dewey_classification: string | null
          digital_format: string | null
          edition: string | null
          editors: string[] | null
          file_size_mb: number | null
          format_size: string | null
          general_notes: string | null
          geographic_coverage: string[] | null
          id: string
          illustrations_type: string | null
          illustrators: string[] | null
          import_date: string | null
          isbn: string | null
          issn: string | null
          keywords: string[] | null
          last_sync_date: string | null
          main_author: string | null
          manuscript_id: string | null
          missing_pages_reason: string | null
          original_title: string | null
          page_count: number | null
          physical_description: string | null
          publication_place: string | null
          publication_year: number | null
          publisher: string | null
          resolution_dpi: number | null
          series_title: string | null
          source_record_id: string | null
          source_sigb: string | null
          subjects: string[] | null
          subtitle: string | null
          time_period: string | null
          translated_title: string | null
          translators: string[] | null
          udc_classification: string | null
          updated_at: string | null
          updated_by: string | null
          usage_restrictions: string | null
          volume_number: string | null
        }
        Insert: {
          access_rights?: string | null
          cdu_classification?: string | null
          co_authors?: string[] | null
          color_mode?: string | null
          conservation_notes?: string | null
          content_id?: string | null
          content_notes?: string | null
          copyright_status?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          dewey_classification?: string | null
          digital_format?: string | null
          edition?: string | null
          editors?: string[] | null
          file_size_mb?: number | null
          format_size?: string | null
          general_notes?: string | null
          geographic_coverage?: string[] | null
          id?: string
          illustrations_type?: string | null
          illustrators?: string[] | null
          import_date?: string | null
          isbn?: string | null
          issn?: string | null
          keywords?: string[] | null
          last_sync_date?: string | null
          main_author?: string | null
          manuscript_id?: string | null
          missing_pages_reason?: string | null
          original_title?: string | null
          page_count?: number | null
          physical_description?: string | null
          publication_place?: string | null
          publication_year?: number | null
          publisher?: string | null
          resolution_dpi?: number | null
          series_title?: string | null
          source_record_id?: string | null
          source_sigb?: string | null
          subjects?: string[] | null
          subtitle?: string | null
          time_period?: string | null
          translated_title?: string | null
          translators?: string[] | null
          udc_classification?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_restrictions?: string | null
          volume_number?: string | null
        }
        Update: {
          access_rights?: string | null
          cdu_classification?: string | null
          co_authors?: string[] | null
          color_mode?: string | null
          conservation_notes?: string | null
          content_id?: string | null
          content_notes?: string | null
          copyright_status?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          dewey_classification?: string | null
          digital_format?: string | null
          edition?: string | null
          editors?: string[] | null
          file_size_mb?: number | null
          format_size?: string | null
          general_notes?: string | null
          geographic_coverage?: string[] | null
          id?: string
          illustrations_type?: string | null
          illustrators?: string[] | null
          import_date?: string | null
          isbn?: string | null
          issn?: string | null
          keywords?: string[] | null
          last_sync_date?: string | null
          main_author?: string | null
          manuscript_id?: string | null
          missing_pages_reason?: string | null
          original_title?: string | null
          page_count?: number | null
          physical_description?: string | null
          publication_place?: string | null
          publication_year?: number | null
          publisher?: string | null
          resolution_dpi?: number | null
          series_title?: string | null
          source_record_id?: string | null
          source_sigb?: string | null
          subjects?: string[] | null
          subtitle?: string | null
          time_period?: string | null
          translated_title?: string | null
          translators?: string[] | null
          udc_classification?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_restrictions?: string | null
          volume_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_metadata_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_metadata_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          language: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          language: string
          metadata: Json | null
          sender: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          language?: string
          metadata?: Json | null
          sender: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          language?: string
          metadata?: Json | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          language: string
          metadata: Json | null
          query_text: string | null
          response_text: string | null
          response_time_ms: number | null
          satisfaction_rating: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          language?: string
          metadata?: Json | null
          query_text?: string | null
          response_text?: string | null
          response_time_ms?: number | null
          satisfaction_rating?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          language?: string
          metadata?: Json | null
          query_text?: string | null
          response_text?: string | null
          response_time_ms?: number | null
          satisfaction_rating?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          language: string
          priority: number | null
          source_type: string | null
          source_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          language?: string
          priority?: number | null
          source_type?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          language?: string
          priority?: number | null
          source_type?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string | null
          curator_id: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          curator_id?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          curator_id?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_curator_id_fkey"
            columns: ["curator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_curator_id_fkey"
            columns: ["curator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          author_id: string
          content_body: string
          content_type: Database["public"]["Enums"]["content_type"]
          copyright_derogation: boolean | null
          copyright_expires_at: string | null
          created_at: string | null
          download_enabled: boolean | null
          email_share_enabled: boolean | null
          end_date: string | null
          excerpt: string | null
          featured_image_url: string | null
          file_size_mb: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          is_visible: boolean | null
          location: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          seo_keywords: string[] | null
          slug: string
          social_share_enabled: boolean | null
          start_date: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          content_body: string
          content_type: Database["public"]["Enums"]["content_type"]
          copyright_derogation?: boolean | null
          copyright_expires_at?: string | null
          created_at?: string | null
          download_enabled?: boolean | null
          email_share_enabled?: boolean | null
          end_date?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          file_size_mb?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          seo_keywords?: string[] | null
          slug: string
          social_share_enabled?: boolean | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          content_body?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          copyright_derogation?: boolean | null
          copyright_expires_at?: string | null
          created_at?: string | null
          download_enabled?: boolean | null
          email_share_enabled?: boolean | null
          end_date?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          file_size_mb?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          seo_keywords?: string[] | null
          slug?: string
          social_share_enabled?: boolean | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          color: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      content_category_relations: {
        Row: {
          category_id: string
          content_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          category_id: string
          content_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          category_id?: string
          content_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_category_relations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_category_relations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_translations: {
        Row: {
          content_body: string
          content_id: string
          created_at: string | null
          excerpt: string | null
          id: string
          is_approved: boolean | null
          language_code: string
          meta_description: string | null
          meta_title: string | null
          seo_keywords: string[] | null
          slug: string
          title: string
          translated_by: string | null
          updated_at: string | null
        }
        Insert: {
          content_body: string
          content_id: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_approved?: boolean | null
          language_code: string
          meta_description?: string | null
          meta_title?: string | null
          seo_keywords?: string[] | null
          slug: string
          title: string
          translated_by?: string | null
          updated_at?: string | null
        }
        Update: {
          content_body?: string
          content_id?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_approved?: boolean | null
          language_code?: string
          meta_description?: string | null
          meta_title?: string | null
          seo_keywords?: string[] | null
          slug?: string
          title?: string
          translated_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_translations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      content_validation: {
        Row: {
          comments: string | null
          content_id: string
          created_at: string | null
          id: string
          status: string
          updated_at: string | null
          validated_at: string | null
          validation_criteria: Json | null
          validation_type: string
          validator_id: string | null
        }
        Insert: {
          comments?: string | null
          content_id: string
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          validated_at?: string | null
          validation_criteria?: Json | null
          validation_type: string
          validator_id?: string | null
        }
        Update: {
          comments?: string | null
          content_id?: string
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          validated_at?: string | null
          validation_criteria?: Json | null
          validation_type?: string
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_validation_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_activity_log: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          new_status: Database["public"]["Enums"]["deposit_status"] | null
          old_status: Database["public"]["Enums"]["deposit_status"] | null
          request_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_status?: Database["public"]["Enums"]["deposit_status"] | null
          old_status?: Database["public"]["Enums"]["deposit_status"] | null
          request_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_status?: Database["public"]["Enums"]["deposit_status"] | null
          old_status?: Database["public"]["Enums"]["deposit_status"] | null
          request_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_activity_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_deposit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_notifications: {
        Row: {
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          recipient_id: string | null
          request_id: string | null
          sent_at: string | null
          title: string
        }
        Insert: {
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          recipient_id?: string | null
          request_id?: string | null
          sent_at?: string | null
          title: string
        }
        Update: {
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          recipient_id?: string | null
          request_id?: string | null
          sent_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_deposit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_workflow_steps: {
        Row: {
          comments: string | null
          created_at: string | null
          gestionnaire_id: string | null
          id: string
          processed_at: string | null
          request_id: string | null
          status: string | null
          step_name: string
          step_number: number
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          gestionnaire_id?: string | null
          id?: string
          processed_at?: string | null
          request_id?: string | null
          status?: string | null
          step_name: string
          step_number: number
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          gestionnaire_id?: string | null
          id?: string
          processed_at?: string | null
          request_id?: string | null
          status?: string | null
          step_name?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "deposit_workflow_steps_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_deposit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      download_logs: {
        Row: {
          content_id: string
          downloaded_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          content_id: string
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      download_restrictions: {
        Row: {
          content_id: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          reason: string | null
          restricted_at: string | null
          restriction_type: string
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          restricted_at?: string | null
          restriction_type: string
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          restricted_at?: string | null
          restriction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_restrictions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      exhibition_resources: {
        Row: {
          added_at: string | null
          content_id: string | null
          display_order: number | null
          exhibition_id: string | null
          id: string
        }
        Insert: {
          added_at?: string | null
          content_id?: string | null
          display_order?: number | null
          exhibition_id?: string | null
          id?: string
        }
        Update: {
          added_at?: string | null
          content_id?: string | null
          display_order?: number | null
          exhibition_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exhibition_resources_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exhibition_resources_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "virtual_exhibitions"
            referencedColumns: ["id"]
          },
        ]
      }
      exhibition_visits: {
        Row: {
          exhibition_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
          visited_at: string | null
        }
        Insert: {
          exhibition_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
          visited_at?: string | null
        }
        Update: {
          exhibition_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exhibition_visits_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "virtual_exhibitions"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          answer_ar: string
          answer_ber: string | null
          category_id: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          question: string
          question_ar: string
          question_ber: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          answer_ar: string
          answer_ber?: string | null
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          question: string
          question_ar: string
          question_ber?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          answer_ar?: string
          answer_ber?: string | null
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          question?: string
          question_ar?: string
          question_ber?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          author: string | null
          content_id: string | null
          content_type: string
          created_at: string
          id: string
          manuscript_id: string | null
          notes: string | null
          thumbnail_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          author?: string | null
          content_id?: string | null
          content_type: string
          created_at?: string
          id?: string
          manuscript_id?: string | null
          notes?: string | null
          thumbnail_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          author?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          manuscript_id?: string | null
          notes?: string | null
          thumbnail_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_logs: {
        Row: {
          action_taken: string | null
          created_at: string | null
          fraud_indicators: Json | null
          id: string
          risk_score: number | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          fraud_indicators?: Json | null
          id?: string
          risk_score?: number | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          fraud_indicators?: Json | null
          id?: string
          risk_score?: number | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_detection_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          created_at: string | null
          description: string | null
          description_ar: string | null
          description_ber: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string
          name_ber: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_ber?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar: string
          name_ber?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_ber?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string
          name_ber?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      help_guides: {
        Row: {
          category_id: string | null
          content: string
          content_ar: string
          content_ber: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_ar: string | null
          description_ber: string | null
          difficulty_level: string | null
          estimated_time: number | null
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          title_ar: string
          title_ber: string | null
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          content_ar: string
          content_ber?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_ar?: string | null
          description_ber?: string | null
          difficulty_level?: string | null
          estimated_time?: number | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          title_ar: string
          title_ber?: string | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          content_ar?: string
          content_ber?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_ar?: string | null
          description_ber?: string | null
          difficulty_level?: string | null
          estimated_time?: number | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          title_ar?: string
          title_ber?: string | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "help_guides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_rtl: boolean | null
          name: string
          native_name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_rtl?: boolean | null
          name: string
          native_name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_rtl?: boolean | null
          name?: string
          native_name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      legal_deposit_requests: {
        Row: {
          attribution_date: string | null
          author_name: string | null
          collaborator_id: string | null
          created_at: string | null
          dl_number: string | null
          documents_urls: Json | null
          id: string
          initiator_id: string
          isbn: string | null
          isbn_assigned: string | null
          ismn: string | null
          ismn_assigned: string | null
          issn: string | null
          issn_assigned: string | null
          language: string | null
          metadata: Json | null
          monograph_type: Database["public"]["Enums"]["monograph_type"]
          page_count: number | null
          processing_start_date: string | null
          publication_date: string | null
          reception_date: string | null
          request_number: string
          status: Database["public"]["Enums"]["deposit_status"] | null
          submission_date: string | null
          subtitle: string | null
          support_type: Database["public"]["Enums"]["support_type"]
          title: string
          updated_at: string | null
          validation_b_date: string | null
          validation_code: string | null
        }
        Insert: {
          attribution_date?: string | null
          author_name?: string | null
          collaborator_id?: string | null
          created_at?: string | null
          dl_number?: string | null
          documents_urls?: Json | null
          id?: string
          initiator_id: string
          isbn?: string | null
          isbn_assigned?: string | null
          ismn?: string | null
          ismn_assigned?: string | null
          issn?: string | null
          issn_assigned?: string | null
          language?: string | null
          metadata?: Json | null
          monograph_type: Database["public"]["Enums"]["monograph_type"]
          page_count?: number | null
          processing_start_date?: string | null
          publication_date?: string | null
          reception_date?: string | null
          request_number: string
          status?: Database["public"]["Enums"]["deposit_status"] | null
          submission_date?: string | null
          subtitle?: string | null
          support_type: Database["public"]["Enums"]["support_type"]
          title: string
          updated_at?: string | null
          validation_b_date?: string | null
          validation_code?: string | null
        }
        Update: {
          attribution_date?: string | null
          author_name?: string | null
          collaborator_id?: string | null
          created_at?: string | null
          dl_number?: string | null
          documents_urls?: Json | null
          id?: string
          initiator_id?: string
          isbn?: string | null
          isbn_assigned?: string | null
          ismn?: string | null
          ismn_assigned?: string | null
          issn?: string | null
          issn_assigned?: string | null
          language?: string | null
          metadata?: Json | null
          monograph_type?: Database["public"]["Enums"]["monograph_type"]
          page_count?: number | null
          processing_start_date?: string | null
          publication_date?: string | null
          reception_date?: string | null
          request_number?: string
          status?: Database["public"]["Enums"]["deposit_status"] | null
          submission_date?: string | null
          subtitle?: string | null
          support_type?: Database["public"]["Enums"]["support_type"]
          title?: string
          updated_at?: string | null
          validation_b_date?: string | null
          validation_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_deposit_requests_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "professional_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_deposit_requests_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "professional_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_deposits: {
        Row: {
          acknowledgment_date: string | null
          content_id: string
          created_at: string | null
          deposit_number: string | null
          deposit_type: string
          id: string
          metadata: Json | null
          status: string
          submission_date: string | null
          submitter_id: string
          updated_at: string | null
        }
        Insert: {
          acknowledgment_date?: string | null
          content_id: string
          created_at?: string | null
          deposit_number?: string | null
          deposit_type: string
          id?: string
          metadata?: Json | null
          status?: string
          submission_date?: string | null
          submitter_id: string
          updated_at?: string | null
        }
        Update: {
          acknowledgment_date?: string | null
          content_id?: string
          created_at?: string | null
          deposit_number?: string | null
          deposit_type?: string
          id?: string
          metadata?: Json | null
          status?: string
          submission_date?: string | null
          submitter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_deposits_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          manuscript_id: string
          note: string | null
          page_number: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          manuscript_id: string
          note?: string | null
          page_number: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          manuscript_id?: string
          note?: string | null
          page_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_bookmarks_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_pages: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          manuscript_id: string
          ocr_text: string | null
          page_number: number
          paragraphs: Json | null
          translations: Json | null
          updated_at: string | null
          word_coordinates: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          manuscript_id: string
          ocr_text?: string | null
          page_number: number
          paragraphs?: Json | null
          translations?: Json | null
          updated_at?: string | null
          word_coordinates?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          manuscript_id?: string
          ocr_text?: string | null
          page_number?: number
          paragraphs?: Json | null
          translations?: Json | null
          updated_at?: string | null
          word_coordinates?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_pages_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_platform_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["manuscript_platform_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["manuscript_platform_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["manuscript_platform_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      manuscript_reading_history: {
        Row: {
          action_type: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          manuscript_id: string
          metadata: Json | null
          page_number: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          manuscript_id: string
          metadata?: Json | null
          page_number?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          manuscript_id?: string
          metadata?: Json | null
          page_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_reading_history_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          manuscript_id: string
          rating: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          manuscript_id: string
          rating: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          manuscript_id?: string
          rating?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_reviews_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_viewer_settings: {
        Row: {
          allow_download_default: boolean | null
          allow_email_share_default: boolean | null
          allow_print_default: boolean | null
          block_right_click_default: boolean | null
          block_screenshot_default: boolean | null
          created_at: string | null
          default_view_mode: string | null
          id: string
          max_zoom: number | null
          min_zoom: number | null
          updated_at: string | null
        }
        Insert: {
          allow_download_default?: boolean | null
          allow_email_share_default?: boolean | null
          allow_print_default?: boolean | null
          block_right_click_default?: boolean | null
          block_screenshot_default?: boolean | null
          created_at?: string | null
          default_view_mode?: string | null
          id?: string
          max_zoom?: number | null
          min_zoom?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_download_default?: boolean | null
          allow_email_share_default?: boolean | null
          allow_print_default?: boolean | null
          block_right_click_default?: boolean | null
          block_screenshot_default?: boolean | null
          created_at?: string | null
          default_view_mode?: string | null
          id?: string
          max_zoom?: number | null
          min_zoom?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      manuscripts: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"] | null
          allow_download: boolean | null
          allow_email_share: boolean | null
          allow_print: boolean | null
          author: string | null
          block_right_click: boolean | null
          block_screenshot: boolean | null
          category_id: string | null
          collection_id: string | null
          condition_notes: string | null
          cote: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          digital_copy_url: string | null
          dimensions: string | null
          file_url: string | null
          full_text_content: string | null
          genre: string | null
          has_ocr: boolean | null
          historical_period: string | null
          id: string
          inventory_number: string | null
          is_visible: boolean | null
          language: string | null
          material: string | null
          ocr_pages: Json | null
          ocr_text: string | null
          page_count: number | null
          page_structure: Json | null
          pages_data: Json | null
          period: string | null
          permalink: string | null
          publication_year: number | null
          search_keywords: string[] | null
          source: string | null
          status: Database["public"]["Enums"]["manuscript_status"] | null
          subject: string[] | null
          thumbnail_url: string | null
          title: string
          translations: Json | null
          updated_at: string | null
          versions: Json | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          allow_download?: boolean | null
          allow_email_share?: boolean | null
          allow_print?: boolean | null
          author?: string | null
          block_right_click?: boolean | null
          block_screenshot?: boolean | null
          category_id?: string | null
          collection_id?: string | null
          condition_notes?: string | null
          cote?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          digital_copy_url?: string | null
          dimensions?: string | null
          file_url?: string | null
          full_text_content?: string | null
          genre?: string | null
          has_ocr?: boolean | null
          historical_period?: string | null
          id?: string
          inventory_number?: string | null
          is_visible?: boolean | null
          language?: string | null
          material?: string | null
          ocr_pages?: Json | null
          ocr_text?: string | null
          page_count?: number | null
          page_structure?: Json | null
          pages_data?: Json | null
          period?: string | null
          permalink?: string | null
          publication_year?: number | null
          search_keywords?: string[] | null
          source?: string | null
          status?: Database["public"]["Enums"]["manuscript_status"] | null
          subject?: string[] | null
          thumbnail_url?: string | null
          title: string
          translations?: Json | null
          updated_at?: string | null
          versions?: Json | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          allow_download?: boolean | null
          allow_email_share?: boolean | null
          allow_print?: boolean | null
          author?: string | null
          block_right_click?: boolean | null
          block_screenshot?: boolean | null
          category_id?: string | null
          collection_id?: string | null
          condition_notes?: string | null
          cote?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          digital_copy_url?: string | null
          dimensions?: string | null
          file_url?: string | null
          full_text_content?: string | null
          genre?: string | null
          has_ocr?: boolean | null
          historical_period?: string | null
          id?: string
          inventory_number?: string | null
          is_visible?: boolean | null
          language?: string | null
          material?: string | null
          ocr_pages?: Json | null
          ocr_text?: string | null
          page_count?: number | null
          page_structure?: Json | null
          pages_data?: Json | null
          period?: string | null
          permalink?: string | null
          publication_year?: number | null
          search_keywords?: string[] | null
          source?: string | null
          status?: Database["public"]["Enums"]["manuscript_status"] | null
          subject?: string[] | null
          thumbnail_url?: string | null
          title?: string
          translations?: Json | null
          updated_at?: string | null
          versions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "manuscripts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manuscripts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manuscripts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manuscripts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      metadata_exports: {
        Row: {
          created_at: string | null
          download_count: number | null
          expires_at: string | null
          export_date: string | null
          export_filters: Json | null
          export_format: string
          export_status: string | null
          exported_by: string | null
          file_path: string | null
          file_size_mb: number | null
          id: string
          records_count: number | null
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          export_date?: string | null
          export_filters?: Json | null
          export_format: string
          export_status?: string | null
          exported_by?: string | null
          file_path?: string | null
          file_size_mb?: number | null
          id?: string
          records_count?: number | null
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          export_date?: string | null
          export_filters?: Json | null
          export_format?: string
          export_status?: string | null
          exported_by?: string | null
          file_path?: string | null
          file_size_mb?: number | null
          id?: string
          records_count?: number | null
        }
        Relationships: []
      }
      metadata_import_history: {
        Row: {
          created_at: string | null
          error_log: Json | null
          id: string
          import_date: string | null
          import_parameters: Json | null
          import_status: string | null
          import_type: string
          imported_by: string | null
          records_failed: number | null
          records_imported: number | null
          records_updated: number | null
          source_system: string
        }
        Insert: {
          created_at?: string | null
          error_log?: Json | null
          id?: string
          import_date?: string | null
          import_parameters?: Json | null
          import_status?: string | null
          import_type: string
          imported_by?: string | null
          records_failed?: number | null
          records_imported?: number | null
          records_updated?: number | null
          source_system: string
        }
        Update: {
          created_at?: string | null
          error_log?: Json | null
          id?: string
          import_date?: string | null
          import_parameters?: Json | null
          import_status?: string | null
          import_type?: string
          imported_by?: string | null
          records_failed?: number | null
          records_imported?: number | null
          records_updated?: number | null
          source_system?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      number_ranges: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_number: string
          id: string
          is_active: boolean | null
          number_type: string
          professional_id: string | null
          range_end: string
          range_start: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_number: string
          id?: string
          is_active?: boolean | null
          number_type: string
          professional_id?: string | null
          range_end: string
          range_start: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_number?: string
          id?: string
          is_active?: boolean | null
          number_type?: string
          professional_id?: string | null
          range_end?: string
          range_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "number_ranges_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_collections: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          contact_email: string
          contact_person: string
          contact_phone: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          institution_code: string
          institution_name: string
          is_approved: boolean | null
          logo_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email: string
          contact_person: string
          contact_phone?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          institution_code: string
          institution_name: string
          is_approved?: boolean | null
          logo_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string
          contact_person?: string
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          institution_code?: string
          institution_name?: string
          is_approved?: boolean | null
          logo_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      partner_manuscript_submissions: {
        Row: {
          approved_at: string | null
          author: string | null
          collection_id: string | null
          condition_notes: string | null
          created_at: string | null
          description: string | null
          digital_files: Json | null
          dimensions: string | null
          id: string
          inventory_number: string | null
          language: string
          manuscript_id: string | null
          material: string | null
          metadata: Json | null
          page_count: number | null
          period: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revision_notes: string | null
          submission_status: string | null
          submitted_by: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          author?: string | null
          collection_id?: string | null
          condition_notes?: string | null
          created_at?: string | null
          description?: string | null
          digital_files?: Json | null
          dimensions?: string | null
          id?: string
          inventory_number?: string | null
          language: string
          manuscript_id?: string | null
          material?: string | null
          metadata?: Json | null
          page_count?: number | null
          period?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_notes?: string | null
          submission_status?: string | null
          submitted_by: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          author?: string | null
          collection_id?: string | null
          condition_notes?: string | null
          created_at?: string | null
          description?: string | null
          digital_files?: Json | null
          dimensions?: string | null
          id?: string
          inventory_number?: string | null
          language?: string
          manuscript_id?: string | null
          material?: string | null
          metadata?: Json | null
          page_count?: number | null
          period?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_notes?: string | null
          submission_status?: string | null
          submitted_by?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_manuscript_submissions_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "partner_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_manuscript_submissions_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_submission_history: {
        Row: {
          action: string
          comments: string | null
          created_at: string | null
          id: string
          new_status: string | null
          old_status: string | null
          performed_by: string | null
          submission_id: string | null
        }
        Insert: {
          action: string
          comments?: string | null
          created_at?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_by?: string | null
          submission_id?: string | null
        }
        Update: {
          action?: string
          comments?: string | null
          created_at?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          performed_by?: string | null
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_submission_history_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "partner_manuscript_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          cmi_reference: string | null
          completed_at: string | null
          created_at: string | null
          currency: string
          error_message: string | null
          fraud_score: number | null
          id: string
          ip_address: unknown | null
          is_3d_secure: boolean | null
          legal_deposit_id: string | null
          metadata: Json | null
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          processed_at: string | null
          reproduction_request_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          cmi_reference?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          error_message?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          is_3d_secure?: boolean | null
          legal_deposit_id?: string | null
          metadata?: Json | null
          payment_method: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          processed_at?: string | null
          reproduction_request_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          cmi_reference?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          error_message?: string | null
          fraud_score?: number | null
          id?: string
          ip_address?: unknown | null
          is_3d_secure?: boolean | null
          legal_deposit_id?: string | null
          metadata?: Json | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          processed_at?: string | null
          reproduction_request_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_number?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_legal_deposit_id_fkey"
            columns: ["legal_deposit_id"]
            isOneToOne: false
            referencedRelation: "legal_deposits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_reproduction_request_id_fkey"
            columns: ["reproduction_request_id"]
            isOneToOne: false
            referencedRelation: "reproduction_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      preservation_actions: {
        Row: {
          action_type: string
          backup_location: string | null
          checksum_after: string | null
          checksum_before: string | null
          completed_at: string | null
          content_id: string | null
          created_at: string | null
          error_message: string | null
          file_path: string | null
          id: string
          manuscript_id: string | null
          metadata: Json | null
          performed_by: string | null
          scheduled_date: string | null
          source_format: string | null
          started_at: string | null
          status: string | null
          target_format: string | null
        }
        Insert: {
          action_type: string
          backup_location?: string | null
          checksum_after?: string | null
          checksum_before?: string | null
          completed_at?: string | null
          content_id?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          manuscript_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
          scheduled_date?: string | null
          source_format?: string | null
          started_at?: string | null
          status?: string | null
          target_format?: string | null
        }
        Update: {
          action_type?: string
          backup_location?: string | null
          checksum_after?: string | null
          checksum_before?: string | null
          completed_at?: string | null
          content_id?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          manuscript_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
          scheduled_date?: string | null
          source_format?: string | null
          started_at?: string | null
          status?: string | null
          target_format?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preservation_actions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preservation_actions_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      preservation_backups: {
        Row: {
          backup_location: string
          backup_size_mb: number | null
          backup_type: string
          checksum: string
          created_at: string | null
          created_by: string | null
          encryption_method: string | null
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          retention_period_days: number | null
          verification_date: string | null
        }
        Insert: {
          backup_location: string
          backup_size_mb?: number | null
          backup_type: string
          checksum: string
          created_at?: string | null
          created_by?: string | null
          encryption_method?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          retention_period_days?: number | null
          verification_date?: string | null
        }
        Update: {
          backup_location?: string
          backup_size_mb?: number | null
          backup_type?: string
          checksum?: string
          created_at?: string | null
          created_by?: string | null
          encryption_method?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          retention_period_days?: number | null
          verification_date?: string | null
        }
        Relationships: []
      }
      preservation_formats: {
        Row: {
          created_at: string | null
          file_extension: string
          format_name: string
          format_stability: string | null
          id: string
          is_preservation_format: boolean | null
          migration_priority: number | null
          mime_type: string
          recommended_alternative: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_extension: string
          format_name: string
          format_stability?: string | null
          id?: string
          is_preservation_format?: boolean | null
          migration_priority?: number | null
          mime_type: string
          recommended_alternative?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_extension?: string
          format_name?: string
          format_stability?: string | null
          id?: string
          is_preservation_format?: boolean | null
          migration_priority?: number | null
          mime_type?: string
          recommended_alternative?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      preservation_schedules: {
        Row: {
          action_type: string
          created_at: string | null
          created_by: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run: string | null
          next_run: string | null
          resource_filter: Json | null
          schedule_name: string
          updated_at: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          created_by?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          resource_filter?: Json | null
          schedule_name: string
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          resource_filter?: Json | null
          schedule_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      professional_registry: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          contact_person: string
          created_at: string | null
          email: string
          id: string
          is_verified: boolean | null
          last_dl_number: string | null
          phone: string | null
          postal_code: string | null
          professional_type: Database["public"]["Enums"]["professional_type"]
          registration_number: string | null
          updated_at: string | null
          user_id: string | null
          verification_date: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          contact_person: string
          created_at?: string | null
          email: string
          id?: string
          is_verified?: boolean | null
          last_dl_number?: string | null
          phone?: string | null
          postal_code?: string | null
          professional_type: Database["public"]["Enums"]["professional_type"]
          registration_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_date?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          last_dl_number?: string | null
          phone?: string | null
          postal_code?: string | null
          professional_type?: Database["public"]["Enums"]["professional_type"]
          registration_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_date?: string | null
        }
        Relationships: []
      }
      profile_pii_access_log: {
        Row: {
          access_reason: string | null
          accessed_by: string
          accessed_fields: string[]
          accessed_profile_id: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          access_reason?: string | null
          accessed_by: string
          accessed_fields: string[]
          accessed_profile_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          access_reason?: string | null
          accessed_by?: string
          accessed_fields?: string[]
          accessed_profile_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_level_details: Json | null
          created_at: string | null
          first_name: string
          id: string
          institution: string | null
          is_approved: boolean | null
          last_name: string
          partner_organization: string | null
          phone: string | null
          profile_preferences: Json | null
          research_field: string | null
          research_specialization: string[] | null
          role: Database["public"]["Enums"]["user_role"] | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level_details?: Json | null
          created_at?: string | null
          first_name: string
          id?: string
          institution?: string | null
          is_approved?: boolean | null
          last_name: string
          partner_organization?: string | null
          phone?: string | null
          profile_preferences?: Json | null
          research_field?: string | null
          research_specialization?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level_details?: Json | null
          created_at?: string | null
          first_name?: string
          id?: string
          institution?: string | null
          is_approved?: boolean | null
          last_name?: string
          partner_organization?: string | null
          phone?: string | null
          profile_preferences?: Json | null
          research_field?: string | null
          research_specialization?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reading_history: {
        Row: {
          action_type: string
          author: string | null
          content_id: string | null
          content_type: string
          created_at: string
          duration_minutes: number | null
          id: string
          last_page_read: number | null
          manuscript_id: string | null
          reading_progress: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          author?: string | null
          content_id?: string | null
          content_type: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          last_page_read?: number | null
          manuscript_id?: string | null
          reading_progress?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          author?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          last_page_read?: number | null
          manuscript_id?: string | null
          reading_progress?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_history_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      reproduction_items: {
        Row: {
          color_mode: string | null
          content_id: string | null
          created_at: string | null
          formats: Database["public"]["Enums"]["reproduction_format"][]
          id: string
          manuscript_id: string | null
          output_files: Json | null
          pages_specification: string | null
          quantity: number | null
          reference: string | null
          request_id: string
          resolution_dpi: number | null
          title: string
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          color_mode?: string | null
          content_id?: string | null
          created_at?: string | null
          formats?: Database["public"]["Enums"]["reproduction_format"][]
          id?: string
          manuscript_id?: string | null
          output_files?: Json | null
          pages_specification?: string | null
          quantity?: number | null
          reference?: string | null
          request_id: string
          resolution_dpi?: number | null
          title: string
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          color_mode?: string | null
          content_id?: string | null
          created_at?: string | null
          formats?: Database["public"]["Enums"]["reproduction_format"][]
          id?: string
          manuscript_id?: string | null
          output_files?: Json | null
          pages_specification?: string | null
          quantity?: number | null
          reference?: string | null
          request_id?: string
          resolution_dpi?: number | null
          title?: string
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reproduction_items_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reproduction_items_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reproduction_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "reproduction_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reproduction_notifications: {
        Row: {
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          recipient_id: string
          request_id: string
          sent_at: string | null
          title: string
        }
        Insert: {
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          recipient_id: string
          request_id: string
          sent_at?: string | null
          title: string
        }
        Update: {
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          recipient_id?: string
          request_id?: string
          sent_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reproduction_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "reproduction_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reproduction_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          paid_at: string | null
          payment_details: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: string | null
          request_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_details?: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: string | null
          request_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_details?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: string | null
          request_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reproduction_payments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "reproduction_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reproduction_requests: {
        Row: {
          available_at: string | null
          created_at: string | null
          download_count: number | null
          expires_at: string | null
          id: string
          internal_notes: string | null
          manager_validated_at: string | null
          manager_validation_notes: string | null
          manager_validator_id: string | null
          metadata: Json | null
          paid_at: string | null
          payment_amount: number | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: string | null
          processed_by: string | null
          processing_completed_at: string | null
          processing_started_at: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          reproduction_modality: Database["public"]["Enums"]["reproduction_modality"]
          request_number: string
          service_validated_at: string | null
          service_validation_notes: string | null
          service_validator_id: string | null
          status: Database["public"]["Enums"]["reproduction_status"]
          submitted_at: string | null
          supporting_documents: Json | null
          updated_at: string | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          available_at?: string | null
          created_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          id?: string
          internal_notes?: string | null
          manager_validated_at?: string | null
          manager_validation_notes?: string | null
          manager_validator_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: string | null
          processed_by?: string | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          reproduction_modality: Database["public"]["Enums"]["reproduction_modality"]
          request_number: string
          service_validated_at?: string | null
          service_validation_notes?: string | null
          service_validator_id?: string | null
          status?: Database["public"]["Enums"]["reproduction_status"]
          submitted_at?: string | null
          supporting_documents?: Json | null
          updated_at?: string | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          available_at?: string | null
          created_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          id?: string
          internal_notes?: string | null
          manager_validated_at?: string | null
          manager_validation_notes?: string | null
          manager_validator_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: string | null
          processed_by?: string | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          reproduction_modality?: Database["public"]["Enums"]["reproduction_modality"]
          request_number?: string
          service_validated_at?: string | null
          service_validation_notes?: string | null
          service_validator_id?: string | null
          status?: Database["public"]["Enums"]["reproduction_status"]
          submitted_at?: string | null
          supporting_documents?: Json | null
          updated_at?: string | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: []
      }
      reproduction_workflow_steps: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          request_id: string
          status: string | null
          step_name: string
          step_number: number
          validated_at: string | null
          validator_id: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          request_id: string
          status?: string | null
          step_name: string
          step_number: number
          validated_at?: string | null
          validator_id?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          request_id?: string
          status?: string | null
          step_name?: string
          step_number?: number
          validated_at?: string | null
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reproduction_workflow_steps_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "reproduction_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      search_logs: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          results_count: number | null
          search_duration_ms: number | null
          selected_result_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
          search_duration_ms?: number | null
          selected_result_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
          search_duration_ms?: number | null
          selected_result_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      search_settings: {
        Row: {
          created_at: string | null
          enable_faceted_search: boolean | null
          enable_fulltext_search: boolean | null
          enable_realtime_indexing: boolean | null
          highlight_color: string | null
          id: string
          max_results: number | null
          results_per_page: number
          snippet_length: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enable_faceted_search?: boolean | null
          enable_fulltext_search?: boolean | null
          enable_realtime_indexing?: boolean | null
          highlight_color?: string | null
          id?: string
          max_results?: number | null
          results_per_page?: number
          snippet_length?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enable_faceted_search?: boolean | null
          enable_fulltext_search?: boolean | null
          enable_realtime_indexing?: boolean | null
          highlight_color?: string | null
          id?: string
          max_results?: number | null
          results_per_page?: number
          snippet_length?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sigb_configuration: {
        Row: {
          api_endpoint: string | null
          api_version: string | null
          authentication_type: string | null
          configuration_params: Json | null
          configured_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_date: string | null
          next_sync_date: string | null
          sync_enabled: boolean | null
          sync_frequency: string | null
          system_name: string
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_version?: string | null
          authentication_type?: string | null
          configuration_params?: Json | null
          configured_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_date?: string | null
          next_sync_date?: string | null
          sync_enabled?: boolean | null
          sync_frequency?: string | null
          system_name: string
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_version?: string | null
          authentication_type?: string | null
          configuration_params?: Json | null
          configured_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_date?: string | null
          next_sync_date?: string | null
          sync_enabled?: boolean | null
          sync_frequency?: string | null
          system_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sigb_sync_logs: {
        Row: {
          config_id: string | null
          created_at: string | null
          error_details: Json | null
          id: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          sync_duration_seconds: number | null
          sync_end: string | null
          sync_start: string | null
          sync_status: string | null
        }
        Insert: {
          config_id?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          sync_duration_seconds?: number | null
          sync_end?: string | null
          sync_start?: string | null
          sync_status?: string | null
        }
        Update: {
          config_id?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          sync_duration_seconds?: number | null
          sync_end?: string | null
          sync_start?: string | null
          sync_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sigb_sync_logs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "sigb_configuration"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          has_advanced_search: boolean | null
          has_priority_support: boolean | null
          id: string
          max_downloads_per_month: number | null
          max_manuscript_requests: number | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          has_advanced_search?: boolean | null
          has_priority_support?: boolean | null
          id?: string
          max_downloads_per_month?: number | null
          max_manuscript_requests?: number | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          has_advanced_search?: boolean | null
          has_priority_support?: boolean | null
          id?: string
          max_downloads_per_month?: number | null
          max_manuscript_requests?: number | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translation_keys: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          key_name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key_name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key_name?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string | null
          id: string
          is_approved: boolean | null
          language_code: string
          translated_by: string | null
          translation_key_id: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          language_code: string
          translated_by?: string | null
          translation_key_id: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          language_code?: string
          translated_by?: string | null
          translation_key_id?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "translations_translation_key_id_fkey"
            columns: ["translation_key_id"]
            isOneToOne: false
            referencedRelation: "translation_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_steps: {
        Row: {
          content: string
          content_ar: string
          content_ber: string | null
          created_at: string | null
          guide_id: string | null
          id: string
          image_url: string | null
          step_number: number
          title: string
          title_ar: string
          title_ber: string | null
        }
        Insert: {
          content: string
          content_ar: string
          content_ber?: string | null
          created_at?: string | null
          guide_id?: string | null
          id?: string
          image_url?: string | null
          step_number: number
          title: string
          title_ar: string
          title_ber?: string | null
        }
        Update: {
          content?: string
          content_ar?: string
          content_ber?: string | null
          created_at?: string | null
          guide_id?: string | null
          id?: string
          image_url?: string | null
          step_number?: number
          title?: string
          title_ar?: string
          title_ber?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_steps_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "help_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          content_id: string | null
          created_at: string
          id: string
          manuscript_id: string | null
          note: string | null
          page_number: number
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          id?: string
          manuscript_id?: string | null
          note?: string | null
          page_number: number
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          id?: string
          manuscript_id?: string | null
          note?: string | null
          page_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted: boolean
          granted_by: string | null
          id: string
          permission_id: string
          reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted: boolean
          granted_by?: string | null
          id?: string
          permission_id: string
          reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted?: boolean
          granted_by?: string | null
          id?: string
          permission_id?: string
          reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          admin_response: string | null
          comment: string | null
          content_id: string | null
          created_at: string
          id: string
          is_reviewed_by_admin: boolean | null
          manuscript_id: string | null
          rating: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          comment?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          is_reviewed_by_admin?: boolean | null
          manuscript_id?: string | null
          rating?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          comment?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          is_reviewed_by_admin?: boolean | null
          manuscript_id?: string | null
          rating?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reviews_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tutorial_progress: {
        Row: {
          completed: boolean | null
          completion_date: string | null
          created_at: string | null
          guide_id: string | null
          id: string
          last_step: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          guide_id?: string | null
          id?: string
          last_step?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          guide_id?: string | null
          id?: string
          last_step?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tutorial_progress_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "help_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_exhibitions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          title: string
          updated_at: string | null
          visitor_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          title: string
          updated_at?: string | null
          visitor_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          title?: string
          updated_at?: string | null
          visitor_count?: number | null
        }
        Relationships: []
      }
      wallet_recharges: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          wallet_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          wallet_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_recharges_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_recharges_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "bnrm_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "bnrm_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          completed_at: string | null
          content_id: string
          created_at: string | null
          current_step: number | null
          id: string
          metadata: Json | null
          started_at: string | null
          started_by: string
          status: string
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          created_at?: string | null
          current_step?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          started_by: string
          status?: string
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          created_at?: string | null
          current_step?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          started_by?: string
          status?: string
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_executions: {
        Row: {
          assigned_to: string | null
          comments: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string
          step_name: string
          step_number: number
          updated_at: string | null
          workflow_instance_id: string
        }
        Insert: {
          assigned_to?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          step_name: string
          step_number: number
          updated_at?: string | null
          workflow_instance_id: string
        }
        Update: {
          assigned_to?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          step_name?: string
          step_number?: number
          updated_at?: string | null
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_executions_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps?: Json
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      manuscript_reading_stats: {
        Row: {
          download_count: number | null
          last_page: number | null
          last_read_at: string | null
          manuscript_id: string | null
          read_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_reading_history_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_public: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string | null
          institution: string | null
          is_approved: boolean | null
          last_name: string | null
          research_field: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          institution?: string | null
          is_approved?: boolean | null
          last_name?: string | null
          research_field?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          institution?: string | null
          is_approved?: boolean | null
          last_name?: string | null
          research_field?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize_ip: {
        Args: { ip_addr: unknown }
        Returns: unknown
      }
      anonymize_user_agent: {
        Args: { user_agent_str: string }
        Returns: string
      }
      calculate_checksum: {
        Args: { content_data: string }
        Returns: string
      }
      calculate_reproduction_total: {
        Args: { request_uuid: string }
        Returns: number
      }
      can_user_download: {
        Args: { p_content_id: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_activity_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_content_slug: {
        Args: { title: string }
        Returns: string
      }
      generate_deposit_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_reproduction_request_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_request_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_validation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_profile_summary: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          first_name: string
          institution: string
          is_approved: boolean
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }[]
      }
      get_profile_permissions: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_profile_with_contact: {
        Args: { access_reason?: string; profile_user_id: string }
        Returns: {
          first_name: string
          id: string
          institution: string
          is_approved: boolean
          last_name: string
          partner_organization: string
          phone: string
          research_field: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }[]
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_manuscript_role: {
        Args: {
          _role: Database["public"]["Enums"]["manuscript_platform_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_exhibition_visitors: {
        Args: { exhibition_uuid: string }
        Returns: undefined
      }
      insert_activity_log: {
        Args: {
          p_action: string
          p_details?: Json
          p_ip_address?: unknown
          p_resource_id?: string
          p_resource_type: string
          p_user_agent?: string
        }
        Returns: string
      }
      is_admin_or_librarian: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_manuscript_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_search: {
        Args: {
          p_filters?: Json
          p_query: string
          p_results_count?: number
          p_search_duration_ms?: number
        }
        Returns: string
      }
      perform_automatic_archiving: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      search_knowledge_base: {
        Args: {
          limit_results?: number
          search_language?: string
          search_query: string
        }
        Returns: {
          category: string
          content: string
          id: string
          relevance: number
          title: string
        }[]
      }
      search_manuscript_pages: {
        Args: {
          p_context_words?: number
          p_manuscript_id: string
          p_query: string
        }
        Returns: {
          matches: Json
          page_id: string
          page_number: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      should_content_be_archived: {
        Args: {
          content_row: Record<string, unknown>
          settings_row: Record<string, unknown>
        }
        Returns: boolean
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      update_wallet_balance: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_transaction_type: string
          p_wallet_id: string
        }
        Returns: string
      }
      user_has_permission: {
        Args: { permission_name: string; user_uuid: string }
        Returns: boolean
      }
      verify_backup_integrity: {
        Args: { backup_id: string }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "public" | "restricted" | "confidential"
      content_status: "draft" | "published" | "archived"
      content_type: "news" | "event" | "exhibition" | "page"
      deposit_status:
        | "brouillon"
        | "soumis"
        | "en_attente_validation_b"
        | "valide_par_b"
        | "rejete_par_b"
        | "en_cours"
        | "attribue"
        | "receptionne"
        | "rejete"
      manuscript_platform_role: "viewer" | "contributor" | "editor" | "admin"
      manuscript_status:
        | "available"
        | "reserved"
        | "maintenance"
        | "digitization"
      monograph_type:
        | "livres"
        | "beaux_livres"
        | "encyclopedies"
        | "corans"
        | "theses"
        | "ouvrages_scolaires"
        | "periodiques"
        | "musique"
      payment_method: "carte_bancaire" | "virement" | "especes" | "cheque"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "cancelled"
      professional_type: "editeur" | "producteur" | "imprimeur"
      reproduction_format: "pdf" | "jpeg" | "tiff" | "png"
      reproduction_modality:
        | "papier"
        | "numerique_mail"
        | "numerique_espace"
        | "support_physique"
      reproduction_status:
        | "brouillon"
        | "soumise"
        | "en_validation_service"
        | "validee_service"
        | "en_validation_responsable"
        | "approuvee"
        | "refusee"
        | "en_attente_paiement"
        | "paiement_recu"
        | "en_traitement"
        | "terminee"
        | "disponible"
        | "expiree"
      support_type: "imprime" | "electronique"
      transaction_type:
        | "reproduction"
        | "subscription"
        | "legal_deposit"
        | "service_bnrm"
        | "recharge_wallet"
      user_role:
        | "admin"
        | "librarian"
        | "researcher"
        | "visitor"
        | "public_user"
        | "subscriber"
        | "partner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level: ["public", "restricted", "confidential"],
      content_status: ["draft", "published", "archived"],
      content_type: ["news", "event", "exhibition", "page"],
      deposit_status: [
        "brouillon",
        "soumis",
        "en_attente_validation_b",
        "valide_par_b",
        "rejete_par_b",
        "en_cours",
        "attribue",
        "receptionne",
        "rejete",
      ],
      manuscript_platform_role: ["viewer", "contributor", "editor", "admin"],
      manuscript_status: [
        "available",
        "reserved",
        "maintenance",
        "digitization",
      ],
      monograph_type: [
        "livres",
        "beaux_livres",
        "encyclopedies",
        "corans",
        "theses",
        "ouvrages_scolaires",
        "periodiques",
        "musique",
      ],
      payment_method: ["carte_bancaire", "virement", "especes", "cheque"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      professional_type: ["editeur", "producteur", "imprimeur"],
      reproduction_format: ["pdf", "jpeg", "tiff", "png"],
      reproduction_modality: [
        "papier",
        "numerique_mail",
        "numerique_espace",
        "support_physique",
      ],
      reproduction_status: [
        "brouillon",
        "soumise",
        "en_validation_service",
        "validee_service",
        "en_validation_responsable",
        "approuvee",
        "refusee",
        "en_attente_paiement",
        "paiement_recu",
        "en_traitement",
        "terminee",
        "disponible",
        "expiree",
      ],
      support_type: ["imprime", "electronique"],
      transaction_type: [
        "reproduction",
        "subscription",
        "legal_deposit",
        "service_bnrm",
        "recharge_wallet",
      ],
      user_role: [
        "admin",
        "librarian",
        "researcher",
        "visitor",
        "public_user",
        "subscriber",
        "partner",
      ],
    },
  },
} as const
