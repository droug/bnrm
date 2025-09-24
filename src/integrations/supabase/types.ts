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
        ]
      }
      content: {
        Row: {
          author_id: string
          content_body: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          end_date: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          location: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          seo_keywords: string[] | null
          slug: string
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
          created_at?: string | null
          end_date?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          seo_keywords?: string[] | null
          slug: string
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
          created_at?: string | null
          end_date?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          seo_keywords?: string[] | null
          slug?: string
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
      manuscripts: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"] | null
          author: string | null
          category_id: string | null
          collection_id: string | null
          condition_notes: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          digital_copy_url: string | null
          dimensions: string | null
          id: string
          inventory_number: string | null
          language: string | null
          material: string | null
          period: string | null
          status: Database["public"]["Enums"]["manuscript_status"] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          author?: string | null
          category_id?: string | null
          collection_id?: string | null
          condition_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          digital_copy_url?: string | null
          dimensions?: string | null
          id?: string
          inventory_number?: string | null
          language?: string | null
          material?: string | null
          period?: string | null
          status?: Database["public"]["Enums"]["manuscript_status"] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          author?: string | null
          category_id?: string | null
          collection_id?: string | null
          condition_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          digital_copy_url?: string | null
          dimensions?: string | null
          id?: string
          inventory_number?: string | null
          language?: string | null
          material?: string | null
          period?: string | null
          status?: Database["public"]["Enums"]["manuscript_status"] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
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
      [_ in never]: never
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
      get_profile_permissions: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
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
      perform_automatic_archiving: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      should_content_be_archived: {
        Args: {
          content_row: Record<string, unknown>
          settings_row: Record<string, unknown>
        }
        Returns: boolean
      }
      user_has_permission: {
        Args: { permission_name: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "public" | "restricted" | "confidential"
      content_status: "draft" | "published" | "archived"
      content_type: "news" | "event" | "exhibition" | "page"
      manuscript_status:
        | "available"
        | "reserved"
        | "maintenance"
        | "digitization"
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
      manuscript_status: [
        "available",
        "reserved",
        "maintenance",
        "digitization",
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
