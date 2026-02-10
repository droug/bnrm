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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      activity_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          custom_dimensions: Json | null
          device_type: string | null
          event_action: string | null
          event_category: string | null
          event_label: string | null
          event_type: string
          event_value: number | null
          id: string
          language: string | null
          page_path: string
          page_title: string | null
          platform: string
          referrer: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          custom_dimensions?: Json | null
          device_type?: string | null
          event_action?: string | null
          event_category?: string | null
          event_label?: string | null
          event_type?: string
          event_value?: number | null
          id?: string
          language?: string | null
          page_path: string
          page_title?: string | null
          platform?: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          custom_dimensions?: Json | null
          device_type?: string | null
          event_action?: string | null
          event_category?: string | null
          event_label?: string | null
          event_type?: string
          event_value?: number | null
          id?: string
          language?: string | null
          page_path?: string
          page_title?: string | null
          platform?: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      autocomplete_list_values: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          level: number
          list_id: string
          metadata: Json | null
          parent_value_code: string | null
          sort_order: number | null
          value_code: string
          value_label: string
          value_label_ar: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          list_id: string
          metadata?: Json | null
          parent_value_code?: string | null
          sort_order?: number | null
          value_code: string
          value_label: string
          value_label_ar?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          list_id?: string
          metadata?: Json | null
          parent_value_code?: string | null
          sort_order?: number | null
          value_code?: string
          value_label?: string
          value_label_ar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autocomplete_list_values_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "autocomplete_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      autocomplete_lists: {
        Row: {
          created_at: string | null
          description: string | null
          form_name: string | null
          id: string
          is_active: boolean | null
          list_code: string
          list_name: string
          max_levels: number | null
          module: string | null
          platform: string | null
          portal: string | null
          service: string | null
          sub_service: string | null
          sync_hash: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          form_name?: string | null
          id?: string
          is_active?: boolean | null
          list_code: string
          list_name: string
          max_levels?: number | null
          module?: string | null
          platform?: string | null
          portal?: string | null
          service?: string | null
          sub_service?: string | null
          sync_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          form_name?: string | null
          id?: string
          is_active?: boolean | null
          list_code?: string
          list_name?: string
          max_levels?: number | null
          module?: string | null
          platform?: string | null
          portal?: string | null
          service?: string | null
          sub_service?: string | null
          sync_hash?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bnrm_categories_generales: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          libelle: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          libelle: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          libelle?: string
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
          is_free: boolean | null
          nom_service: string
          public_cible: string
          reference_legale: string
          updated_at: string | null
          usage_limit_per_year: number | null
        }
        Insert: {
          categorie: string
          created_at?: string | null
          description: string
          id_service: string
          is_free?: boolean | null
          nom_service: string
          public_cible: string
          reference_legale: string
          updated_at?: string | null
          usage_limit_per_year?: number | null
        }
        Update: {
          categorie?: string
          created_at?: string | null
          description?: string
          id_service?: string
          is_free?: boolean | null
          nom_service?: string
          public_cible?: string
          reference_legale?: string
          updated_at?: string | null
          usage_limit_per_year?: number | null
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
      booking_equipment: {
        Row: {
          booking_id: string
          created_at: string | null
          equipment_id: string
          id: string
          quantity: number | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          equipment_id: string
          id?: string
          quantity?: number | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          equipment_id?: string
          id?: string
          quantity?: number | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_equipment_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "space_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_services: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          quantity: number | null
          service_id: string
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          service_id: string
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          service_id?: string
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "space_services"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_workflow_history: {
        Row: {
          booking_id: string
          comment: string | null
          decision: string
          id: string
          processed_at: string | null
          processed_by: string | null
          step_code: string
          step_name: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          decision: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          step_code: string
          step_name: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          decision?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          step_code?: string
          step_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_workflow_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_workflow_steps: {
        Row: {
          assigned_role: string | null
          created_at: string | null
          description: string | null
          id: string
          step_code: string
          step_name: string
          step_order: number
        }
        Insert: {
          assigned_role?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          step_code: string
          step_name: string
          step_order: number
        }
        Update: {
          assigned_role?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          step_code?: string
          step_name?: string
          step_order?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          admin_notes: string | null
          authorization_document_url: string | null
          base_tariff_amount: number | null
          city: string | null
          contact_email: string
          contact_person: string
          contact_phone: string
          country: string | null
          created_at: string | null
          currency: string | null
          current_step_code: string | null
          current_step_order: number | null
          duration_type: string | null
          end_date: string
          equipment_total_amount: number | null
          event_description: string | null
          event_title: string
          has_accepted_conditions: boolean | null
          has_read_rules: boolean | null
          id: string
          justification_document_url: string | null
          organization_address: string | null
          organization_name: string
          organization_type: string
          participants_count: number
          program_document_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          services_total_amount: number | null
          space_id: string
          start_date: string
          status: string | null
          status_document_url: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          workflow_completed_at: string | null
          workflow_started_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          authorization_document_url?: string | null
          base_tariff_amount?: number | null
          city?: string | null
          contact_email: string
          contact_person: string
          contact_phone: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          current_step_code?: string | null
          current_step_order?: number | null
          duration_type?: string | null
          end_date: string
          equipment_total_amount?: number | null
          event_description?: string | null
          event_title: string
          has_accepted_conditions?: boolean | null
          has_read_rules?: boolean | null
          id?: string
          justification_document_url?: string | null
          organization_address?: string | null
          organization_name: string
          organization_type: string
          participants_count: number
          program_document_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          services_total_amount?: number | null
          space_id: string
          start_date: string
          status?: string | null
          status_document_url?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          workflow_completed_at?: string | null
          workflow_started_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          authorization_document_url?: string | null
          base_tariff_amount?: number | null
          city?: string | null
          contact_email?: string
          contact_person?: string
          contact_phone?: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          current_step_code?: string | null
          current_step_order?: number | null
          duration_type?: string | null
          end_date?: string
          equipment_total_amount?: number | null
          event_description?: string | null
          event_title?: string
          has_accepted_conditions?: boolean | null
          has_read_rules?: boolean | null
          id?: string
          justification_document_url?: string | null
          organization_address?: string | null
          organization_name?: string
          organization_type?: string
          participants_count?: number
          program_document_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          services_total_amount?: number | null
          space_id?: string
          start_date?: string
          status?: string | null
          status_document_url?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          workflow_completed_at?: string | null
          workflow_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "cultural_spaces"
            referencedColumns: ["id"]
          },
        ]
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
      cbm_adhesions: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          library_name: string
          library_type: string
          motivation: string | null
          phone: string | null
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          library_name: string
          library_type: string
          motivation?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          library_name?: string
          library_type?: string
          motivation?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cbm_adhesions_catalogue: {
        Row: {
          adresse: string | null
          created_at: string
          directeur: string
          email: string
          engagement_charte: boolean
          engagement_partage_donnees: boolean
          id: string
          motif_refus: string | null
          nom_bibliotheque: string
          nombre_documents: number
          normes_catalogage: string | null
          referent_technique: string
          region: string
          responsable_catalogage: string
          sigb: string
          statut: string | null
          telephone: string
          tutelle: string | null
          type_bibliotheque: string
          updated_at: string
          url_catalogue: string | null
          url_maps: string | null
          user_id: string | null
          ville: string
          volumetrie: Json | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          directeur: string
          email: string
          engagement_charte?: boolean
          engagement_partage_donnees?: boolean
          id?: string
          motif_refus?: string | null
          nom_bibliotheque: string
          nombre_documents: number
          normes_catalogage?: string | null
          referent_technique: string
          region: string
          responsable_catalogage: string
          sigb: string
          statut?: string | null
          telephone: string
          tutelle?: string | null
          type_bibliotheque: string
          updated_at?: string
          url_catalogue?: string | null
          url_maps?: string | null
          user_id?: string | null
          ville: string
          volumetrie?: Json | null
        }
        Update: {
          adresse?: string | null
          created_at?: string
          directeur?: string
          email?: string
          engagement_charte?: boolean
          engagement_partage_donnees?: boolean
          id?: string
          motif_refus?: string | null
          nom_bibliotheque?: string
          nombre_documents?: number
          normes_catalogage?: string | null
          referent_technique?: string
          region?: string
          responsable_catalogage?: string
          sigb?: string
          statut?: string | null
          telephone?: string
          tutelle?: string | null
          type_bibliotheque?: string
          updated_at?: string
          url_catalogue?: string | null
          url_maps?: string | null
          user_id?: string | null
          ville?: string
          volumetrie?: Json | null
        }
        Relationships: []
      }
      cbm_adhesions_reseau: {
        Row: {
          adresse: string | null
          created_at: string
          directeur: string
          email: string
          en_cours_informatisation: string
          engagement_charte: boolean
          engagement_partage_donnees: boolean
          id: string
          motif_refus: string | null
          moyens_recensement: string
          nom_bibliotheque: string
          nombre_documents: number
          referent_technique: string
          region: string
          responsable_catalogage: string
          statut: string | null
          telephone: string
          tutelle: string | null
          type_bibliotheque: string
          updated_at: string
          url_catalogue: string | null
          url_maps: string | null
          user_id: string | null
          ville: string
          volumetrie: Json | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          directeur: string
          email: string
          en_cours_informatisation: string
          engagement_charte?: boolean
          engagement_partage_donnees?: boolean
          id?: string
          motif_refus?: string | null
          moyens_recensement: string
          nom_bibliotheque: string
          nombre_documents: number
          referent_technique: string
          region: string
          responsable_catalogage: string
          statut?: string | null
          telephone: string
          tutelle?: string | null
          type_bibliotheque: string
          updated_at?: string
          url_catalogue?: string | null
          url_maps?: string | null
          user_id?: string | null
          ville: string
          volumetrie?: Json | null
        }
        Update: {
          adresse?: string | null
          created_at?: string
          directeur?: string
          email?: string
          en_cours_informatisation?: string
          engagement_charte?: boolean
          engagement_partage_donnees?: boolean
          id?: string
          motif_refus?: string | null
          moyens_recensement?: string
          nom_bibliotheque?: string
          nombre_documents?: number
          referent_technique?: string
          region?: string
          responsable_catalogage?: string
          statut?: string | null
          telephone?: string
          tutelle?: string | null
          type_bibliotheque?: string
          updated_at?: string
          url_catalogue?: string | null
          url_maps?: string | null
          user_id?: string | null
          ville?: string
          volumetrie?: Json | null
        }
        Relationships: []
      }
      cbm_catalog: {
        Row: {
          author: string | null
          author_ar: string | null
          availability_status: string | null
          cbm_record_id: string
          cbn_document_id: string | null
          created_at: string | null
          deleted_at: string | null
          dewey_classification: string | null
          document_type: string | null
          id: string
          isbn: string | null
          last_sync_date: string | null
          library_code: string
          library_name: string
          metadata_source: string | null
          publication_year: number | null
          publisher: string | null
          shelf_location: string | null
          source_library: string
          subject_headings: string[] | null
          title: string
          title_ar: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          author_ar?: string | null
          availability_status?: string | null
          cbm_record_id: string
          cbn_document_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          dewey_classification?: string | null
          document_type?: string | null
          id?: string
          isbn?: string | null
          last_sync_date?: string | null
          library_code: string
          library_name: string
          metadata_source?: string | null
          publication_year?: number | null
          publisher?: string | null
          shelf_location?: string | null
          source_library: string
          subject_headings?: string[] | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          author_ar?: string | null
          availability_status?: string | null
          cbm_record_id?: string
          cbn_document_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          dewey_classification?: string | null
          document_type?: string | null
          id?: string
          isbn?: string | null
          last_sync_date?: string | null
          library_code?: string
          library_name?: string
          metadata_source?: string | null
          publication_year?: number | null
          publisher?: string | null
          shelf_location?: string | null
          source_library?: string
          subject_headings?: string[] | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cbm_catalog_cbn_document"
            columns: ["cbn_document_id"]
            isOneToOne: false
            referencedRelation: "cbn_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cbm_demandes_formation: {
        Row: {
          besoins_specifiques: string | null
          created_at: string
          email: string
          fichier_participants_path: string | null
          fonction_contact: string
          id: string
          nom_contact: string
          nom_organisme: string
          nombre_participants: number
          statut: string
          telephone: string
          type_formation: string
          type_organisme: string
          updated_at: string
        }
        Insert: {
          besoins_specifiques?: string | null
          created_at?: string
          email: string
          fichier_participants_path?: string | null
          fonction_contact: string
          id?: string
          nom_contact: string
          nom_organisme: string
          nombre_participants: number
          statut?: string
          telephone: string
          type_formation: string
          type_organisme: string
          updated_at?: string
        }
        Update: {
          besoins_specifiques?: string | null
          created_at?: string
          email?: string
          fichier_participants_path?: string | null
          fonction_contact?: string
          id?: string
          nom_contact?: string
          nom_organisme?: string
          nombre_participants?: number
          statut?: string
          telephone?: string
          type_formation?: string
          type_organisme?: string
          updated_at?: string
        }
        Relationships: []
      }
      cbm_formation_requests: {
        Row: {
          created_at: string
          id: string
          library_name: string
          number_of_participants: number | null
          preferred_dates: string | null
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          specific_needs: string | null
          status: string
          training_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          library_name: string
          number_of_participants?: number | null
          preferred_dates?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          specific_needs?: string | null
          status?: string
          training_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          library_name?: string
          number_of_participants?: number | null
          preferred_dates?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          specific_needs?: string | null
          status?: string
          training_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cbn_catalog_documents: {
        Row: {
          allow_physical_consultation: boolean | null
          author: string
          collection: string | null
          cote: string
          created_at: string | null
          description: string | null
          digital_link: string | null
          id: string
          internal_id: string | null
          is_free_access: boolean
          isbn: string | null
          issn: string | null
          keywords: string[] | null
          language: string | null
          notice_origin: string | null
          pages: number | null
          physical_description: string | null
          publish_place: string | null
          publisher: string
          secondary_authors: string[] | null
          summary: string | null
          support_status: string
          support_type: string
          table_of_contents: string[] | null
          title: string
          title_ar: string | null
          updated_at: string | null
          year: string
        }
        Insert: {
          allow_physical_consultation?: boolean | null
          author: string
          collection?: string | null
          cote: string
          created_at?: string | null
          description?: string | null
          digital_link?: string | null
          id: string
          internal_id?: string | null
          is_free_access?: boolean
          isbn?: string | null
          issn?: string | null
          keywords?: string[] | null
          language?: string | null
          notice_origin?: string | null
          pages?: number | null
          physical_description?: string | null
          publish_place?: string | null
          publisher: string
          secondary_authors?: string[] | null
          summary?: string | null
          support_status: string
          support_type: string
          table_of_contents?: string[] | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          year: string
        }
        Update: {
          allow_physical_consultation?: boolean | null
          author?: string
          collection?: string | null
          cote?: string
          created_at?: string | null
          description?: string | null
          digital_link?: string | null
          id?: string
          internal_id?: string | null
          is_free_access?: boolean
          isbn?: string | null
          issn?: string | null
          keywords?: string[] | null
          language?: string | null
          notice_origin?: string | null
          pages?: number | null
          physical_description?: string | null
          publish_place?: string | null
          publisher?: string
          secondary_authors?: string[] | null
          summary?: string | null
          support_status?: string
          support_type?: string
          table_of_contents?: string[] | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          year?: string
        }
        Relationships: []
      }
      cbn_documents: {
        Row: {
          access_level: string | null
          author: string | null
          author_ar: string | null
          cbm_catalog_id: string | null
          collection_name: string | null
          consultation_mode: string | null
          cote: string
          created_at: string | null
          deleted_at: string | null
          depositor_id: string | null
          dewey_classification: string | null
          digital_library_document_id: string | null
          dimensions: string | null
          document_type: string
          edition: string | null
          id: string
          internal_notes: string | null
          is_digitized: boolean | null
          isbn: string | null
          issn: string | null
          keywords: string[] | null
          location: string | null
          notes: string | null
          pages_count: number | null
          physical_description: string | null
          physical_status: string | null
          publication_place: string | null
          publication_year: number | null
          publisher: string | null
          secondary_authors: string[] | null
          shelf_location: string | null
          subject_headings: string[] | null
          subtitle: string | null
          subtitle_ar: string | null
          support_type: string | null
          title: string
          title_ar: string | null
          unimarc_record_id: string | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          author?: string | null
          author_ar?: string | null
          cbm_catalog_id?: string | null
          collection_name?: string | null
          consultation_mode?: string | null
          cote: string
          created_at?: string | null
          deleted_at?: string | null
          depositor_id?: string | null
          dewey_classification?: string | null
          digital_library_document_id?: string | null
          dimensions?: string | null
          document_type: string
          edition?: string | null
          id?: string
          internal_notes?: string | null
          is_digitized?: boolean | null
          isbn?: string | null
          issn?: string | null
          keywords?: string[] | null
          location?: string | null
          notes?: string | null
          pages_count?: number | null
          physical_description?: string | null
          physical_status?: string | null
          publication_place?: string | null
          publication_year?: number | null
          publisher?: string | null
          secondary_authors?: string[] | null
          shelf_location?: string | null
          subject_headings?: string[] | null
          subtitle?: string | null
          subtitle_ar?: string | null
          support_type?: string | null
          title: string
          title_ar?: string | null
          unimarc_record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          author?: string | null
          author_ar?: string | null
          cbm_catalog_id?: string | null
          collection_name?: string | null
          consultation_mode?: string | null
          cote?: string
          created_at?: string | null
          deleted_at?: string | null
          depositor_id?: string | null
          dewey_classification?: string | null
          digital_library_document_id?: string | null
          dimensions?: string | null
          document_type?: string
          edition?: string | null
          id?: string
          internal_notes?: string | null
          is_digitized?: boolean | null
          isbn?: string | null
          issn?: string | null
          keywords?: string[] | null
          location?: string | null
          notes?: string | null
          pages_count?: number | null
          physical_description?: string | null
          physical_status?: string | null
          publication_place?: string | null
          publication_year?: number | null
          publisher?: string | null
          secondary_authors?: string[] | null
          shelf_location?: string | null
          subject_headings?: string[] | null
          subtitle?: string | null
          subtitle_ar?: string | null
          support_type?: string | null
          title?: string
          title_ar?: string | null
          unimarc_record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cbn_documents_cbm_catalog"
            columns: ["cbm_catalog_id"]
            isOneToOne: false
            referencedRelation: "cbm_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cbn_documents_digital_library"
            columns: ["digital_library_document_id"]
            isOneToOne: false
            referencedRelation: "digital_library_documents"
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
      cms_actualites: {
        Row: {
          body_ar: string | null
          body_fr: string | null
          category: string | null
          chapo_ar: string | null
          chapo_fr: string | null
          created_at: string | null
          created_by: string | null
          date_publication: string | null
          id: string
          image_alt_ar: string | null
          image_alt_fr: string | null
          image_url: string | null
          published_at: string | null
          published_by: string | null
          seo_description_ar: string | null
          seo_description_fr: string | null
          seo_title_ar: string | null
          seo_title_fr: string | null
          slug: string
          status: string
          tags: string[] | null
          title_ar: string | null
          title_fr: string
          updated_at: string | null
          updated_by: string | null
          view_count: number | null
          workflow_comments: Json | null
        }
        Insert: {
          body_ar?: string | null
          body_fr?: string | null
          category?: string | null
          chapo_ar?: string | null
          chapo_fr?: string | null
          created_at?: string | null
          created_by?: string | null
          date_publication?: string | null
          id?: string
          image_alt_ar?: string | null
          image_alt_fr?: string | null
          image_url?: string | null
          published_at?: string | null
          published_by?: string | null
          seo_description_ar?: string | null
          seo_description_fr?: string | null
          seo_title_ar?: string | null
          seo_title_fr?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title_ar?: string | null
          title_fr: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
          workflow_comments?: Json | null
        }
        Update: {
          body_ar?: string | null
          body_fr?: string | null
          category?: string | null
          chapo_ar?: string | null
          chapo_fr?: string | null
          created_at?: string | null
          created_by?: string | null
          date_publication?: string | null
          id?: string
          image_alt_ar?: string | null
          image_alt_fr?: string | null
          image_url?: string | null
          published_at?: string | null
          published_by?: string | null
          seo_description_ar?: string | null
          seo_description_fr?: string | null
          seo_title_ar?: string | null
          seo_title_fr?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title_ar?: string | null
          title_fr?: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
          workflow_comments?: Json | null
        }
        Relationships: []
      }
      cms_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      cms_bannieres: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          image_alt_ar: string | null
          image_alt_fr: string | null
          image_url: string
          is_active: boolean | null
          link_label_ar: string | null
          link_label_fr: string | null
          link_url: string | null
          position: string | null
          priority: number | null
          start_date: string | null
          status: string
          text_ar: string | null
          text_fr: string | null
          title_ar: string | null
          title_fr: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          image_alt_ar?: string | null
          image_alt_fr?: string | null
          image_url: string
          is_active?: boolean | null
          link_label_ar?: string | null
          link_label_fr?: string | null
          link_url?: string | null
          position?: string | null
          priority?: number | null
          start_date?: string | null
          status?: string
          text_ar?: string | null
          text_fr?: string | null
          title_ar?: string | null
          title_fr?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          image_alt_ar?: string | null
          image_alt_fr?: string | null
          image_url?: string
          is_active?: boolean | null
          link_label_ar?: string | null
          link_label_fr?: string | null
          link_url?: string | null
          position?: string | null
          priority?: number | null
          start_date?: string | null
          status?: string
          text_ar?: string | null
          text_fr?: string | null
          title_ar?: string | null
          title_fr?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cms_digital_services: {
        Row: {
          category_ar: string | null
          category_fr: string | null
          created_at: string
          description_ar: string | null
          description_fr: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          sort_order: number
          title_ar: string | null
          title_fr: string
          updated_at: string
        }
        Insert: {
          category_ar?: string | null
          category_fr?: string | null
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          title_ar?: string | null
          title_fr: string
          updated_at?: string
        }
        Update: {
          category_ar?: string | null
          category_fr?: string | null
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          title_ar?: string | null
          title_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_evenements: {
        Row: {
          affiche_alt_ar: string | null
          affiche_alt_fr: string | null
          affiche_url: string | null
          created_at: string | null
          created_by: string | null
          cta_label_ar: string | null
          cta_label_fr: string | null
          cta_url: string | null
          date_debut: string
          date_fin: string
          description_ar: string | null
          description_fr: string | null
          event_type: string | null
          id: string
          lieu_ar: string | null
          lieu_fr: string | null
          published_at: string | null
          published_by: string | null
          slug: string
          status: string
          tags: string[] | null
          title_ar: string | null
          title_fr: string
          updated_at: string | null
          updated_by: string | null
          workflow_comments: Json | null
        }
        Insert: {
          affiche_alt_ar?: string | null
          affiche_alt_fr?: string | null
          affiche_url?: string | null
          created_at?: string | null
          created_by?: string | null
          cta_label_ar?: string | null
          cta_label_fr?: string | null
          cta_url?: string | null
          date_debut: string
          date_fin: string
          description_ar?: string | null
          description_fr?: string | null
          event_type?: string | null
          id?: string
          lieu_ar?: string | null
          lieu_fr?: string | null
          published_at?: string | null
          published_by?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title_ar?: string | null
          title_fr: string
          updated_at?: string | null
          updated_by?: string | null
          workflow_comments?: Json | null
        }
        Update: {
          affiche_alt_ar?: string | null
          affiche_alt_fr?: string | null
          affiche_url?: string | null
          created_at?: string | null
          created_by?: string | null
          cta_label_ar?: string | null
          cta_label_fr?: string | null
          cta_url?: string | null
          date_debut?: string
          date_fin?: string
          description_ar?: string | null
          description_fr?: string | null
          event_type?: string | null
          id?: string
          lieu_ar?: string | null
          lieu_fr?: string | null
          published_at?: string | null
          published_by?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title_ar?: string | null
          title_fr?: string
          updated_at?: string | null
          updated_by?: string | null
          workflow_comments?: Json | null
        }
        Relationships: []
      }
      cms_footer: {
        Row: {
          columns: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          legal_text_ar: string | null
          legal_text_fr: string | null
          logos: Json | null
          social_links: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          legal_text_ar?: string | null
          legal_text_fr?: string | null
          logos?: Json | null
          social_links?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          legal_text_ar?: string | null
          legal_text_fr?: string | null
          logos?: Json | null
          social_links?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_hero_settings: {
        Row: {
          created_at: string
          hero_cta_label_ar: string | null
          hero_cta_label_fr: string | null
          hero_cta_url: string | null
          hero_image_url: string | null
          hero_secondary_cta_label_ar: string | null
          hero_secondary_cta_label_fr: string | null
          hero_secondary_cta_url: string | null
          hero_subtitle_ar: string | null
          hero_subtitle_fr: string | null
          hero_title_ar: string | null
          hero_title_fr: string | null
          id: string
          platform: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_cta_label_ar?: string | null
          hero_cta_label_fr?: string | null
          hero_cta_url?: string | null
          hero_image_url?: string | null
          hero_secondary_cta_label_ar?: string | null
          hero_secondary_cta_label_fr?: string | null
          hero_secondary_cta_url?: string | null
          hero_subtitle_ar?: string | null
          hero_subtitle_fr?: string | null
          hero_title_ar?: string | null
          hero_title_fr?: string | null
          id?: string
          platform?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_cta_label_ar?: string | null
          hero_cta_label_fr?: string | null
          hero_cta_url?: string | null
          hero_image_url?: string | null
          hero_secondary_cta_label_ar?: string | null
          hero_secondary_cta_label_fr?: string | null
          hero_secondary_cta_url?: string | null
          hero_subtitle_ar?: string | null
          hero_subtitle_fr?: string | null
          hero_title_ar?: string | null
          hero_title_fr?: string | null
          id?: string
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_media: {
        Row: {
          alt_ar: string | null
          alt_fr: string | null
          copyright: string | null
          created_at: string | null
          description_ar: string | null
          description_fr: string | null
          file_name: string
          file_size_kb: number | null
          file_type: string
          file_url: string
          folder: string | null
          height: number | null
          id: string
          licence: string | null
          tags: string[] | null
          title_ar: string | null
          title_fr: string | null
          updated_at: string | null
          uploaded_by: string | null
          variants: Json | null
          width: number | null
        }
        Insert: {
          alt_ar?: string | null
          alt_fr?: string | null
          copyright?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_fr?: string | null
          file_name: string
          file_size_kb?: number | null
          file_type: string
          file_url: string
          folder?: string | null
          height?: number | null
          id?: string
          licence?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_fr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          variants?: Json | null
          width?: number | null
        }
        Update: {
          alt_ar?: string | null
          alt_fr?: string | null
          copyright?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_fr?: string | null
          file_name?: string
          file_size_kb?: number | null
          file_type?: string
          file_url?: string
          folder?: string | null
          height?: number | null
          id?: string
          licence?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_fr?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          variants?: Json | null
          width?: number | null
        }
        Relationships: []
      }
      cms_mediatheque_videos: {
        Row: {
          created_at: string
          description_ar: string | null
          description_fr: string | null
          id: string
          is_active: boolean
          sort_order: number
          thumbnail_url: string | null
          title_ar: string | null
          title_fr: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title_ar?: string | null
          title_fr: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_fr?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title_ar?: string | null
          title_fr?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: []
      }
      cms_menus: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          items: Json | null
          menu_code: string
          menu_name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json | null
          menu_code: string
          menu_name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json | null
          menu_code?: string
          menu_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          published_at: string | null
          published_by: string | null
          seo_canonical: string | null
          seo_description_ar: string | null
          seo_description_fr: string | null
          seo_keywords_ar: string[] | null
          seo_keywords_fr: string[] | null
          seo_title_ar: string | null
          seo_title_fr: string | null
          slug: string
          status: string
          title_ar: string | null
          title_fr: string
          updated_at: string | null
          updated_by: string | null
          workflow_comments: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          seo_canonical?: string | null
          seo_description_ar?: string | null
          seo_description_fr?: string | null
          seo_keywords_ar?: string[] | null
          seo_keywords_fr?: string[] | null
          seo_title_ar?: string | null
          seo_title_fr?: string | null
          slug: string
          status?: string
          title_ar?: string | null
          title_fr: string
          updated_at?: string | null
          updated_by?: string | null
          workflow_comments?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          seo_canonical?: string | null
          seo_description_ar?: string | null
          seo_description_fr?: string | null
          seo_keywords_ar?: string[] | null
          seo_keywords_fr?: string[] | null
          seo_title_ar?: string | null
          seo_title_fr?: string | null
          slug?: string
          status?: string
          title_ar?: string | null
          title_fr?: string
          updated_at?: string | null
          updated_by?: string | null
          workflow_comments?: Json | null
        }
        Relationships: []
      }
      cms_portal_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      cms_sections: {
        Row: {
          content_ar: string | null
          content_fr: string | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          order_index: number
          page_id: string | null
          props: Json | null
          section_type: string
          title_ar: string | null
          title_fr: string | null
          updated_at: string | null
        }
        Insert: {
          content_ar?: string | null
          content_fr?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          order_index?: number
          page_id?: string | null
          props?: Json | null
          section_type: string
          title_ar?: string | null
          title_fr?: string | null
          updated_at?: string | null
        }
        Update: {
          content_ar?: string | null
          content_fr?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          order_index?: number
          page_id?: string | null
          props?: Json | null
          section_type?: string
          title_ar?: string | null
          title_fr?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_visual_resources: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_fr: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_active: boolean | null
          name: string
          name_ar: string | null
          tags: string[] | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_fr?: string | null
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          is_active?: boolean | null
          name: string
          name_ar?: string | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_fr?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      cms_webhook_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          response_body: string | null
          response_code: number | null
          status: string | null
          triggered_at: string | null
          webhook_id: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_code?: number | null
          status?: string | null
          triggered_at?: string | null
          webhook_id?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_code?: number | null
          status?: string | null
          triggered_at?: string | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "cms_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_webhooks: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          success_count: number | null
          trigger_events: string[] | null
          updated_at: string | null
          webhook_name: string
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          success_count?: number | null
          trigger_events?: string[] | null
          updated_at?: string | null
          webhook_name: string
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          success_count?: number | null
          trigger_events?: string[] | null
          updated_at?: string | null
          webhook_name?: string
          webhook_url?: string
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
      configurable_forms: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_version: number | null
          form_key: string
          form_name: string
          id: string
          module: string
          platform: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_version?: number | null
          form_key: string
          form_name: string
          id?: string
          module: string
          platform: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_version?: number | null
          form_key?: string
          form_name?: string
          id?: string
          module?: string
          platform?: string
          updated_at?: string | null
        }
        Relationships: []
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
          page_count: number | null
          pages_path: string | null
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
          page_count?: number | null
          pages_path?: string | null
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
          page_count?: number | null
          pages_path?: string | null
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
      conversation_participants: {
        Row: {
          conversation_id: string | null
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          last_message_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          conversation_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          conversation_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cookie_consents: {
        Row: {
          analytics_consent: boolean
          consent_date: string
          created_at: string
          functional_consent: boolean
          id: string
          ip_address: string | null
          marketing_consent: boolean
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          analytics_consent?: boolean
          consent_date?: string
          created_at?: string
          functional_consent?: boolean
          id?: string
          ip_address?: string | null
          marketing_consent?: boolean
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          analytics_consent?: boolean
          consent_date?: string
          created_at?: string
          functional_consent?: boolean
          id?: string
          ip_address?: string | null
          marketing_consent?: boolean
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cookie_settings: {
        Row: {
          accept_button_text: string
          cookie_policy_url: string | null
          created_at: string
          enabled: boolean
          id: string
          message: string
          position: string
          privacy_policy_url: string | null
          reject_button_text: string
          settings_button_text: string
          show_settings_button: boolean
          theme: string
          title: string
          updated_at: string
        }
        Insert: {
          accept_button_text?: string
          cookie_policy_url?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          message?: string
          position?: string
          privacy_policy_url?: string | null
          reject_button_text?: string
          settings_button_text?: string
          show_settings_button?: boolean
          theme?: string
          title?: string
          updated_at?: string
        }
        Update: {
          accept_button_text?: string
          cookie_policy_url?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          message?: string
          position?: string
          privacy_policy_url?: string | null
          reject_button_text?: string
          settings_button_text?: string
          show_settings_button?: boolean
          theme?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cote_collections: {
        Row: {
          code: string
          commentaire: string | null
          created_at: string | null
          id: string
          nom_arabe: string
          nom_francais: string
          type_collection: string
          updated_at: string | null
        }
        Insert: {
          code: string
          commentaire?: string | null
          created_at?: string | null
          id?: string
          nom_arabe: string
          nom_francais: string
          type_collection: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          commentaire?: string | null
          created_at?: string | null
          id?: string
          nom_arabe?: string
          nom_francais?: string
          type_collection?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cote_nomenclatures: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          modele_codification: string
          module_concerne: string
          prefixe: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          modele_codification: string
          module_concerne: string
          prefixe: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          modele_codification?: string
          module_concerne?: string
          prefixe?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cote_villes: {
        Row: {
          abreviation: string
          created_at: string | null
          id: string
          nom_arabe: string
          nom_francais: string
          updated_at: string | null
        }
        Insert: {
          abreviation: string
          created_at?: string | null
          id?: string
          nom_arabe: string
          nom_francais: string
          updated_at?: string | null
        }
        Update: {
          abreviation?: string
          created_at?: string | null
          id?: string
          nom_arabe?: string
          nom_francais?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cultural_activity_tariffs: {
        Row: {
          amount_ht: number
          amount_ttc: number | null
          applies_to_private: boolean | null
          applies_to_public: boolean | null
          calculation_base: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          space_type: string | null
          tariff_name: string
          tva_rate: number
          updated_at: string | null
        }
        Insert: {
          amount_ht?: number
          amount_ttc?: number | null
          applies_to_private?: boolean | null
          applies_to_public?: boolean | null
          calculation_base: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          space_type?: string | null
          tariff_name: string
          tva_rate?: number
          updated_at?: string | null
        }
        Update: {
          amount_ht?: number
          amount_ttc?: number | null
          applies_to_private?: boolean | null
          applies_to_public?: boolean | null
          calculation_base?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          space_type?: string | null
          tariff_name?: string
          tva_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      cultural_program_proposals: {
        Row: {
          activity_type: string
          budget_estimate: number | null
          committee_comments: string | null
          committee_signature: string | null
          created_at: string
          description: string | null
          duration_hours: number | null
          equipment_needs: string | null
          expected_attendees: number | null
          id: string
          proposal_number: string
          proposed_date: string
          proposed_time: string | null
          requester_email: string
          requester_id: string
          requester_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          signed_at: string | null
          signed_by: string | null
          space_requirements: string | null
          status: string
          title: string
          updated_at: string
          validation_notes: string | null
        }
        Insert: {
          activity_type: string
          budget_estimate?: number | null
          committee_comments?: string | null
          committee_signature?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          equipment_needs?: string | null
          expected_attendees?: number | null
          id?: string
          proposal_number: string
          proposed_date: string
          proposed_time?: string | null
          requester_email: string
          requester_id: string
          requester_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          signed_at?: string | null
          signed_by?: string | null
          space_requirements?: string | null
          status?: string
          title: string
          updated_at?: string
          validation_notes?: string | null
        }
        Update: {
          activity_type?: string
          budget_estimate?: number | null
          committee_comments?: string | null
          committee_signature?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          equipment_needs?: string | null
          expected_attendees?: number | null
          id?: string
          proposal_number?: string
          proposed_date?: string
          proposed_time?: string | null
          requester_email?: string
          requester_id?: string
          requester_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          signed_at?: string | null
          signed_by?: string | null
          space_requirements?: string | null
          status?: string
          title?: string
          updated_at?: string
          validation_notes?: string | null
        }
        Relationships: []
      }
      cultural_spaces: {
        Row: {
          allows_half_day: boolean | null
          capacity: number
          cleaning_charge: number | null
          created_at: string | null
          description: string | null
          electricity_charge: number | null
          floor_level: string | null
          gallery_images: Json | null
          has_lighting: boolean | null
          has_projection: boolean | null
          has_sound_system: boolean | null
          has_stage: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          space_type: string | null
          surface_m2: number | null
          tariff_private_full_day: number | null
          tariff_private_half_day: number | null
          tariff_public_full_day: number | null
          tariff_public_half_day: number | null
          updated_at: string | null
        }
        Insert: {
          allows_half_day?: boolean | null
          capacity: number
          cleaning_charge?: number | null
          created_at?: string | null
          description?: string | null
          electricity_charge?: number | null
          floor_level?: string | null
          gallery_images?: Json | null
          has_lighting?: boolean | null
          has_projection?: boolean | null
          has_sound_system?: boolean | null
          has_stage?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          space_type?: string | null
          surface_m2?: number | null
          tariff_private_full_day?: number | null
          tariff_private_half_day?: number | null
          tariff_public_full_day?: number | null
          tariff_public_half_day?: number | null
          updated_at?: string | null
        }
        Update: {
          allows_half_day?: boolean | null
          capacity?: number
          cleaning_charge?: number | null
          created_at?: string | null
          description?: string | null
          electricity_charge?: number | null
          floor_level?: string | null
          gallery_images?: Json | null
          has_lighting?: boolean | null
          has_projection?: boolean | null
          has_sound_system?: boolean | null
          has_stage?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          space_type?: string | null
          surface_m2?: number | null
          tariff_private_full_day?: number | null
          tariff_private_half_day?: number | null
          tariff_public_full_day?: number | null
          tariff_public_half_day?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_fields: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          default_value: string | null
          deleted_at: string | null
          deleted_by: string | null
          description_ar: string | null
          description_fr: string | null
          field_key: string
          field_type: string
          form_version_id: string
          id: string
          insert_after: string | null
          is_readonly: boolean | null
          is_required: boolean | null
          is_visible: boolean | null
          label_ar: string | null
          label_fr: string
          order_index: number
          section_key: string
          updated_at: string | null
          validation_rules: Json | null
          visibility_conditions: Json | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_fr?: string | null
          field_key: string
          field_type: string
          form_version_id: string
          id?: string
          insert_after?: string | null
          is_readonly?: boolean | null
          is_required?: boolean | null
          is_visible?: boolean | null
          label_ar?: string | null
          label_fr: string
          order_index: number
          section_key: string
          updated_at?: string | null
          validation_rules?: Json | null
          visibility_conditions?: Json | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_fr?: string | null
          field_key?: string
          field_type?: string
          form_version_id?: string
          id?: string
          insert_after?: string | null
          is_readonly?: boolean | null
          is_required?: boolean | null
          is_visible?: boolean | null
          label_ar?: string | null
          label_fr?: string
          order_index?: number
          section_key?: string
          updated_at?: string | null
          validation_rules?: Json | null
          visibility_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_form_version_id_fkey"
            columns: ["form_version_id"]
            isOneToOne: false
            referencedRelation: "form_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_pass_usage: {
        Row: {
          created_at: string
          id: string
          service_id: string
          usage_date: string
          usage_year: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          usage_date?: string
          usage_year?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          usage_date?: string
          usage_year?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_pass_usage_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "bnrm_services"
            referencedColumns: ["id_service"]
          },
        ]
      }
      deposit_activity_log: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
            referencedRelation: "kitab_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_activity_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_deposit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_confirmation_tokens: {
        Row: {
          confirmed_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          ip_address: unknown
          party_type: string
          rejected_at: string | null
          rejection_reason: string | null
          request_id: string
          status: Database["public"]["Enums"]["confirmation_status"]
          token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          party_type: string
          rejected_at?: string | null
          rejection_reason?: string | null
          request_id: string
          status?: Database["public"]["Enums"]["confirmation_status"]
          token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          party_type?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["confirmation_status"]
          token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_confirmation_tokens_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "kitab_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_confirmation_tokens_request_id_fkey"
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
            referencedRelation: "kitab_publications"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "kitab_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_workflow_steps_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_deposit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_library_access_restrictions: {
        Row: {
          access_level: string
          allow_download: boolean | null
          allow_embed: boolean | null
          allow_full_consultation: boolean | null
          allow_sharing: boolean | null
          allowed_pages: number[] | null
          block_print: boolean | null
          block_right_click: boolean | null
          block_screenshot: boolean | null
          consultation_percentage: number | null
          copyright_expires_at: string | null
          copyright_holder: string | null
          copyright_status: string | null
          created_at: string | null
          created_by: string | null
          document_id: string
          document_source: string
          download_format: string[] | null
          download_watermark: boolean | null
          id: string
          license_type: string | null
          license_url: string | null
          required_subscription_type: string | null
          requires_subscription: boolean | null
          restriction_message_ar: string | null
          restriction_message_fr: string | null
          subscription_message: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          access_level?: string
          allow_download?: boolean | null
          allow_embed?: boolean | null
          allow_full_consultation?: boolean | null
          allow_sharing?: boolean | null
          allowed_pages?: number[] | null
          block_print?: boolean | null
          block_right_click?: boolean | null
          block_screenshot?: boolean | null
          consultation_percentage?: number | null
          copyright_expires_at?: string | null
          copyright_holder?: string | null
          copyright_status?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id: string
          document_source?: string
          download_format?: string[] | null
          download_watermark?: boolean | null
          id?: string
          license_type?: string | null
          license_url?: string | null
          required_subscription_type?: string | null
          requires_subscription?: boolean | null
          restriction_message_ar?: string | null
          restriction_message_fr?: string | null
          subscription_message?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          access_level?: string
          allow_download?: boolean | null
          allow_embed?: boolean | null
          allow_full_consultation?: boolean | null
          allow_sharing?: boolean | null
          allowed_pages?: number[] | null
          block_print?: boolean | null
          block_right_click?: boolean | null
          block_screenshot?: boolean | null
          consultation_percentage?: number | null
          copyright_expires_at?: string | null
          copyright_holder?: string | null
          copyright_status?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          document_source?: string
          download_format?: string[] | null
          download_watermark?: boolean | null
          id?: string
          license_type?: string | null
          license_url?: string | null
          required_subscription_type?: string | null
          requires_subscription?: boolean | null
          restriction_message_ar?: string | null
          restriction_message_fr?: string | null
          subscription_message?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      digital_library_documents: {
        Row: {
          access_level: string | null
          author: string | null
          cbn_document_id: string
          cover_image_url: string | null
          created_at: string | null
          deleted_at: string | null
          digital_collections: string[] | null
          digitization_date: string | null
          digitization_quality: string | null
          digitization_source: string | null
          document_type: string | null
          download_enabled: boolean | null
          downloads_count: number | null
          file_format: string | null
          file_size_mb: number | null
          id: string
          is_manuscript: boolean | null
          language: string | null
          manuscript_id: string | null
          ocr_processed: boolean | null
          pages_count: number
          pdf_url: string | null
          print_enabled: boolean | null
          publication_date: string | null
          publication_status: string | null
          publication_year: number | null
          published_at: string | null
          requires_authentication: boolean | null
          sort_order: number | null
          themes: string[] | null
          thumbnail_url: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          access_level?: string | null
          author?: string | null
          cbn_document_id: string
          cover_image_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          digital_collections?: string[] | null
          digitization_date?: string | null
          digitization_quality?: string | null
          digitization_source?: string | null
          document_type?: string | null
          download_enabled?: boolean | null
          downloads_count?: number | null
          file_format?: string | null
          file_size_mb?: number | null
          id?: string
          is_manuscript?: boolean | null
          language?: string | null
          manuscript_id?: string | null
          ocr_processed?: boolean | null
          pages_count: number
          pdf_url?: string | null
          print_enabled?: boolean | null
          publication_date?: string | null
          publication_status?: string | null
          publication_year?: number | null
          published_at?: string | null
          requires_authentication?: boolean | null
          sort_order?: number | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          access_level?: string | null
          author?: string | null
          cbn_document_id?: string
          cover_image_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          digital_collections?: string[] | null
          digitization_date?: string | null
          digitization_quality?: string | null
          digitization_source?: string | null
          document_type?: string | null
          download_enabled?: boolean | null
          downloads_count?: number | null
          file_format?: string | null
          file_size_mb?: number | null
          id?: string
          is_manuscript?: boolean | null
          language?: string | null
          manuscript_id?: string | null
          ocr_processed?: boolean | null
          pages_count?: number
          pdf_url?: string | null
          print_enabled?: boolean | null
          publication_date?: string | null
          publication_status?: string | null
          publication_year?: number | null
          published_at?: string | null
          requires_authentication?: boolean | null
          sort_order?: number | null
          themes?: string[] | null
          thumbnail_url?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_digital_library_cbn_document"
            columns: ["cbn_document_id"]
            isOneToOne: false
            referencedRelation: "cbn_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_digital_library_manuscript"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_library_featured_works: {
        Row: {
          created_at: string
          created_by: string | null
          custom_author: string | null
          custom_category: string | null
          custom_date: string | null
          custom_description: string | null
          custom_image_url: string | null
          custom_link: string | null
          custom_title: string | null
          custom_title_ar: string | null
          display_order: number
          document_id: string | null
          id: string
          is_active: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_author?: string | null
          custom_category?: string | null
          custom_date?: string | null
          custom_description?: string | null
          custom_image_url?: string | null
          custom_link?: string | null
          custom_title?: string | null
          custom_title_ar?: string | null
          display_order?: number
          document_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_author?: string | null
          custom_category?: string | null
          custom_date?: string | null
          custom_description?: string | null
          custom_image_url?: string | null
          custom_link?: string | null
          custom_title?: string | null
          custom_title_ar?: string | null
          display_order?: number
          document_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_library_featured_works_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "digital_library_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_library_pages: {
        Row: {
          created_at: string
          document_id: string
          id: string
          image_url: string | null
          ocr_text: string | null
          page_number: number
          paragraphs: Json | null
          updated_at: string
          word_coordinates: Json | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          image_url?: string | null
          ocr_text?: string | null
          page_number: number
          paragraphs?: Json | null
          updated_at?: string
          word_coordinates?: Json | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          image_url?: string | null
          ocr_text?: string | null
          page_number?: number
          paragraphs?: Json | null
          updated_at?: string
          word_coordinates?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_library_pages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "digital_library_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      digitization_requests: {
        Row: {
          admin_notes: string | null
          attachment_url: string | null
          copyright_agreement: boolean
          created_at: string
          document_cote: string | null
          document_id: string | null
          document_title: string
          id: string
          justification: string
          pages_count: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          usage_type: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          admin_notes?: string | null
          attachment_url?: string | null
          copyright_agreement?: boolean
          created_at?: string
          document_cote?: string | null
          document_id?: string | null
          document_title: string
          id?: string
          justification: string
          pages_count: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          usage_type: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          admin_notes?: string | null
          attachment_url?: string | null
          copyright_agreement?: boolean
          created_at?: string
          document_cote?: string | null
          document_id?: string | null
          document_title?: string
          id?: string
          justification?: string
          pages_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          usage_type?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      distributors: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          google_maps_link: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_copies: {
        Row: {
          availability_status: string
          barcode: string | null
          copy_number: string
          cote: string
          created_at: string
          document_id: string
          id: string
          last_sync_date: string | null
          location: string | null
          notes: string | null
          sigb_copy_id: string | null
          sigb_data: Json | null
          unavailability_reason: string | null
          unavailable_until: string | null
          updated_at: string
        }
        Insert: {
          availability_status?: string
          barcode?: string | null
          copy_number: string
          cote: string
          created_at?: string
          document_id: string
          id?: string
          last_sync_date?: string | null
          location?: string | null
          notes?: string | null
          sigb_copy_id?: string | null
          sigb_data?: Json | null
          unavailability_reason?: string | null
          unavailable_until?: string | null
          updated_at?: string
        }
        Update: {
          availability_status?: string
          barcode?: string | null
          copy_number?: string
          cote?: string
          created_at?: string
          document_id?: string
          id?: string
          last_sync_date?: string | null
          location?: string | null
          notes?: string | null
          sigb_copy_id?: string | null
          sigb_data?: Json | null
          unavailability_reason?: string | null
          unavailable_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          content_template: string
          created_at: string
          created_by: string | null
          document_type: string
          file_url: string | null
          footer_content: string | null
          header_content: string | null
          id: string
          is_active: boolean | null
          module: string
          signature_required: boolean | null
          template_code: string
          template_name: string
          updated_at: string
          variables: Json | null
          workflow_id: string | null
        }
        Insert: {
          content_template: string
          created_at?: string
          created_by?: string | null
          document_type: string
          file_url?: string | null
          footer_content?: string | null
          header_content?: string | null
          id?: string
          is_active?: boolean | null
          module: string
          signature_required?: boolean | null
          template_code: string
          template_name: string
          updated_at?: string
          variables?: Json | null
          workflow_id?: string | null
        }
        Update: {
          content_template?: string
          created_at?: string
          created_by?: string | null
          document_type?: string
          file_url?: string | null
          footer_content?: string | null
          header_content?: string | null
          id?: string
          is_active?: boolean | null
          module?: string
          signature_required?: boolean | null
          template_code?: string
          template_name?: string
          updated_at?: string
          variables?: Json | null
          workflow_id?: string | null
        }
        Relationships: []
      }
      donation_items: {
        Row: {
          author: string | null
          catalog_number: string | null
          created_at: string | null
          description: string | null
          digital_library_id: string | null
          donation_id: string
          id: string
          image_url: string | null
          is_digitized: boolean | null
          publication_year: string | null
          support_type: string | null
          title: string
          title_ar: string | null
        }
        Insert: {
          author?: string | null
          catalog_number?: string | null
          created_at?: string | null
          description?: string | null
          digital_library_id?: string | null
          donation_id: string
          id?: string
          image_url?: string | null
          is_digitized?: boolean | null
          publication_year?: string | null
          support_type?: string | null
          title: string
          title_ar?: string | null
        }
        Update: {
          author?: string | null
          catalog_number?: string | null
          created_at?: string | null
          description?: string | null
          digital_library_id?: string | null
          donation_id?: string
          id?: string
          image_url?: string | null
          is_digitized?: boolean | null
          publication_year?: string | null
          support_type?: string | null
          title?: string
          title_ar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_items_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_proposals: {
        Row: {
          address: string | null
          city: string
          collection_description: string
          condition: string | null
          converted_donation_id: string | null
          country: string | null
          created_at: string | null
          documents: Json | null
          donor_type: string
          email: string
          estimated_books_count: number | null
          estimated_pages_count: number | null
          first_name: string
          historical_value: string | null
          id: string
          last_name: string
          oldest_item_date: string | null
          organization_name: string | null
          phone: string
          proposal_number: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          support_type: string
          thematics: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city: string
          collection_description: string
          condition?: string | null
          converted_donation_id?: string | null
          country?: string | null
          created_at?: string | null
          documents?: Json | null
          donor_type: string
          email: string
          estimated_books_count?: number | null
          estimated_pages_count?: number | null
          first_name: string
          historical_value?: string | null
          id?: string
          last_name: string
          oldest_item_date?: string | null
          organization_name?: string | null
          phone: string
          proposal_number?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          support_type: string
          thematics?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          collection_description?: string
          condition?: string | null
          converted_donation_id?: string | null
          country?: string | null
          created_at?: string | null
          documents?: Json | null
          donor_type?: string
          email?: string
          estimated_books_count?: number | null
          estimated_pages_count?: number | null
          first_name?: string
          historical_value?: string | null
          id?: string
          last_name?: string
          oldest_item_date?: string | null
          organization_name?: string | null
          phone?: string
          proposal_number?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          support_type?: string
          thematics?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_proposals_converted_donation_id_fkey"
            columns: ["converted_donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          cataloged_items_count: number | null
          condition: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          documents: Json | null
          donation_date: string | null
          donation_number: string | null
          donor_id: string
          estimated_quantity: number | null
          historical_value: string | null
          id: string
          images: Json | null
          oldest_item_date: string | null
          reception_date: string | null
          status: string | null
          support_type: string
          thematic: string[] | null
          title: string
          title_ar: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          validation_notes: string | null
        }
        Insert: {
          cataloged_items_count?: number | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          documents?: Json | null
          donation_date?: string | null
          donation_number?: string | null
          donor_id: string
          estimated_quantity?: number | null
          historical_value?: string | null
          id?: string
          images?: Json | null
          oldest_item_date?: string | null
          reception_date?: string | null
          status?: string | null
          support_type: string
          thematic?: string[] | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
        }
        Update: {
          cataloged_items_count?: number | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          documents?: Json | null
          donation_date?: string | null
          donation_number?: string | null
          donor_id?: string
          estimated_quantity?: number | null
          historical_value?: string | null
          id?: string
          images?: Json | null
          oldest_item_date?: string | null
          reception_date?: string | null
          status?: string | null
          support_type?: string
          thematic?: string[] | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_communications: {
        Row: {
          communication_type: string
          content: string | null
          created_at: string | null
          created_by: string | null
          direction: string | null
          donor_id: string | null
          id: string
          proposal_id: string | null
          subject: string | null
        }
        Insert: {
          communication_type: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          direction?: string | null
          donor_id?: string | null
          id?: string
          proposal_id?: string | null
          subject?: string | null
        }
        Update: {
          communication_type?: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          direction?: string | null
          donor_id?: string | null
          id?: string
          proposal_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_communications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_communications_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "donation_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string | null
          biography: string | null
          biography_ar: string | null
          city: string | null
          country: string | null
          created_at: string | null
          donor_type: string
          email: string
          first_name: string | null
          id: string
          is_anonymous: boolean | null
          is_featured: boolean | null
          last_name: string | null
          organization_name: string | null
          phone: string | null
          photo_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          biography?: string | null
          biography_ar?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          donor_type: string
          email: string
          first_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_featured?: boolean | null
          last_name?: string | null
          organization_name?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          biography?: string | null
          biography_ar?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          donor_type?: string
          email?: string
          first_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_featured?: boolean | null
          last_name?: string | null
          organization_name?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      download_logs: {
        Row: {
          content_id: string
          downloaded_at: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          content_id: string
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown
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
      editors: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          google_maps_link: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          google_maps_link?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          google_maps_link?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      electronic_bundles: {
        Row: {
          access_type: string | null
          api_authentication_type: string | null
          api_base_url: string | null
          api_headers: Json | null
          api_key_name: string | null
          api_query_params: Json | null
          categories: string[] | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_ar: string | null
          document_count: number | null
          fulltext_endpoint: string | null
          id: string
          ip_authentication: boolean | null
          ip_ranges: string[] | null
          is_active: boolean | null
          metadata_endpoint: string | null
          name: string
          name_ar: string | null
          notes: string | null
          provider: string
          provider_logo_url: string | null
          proxy_required: boolean | null
          proxy_url: string | null
          search_endpoint: string | null
          sort_order: number | null
          subjects: string[] | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          supported_formats: string[] | null
          updated_at: string | null
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          access_type?: string | null
          api_authentication_type?: string | null
          api_base_url?: string | null
          api_headers?: Json | null
          api_key_name?: string | null
          api_query_params?: Json | null
          categories?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_ar?: string | null
          document_count?: number | null
          fulltext_endpoint?: string | null
          id?: string
          ip_authentication?: boolean | null
          ip_ranges?: string[] | null
          is_active?: boolean | null
          metadata_endpoint?: string | null
          name: string
          name_ar?: string | null
          notes?: string | null
          provider: string
          provider_logo_url?: string | null
          proxy_required?: boolean | null
          proxy_url?: string | null
          search_endpoint?: string | null
          sort_order?: number | null
          subjects?: string[] | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          supported_formats?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          access_type?: string | null
          api_authentication_type?: string | null
          api_base_url?: string | null
          api_headers?: Json | null
          api_key_name?: string | null
          api_query_params?: Json | null
          categories?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_ar?: string | null
          document_count?: number | null
          fulltext_endpoint?: string | null
          id?: string
          ip_authentication?: boolean | null
          ip_ranges?: string[] | null
          is_active?: boolean | null
          metadata_endpoint?: string | null
          name?: string
          name_ar?: string | null
          notes?: string | null
          provider?: string
          provider_logo_url?: string | null
          proxy_required?: boolean | null
          proxy_url?: string | null
          search_endpoint?: string | null
          sort_order?: number | null
          subjects?: string[] | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          supported_formats?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      email_campaign_logs: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          recipient_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          recipient_id?: string | null
          sent_at?: string | null
          status: string
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          recipient_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          custom_recipients: string[] | null
          description: string | null
          from_email: string
          from_name: string
          id: string
          name: string
          recipient_type: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          total_failed: number | null
          total_recipients: number | null
          total_sent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custom_recipients?: string[] | null
          description?: string | null
          from_email?: string
          from_name?: string
          id?: string
          name: string
          recipient_type: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          total_failed?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custom_recipients?: string[] | null
          description?: string | null
          from_email?: string
          from_name?: string
          id?: string
          name?: string
          recipient_type?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          total_failed?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          html_content: string
          html_content_ar: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          subject_ar: string | null
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          html_content: string
          html_content_ar?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          subject_ar?: string | null
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          html_content?: string
          html_content_ar?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          subject_ar?: string | null
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      equipment_types: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          unit_price: number | null
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          unit_price?: number | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          unit_price?: number | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      exhibition_tour_items: {
        Row: {
          created_at: string | null
          description: string | null
          details: string | null
          dimensions: string | null
          display_order: number
          exhibition_id: string
          id: string
          image_url: string | null
          is_active: boolean | null
          item_type: string
          origin: string | null
          technique: string | null
          title: string
          updated_at: string | null
          year: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          details?: string | null
          dimensions?: string | null
          display_order?: number
          exhibition_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          item_type?: string
          origin?: string | null
          technique?: string | null
          title: string
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          details?: string | null
          dimensions?: string | null
          display_order?: number
          exhibition_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          item_type?: string
          origin?: string | null
          technique?: string | null
          title?: string
          updated_at?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exhibition_tour_items_exhibition_id_fkey"
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
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
          visited_at: string | null
        }
        Insert: {
          exhibition_id?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          visited_at?: string | null
        }
        Update: {
          exhibition_id?: string | null
          id?: string
          ip_address?: unknown
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
      external_integrations: {
        Row: {
          auth_credentials: Json | null
          auth_type: string | null
          auto_sync_enabled: boolean | null
          batch_size: number | null
          created_at: string | null
          created_by: string | null
          data_mapping: Json | null
          description: string | null
          endpoint_url: string
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          next_sync_at: string | null
          retry_attempts: number | null
          sync_direction: string
          sync_entities: string[] | null
          sync_frequency: string | null
          timeout_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          auth_credentials?: Json | null
          auth_type?: string | null
          auto_sync_enabled?: boolean | null
          batch_size?: number | null
          created_at?: string | null
          created_by?: string | null
          data_mapping?: Json | null
          description?: string | null
          endpoint_url: string
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          next_sync_at?: string | null
          retry_attempts?: number | null
          sync_direction: string
          sync_entities?: string[] | null
          sync_frequency?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          auth_credentials?: Json | null
          auth_type?: string | null
          auto_sync_enabled?: boolean | null
          batch_size?: number | null
          created_at?: string | null
          created_by?: string | null
          data_mapping?: Json | null
          description?: string | null
          endpoint_url?: string
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          next_sync_at?: string | null
          retry_attempts?: number | null
          sync_direction?: string
          sync_entities?: string[] | null
          sync_frequency?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      external_system_configs: {
        Row: {
          additional_params: Json | null
          api_key_encrypted: string | null
          base_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_configured: boolean | null
          last_sync_at: string | null
          last_sync_status: string | null
          password_encrypted: string | null
          sync_frequency_minutes: number | null
          system_name: string
          system_type: string
          updated_at: string | null
          updated_by: string | null
          username: string | null
        }
        Insert: {
          additional_params?: Json | null
          api_key_encrypted?: string | null
          base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_configured?: boolean | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          password_encrypted?: string | null
          sync_frequency_minutes?: number | null
          system_name: string
          system_type: string
          updated_at?: string | null
          updated_by?: string | null
          username?: string | null
        }
        Update: {
          additional_params?: Json | null
          api_key_encrypted?: string | null
          base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_configured?: boolean | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          password_encrypted?: string | null
          sync_frequency_minutes?: number | null
          system_name?: string
          system_type?: string
          updated_at?: string | null
          updated_by?: string | null
          username?: string | null
        }
        Relationships: []
      }
      external_system_sync_logs: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          records_added: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          status: string
          sync_completed_at: string | null
          sync_started_at: string | null
          system_config_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_added?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          status: string
          sync_completed_at?: string | null
          sync_started_at?: string | null
          system_config_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_added?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string | null
          system_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_system_sync_logs_system_config_id_fkey"
            columns: ["system_config_id"]
            isOneToOne: false
            referencedRelation: "external_system_configs"
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
      form_audit_log: {
        Row: {
          action: string
          diff: Json | null
          entity_id: string | null
          entity_type: string
          form_id: string
          id: string
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          diff?: Json | null
          entity_id?: string | null
          entity_type: string
          form_id: string
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string
          form_id?: string
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_audit_log_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "configurable_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          form_id: string
          id: string
          is_published: boolean | null
          published_at: string | null
          published_by: string | null
          structure: Json
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          form_id: string
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          published_by?: string | null
          structure?: Json
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          form_id?: string
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          published_by?: string | null
          structure?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_versions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string | null
          description: string | null
          form_key: string
          form_name: string
          id: string
          is_active: boolean | null
          module: string | null
          platform: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          form_key: string
          form_name: string
          id?: string
          is_active?: boolean | null
          module?: string | null
          platform?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          form_key?: string
          form_name?: string
          id?: string
          is_active?: boolean | null
          module?: string | null
          platform?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      ged_document_access_log: {
        Row: {
          access_granted: boolean | null
          accessed_at: string | null
          action: string
          denial_reason: string | null
          document_id: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_granted?: boolean | null
          accessed_at?: string | null
          action: string
          denial_reason?: string | null
          document_id: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_granted?: boolean | null
          accessed_at?: string | null
          action?: string
          denial_reason?: string | null
          document_id?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ged_document_access_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_document_annotations: {
        Row: {
          annotation_type: string
          content: string
          created_at: string | null
          created_by: string
          document_id: string
          id: string
          is_private: boolean | null
          is_resolved: boolean | null
          page_number: number | null
          position_data: Json | null
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string | null
        }
        Insert: {
          annotation_type: string
          content: string
          created_at?: string | null
          created_by: string
          document_id: string
          id?: string
          is_private?: boolean | null
          is_resolved?: boolean | null
          page_number?: number | null
          position_data?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string | null
        }
        Update: {
          annotation_type?: string
          content?: string
          created_at?: string | null
          created_by?: string
          document_id?: string
          id?: string
          is_private?: boolean | null
          is_resolved?: boolean | null
          page_number?: number | null
          position_data?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ged_document_annotations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_document_permissions: {
        Row: {
          can_delete: boolean | null
          can_download: boolean | null
          can_edit: boolean | null
          can_share: boolean | null
          can_sign: boolean | null
          can_view: boolean | null
          document_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role_name: string | null
          user_id: string | null
        }
        Insert: {
          can_delete?: boolean | null
          can_download?: boolean | null
          can_edit?: boolean | null
          can_share?: boolean | null
          can_sign?: boolean | null
          can_view?: boolean | null
          document_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role_name?: string | null
          user_id?: string | null
        }
        Update: {
          can_delete?: boolean | null
          can_download?: boolean | null
          can_edit?: boolean | null
          can_share?: boolean | null
          can_sign?: boolean | null
          can_view?: boolean | null
          document_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ged_document_permissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_document_relations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          relation_type: string
          source_document_id: string
          target_document_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          relation_type: string
          source_document_id: string
          target_document_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          relation_type?: string
          source_document_id?: string
          target_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ged_document_relations_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ged_document_relations_target_document_id_fkey"
            columns: ["target_document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_document_signatures: {
        Row: {
          document_id: string
          id: string
          ip_address: unknown
          is_valid: boolean | null
          signature_certificate: string | null
          signature_data: Json
          signature_type: string
          signed_at: string | null
          signer_email: string | null
          signer_id: string
          signer_name: string
          signer_role: string | null
          validated_at: string | null
          validation_status: string | null
        }
        Insert: {
          document_id: string
          id?: string
          ip_address?: unknown
          is_valid?: boolean | null
          signature_certificate?: string | null
          signature_data: Json
          signature_type: string
          signed_at?: string | null
          signer_email?: string | null
          signer_id: string
          signer_name: string
          signer_role?: string | null
          validated_at?: string | null
          validation_status?: string | null
        }
        Update: {
          document_id?: string
          id?: string
          ip_address?: unknown
          is_valid?: boolean | null
          signature_certificate?: string | null
          signature_data?: Json
          signature_type?: string
          signed_at?: string | null
          signer_email?: string | null
          signer_id?: string
          signer_name?: string
          signer_role?: string | null
          validated_at?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ged_document_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_document_versions: {
        Row: {
          changes_description: string | null
          checksum: string | null
          created_at: string | null
          created_by: string | null
          document_id: string
          file_path: string
          file_size_bytes: number | null
          file_url: string | null
          id: string
          version_notes: string | null
          version_number: number
        }
        Insert: {
          changes_description?: string | null
          checksum?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id: string
          file_path: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          version_notes?: string | null
          version_number: number
        }
        Update: {
          changes_description?: string | null
          checksum?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          file_path?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          version_notes?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ged_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_document_workflows: {
        Row: {
          completed_at: string | null
          current_assignee: string | null
          current_status: string | null
          document_id: string
          id: string
          started_at: string | null
          total_steps: number
          workflow_data: Json | null
          workflow_name: string
          workflow_step: number | null
        }
        Insert: {
          completed_at?: string | null
          current_assignee?: string | null
          current_status?: string | null
          document_id: string
          id?: string
          started_at?: string | null
          total_steps: number
          workflow_data?: Json | null
          workflow_name: string
          workflow_step?: number | null
        }
        Update: {
          completed_at?: string | null
          current_assignee?: string | null
          current_status?: string | null
          document_id?: string
          id?: string
          started_at?: string | null
          total_steps?: number
          workflow_data?: Json | null
          workflow_name?: string
          workflow_step?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ged_document_workflows_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_documents: {
        Row: {
          access_count: number | null
          access_level: string | null
          approved_at: string | null
          approved_by: string | null
          archival_date: string | null
          checksum: string | null
          confidentiality_level: number | null
          created_at: string | null
          created_by: string | null
          custom_metadata: Json | null
          deletion_date: string | null
          description: string | null
          document_category: string | null
          document_number: string
          document_title: string
          document_type: string
          file_extension: string | null
          file_mime_type: string | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          file_url: string | null
          id: string
          indexed: boolean | null
          is_latest_version: boolean | null
          is_signed: boolean | null
          keywords: string[] | null
          last_accessed_at: string | null
          ocr_processed: boolean | null
          ocr_text: string | null
          parent_document_id: string | null
          preview_url: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          related_documents: string[] | null
          requires_signature: boolean | null
          retention_period_years: number | null
          signature_data: Json | null
          source_module: string
          source_record_id: string | null
          source_table: string | null
          status: string | null
          storage_location: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          updated_by: string | null
          version_number: number | null
          workflow_status: string | null
        }
        Insert: {
          access_count?: number | null
          access_level?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archival_date?: string | null
          checksum?: string | null
          confidentiality_level?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_metadata?: Json | null
          deletion_date?: string | null
          description?: string | null
          document_category?: string | null
          document_number: string
          document_title: string
          document_type: string
          file_extension?: string | null
          file_mime_type?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          indexed?: boolean | null
          is_latest_version?: boolean | null
          is_signed?: boolean | null
          keywords?: string[] | null
          last_accessed_at?: string | null
          ocr_processed?: boolean | null
          ocr_text?: string | null
          parent_document_id?: string | null
          preview_url?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          related_documents?: string[] | null
          requires_signature?: boolean | null
          retention_period_years?: number | null
          signature_data?: Json | null
          source_module: string
          source_record_id?: string | null
          source_table?: string | null
          status?: string | null
          storage_location?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version_number?: number | null
          workflow_status?: string | null
        }
        Update: {
          access_count?: number | null
          access_level?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archival_date?: string | null
          checksum?: string | null
          confidentiality_level?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_metadata?: Json | null
          deletion_date?: string | null
          description?: string | null
          document_category?: string | null
          document_number?: string
          document_title?: string
          document_type?: string
          file_extension?: string | null
          file_mime_type?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          indexed?: boolean | null
          is_latest_version?: boolean | null
          is_signed?: boolean | null
          keywords?: string[] | null
          last_accessed_at?: string | null
          ocr_processed?: boolean | null
          ocr_text?: string | null
          parent_document_id?: string | null
          preview_url?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          related_documents?: string[] | null
          requires_signature?: boolean | null
          retention_period_years?: number | null
          signature_data?: Json | null
          source_module?: string
          source_record_id?: string | null
          source_table?: string | null
          status?: string | null
          storage_location?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version_number?: number | null
          workflow_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ged_documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "ged_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          document_data: Json
          document_number: string
          document_type: string
          file_url: string | null
          generated_at: string
          generated_by: string
          id: string
          module: string
          reference_id: string
          reference_type: string
          signature_data: Json | null
          template_id: string
        }
        Insert: {
          document_data: Json
          document_number: string
          document_type: string
          file_url?: string | null
          generated_at?: string
          generated_by: string
          id?: string
          module: string
          reference_id: string
          reference_type: string
          signature_data?: Json | null
          template_id: string
        }
        Update: {
          document_data?: Json
          document_number?: string
          document_type?: string
          file_url?: string | null
          generated_at?: string
          generated_by?: string
          id?: string
          module?: string
          reference_id?: string
          reference_type?: string
          signature_data?: Json | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
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
      integration_sync_errors: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          error_code: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          integration_id: string | null
          record_data: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          retry_count: number | null
          sync_log_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_code?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          integration_id?: string | null
          record_data?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_count?: number | null
          sync_log_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_code?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          integration_id?: string | null
          record_data?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_count?: number | null
          sync_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_errors_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "external_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_sync_errors_sync_log_id_fkey"
            columns: ["sync_log_id"]
            isOneToOne: false
            referencedRelation: "integration_sync_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          entity_type: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          integration_id: string | null
          records_failed: number | null
          records_processed: number | null
          records_skipped: number | null
          records_success: number | null
          records_total: number | null
          started_at: string | null
          status: string
          sync_details: Json | null
          sync_direction: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          entity_type?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          records_failed?: number | null
          records_processed?: number | null
          records_skipped?: number | null
          records_success?: number | null
          records_total?: number | null
          started_at?: string | null
          status: string
          sync_details?: Json | null
          sync_direction: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          entity_type?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          records_failed?: number | null
          records_processed?: number | null
          records_skipped?: number | null
          records_success?: number | null
          records_total?: number | null
          started_at?: string | null
          status?: string
          sync_details?: Json | null
          sync_direction?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "external_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_webhooks: {
        Row: {
          allowed_ips: string[] | null
          created_at: string | null
          event_types: string[]
          id: string
          integration_id: string | null
          is_active: boolean | null
          signature_algorithm: string | null
          signature_header: string | null
          updated_at: string | null
          webhook_name: string
          webhook_secret: string | null
        }
        Insert: {
          allowed_ips?: string[] | null
          created_at?: string | null
          event_types: string[]
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          signature_algorithm?: string | null
          signature_header?: string | null
          updated_at?: string | null
          webhook_name: string
          webhook_secret?: string | null
        }
        Update: {
          allowed_ips?: string[] | null
          created_at?: string | null
          event_types?: string[]
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          signature_algorithm?: string | null
          signature_header?: string | null
          updated_at?: string | null
          webhook_name?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_webhooks_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "external_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      issn_requests: {
        Row: {
          contact_address: string
          country_code: string
          created_at: string
          discipline: string
          frequency: string
          id: string
          justification_file_url: string | null
          language_code: string
          publisher: string
          rejection_reason: string | null
          request_number: string | null
          requester_email: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          support: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_address: string
          country_code: string
          created_at?: string
          discipline: string
          frequency: string
          id?: string
          justification_file_url?: string | null
          language_code: string
          publisher: string
          rejection_reason?: string | null
          request_number?: string | null
          requester_email?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          support: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_address?: string
          country_code?: string
          created_at?: string
          discipline?: string
          frequency?: string
          id?: string
          justification_file_url?: string | null
          language_code?: string
          publisher?: string
          rejection_reason?: string | null
          request_number?: string | null
          requester_email?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          support?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          native_name: string
          orientation: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          native_name: string
          orientation?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          native_name?: string
          orientation?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legal_deposit_committee_reviews: {
        Row: {
          comments: string | null
          committee_member_id: string
          created_at: string | null
          decision_rationale: string | null
          id: string
          request_id: string
          review_date: string | null
          review_status: string
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          committee_member_id: string
          created_at?: string | null
          decision_rationale?: string | null
          id?: string
          request_id: string
          review_date?: string | null
          review_status: string
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          committee_member_id?: string
          created_at?: string | null
          decision_rationale?: string | null
          id?: string
          request_id?: string
          review_date?: string | null
          review_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_deposit_committee_reviews_committee_member_id_fkey"
            columns: ["committee_member_id"]
            isOneToOne: false
            referencedRelation: "legal_deposit_validation_committee"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_deposit_committee_reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "kitab_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_deposit_committee_reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_deposit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_deposit_monograph_data: {
        Row: {
          abstract_file_url: string | null
          accompanying_material_type: string | null
          author_birth_date: string | null
          author_city: string | null
          author_email: string | null
          author_gender: string | null
          author_name: string | null
          author_phone: string | null
          author_pseudonym: string | null
          author_region: string | null
          author_sigle: string | null
          author_status: string | null
          author_type: string | null
          cin_file_url: string | null
          collection_number: string | null
          collection_title: string | null
          cover_file_url: string | null
          created_at: string | null
          declaration_nature: string | null
          has_accompanying_material: string | null
          id: string
          is_periodic: string | null
          issn_submitted: boolean | null
          languages: string[] | null
          multiple_volumes: string | null
          number_of_pages: number | null
          number_of_volumes: number | null
          print_run_number: number | null
          printer_address: string | null
          printer_country: string | null
          printer_email: string | null
          printer_id: string | null
          printer_phone: string | null
          publication_date: string | null
          publication_discipline: string | null
          publication_title: string
          publication_type: string | null
          publisher_id: string | null
          quran_authorization_url: string | null
          request_id: string | null
          summary_file_url: string | null
          support_type: string | null
          thesis_recommendation_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          abstract_file_url?: string | null
          accompanying_material_type?: string | null
          author_birth_date?: string | null
          author_city?: string | null
          author_email?: string | null
          author_gender?: string | null
          author_name?: string | null
          author_phone?: string | null
          author_pseudonym?: string | null
          author_region?: string | null
          author_sigle?: string | null
          author_status?: string | null
          author_type?: string | null
          cin_file_url?: string | null
          collection_number?: string | null
          collection_title?: string | null
          cover_file_url?: string | null
          created_at?: string | null
          declaration_nature?: string | null
          has_accompanying_material?: string | null
          id?: string
          is_periodic?: string | null
          issn_submitted?: boolean | null
          languages?: string[] | null
          multiple_volumes?: string | null
          number_of_pages?: number | null
          number_of_volumes?: number | null
          print_run_number?: number | null
          printer_address?: string | null
          printer_country?: string | null
          printer_email?: string | null
          printer_id?: string | null
          printer_phone?: string | null
          publication_date?: string | null
          publication_discipline?: string | null
          publication_title: string
          publication_type?: string | null
          publisher_id?: string | null
          quran_authorization_url?: string | null
          request_id?: string | null
          summary_file_url?: string | null
          support_type?: string | null
          thesis_recommendation_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          abstract_file_url?: string | null
          accompanying_material_type?: string | null
          author_birth_date?: string | null
          author_city?: string | null
          author_email?: string | null
          author_gender?: string | null
          author_name?: string | null
          author_phone?: string | null
          author_pseudonym?: string | null
          author_region?: string | null
          author_sigle?: string | null
          author_status?: string | null
          author_type?: string | null
          cin_file_url?: string | null
          collection_number?: string | null
          collection_title?: string | null
          cover_file_url?: string | null
          created_at?: string | null
          declaration_nature?: string | null
          has_accompanying_material?: string | null
          id?: string
          is_periodic?: string | null
          issn_submitted?: boolean | null
          languages?: string[] | null
          multiple_volumes?: string | null
          number_of_pages?: number | null
          number_of_volumes?: number | null
          print_run_number?: number | null
          printer_address?: string | null
          printer_country?: string | null
          printer_email?: string | null
          printer_id?: string | null
          printer_phone?: string | null
          publication_date?: string | null
          publication_discipline?: string | null
          publication_title?: string
          publication_type?: string | null
          publisher_id?: string | null
          quran_authorization_url?: string | null
          request_id?: string | null
          summary_file_url?: string | null
          support_type?: string | null
          thesis_recommendation_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_deposit_monograph_data_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_deposit_monograph_data_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_deposit_monograph_data_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "kitab_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_deposit_monograph_data_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "legal_deposit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_deposit_parties: {
        Row: {
          approval_comments: string | null
          approval_date: string | null
          approval_status: string | null
          created_at: string | null
          id: string
          is_initiator: boolean | null
          notified_at: string | null
          party_role: string
          request_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_comments?: string | null
          approval_date?: string | null
          approval_status?: string | null
          created_at?: string | null
          id?: string
          is_initiator?: boolean | null
          notified_at?: string | null
          party_role: string
          request_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_comments?: string | null
          approval_date?: string | null
          approval_status?: string | null
          created_at?: string | null
          id?: string
          is_initiator?: boolean | null
          notified_at?: string | null
          party_role?: string
          request_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_deposit_parties_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "kitab_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_deposit_parties_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "legal_deposit_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_deposit_requests: {
        Row: {
          amazon_link: string | null
          arbitration_decision_reason: string | null
          arbitration_reason: string | null
          arbitration_requested: boolean | null
          arbitration_requested_at: string | null
          arbitration_requested_by: string | null
          arbitration_status: string | null
          arbitration_validated_at: string | null
          arbitration_validated_by: string | null
          attribution_date: string | null
          author_name: string | null
          collaborator_id: string | null
          committee_validated_at: string | null
          committee_validation_notes: string | null
          confirmation_status: string | null
          created_at: string | null
          department_validated_at: string | null
          department_validation_notes: string | null
          dl_number: string | null
          documents_urls: Json | null
          editor_confirmation_at: string | null
          editor_confirmed: boolean | null
          id: string
          initiator_id: string
          isbn: string | null
          isbn_assigned: string | null
          ismn: string | null
          ismn_assigned: string | null
          issn: string | null
          issn_assigned: string | null
          kitab_status: string | null
          language: string | null
          metadata: Json | null
          monograph_type: Database["public"]["Enums"]["monograph_type"]
          page_count: number | null
          printer_confirmation_at: string | null
          printer_confirmed: boolean | null
          processing_start_date: string | null
          publication_date: string | null
          publication_status: string | null
          reception_date: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          request_number: string
          requires_amazon_validation: boolean | null
          service_validated_at: string | null
          service_validation_notes: string | null
          status: Database["public"]["Enums"]["deposit_status"] | null
          submission_date: string | null
          subtitle: string | null
          support_type: Database["public"]["Enums"]["support_type"]
          title: string
          updated_at: string | null
          validated_by_committee: string | null
          validated_by_department: string | null
          validated_by_service: string | null
          validation_b_date: string | null
          validation_code: string | null
        }
        Insert: {
          amazon_link?: string | null
          arbitration_decision_reason?: string | null
          arbitration_reason?: string | null
          arbitration_requested?: boolean | null
          arbitration_requested_at?: string | null
          arbitration_requested_by?: string | null
          arbitration_status?: string | null
          arbitration_validated_at?: string | null
          arbitration_validated_by?: string | null
          attribution_date?: string | null
          author_name?: string | null
          collaborator_id?: string | null
          committee_validated_at?: string | null
          committee_validation_notes?: string | null
          confirmation_status?: string | null
          created_at?: string | null
          department_validated_at?: string | null
          department_validation_notes?: string | null
          dl_number?: string | null
          documents_urls?: Json | null
          editor_confirmation_at?: string | null
          editor_confirmed?: boolean | null
          id?: string
          initiator_id: string
          isbn?: string | null
          isbn_assigned?: string | null
          ismn?: string | null
          ismn_assigned?: string | null
          issn?: string | null
          issn_assigned?: string | null
          kitab_status?: string | null
          language?: string | null
          metadata?: Json | null
          monograph_type: Database["public"]["Enums"]["monograph_type"]
          page_count?: number | null
          printer_confirmation_at?: string | null
          printer_confirmed?: boolean | null
          processing_start_date?: string | null
          publication_date?: string | null
          publication_status?: string | null
          reception_date?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_number: string
          requires_amazon_validation?: boolean | null
          service_validated_at?: string | null
          service_validation_notes?: string | null
          status?: Database["public"]["Enums"]["deposit_status"] | null
          submission_date?: string | null
          subtitle?: string | null
          support_type: Database["public"]["Enums"]["support_type"]
          title: string
          updated_at?: string | null
          validated_by_committee?: string | null
          validated_by_department?: string | null
          validated_by_service?: string | null
          validation_b_date?: string | null
          validation_code?: string | null
        }
        Update: {
          amazon_link?: string | null
          arbitration_decision_reason?: string | null
          arbitration_reason?: string | null
          arbitration_requested?: boolean | null
          arbitration_requested_at?: string | null
          arbitration_requested_by?: string | null
          arbitration_status?: string | null
          arbitration_validated_at?: string | null
          arbitration_validated_by?: string | null
          attribution_date?: string | null
          author_name?: string | null
          collaborator_id?: string | null
          committee_validated_at?: string | null
          committee_validation_notes?: string | null
          confirmation_status?: string | null
          created_at?: string | null
          department_validated_at?: string | null
          department_validation_notes?: string | null
          dl_number?: string | null
          documents_urls?: Json | null
          editor_confirmation_at?: string | null
          editor_confirmed?: boolean | null
          id?: string
          initiator_id?: string
          isbn?: string | null
          isbn_assigned?: string | null
          ismn?: string | null
          ismn_assigned?: string | null
          issn?: string | null
          issn_assigned?: string | null
          kitab_status?: string | null
          language?: string | null
          metadata?: Json | null
          monograph_type?: Database["public"]["Enums"]["monograph_type"]
          page_count?: number | null
          printer_confirmation_at?: string | null
          printer_confirmed?: boolean | null
          processing_start_date?: string | null
          publication_date?: string | null
          publication_status?: string | null
          reception_date?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_number?: string
          requires_amazon_validation?: boolean | null
          service_validated_at?: string | null
          service_validation_notes?: string | null
          status?: Database["public"]["Enums"]["deposit_status"] | null
          submission_date?: string | null
          subtitle?: string | null
          support_type?: Database["public"]["Enums"]["support_type"]
          title?: string
          updated_at?: string | null
          validated_by_committee?: string | null
          validated_by_department?: string | null
          validated_by_service?: string | null
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
        ]
      }
      legal_deposit_validation_committee: {
        Row: {
          appointed_by: string | null
          appointed_date: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          member_id: string
          role: string
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          appointed_by?: string | null
          appointed_date?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          member_id: string
          role: string
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          appointed_by?: string | null
          appointed_date?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          member_id?: string
          role?: string
          specialization?: string | null
          updated_at?: string | null
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
          cbn_document_id: string | null
          collection_id: string | null
          condition_notes: string | null
          cote: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          digital_copy_url: string | null
          digital_library_document_id: string | null
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
          cbn_document_id?: string | null
          collection_id?: string | null
          condition_notes?: string | null
          cote?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          digital_copy_url?: string | null
          digital_library_document_id?: string | null
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
          cbn_document_id?: string | null
          collection_id?: string | null
          condition_notes?: string | null
          cote?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          digital_copy_url?: string | null
          digital_library_document_id?: string | null
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
            foreignKeyName: "fk_manuscripts_cbn_document"
            columns: ["cbn_document_id"]
            isOneToOne: false
            referencedRelation: "cbn_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_manuscripts_digital_library"
            columns: ["digital_library_document_id"]
            isOneToOne: false
            referencedRelation: "digital_library_documents"
            referencedColumns: ["id"]
          },
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
      media_bookmarks: {
        Row: {
          created_at: string
          document_id: string
          id: string
          label: string | null
          timestamp_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          label?: string | null
          timestamp_seconds: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          label?: string | null
          timestamp_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          message_type: string | null
          sender_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          sender_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
      monitored_services: {
        Row: {
          check_interval_seconds: number | null
          created_at: string
          description: string | null
          endpoint_url: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          service_name: string
          service_type: string
          updated_at: string
        }
        Insert: {
          check_interval_seconds?: number | null
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          service_name: string
          service_type?: string
          updated_at?: string
        }
        Update: {
          check_interval_seconds?: number | null
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          service_name?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      nationalities: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          label_ar: string | null
          label_fr: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          label_ar?: string | null
          label_fr: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          label_ar?: string | null
          label_fr?: string
          sort_order?: number | null
          updated_at?: string
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
      notifications: {
        Row: {
          action_completed: boolean | null
          action_completed_at: string | null
          action_label: string | null
          action_url: string | null
          category: string | null
          created_at: string
          created_by: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          module: string | null
          notification_number: string | null
          priority: number | null
          read_at: string | null
          related_url: string | null
          requires_action: boolean | null
          short_message: string | null
          source_record_id: string | null
          source_table: string | null
          title: string
          type: string
          type_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_completed?: boolean | null
          action_completed_at?: string | null
          action_label?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          module?: string | null
          notification_number?: string | null
          priority?: number | null
          read_at?: string | null
          related_url?: string | null
          requires_action?: boolean | null
          short_message?: string | null
          source_record_id?: string | null
          source_table?: string | null
          title: string
          type: string
          type_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_completed?: boolean | null
          action_completed_at?: string | null
          action_label?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          module?: string | null
          notification_number?: string | null
          priority?: number | null
          read_at?: string | null
          related_url?: string | null
          requires_action?: boolean | null
          short_message?: string | null
          source_record_id?: string | null
          source_table?: string | null
          title?: string
          type?: string
          type_code?: string | null
          updated_at?: string | null
          user_id?: string
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
      ocr_audit_logs: {
        Row: {
          action: string
          cloud_endpoint: string | null
          created_at: string | null
          duration_ms: number | null
          file_hash: string | null
          file_size_bytes: number | null
          id: string
          ip_address: unknown
          job_id: string | null
          page_id: string | null
          provider: Database["public"]["Enums"]["ocr_provider"] | null
          request_data: Json | null
          response_summary: Json | null
          sent_to_cloud: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          cloud_endpoint?: string | null
          created_at?: string | null
          duration_ms?: number | null
          file_hash?: string | null
          file_size_bytes?: number | null
          id?: string
          ip_address?: unknown
          job_id?: string | null
          page_id?: string | null
          provider?: Database["public"]["Enums"]["ocr_provider"] | null
          request_data?: Json | null
          response_summary?: Json | null
          sent_to_cloud?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          cloud_endpoint?: string | null
          created_at?: string | null
          duration_ms?: number | null
          file_hash?: string | null
          file_size_bytes?: number | null
          id?: string
          ip_address?: unknown
          job_id?: string | null
          page_id?: string | null
          provider?: Database["public"]["Enums"]["ocr_provider"] | null
          request_data?: Json | null
          response_summary?: Json | null
          sent_to_cloud?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_audit_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ocr_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_audit_logs_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "ocr_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_ground_truth: {
        Row: {
          bbox: Json | null
          corrected_text: string
          correction_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_validated: boolean | null
          job_id: string
          line_id: string | null
          line_index: number | null
          page_id: string | null
          page_number: number
          recognized_text: string
          updated_at: string | null
          validated_by: string | null
        }
        Insert: {
          bbox?: Json | null
          corrected_text: string
          correction_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_validated?: boolean | null
          job_id: string
          line_id?: string | null
          line_index?: number | null
          page_id?: string | null
          page_number: number
          recognized_text: string
          updated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          bbox?: Json | null
          corrected_text?: string
          correction_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_validated?: boolean | null
          job_id?: string
          line_id?: string | null
          line_index?: number | null
          page_id?: string | null
          page_number?: number
          recognized_text?: string
          updated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_ground_truth_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ocr_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_ground_truth_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "ocr_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_jobs: {
        Row: {
          auto_mode: boolean | null
          cloud_allowed: boolean | null
          completed_at: string | null
          created_at: string | null
          document_id: string | null
          document_type: Database["public"]["Enums"]["ocr_document_type"]
          error_message: string | null
          id: string
          languages: string[] | null
          overall_confidence: number | null
          preprocessing_options: Json | null
          processed_pages: number | null
          processing_time_ms: number | null
          recommended_provider:
            | Database["public"]["Enums"]["ocr_provider"]
            | null
          selected_provider: Database["public"]["Enums"]["ocr_provider"] | null
          source_file_hash: string | null
          source_file_name: string | null
          source_file_url: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["ocr_job_status"] | null
          total_pages: number | null
          unknown_char_ratio: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_mode?: boolean | null
          cloud_allowed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          document_type?: Database["public"]["Enums"]["ocr_document_type"]
          error_message?: string | null
          id?: string
          languages?: string[] | null
          overall_confidence?: number | null
          preprocessing_options?: Json | null
          processed_pages?: number | null
          processing_time_ms?: number | null
          recommended_provider?:
            | Database["public"]["Enums"]["ocr_provider"]
            | null
          selected_provider?: Database["public"]["Enums"]["ocr_provider"] | null
          source_file_hash?: string | null
          source_file_name?: string | null
          source_file_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ocr_job_status"] | null
          total_pages?: number | null
          unknown_char_ratio?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_mode?: boolean | null
          cloud_allowed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          document_type?: Database["public"]["Enums"]["ocr_document_type"]
          error_message?: string | null
          id?: string
          languages?: string[] | null
          overall_confidence?: number | null
          preprocessing_options?: Json | null
          processed_pages?: number | null
          processing_time_ms?: number | null
          recommended_provider?:
            | Database["public"]["Enums"]["ocr_provider"]
            | null
          selected_provider?: Database["public"]["Enums"]["ocr_provider"] | null
          source_file_hash?: string | null
          source_file_name?: string | null
          source_file_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ocr_job_status"] | null
          total_pages?: number | null
          unknown_char_ratio?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "digital_library_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_models: {
        Row: {
          accuracy: number | null
          cer: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_pretrained: boolean | null
          meta_json: Json | null
          model_name: string
          model_path: string | null
          model_version: string | null
          provider: Database["public"]["Enums"]["ocr_provider"]
          supported_scripts: string[] | null
          test_set_size: number | null
          trained_on_jobs: string[] | null
          training_samples_count: number | null
          updated_at: string | null
          wer: number | null
        }
        Insert: {
          accuracy?: number | null
          cer?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_pretrained?: boolean | null
          meta_json?: Json | null
          model_name: string
          model_path?: string | null
          model_version?: string | null
          provider: Database["public"]["Enums"]["ocr_provider"]
          supported_scripts?: string[] | null
          test_set_size?: number | null
          trained_on_jobs?: string[] | null
          training_samples_count?: number | null
          updated_at?: string | null
          wer?: number | null
        }
        Update: {
          accuracy?: number | null
          cer?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_pretrained?: boolean | null
          meta_json?: Json | null
          model_name?: string
          model_path?: string | null
          model_version?: string | null
          provider?: Database["public"]["Enums"]["ocr_provider"]
          supported_scripts?: string[] | null
          test_set_size?: number | null
          trained_on_jobs?: string[] | null
          training_samples_count?: number | null
          updated_at?: string | null
          wer?: number | null
        }
        Relationships: []
      }
      ocr_pages: {
        Row: {
          alto_xml: string | null
          confidence: number | null
          created_at: string | null
          error_message: string | null
          id: string
          image_height: number | null
          image_url: string | null
          image_width: number | null
          job_id: string
          line_count: number | null
          meta_json: Json | null
          page_number: number
          page_xml: string | null
          processing_time_ms: number | null
          provider_used: Database["public"]["Enums"]["ocr_provider"] | null
          recognized_text: string | null
          regions: Json | null
          status: Database["public"]["Enums"]["ocr_job_status"] | null
          unknown_char_count: number | null
          updated_at: string | null
        }
        Insert: {
          alto_xml?: string | null
          confidence?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_height?: number | null
          image_url?: string | null
          image_width?: number | null
          job_id: string
          line_count?: number | null
          meta_json?: Json | null
          page_number: number
          page_xml?: string | null
          processing_time_ms?: number | null
          provider_used?: Database["public"]["Enums"]["ocr_provider"] | null
          recognized_text?: string | null
          regions?: Json | null
          status?: Database["public"]["Enums"]["ocr_job_status"] | null
          unknown_char_count?: number | null
          updated_at?: string | null
        }
        Update: {
          alto_xml?: string | null
          confidence?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_height?: number | null
          image_url?: string | null
          image_width?: number | null
          job_id?: string
          line_count?: number | null
          meta_json?: Json | null
          page_number?: number
          page_xml?: string | null
          processing_time_ms?: number | null
          provider_used?: Database["public"]["Enums"]["ocr_provider"] | null
          recognized_text?: string | null
          regions?: Json | null
          status?: Database["public"]["Enums"]["ocr_job_status"] | null
          unknown_char_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_pages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ocr_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_provider_configs: {
        Row: {
          api_version: string | null
          base_url: string | null
          created_at: string | null
          current_usage_today: number | null
          default_options: Json | null
          description: string | null
          documentation_url: string | null
          id: string
          is_cloud: boolean | null
          is_enabled: boolean | null
          provider: Database["public"]["Enums"]["ocr_provider"]
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          api_version?: string | null
          base_url?: string | null
          created_at?: string | null
          current_usage_today?: number | null
          default_options?: Json | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          is_cloud?: boolean | null
          is_enabled?: boolean | null
          provider: Database["public"]["Enums"]["ocr_provider"]
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          api_version?: string | null
          base_url?: string | null
          created_at?: string | null
          current_usage_today?: number | null
          default_options?: Json | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          is_cloud?: boolean | null
          is_enabled?: boolean | null
          provider?: Database["public"]["Enums"]["ocr_provider"]
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      page_access_restrictions: {
        Row: {
          allow_double_page_view: boolean | null
          allow_download: boolean | null
          allow_internal_access: boolean | null
          allow_internet_access: boolean | null
          allow_physical_consultation: boolean | null
          allow_right_click: boolean | null
          allow_screenshot: boolean | null
          allow_scroll_view: boolean | null
          content_id: string
          created_at: string | null
          created_by: string | null
          end_page: number | null
          id: string
          is_rare_book: boolean | null
          is_restricted: boolean | null
          manual_pages: number[] | null
          missing_pages: number[] | null
          missing_pages_custom_reason: string | null
          missing_pages_reason: string | null
          restricted_page_display: string | null
          restriction_mode: string | null
          start_page: number | null
          updated_at: string | null
        }
        Insert: {
          allow_double_page_view?: boolean | null
          allow_download?: boolean | null
          allow_internal_access?: boolean | null
          allow_internet_access?: boolean | null
          allow_physical_consultation?: boolean | null
          allow_right_click?: boolean | null
          allow_screenshot?: boolean | null
          allow_scroll_view?: boolean | null
          content_id: string
          created_at?: string | null
          created_by?: string | null
          end_page?: number | null
          id?: string
          is_rare_book?: boolean | null
          is_restricted?: boolean | null
          manual_pages?: number[] | null
          missing_pages?: number[] | null
          missing_pages_custom_reason?: string | null
          missing_pages_reason?: string | null
          restricted_page_display?: string | null
          restriction_mode?: string | null
          start_page?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_double_page_view?: boolean | null
          allow_download?: boolean | null
          allow_internal_access?: boolean | null
          allow_internet_access?: boolean | null
          allow_physical_consultation?: boolean | null
          allow_right_click?: boolean | null
          allow_screenshot?: boolean | null
          allow_scroll_view?: boolean | null
          content_id?: string
          created_at?: string | null
          created_by?: string | null
          end_page?: number | null
          id?: string
          is_rare_book?: boolean | null
          is_restricted?: boolean | null
          manual_pages?: number[] | null
          missing_pages?: number[] | null
          missing_pages_custom_reason?: string | null
          missing_pages_reason?: string | null
          restricted_page_display?: string | null
          restriction_mode?: string | null
          start_page?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_access_restrictions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "content"
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
          institution_name: string
          is_approved: boolean | null
          legal_representative: string | null
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
          institution_name: string
          is_approved?: boolean | null
          legal_representative?: string | null
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
          institution_name?: string
          is_approved?: boolean | null
          legal_representative?: string | null
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
      partnerships: {
        Row: {
          adresse: string
          created_at: string | null
          date_debut: string
          date_fin: string
          description_organisme: string | null
          description_projet: string
          email_officiel: string
          id: string
          lieu_concerne: string | null
          moyens_bnrm: string
          moyens_organisme: string
          nationalite: string
          nom_organisme: string
          nom_organisme_autre: string | null
          notes_admin: string | null
          objectifs: string
          objet_partenariat: string
          programme_url: string
          public_cible: string
          representants: Json
          reviewed_at: string | null
          reviewed_by: string | null
          site_web: string | null
          statut: string
          statut_document_url: string | null
          statut_juridique: string
          telephone: string
          type_organisation: string
          type_partenariat: string
          updated_at: string | null
        }
        Insert: {
          adresse: string
          created_at?: string | null
          date_debut: string
          date_fin: string
          description_organisme?: string | null
          description_projet: string
          email_officiel: string
          id?: string
          lieu_concerne?: string | null
          moyens_bnrm: string
          moyens_organisme: string
          nationalite: string
          nom_organisme: string
          nom_organisme_autre?: string | null
          notes_admin?: string | null
          objectifs: string
          objet_partenariat: string
          programme_url: string
          public_cible: string
          representants?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_web?: string | null
          statut?: string
          statut_document_url?: string | null
          statut_juridique: string
          telephone: string
          type_organisation: string
          type_partenariat: string
          updated_at?: string | null
        }
        Update: {
          adresse?: string
          created_at?: string | null
          date_debut?: string
          date_fin?: string
          description_organisme?: string | null
          description_projet?: string
          email_officiel?: string
          id?: string
          lieu_concerne?: string | null
          moyens_bnrm?: string
          moyens_organisme?: string
          nationalite?: string
          nom_organisme?: string
          nom_organisme_autre?: string | null
          notes_admin?: string | null
          objectifs?: string
          objet_partenariat?: string
          programme_url?: string
          public_cible?: string
          representants?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_web?: string | null
          statut?: string
          statut_document_url?: string | null
          statut_juridique?: string
          telephone?: string
          type_organisation?: string
          type_partenariat?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          created_at: string | null
          days_before_due: number | null
          id: string
          is_read: boolean | null
          reminder_type: string
          sent_at: string | null
          subscription_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_before_due?: number | null
          id?: string
          is_read?: boolean | null
          reminder_type: string
          sent_at?: string | null
          subscription_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_before_due?: number | null
          id?: string
          is_read?: boolean | null
          reminder_type?: string
          sent_at?: string | null
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "service_subscriptions"
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      printers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          google_maps_link: string | null
          id: string
          is_validated: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          is_validated?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          is_validated?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      producers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          google_maps_link: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      professional_invitations: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invitation_token: string | null
          invited_at: string | null
          invited_by: string | null
          last_deposit_number: string
          professional_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          last_deposit_number: string
          professional_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          last_deposit_number?: string
          professional_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_invitations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_registration_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_size_kb: number | null
          file_url: string
          id: string
          invitation_id: string | null
          mime_type: string | null
          rejection_reason: string | null
          uploaded_at: string | null
          user_id: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          file_size_kb?: number | null
          file_url: string
          id?: string
          invitation_id?: string | null
          mime_type?: string | null
          rejection_reason?: string | null
          uploaded_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_size_kb?: number | null
          file_url?: string
          id?: string
          invitation_id?: string | null
          mime_type?: string | null
          rejection_reason?: string | null
          uploaded_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_registration_documents_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "professional_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_registration_requests: {
        Row: {
          cndp_acceptance: boolean | null
          cndp_accepted_at: string | null
          company_name: string | null
          created_at: string | null
          id: string
          invitation_id: string | null
          professional_type: string
          registration_data: Json | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          verified_deposit_number: string
        }
        Insert: {
          cndp_acceptance?: boolean | null
          cndp_accepted_at?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          invitation_id?: string | null
          professional_type: string
          registration_data?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_deposit_number: string
        }
        Update: {
          cndp_acceptance?: boolean | null
          cndp_accepted_at?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          invitation_id?: string | null
          professional_type?: string
          registration_data?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_deposit_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_registration_requests_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "professional_invitations"
            referencedColumns: ["id"]
          },
        ]
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
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          access_reason?: string | null
          accessed_by: string
          accessed_fields: string[]
          accessed_profile_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          access_reason?: string | null
          accessed_by?: string
          accessed_fields?: string[]
          accessed_profile_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
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
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      program_contributions: {
        Row: {
          adresse: string | null
          besoins_specifiques: string | null
          certification_exactitude: boolean
          commentaires_comite: string | null
          consentement_diffusion: boolean
          created_at: string
          cv_url: string
          date_examen: string | null
          date_proposee: string
          description: string
          dossier_projet_url: string
          duree_minutes: number
          email: string
          espace_souhaite: string
          examine_par: string | null
          heure_proposee: string
          id: string
          langue: string
          message_info: string | null
          motif_refus: string | null
          moyens_techniques: Json | null
          nb_participants_estime: number | null
          nom_complet: string
          numero_reference: string | null
          objectifs: string
          organisme: string | null
          public_cible: string
          statut: string
          statut_juridique_url: string | null
          telephone: string
          titre: string
          type_activite: string
          type_demandeur: string
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          besoins_specifiques?: string | null
          certification_exactitude?: boolean
          commentaires_comite?: string | null
          consentement_diffusion?: boolean
          created_at?: string
          cv_url: string
          date_examen?: string | null
          date_proposee: string
          description: string
          dossier_projet_url: string
          duree_minutes: number
          email: string
          espace_souhaite: string
          examine_par?: string | null
          heure_proposee: string
          id?: string
          langue: string
          message_info?: string | null
          motif_refus?: string | null
          moyens_techniques?: Json | null
          nb_participants_estime?: number | null
          nom_complet: string
          numero_reference?: string | null
          objectifs: string
          organisme?: string | null
          public_cible: string
          statut?: string
          statut_juridique_url?: string | null
          telephone: string
          titre: string
          type_activite: string
          type_demandeur: string
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          besoins_specifiques?: string | null
          certification_exactitude?: boolean
          commentaires_comite?: string | null
          consentement_diffusion?: boolean
          created_at?: string
          cv_url?: string
          date_examen?: string | null
          date_proposee?: string
          description?: string
          dossier_projet_url?: string
          duree_minutes?: number
          email?: string
          espace_souhaite?: string
          examine_par?: string | null
          heure_proposee?: string
          id?: string
          langue?: string
          message_info?: string | null
          motif_refus?: string | null
          moyens_techniques?: Json | null
          nb_participants_estime?: number | null
          nom_complet?: string
          numero_reference?: string | null
          objectifs?: string
          organisme?: string | null
          public_cible?: string
          statut?: string
          statut_juridique_url?: string | null
          telephone?: string
          titre?: string
          type_activite?: string
          type_demandeur?: string
          updated_at?: string
        }
        Relationships: []
      }
      publishers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          google_maps_link: string | null
          id: string
          is_validated: boolean | null
          name: string
          phone: string | null
          publisher_type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          is_validated?: boolean | null
          name: string
          phone?: string | null
          publisher_type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          is_validated?: boolean | null
          name?: string
          phone?: string | null
          publisher_type?: string | null
          updated_at?: string | null
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
      rental_request_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: string
          notes: string | null
          previous_status: string | null
          request_id: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          notes?: string | null
          previous_status?: string | null
          request_id?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_request_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "rental_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_requests: {
        Row: {
          additional_notes: string | null
          authorization_document_url: string | null
          availability_checked_at: string | null
          availability_checked_by: string | null
          availability_confirmed: boolean | null
          base_amount: number | null
          catering_required: boolean | null
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at: string | null
          currency: string | null
          end_date: string
          equipment_amount: number | null
          equipment_needs: string[] | null
          event_description: string | null
          event_title: string
          event_type: string
          expected_participants: number | null
          id: string
          insurance_confirmed: boolean | null
          insurance_document_url: string | null
          organization_address: string | null
          organization_name: string
          organization_type: string
          program_document_url: string | null
          rejection_reason: string | null
          rental_duration_type: string | null
          request_number: string
          reviewed_at: string | null
          reviewed_by: string | null
          services_amount: number | null
          space_id: string | null
          start_date: string
          status: string | null
          technical_support_required: boolean | null
          terms_accepted: boolean | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
          validation_notes: string | null
        }
        Insert: {
          additional_notes?: string | null
          authorization_document_url?: string | null
          availability_checked_at?: string | null
          availability_checked_by?: string | null
          availability_confirmed?: boolean | null
          base_amount?: number | null
          catering_required?: boolean | null
          contact_email: string
          contact_person: string
          contact_phone: string
          created_at?: string | null
          currency?: string | null
          end_date: string
          equipment_amount?: number | null
          equipment_needs?: string[] | null
          event_description?: string | null
          event_title: string
          event_type: string
          expected_participants?: number | null
          id?: string
          insurance_confirmed?: boolean | null
          insurance_document_url?: string | null
          organization_address?: string | null
          organization_name: string
          organization_type: string
          program_document_url?: string | null
          rejection_reason?: string | null
          rental_duration_type?: string | null
          request_number: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          services_amount?: number | null
          space_id?: string | null
          start_date: string
          status?: string | null
          technical_support_required?: boolean | null
          terms_accepted?: boolean | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          validation_notes?: string | null
        }
        Update: {
          additional_notes?: string | null
          authorization_document_url?: string | null
          availability_checked_at?: string | null
          availability_checked_by?: string | null
          availability_confirmed?: boolean | null
          base_amount?: number | null
          catering_required?: boolean | null
          contact_email?: string
          contact_person?: string
          contact_phone?: string
          created_at?: string | null
          currency?: string | null
          end_date?: string
          equipment_amount?: number | null
          equipment_needs?: string[] | null
          event_description?: string | null
          event_title?: string
          event_type?: string
          expected_participants?: number | null
          id?: string
          insurance_confirmed?: boolean | null
          insurance_document_url?: string | null
          organization_address?: string | null
          organization_name?: string
          organization_type?: string
          program_document_url?: string | null
          rejection_reason?: string | null
          rental_duration_type?: string | null
          request_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          services_amount?: number | null
          space_id?: string | null
          start_date?: string
          status?: string | null
          technical_support_required?: boolean | null
          terms_accepted?: boolean | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_requests_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "rental_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_spaces: {
        Row: {
          availability_schedule: Json | null
          capacity: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          equipment: string[] | null
          full_day_rate: number | null
          half_day_rate: number | null
          hourly_rate: number | null
          id: string
          images: string[] | null
          is_active: boolean | null
          location: string | null
          rules: string | null
          space_code: string
          space_name: string
          space_name_ar: string | null
          updated_at: string | null
        }
        Insert: {
          availability_schedule?: Json | null
          capacity?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          equipment?: string[] | null
          full_day_rate?: number | null
          half_day_rate?: number | null
          hourly_rate?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          location?: string | null
          rules?: string | null
          space_code: string
          space_name: string
          space_name_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_schedule?: Json | null
          capacity?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          equipment?: string[] | null
          full_day_rate?: number | null
          half_day_rate?: number | null
          hourly_rate?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          location?: string | null
          rules?: string | null
          space_code?: string
          space_name?: string
          space_name_ar?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reproduction_items: {
        Row: {
          color_mode: string | null
          content_id: string | null
          created_at: string | null
          document_source_id: string | null
          document_source_type: string | null
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
          unified_document_id: string | null
          unit_price: number | null
        }
        Insert: {
          color_mode?: string | null
          content_id?: string | null
          created_at?: string | null
          document_source_id?: string | null
          document_source_type?: string | null
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
          unified_document_id?: string | null
          unit_price?: number | null
        }
        Update: {
          color_mode?: string | null
          content_id?: string | null
          created_at?: string | null
          document_source_id?: string | null
          document_source_type?: string | null
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
          unified_document_id?: string | null
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
          {
            foreignKeyName: "reproduction_items_unified_document_id_fkey"
            columns: ["unified_document_id"]
            isOneToOne: false
            referencedRelation: "unified_document_index"
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
          accounting_validated_at: string | null
          accounting_validation_notes: string | null
          accounting_validator_id: string | null
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
          accounting_validated_at?: string | null
          accounting_validation_notes?: string | null
          accounting_validator_id?: string | null
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
          accounting_validated_at?: string | null
          accounting_validation_notes?: string | null
          accounting_validator_id?: string | null
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
      reservations_ouvrages: {
        Row: {
          admin_comments: string | null
          allow_physical_consultation: boolean
          archived_by: string | null
          comments: string | null
          copy_id: string | null
          created_at: string
          date_archivage: string | null
          date_refus: string | null
          date_validation: string | null
          document_author: string | null
          document_cote: string | null
          document_id: string
          document_title: string
          document_year: string | null
          id: string
          is_free_access: boolean
          is_student_pfe: boolean | null
          motif: string | null
          pfe_proof_url: string | null
          pfe_theme: string | null
          processed_at: string | null
          processed_by: string | null
          reason_refus: string | null
          refused_by: string | null
          request_physical: boolean
          requested_date: string | null
          routed_to: string
          statut: string
          support_status: string
          support_type: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string
          user_phone: string | null
          user_type: string | null
          validated_by: string | null
        }
        Insert: {
          admin_comments?: string | null
          allow_physical_consultation?: boolean
          archived_by?: string | null
          comments?: string | null
          copy_id?: string | null
          created_at?: string
          date_archivage?: string | null
          date_refus?: string | null
          date_validation?: string | null
          document_author?: string | null
          document_cote?: string | null
          document_id: string
          document_title: string
          document_year?: string | null
          id?: string
          is_free_access?: boolean
          is_student_pfe?: boolean | null
          motif?: string | null
          pfe_proof_url?: string | null
          pfe_theme?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason_refus?: string | null
          refused_by?: string | null
          request_physical?: boolean
          requested_date?: string | null
          routed_to: string
          statut?: string
          support_status: string
          support_type: string
          updated_at?: string
          user_email: string
          user_id?: string | null
          user_name: string
          user_phone?: string | null
          user_type?: string | null
          validated_by?: string | null
        }
        Update: {
          admin_comments?: string | null
          allow_physical_consultation?: boolean
          archived_by?: string | null
          comments?: string | null
          copy_id?: string | null
          created_at?: string
          date_archivage?: string | null
          date_refus?: string | null
          date_validation?: string | null
          document_author?: string | null
          document_cote?: string | null
          document_id?: string
          document_title?: string
          document_year?: string | null
          id?: string
          is_free_access?: boolean
          is_student_pfe?: boolean | null
          motif?: string | null
          pfe_proof_url?: string | null
          pfe_theme?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason_refus?: string | null
          refused_by?: string | null
          request_physical?: boolean
          requested_date?: string | null
          routed_to?: string
          statut?: string
          support_status?: string
          support_type?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
          user_phone?: string | null
          user_type?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_ouvrages_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "document_copies"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations_requests: {
        Row: {
          admin_comments: string | null
          comments: string | null
          created_at: string
          document_cote: string | null
          document_id: string
          document_status: string | null
          document_title: string
          id: string
          requested_date: string
          requested_time: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          admin_comments?: string | null
          comments?: string | null
          created_at?: string
          document_cote?: string | null
          document_id: string
          document_status?: string | null
          document_title: string
          id?: string
          requested_date: string
          requested_time: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          admin_comments?: string | null
          comments?: string | null
          created_at?: string
          document_cote?: string | null
          document_id?: string
          document_status?: string | null
          document_title?: string
          id?: string
          requested_date?: string
          requested_time?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      reserved_number_ranges: {
        Row: {
          created_at: string | null
          current_position: string
          deposit_type: string
          id: string
          notes: string | null
          number_type: string
          range_end: string
          range_start: string
          requester_email: string | null
          requester_id: string | null
          requester_name: string | null
          reserved_by: string | null
          status: string | null
          total_numbers: number
          updated_at: string | null
          used_numbers: number | null
          used_numbers_list: string[] | null
        }
        Insert: {
          created_at?: string | null
          current_position: string
          deposit_type: string
          id?: string
          notes?: string | null
          number_type: string
          range_end: string
          range_start: string
          requester_email?: string | null
          requester_id?: string | null
          requester_name?: string | null
          reserved_by?: string | null
          status?: string | null
          total_numbers: number
          updated_at?: string | null
          used_numbers?: number | null
          used_numbers_list?: string[] | null
        }
        Update: {
          created_at?: string | null
          current_position?: string
          deposit_type?: string
          id?: string
          notes?: string | null
          number_type?: string
          range_end?: string
          range_start?: string
          requester_email?: string | null
          requester_id?: string | null
          requester_name?: string | null
          reserved_by?: string | null
          status?: string | null
          total_numbers?: number
          updated_at?: string | null
          used_numbers?: number | null
          used_numbers_list?: string[] | null
        }
        Relationships: []
      }
      restoration_documents: {
        Row: {
          created_at: string
          document_name: string | null
          document_type: string
          document_url: string
          id: string
          notes: string | null
          request_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          document_name?: string | null
          document_type: string
          document_url: string
          id?: string
          notes?: string | null
          request_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          document_name?: string | null
          document_type?: string
          document_url?: string
          id?: string
          notes?: string | null
          request_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "restoration_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "restoration_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      restoration_notifications: {
        Row: {
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
            foreignKeyName: "restoration_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "restoration_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      restoration_request_history: {
        Row: {
          changed_at: string
          changed_by: string
          created_at: string
          id: string
          new_status: string
          notes: string | null
          previous_status: string
          request_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          previous_status: string
          request_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restoration_request_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "restoration_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      restoration_requests: {
        Row: {
          actual_cost: number | null
          actual_duration: number | null
          artwork_condition_at_reception: string | null
          artwork_received_at: string | null
          artwork_received_by: string | null
          artwork_returned_at: string | null
          artwork_returned_by: string | null
          assigned_restorer: string | null
          authorization_document_url: string | null
          completed_at: string | null
          conservation_state: string | null
          created_at: string
          damage_description: string
          diagnosis_completed_at: string | null
          diagnosis_completed_by: string | null
          diagnosis_document_url: string | null
          diagnosis_photos_before: Json | null
          diagnosis_report: string | null
          director_approval_at: string | null
          director_approval_id: string | null
          director_approval_notes: string | null
          director_rejection_reason: string | null
          estimated_cost: number | null
          estimated_duration: number | null
          final_condition: string | null
          id: string
          identified_damages: string | null
          initial_condition: string | null
          invoice_document_url: string | null
          invoice_number: string | null
          manuscript_cote: string
          manuscript_title: string
          materials_used: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_validated_by: string | null
          quote_accepted_at: string | null
          quote_amount: number | null
          quote_document_url: string | null
          quote_issued_at: string | null
          quote_rejected_at: string | null
          quote_rejection_reason: string | null
          reception_document_url: string | null
          recommendations: string | null
          recommended_works: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          request_number: string
          required_materials: string | null
          restoration_completed_by: string | null
          restoration_photos_after: Json | null
          restoration_report: string | null
          restoration_report_document_url: string | null
          restoration_started_at: string | null
          return_document_url: string | null
          return_notes: string | null
          signed_quote_url: string | null
          started_at: string | null
          status: string
          submitted_at: string
          techniques_applied: string | null
          updated_at: string
          urgency_level: string
          user_id: string
          user_notes: string | null
          validated_at: string | null
          validated_by: string | null
          validation_notes: string | null
          works_performed: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_duration?: number | null
          artwork_condition_at_reception?: string | null
          artwork_received_at?: string | null
          artwork_received_by?: string | null
          artwork_returned_at?: string | null
          artwork_returned_by?: string | null
          assigned_restorer?: string | null
          authorization_document_url?: string | null
          completed_at?: string | null
          conservation_state?: string | null
          created_at?: string
          damage_description: string
          diagnosis_completed_at?: string | null
          diagnosis_completed_by?: string | null
          diagnosis_document_url?: string | null
          diagnosis_photos_before?: Json | null
          diagnosis_report?: string | null
          director_approval_at?: string | null
          director_approval_id?: string | null
          director_approval_notes?: string | null
          director_rejection_reason?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          final_condition?: string | null
          id?: string
          identified_damages?: string | null
          initial_condition?: string | null
          invoice_document_url?: string | null
          invoice_number?: string | null
          manuscript_cote: string
          manuscript_title: string
          materials_used?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_validated_by?: string | null
          quote_accepted_at?: string | null
          quote_amount?: number | null
          quote_document_url?: string | null
          quote_issued_at?: string | null
          quote_rejected_at?: string | null
          quote_rejection_reason?: string | null
          reception_document_url?: string | null
          recommendations?: string | null
          recommended_works?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_number: string
          required_materials?: string | null
          restoration_completed_by?: string | null
          restoration_photos_after?: Json | null
          restoration_report?: string | null
          restoration_report_document_url?: string | null
          restoration_started_at?: string | null
          return_document_url?: string | null
          return_notes?: string | null
          signed_quote_url?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string
          techniques_applied?: string | null
          updated_at?: string
          urgency_level: string
          user_id: string
          user_notes?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          works_performed?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_duration?: number | null
          artwork_condition_at_reception?: string | null
          artwork_received_at?: string | null
          artwork_received_by?: string | null
          artwork_returned_at?: string | null
          artwork_returned_by?: string | null
          assigned_restorer?: string | null
          authorization_document_url?: string | null
          completed_at?: string | null
          conservation_state?: string | null
          created_at?: string
          damage_description?: string
          diagnosis_completed_at?: string | null
          diagnosis_completed_by?: string | null
          diagnosis_document_url?: string | null
          diagnosis_photos_before?: Json | null
          diagnosis_report?: string | null
          director_approval_at?: string | null
          director_approval_id?: string | null
          director_approval_notes?: string | null
          director_rejection_reason?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          final_condition?: string | null
          id?: string
          identified_damages?: string | null
          initial_condition?: string | null
          invoice_document_url?: string | null
          invoice_number?: string | null
          manuscript_cote?: string
          manuscript_title?: string
          materials_used?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_validated_by?: string | null
          quote_accepted_at?: string | null
          quote_amount?: number | null
          quote_document_url?: string | null
          quote_issued_at?: string | null
          quote_rejected_at?: string | null
          quote_rejection_reason?: string | null
          reception_document_url?: string | null
          recommendations?: string | null
          recommended_works?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_number?: string
          required_materials?: string | null
          restoration_completed_by?: string | null
          restoration_photos_after?: Json | null
          restoration_report?: string | null
          restoration_report_document_url?: string | null
          restoration_started_at?: string | null
          return_document_url?: string | null
          return_notes?: string | null
          signed_quote_url?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string
          techniques_applied?: string | null
          updated_at?: string
          urgency_level?: string
          user_id?: string
          user_notes?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
          works_performed?: string | null
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
      service_health_logs: {
        Row: {
          checked_at: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          service_type: string
          status: string
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          service_type?: string
          status?: string
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          service_type?: string
          status?: string
          status_code?: number | null
        }
        Relationships: []
      }
      service_registrations: {
        Row: {
          created_at: string | null
          id: string
          is_paid: boolean | null
          processed_at: string | null
          processed_by: string | null
          registration_data: Json
          rejection_reason: string | null
          service_id: string
          status: string
          subscription_id: string | null
          tariff_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          registration_data?: Json
          rejection_reason?: string | null
          service_id: string
          status?: string
          subscription_id?: string | null
          tariff_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          registration_data?: Json
          rejection_reason?: string | null
          service_id?: string
          status?: string
          subscription_id?: string | null
          tariff_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_registrations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "bnrm_services"
            referencedColumns: ["id_service"]
          },
          {
            foreignKeyName: "service_registrations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "service_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_registrations_tariff_id_fkey"
            columns: ["tariff_id"]
            isOneToOne: false
            referencedRelation: "bnrm_tarifs"
            referencedColumns: ["id_tarif"]
          },
        ]
      }
      service_subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean | null
          cancelled_at: string | null
          created_at: string | null
          currency: string
          end_date: string
          id: string
          metadata: Json | null
          payment_status: string
          service_id: string
          start_date: string
          status: string
          subscription_type: string
          tariff_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_renew?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          end_date: string
          id?: string
          metadata?: Json | null
          payment_status?: string
          service_id: string
          start_date?: string
          status?: string
          subscription_type: string
          tariff_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_renew?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          end_date?: string
          id?: string
          metadata?: Json | null
          payment_status?: string
          service_id?: string
          start_date?: string
          status?: string
          subscription_type?: string
          tariff_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_subscriptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "bnrm_services"
            referencedColumns: ["id_service"]
          },
          {
            foreignKeyName: "service_subscriptions_tariff_id_fkey"
            columns: ["tariff_id"]
            isOneToOne: false
            referencedRelation: "bnrm_tarifs"
            referencedColumns: ["id_tarif"]
          },
        ]
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
      sigb_duplicate_cases: {
        Row: {
          created_at: string
          existing_document_id: string | null
          id: string
          match_fields: Json | null
          match_score: number | null
          match_type: string
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          run_id: string | null
          source_data: Json | null
          source_record_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          existing_document_id?: string | null
          id?: string
          match_fields?: Json | null
          match_score?: number | null
          match_type: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string | null
          source_data?: Json | null
          source_record_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          existing_document_id?: string | null
          id?: string
          match_fields?: Json | null
          match_score?: number | null
          match_type?: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string | null
          source_data?: Json | null
          source_record_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sigb_duplicate_cases_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sigb_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sigb_duplicate_events: {
        Row: {
          action: string
          case_id: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          case_id: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          case_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sigb_duplicate_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "sigb_duplicate_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      sigb_duplicate_settings: {
        Row: {
          auto_merge_threshold: number | null
          auto_reject_threshold: number | null
          created_at: string
          fuzzy_match_enabled: boolean | null
          id: string
          is_active: boolean | null
          match_fields: Json | null
          match_strategy: string
          similarity_algorithm: string | null
          updated_at: string
        }
        Insert: {
          auto_merge_threshold?: number | null
          auto_reject_threshold?: number | null
          created_at?: string
          fuzzy_match_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          match_fields?: Json | null
          match_strategy?: string
          similarity_algorithm?: string | null
          updated_at?: string
        }
        Update: {
          auto_merge_threshold?: number | null
          auto_reject_threshold?: number | null
          created_at?: string
          fuzzy_match_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          match_fields?: Json | null
          match_strategy?: string
          similarity_algorithm?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sigb_metadata_mapping: {
        Row: {
          config_id: string | null
          created_at: string
          default_value: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          sort_order: number | null
          source_field: string
          target_field: string
          transformation_rule: string | null
          updated_at: string
        }
        Insert: {
          config_id?: string | null
          created_at?: string
          default_value?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          sort_order?: number | null
          source_field: string
          target_field: string
          transformation_rule?: string | null
          updated_at?: string
        }
        Update: {
          config_id?: string | null
          created_at?: string
          default_value?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          sort_order?: number | null
          source_field?: string
          target_field?: string
          transformation_rule?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sigb_metadata_mapping_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "sigb_sync_config"
            referencedColumns: ["id"]
          },
        ]
      }
      sigb_sync_config: {
        Row: {
          api_endpoint_path: string | null
          api_key_header: string | null
          api_key_value: string | null
          auth_type: string | null
          basic_auth_password: string | null
          basic_auth_username: string | null
          bearer_token: string | null
          created_at: string
          created_by: string | null
          custom_headers: Json | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          last_sync_records_count: number | null
          last_sync_status: string | null
          name: string
          next_sync_at: string | null
          request_timeout_seconds: number | null
          response_format: string | null
          sigb_url: string
          sync_day_of_month: number | null
          sync_day_of_week: number | null
          sync_frequency: string | null
          sync_time: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint_path?: string | null
          api_key_header?: string | null
          api_key_value?: string | null
          auth_type?: string | null
          basic_auth_password?: string | null
          basic_auth_username?: string | null
          bearer_token?: string | null
          created_at?: string
          created_by?: string | null
          custom_headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_records_count?: number | null
          last_sync_status?: string | null
          name: string
          next_sync_at?: string | null
          request_timeout_seconds?: number | null
          response_format?: string | null
          sigb_url: string
          sync_day_of_month?: number | null
          sync_day_of_week?: number | null
          sync_frequency?: string | null
          sync_time?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint_path?: string | null
          api_key_header?: string | null
          api_key_value?: string | null
          auth_type?: string | null
          basic_auth_password?: string | null
          basic_auth_username?: string | null
          bearer_token?: string | null
          created_at?: string
          created_by?: string | null
          custom_headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          last_sync_records_count?: number | null
          last_sync_status?: string | null
          name?: string
          next_sync_at?: string | null
          request_timeout_seconds?: number | null
          response_format?: string | null
          sigb_url?: string
          sync_day_of_month?: number | null
          sync_day_of_week?: number | null
          sync_frequency?: string | null
          sync_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sigb_sync_history: {
        Row: {
          config_id: string
          details: Json | null
          error_message: string | null
          id: string
          records_failed: number | null
          records_imported: number | null
          records_updated: number | null
          status: string
          sync_completed_at: string | null
          sync_started_at: string
        }
        Insert: {
          config_id: string
          details?: Json | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_imported?: number | null
          records_updated?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Update: {
          config_id?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_imported?: number | null
          records_updated?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sigb_sync_history_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "sigb_sync_config"
            referencedColumns: ["id"]
          },
        ]
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
      sigb_sync_rejections: {
        Row: {
          can_retry: boolean | null
          created_at: string
          id: string
          rejection_details: Json | null
          rejection_reason: string
          run_id: string | null
          source_data: Json | null
          source_record_id: string
        }
        Insert: {
          can_retry?: boolean | null
          created_at?: string
          id?: string
          rejection_details?: Json | null
          rejection_reason: string
          run_id?: string | null
          source_data?: Json | null
          source_record_id: string
        }
        Update: {
          can_retry?: boolean | null
          created_at?: string
          id?: string
          rejection_details?: Json | null
          rejection_reason?: string
          run_id?: string | null
          source_data?: Json | null
          source_record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sigb_sync_rejections_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sigb_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sigb_sync_run_items: {
        Row: {
          created_at: string
          document_id: string | null
          error_message: string | null
          id: string
          mapped_data: Json | null
          processed_at: string | null
          run_id: string
          source_data: Json | null
          source_record_id: string
          status: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          error_message?: string | null
          id?: string
          mapped_data?: Json | null
          processed_at?: string | null
          run_id: string
          source_data?: Json | null
          source_record_id: string
          status?: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          error_message?: string | null
          id?: string
          mapped_data?: Json | null
          processed_at?: string | null
          run_id?: string
          source_data?: Json | null
          source_record_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sigb_sync_run_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sigb_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sigb_sync_runs: {
        Row: {
          completed_at: string | null
          config_id: string | null
          created_at: string
          created_records: number | null
          duplicate_records: number | null
          error_message: string | null
          failed_records: number | null
          id: string
          processed_records: number | null
          run_type: string | null
          skipped_records: number | null
          started_at: string
          status: string
          total_records: number | null
          triggered_by: string | null
          updated_records: number | null
        }
        Insert: {
          completed_at?: string | null
          config_id?: string | null
          created_at?: string
          created_records?: number | null
          duplicate_records?: number | null
          error_message?: string | null
          failed_records?: number | null
          id?: string
          processed_records?: number | null
          run_type?: string | null
          skipped_records?: number | null
          started_at?: string
          status?: string
          total_records?: number | null
          triggered_by?: string | null
          updated_records?: number | null
        }
        Update: {
          completed_at?: string | null
          config_id?: string | null
          created_at?: string
          created_records?: number | null
          duplicate_records?: number | null
          error_message?: string | null
          failed_records?: number | null
          id?: string
          processed_records?: number | null
          run_type?: string | null
          skipped_records?: number | null
          started_at?: string
          status?: string
          total_records?: number | null
          triggered_by?: string | null
          updated_records?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sigb_sync_runs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "sigb_sync_config"
            referencedColumns: ["id"]
          },
        ]
      }
      space_availabilities: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: string
          is_available: boolean
          notes: string | null
          space_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          is_available?: boolean
          notes?: string | null
          space_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean
          notes?: string | null
          space_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_availabilities_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "rental_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_availability: {
        Row: {
          booking_id: string | null
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          is_blocked: boolean | null
          reason: string | null
          space_id: string
          start_date: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          is_blocked?: boolean | null
          reason?: string | null
          space_id: string
          start_date: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          is_blocked?: boolean | null
          reason?: string | null
          space_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_availability_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_availability_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "cultural_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_equipment: {
        Row: {
          additional_cost: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_included: boolean | null
          name: string
        }
        Insert: {
          additional_cost?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_included?: boolean | null
          name: string
        }
        Update: {
          additional_cost?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_included?: boolean | null
          name?: string
        }
        Relationships: []
      }
      space_services: {
        Row: {
          base_cost: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          service_type: string
          unit_type: string | null
        }
        Insert: {
          base_cost: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          service_type: string
          unit_type?: string | null
        }
        Update: {
          base_cost?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          service_type?: string
          unit_type?: string | null
        }
        Relationships: []
      }
      space_tariffs: {
        Row: {
          base_price: number
          cleaning_cost: number | null
          created_at: string | null
          currency: string | null
          duration_type: string
          electricity_cost: number | null
          id: string
          is_active: boolean | null
          organization_type: string
          space_id: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          cleaning_cost?: number | null
          created_at?: string | null
          currency?: string | null
          duration_type: string
          electricity_cost?: number | null
          id?: string
          is_active?: boolean | null
          organization_type: string
          space_id: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          cleaning_cost?: number | null
          created_at?: string | null
          currency?: string | null
          duration_type?: string
          electricity_cost?: number | null
          id?: string
          is_active?: boolean | null
          organization_type?: string
          space_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "space_tariffs_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "cultural_spaces"
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
      system_list_values: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          list_id: string
          metadata: Json | null
          parent_code: string | null
          parent_value_id: string | null
          sort_order: number | null
          updated_at: string | null
          value_code: string
          value_label: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          list_id: string
          metadata?: Json | null
          parent_code?: string | null
          parent_value_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          value_code: string
          value_label: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          list_id?: string
          metadata?: Json | null
          parent_code?: string | null
          parent_value_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          value_code?: string
          value_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_list_values_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "system_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_list_values_parent_value_id_fkey"
            columns: ["parent_value_id"]
            isOneToOne: false
            referencedRelation: "system_list_values"
            referencedColumns: ["id"]
          },
        ]
      }
      system_lists: {
        Row: {
          created_at: string | null
          depends_on_parent_value: boolean | null
          description: string | null
          field_type: string | null
          form_name: string | null
          id: string
          is_active: boolean | null
          is_hierarchical: boolean | null
          list_code: string
          list_name: string
          module: string | null
          parent_list_id: string | null
          platform: string | null
          portal: string | null
          service: string | null
          sub_service: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          depends_on_parent_value?: boolean | null
          description?: string | null
          field_type?: string | null
          form_name?: string | null
          id?: string
          is_active?: boolean | null
          is_hierarchical?: boolean | null
          list_code: string
          list_name: string
          module?: string | null
          parent_list_id?: string | null
          platform?: string | null
          portal?: string | null
          service?: string | null
          sub_service?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          depends_on_parent_value?: boolean | null
          description?: string | null
          field_type?: string | null
          form_name?: string | null
          id?: string
          is_active?: boolean | null
          is_hierarchical?: boolean | null
          list_code?: string
          list_name?: string
          module?: string | null
          parent_list_id?: string | null
          platform?: string | null
          portal?: string | null
          service?: string | null
          sub_service?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_lists_parent_list_id_fkey"
            columns: ["parent_list_id"]
            isOneToOne: false
            referencedRelation: "system_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      system_modules: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          platform: string
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          platform: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          platform?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          limits: Json | null
          permissions: Json | null
          role_category: string
          role_code: string
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          permissions?: Json | null
          role_category: string
          role_code: string
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          permissions?: Json | null
          role_category?: string
          role_code?: string
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_services: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          module_id: string | null
          name: string
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          name: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          name?: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_services_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      tariff_conditional_rules: {
        Row: {
          condition_type: string
          condition_value: Json
          created_at: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          priority: number | null
          rule_name: string
          tariff_id: string
        }
        Insert: {
          condition_type: string
          condition_value?: Json
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name: string
          tariff_id: string
        }
        Update: {
          condition_type?: string
          condition_value?: Json
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name?: string
          tariff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tariff_conditional_rules_tariff_id_fkey"
            columns: ["tariff_id"]
            isOneToOne: false
            referencedRelation: "cultural_activity_tariffs"
            referencedColumns: ["id"]
          },
        ]
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
      ui_translations: {
        Row: {
          amz: string | null
          ar: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          en: string | null
          es: string | null
          fr: string | null
          id: string
          is_active: boolean | null
          source: string
          translation_key: string
          updated_at: string | null
        }
        Insert: {
          amz?: string | null
          ar?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          en?: string | null
          es?: string | null
          fr?: string | null
          id?: string
          is_active?: boolean | null
          source?: string
          translation_key: string
          updated_at?: string | null
        }
        Update: {
          amz?: string | null
          ar?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          en?: string | null
          es?: string | null
          fr?: string | null
          id?: string
          is_active?: boolean | null
          source?: string
          translation_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      unified_document_index: {
        Row: {
          access_level: string | null
          author: string | null
          author_ar: string | null
          cote: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          dewey_classification: string | null
          digital_url: string | null
          document_type: string | null
          id: string
          is_available_for_reproduction: boolean | null
          is_digitized: boolean | null
          keywords: string[] | null
          language: string | null
          last_sync_at: string | null
          pages_count: number | null
          physical_description: string | null
          publication_year: number | null
          publisher: string | null
          source_id: string
          source_type: string
          subject_headings: string[] | null
          title: string
          title_ar: string | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          author?: string | null
          author_ar?: string | null
          cote?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          dewey_classification?: string | null
          digital_url?: string | null
          document_type?: string | null
          id?: string
          is_available_for_reproduction?: boolean | null
          is_digitized?: boolean | null
          keywords?: string[] | null
          language?: string | null
          last_sync_at?: string | null
          pages_count?: number | null
          physical_description?: string | null
          publication_year?: number | null
          publisher?: string | null
          source_id: string
          source_type: string
          subject_headings?: string[] | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          author?: string | null
          author_ar?: string | null
          cote?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          dewey_classification?: string | null
          digital_url?: string | null
          document_type?: string | null
          id?: string
          is_available_for_reproduction?: boolean | null
          is_digitized?: boolean | null
          keywords?: string[] | null
          language?: string | null
          last_sync_at?: string | null
          pages_count?: number | null
          physical_description?: string | null
          publication_year?: number | null
          publisher?: string | null
          source_id?: string
          source_type?: string
          subject_headings?: string[] | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      unread_messages: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unread_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unread_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
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
      user_roles: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_system_roles: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role_id: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role_id: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_system_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "system_roles"
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
      vexpo_artworks: {
        Row: {
          artwork_type: string | null
          created_at: string | null
          created_by: string | null
          creation_date: string | null
          creator_author: string | null
          description_ar: string | null
          description_fr: string | null
          external_catalog_url: string | null
          id: string
          images: Json | null
          inventory_id: string | null
          is_active: boolean | null
          keywords: string[] | null
          show_visit_cta: boolean | null
          title_ar: string | null
          title_fr: string
          updated_at: string | null
          updated_by: string | null
          visit_cta_text_ar: string | null
          visit_cta_text_fr: string | null
        }
        Insert: {
          artwork_type?: string | null
          created_at?: string | null
          created_by?: string | null
          creation_date?: string | null
          creator_author?: string | null
          description_ar?: string | null
          description_fr?: string | null
          external_catalog_url?: string | null
          id?: string
          images?: Json | null
          inventory_id?: string | null
          is_active?: boolean | null
          keywords?: string[] | null
          show_visit_cta?: boolean | null
          title_ar?: string | null
          title_fr: string
          updated_at?: string | null
          updated_by?: string | null
          visit_cta_text_ar?: string | null
          visit_cta_text_fr?: string | null
        }
        Update: {
          artwork_type?: string | null
          created_at?: string | null
          created_by?: string | null
          creation_date?: string | null
          creator_author?: string | null
          description_ar?: string | null
          description_fr?: string | null
          external_catalog_url?: string | null
          id?: string
          images?: Json | null
          inventory_id?: string | null
          is_active?: boolean | null
          keywords?: string[] | null
          show_visit_cta?: boolean | null
          title_ar?: string | null
          title_fr?: string
          updated_at?: string | null
          updated_by?: string | null
          visit_cta_text_ar?: string | null
          visit_cta_text_fr?: string | null
        }
        Relationships: []
      }
      vexpo_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_title: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["vexpo_role"] | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_title?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["vexpo_role"] | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_title?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["vexpo_role"] | null
        }
        Relationships: []
      }
      vexpo_exhibitions: {
        Row: {
          archived_at: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          cta_title_ar: string | null
          cta_title_fr: string | null
          end_date: string | null
          id: string
          intro_ar: string | null
          intro_fr: string | null
          location_text_ar: string | null
          location_text_fr: string | null
          map_link: string | null
          meta_description_ar: string | null
          meta_description_fr: string | null
          meta_title_ar: string | null
          meta_title_fr: string | null
          opening_hours_ar: string | null
          opening_hours_fr: string | null
          primary_button_label_ar: string | null
          primary_button_label_fr: string | null
          published_at: string | null
          published_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["vexpo_status"]
          submitted_at: string | null
          teaser_ar: string | null
          teaser_fr: string | null
          title_ar: string | null
          title_fr: string
          updated_at: string | null
          visitor_count: number | null
        }
        Insert: {
          archived_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          cta_title_ar?: string | null
          cta_title_fr?: string | null
          end_date?: string | null
          id?: string
          intro_ar?: string | null
          intro_fr?: string | null
          location_text_ar?: string | null
          location_text_fr?: string | null
          map_link?: string | null
          meta_description_ar?: string | null
          meta_description_fr?: string | null
          meta_title_ar?: string | null
          meta_title_fr?: string | null
          opening_hours_ar?: string | null
          opening_hours_fr?: string | null
          primary_button_label_ar?: string | null
          primary_button_label_fr?: string | null
          published_at?: string | null
          published_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["vexpo_status"]
          submitted_at?: string | null
          teaser_ar?: string | null
          teaser_fr?: string | null
          title_ar?: string | null
          title_fr: string
          updated_at?: string | null
          visitor_count?: number | null
        }
        Update: {
          archived_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          cta_title_ar?: string | null
          cta_title_fr?: string | null
          end_date?: string | null
          id?: string
          intro_ar?: string | null
          intro_fr?: string | null
          location_text_ar?: string | null
          location_text_fr?: string | null
          map_link?: string | null
          meta_description_ar?: string | null
          meta_description_fr?: string | null
          meta_title_ar?: string | null
          meta_title_fr?: string | null
          opening_hours_ar?: string | null
          opening_hours_fr?: string | null
          primary_button_label_ar?: string | null
          primary_button_label_fr?: string | null
          published_at?: string | null
          published_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["vexpo_status"]
          submitted_at?: string | null
          teaser_ar?: string | null
          teaser_fr?: string | null
          title_ar?: string | null
          title_fr?: string
          updated_at?: string | null
          visitor_count?: number | null
        }
        Relationships: []
      }
      vexpo_hotspots: {
        Row: {
          artwork_id: string | null
          caption_ar: string | null
          caption_fr: string | null
          created_at: string | null
          display_order: number | null
          hotspot_type: Database["public"]["Enums"]["vexpo_hotspot_type"]
          icon_color: string | null
          icon_name: string | null
          icon_size: number | null
          id: string
          is_active: boolean | null
          label_ar: string | null
          label_fr: string | null
          media_type: string | null
          media_url: string | null
          panorama_id: string
          pitch: number
          priority: number | null
          rich_text_ar: string | null
          rich_text_fr: string | null
          show_on_mobile: boolean | null
          target_panorama_id: string | null
          teleport_label_ar: string | null
          teleport_label_fr: string | null
          updated_at: string | null
          yaw: number
        }
        Insert: {
          artwork_id?: string | null
          caption_ar?: string | null
          caption_fr?: string | null
          created_at?: string | null
          display_order?: number | null
          hotspot_type: Database["public"]["Enums"]["vexpo_hotspot_type"]
          icon_color?: string | null
          icon_name?: string | null
          icon_size?: number | null
          id?: string
          is_active?: boolean | null
          label_ar?: string | null
          label_fr?: string | null
          media_type?: string | null
          media_url?: string | null
          panorama_id: string
          pitch: number
          priority?: number | null
          rich_text_ar?: string | null
          rich_text_fr?: string | null
          show_on_mobile?: boolean | null
          target_panorama_id?: string | null
          teleport_label_ar?: string | null
          teleport_label_fr?: string | null
          updated_at?: string | null
          yaw: number
        }
        Update: {
          artwork_id?: string | null
          caption_ar?: string | null
          caption_fr?: string | null
          created_at?: string | null
          display_order?: number | null
          hotspot_type?: Database["public"]["Enums"]["vexpo_hotspot_type"]
          icon_color?: string | null
          icon_name?: string | null
          icon_size?: number | null
          id?: string
          is_active?: boolean | null
          label_ar?: string | null
          label_fr?: string | null
          media_type?: string | null
          media_url?: string | null
          panorama_id?: string
          pitch?: number
          priority?: number | null
          rich_text_ar?: string | null
          rich_text_fr?: string | null
          show_on_mobile?: boolean | null
          target_panorama_id?: string | null
          teleport_label_ar?: string | null
          teleport_label_fr?: string | null
          updated_at?: string | null
          yaw?: number
        }
        Relationships: [
          {
            foreignKeyName: "vexpo_hotspots_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "vexpo_artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vexpo_hotspots_panorama_id_fkey"
            columns: ["panorama_id"]
            isOneToOne: false
            referencedRelation: "vexpo_panoramas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vexpo_hotspots_target_panorama_id_fkey"
            columns: ["target_panorama_id"]
            isOneToOne: false
            referencedRelation: "vexpo_panoramas"
            referencedColumns: ["id"]
          },
        ]
      }
      vexpo_panoramas: {
        Row: {
          auto_rotate: boolean | null
          created_at: string | null
          display_order: number
          exhibition_id: string
          id: string
          initial_pitch: number | null
          initial_yaw: number | null
          is_active: boolean | null
          max_zoom: number | null
          min_zoom: number | null
          name_ar: string | null
          name_fr: string
          panorama_image_url: string
          panorama_webp_url: string | null
          show_navigation_hints: boolean | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          auto_rotate?: boolean | null
          created_at?: string | null
          display_order?: number
          exhibition_id: string
          id?: string
          initial_pitch?: number | null
          initial_yaw?: number | null
          is_active?: boolean | null
          max_zoom?: number | null
          min_zoom?: number | null
          name_ar?: string | null
          name_fr: string
          panorama_image_url: string
          panorama_webp_url?: string | null
          show_navigation_hints?: boolean | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_rotate?: boolean | null
          created_at?: string | null
          display_order?: number
          exhibition_id?: string
          id?: string
          initial_pitch?: number | null
          initial_yaw?: number | null
          is_active?: boolean | null
          max_zoom?: number | null
          min_zoom?: number | null
          name_ar?: string | null
          name_fr?: string
          panorama_image_url?: string
          panorama_webp_url?: string | null
          show_navigation_hints?: boolean | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vexpo_panoramas_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "vexpo_exhibitions"
            referencedColumns: ["id"]
          },
        ]
      }
      vexpo_review_comments: {
        Row: {
          author_id: string | null
          author_name: string | null
          comment_text: string
          comment_type: string | null
          created_at: string | null
          exhibition_id: string
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          comment_text: string
          comment_type?: string | null
          created_at?: string | null
          exhibition_id: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          comment_text?: string
          comment_type?: string | null
          created_at?: string | null
          exhibition_id?: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vexpo_review_comments_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "vexpo_exhibitions"
            referencedColumns: ["id"]
          },
        ]
      }
      vexpo_user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["vexpo_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["vexpo_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["vexpo_role"]
          user_id?: string
        }
        Relationships: []
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
      visits_bookings: {
        Row: {
          commentaire: string | null
          confirmation_token: string | null
          created_at: string | null
          email: string
          id: string
          langue: string
          nb_visiteurs: number
          nom: string
          organisme: string | null
          slot_id: string
          statut: string
          telephone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          commentaire?: string | null
          confirmation_token?: string | null
          created_at?: string | null
          email: string
          id?: string
          langue: string
          nb_visiteurs: number
          nom: string
          organisme?: string | null
          slot_id: string
          statut?: string
          telephone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          commentaire?: string | null
          confirmation_token?: string | null
          created_at?: string | null
          email?: string
          id?: string
          langue?: string
          nb_visiteurs?: number
          nom?: string
          organisme?: string | null
          slot_id?: string
          statut?: string
          telephone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "visits_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      visits_slots: {
        Row: {
          capacite_max: number
          created_at: string | null
          date: string
          heure: string
          id: string
          langue: string
          reservations_actuelles: number
          statut: string
          updated_at: string | null
        }
        Insert: {
          capacite_max?: number
          created_at?: string | null
          date: string
          heure: string
          id?: string
          langue: string
          reservations_actuelles?: number
          statut?: string
          updated_at?: string | null
        }
        Update: {
          capacite_max?: number
          created_at?: string | null
          date?: string
          heure?: string
          id?: string
          langue?: string
          reservations_actuelles?: number
          statut?: string
          updated_at?: string | null
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
      webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_data: Json
          event_type: string
          headers: Json | null
          id: string
          processed_at: string | null
          signature_valid: boolean | null
          source_ip: string | null
          status: string
          webhook_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_data: Json
          event_type: string
          headers?: Json | null
          id?: string
          processed_at?: string | null
          signature_valid?: boolean | null
          source_ip?: string | null
          status: string
          webhook_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_data?: Json
          event_type?: string
          headers?: Json | null
          id?: string
          processed_at?: string | null
          signature_valid?: boolean | null
          source_ip?: string | null
          status?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "integration_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_definitions: {
        Row: {
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          diagram_data: Json | null
          id: string
          is_active: boolean | null
          module: string
          name: string
          updated_at: string | null
          version: number
          workflow_type: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          diagram_data?: Json | null
          id?: string
          is_active?: boolean | null
          module: string
          name: string
          updated_at?: string | null
          version?: number
          workflow_type: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          diagram_data?: Json | null
          id?: string
          is_active?: boolean | null
          module?: string
          name?: string
          updated_at?: string | null
          version?: number
          workflow_type?: string
        }
        Relationships: []
      }
      workflow_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          instance_id: string | null
          payload: Json
          processed_at: string | null
          retry_count: number | null
          source_module: string
          status: string | null
          target_module: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          instance_id?: string | null
          payload: Json
          processed_at?: string | null
          retry_count?: number | null
          source_module: string
          status?: string | null
          target_module?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          instance_id?: string | null
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          source_module?: string
          status?: string | null
          target_module?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_events_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_history: {
        Row: {
          action: string
          comments: string | null
          created_at: string | null
          from_step_id: string | null
          id: string
          instance_id: string | null
          metadata: Json | null
          performed_by: string | null
          result: string | null
          to_step_id: string | null
        }
        Insert: {
          action: string
          comments?: string | null
          created_at?: string | null
          from_step_id?: string | null
          id?: string
          instance_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
          result?: string | null
          to_step_id?: string | null
        }
        Update: {
          action?: string
          comments?: string | null
          created_at?: string | null
          from_step_id?: string | null
          id?: string
          instance_id?: string | null
          metadata?: Json | null
          performed_by?: string | null
          result?: string | null
          to_step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_history_from_step_id_fkey"
            columns: ["from_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_history_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_history_to_step_id_fkey"
            columns: ["to_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps_new"
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
          current_step_id: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          instance_number: string | null
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
          current_step_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          instance_number?: string | null
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
          current_step_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          instance_number?: string | null
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
            foreignKeyName: "workflow_instances_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps_new"
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
      workflow_integrations: {
        Row: {
          configuration: Json | null
          created_at: string | null
          endpoint_url: string | null
          event_types: string[] | null
          id: string
          integration_name: string
          is_active: boolean | null
          source_module: string
          target_module: string
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          endpoint_url?: string | null
          event_types?: string[] | null
          id?: string
          integration_name: string
          is_active?: boolean | null
          source_module: string
          target_module: string
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          endpoint_url?: string | null
          event_types?: string[] | null
          id?: string
          integration_name?: string
          is_active?: boolean | null
          source_module?: string
          target_module?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_metrics: {
        Row: {
          avg_completion_time_hours: number | null
          avg_step_duration_hours: number | null
          bottleneck_step_id: string | null
          completed_instances: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string | null
          rejected_instances: number | null
          total_instances: number | null
          workflow_id: string | null
        }
        Insert: {
          avg_completion_time_hours?: number | null
          avg_step_duration_hours?: number | null
          bottleneck_step_id?: string | null
          completed_instances?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string | null
          rejected_instances?: number | null
          total_instances?: number | null
          workflow_id?: string | null
        }
        Update: {
          avg_completion_time_hours?: number | null
          avg_step_duration_hours?: number | null
          bottleneck_step_id?: string | null
          completed_instances?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string | null
          rejected_instances?: number | null
          total_instances?: number | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_metrics_bottleneck_step_id_fkey"
            columns: ["bottleneck_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_metrics_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_notifications: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_notifications_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          permission_name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          permission_name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          permission_name?: string
        }
        Relationships: []
      }
      workflow_role_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string
          permission_id: string | null
          workflow_role_id: string | null
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string | null
          workflow_role_id?: string | null
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string | null
          workflow_role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "workflow_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_role_permissions_workflow_role_id_fkey"
            columns: ["workflow_role_id"]
            isOneToOne: false
            referencedRelation: "workflow_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          module: string
          permissions: Json | null
          role_level: string | null
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
          permissions?: Json | null
          role_level?: string | null
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
          permissions?: Json | null
          role_level?: string | null
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_step_executions: {
        Row: {
          action_taken: string | null
          assigned_to: string | null
          comments: string | null
          completed_at: string | null
          created_at: string | null
          deadline_at: string | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string
          step_id: string | null
          step_name: string
          step_number: number
          updated_at: string | null
          workflow_instance_id: string
        }
        Insert: {
          action_taken?: string | null
          assigned_to?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string | null
          deadline_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          step_id?: string | null
          step_name: string
          step_number: number
          updated_at?: string | null
          workflow_instance_id: string
        }
        Update: {
          action_taken?: string | null
          assigned_to?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string | null
          deadline_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          step_id?: string | null
          step_name?: string
          step_number?: number
          updated_at?: string | null
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_executions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_executions_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps_new: {
        Row: {
          action_type: string | null
          assigned_to: string | null
          auto_actions: Json | null
          conditions: Json | null
          created_at: string | null
          deadline_hours: number | null
          id: string
          notification_config: Json | null
          required_role: string | null
          step_name: string
          step_number: number
          step_type: string
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          action_type?: string | null
          assigned_to?: string | null
          auto_actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          deadline_hours?: number | null
          id?: string
          notification_config?: Json | null
          required_role?: string | null
          step_name: string
          step_number: number
          step_type: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          action_type?: string | null
          assigned_to?: string | null
          auto_actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          deadline_hours?: number | null
          id?: string
          notification_config?: Json | null
          required_role?: string | null
          step_name?: string
          step_number?: number
          step_type?: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_new_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_transitions: {
        Row: {
          condition_expression: Json | null
          created_at: string | null
          from_step_id: string | null
          id: string
          to_step_id: string | null
          transition_name: string
          trigger_type: string | null
          workflow_id: string | null
        }
        Insert: {
          condition_expression?: Json | null
          created_at?: string | null
          from_step_id?: string | null
          id?: string
          to_step_id?: string | null
          transition_name: string
          trigger_type?: string | null
          workflow_id?: string | null
        }
        Update: {
          condition_expression?: Json | null
          created_at?: string | null
          from_step_id?: string | null
          id?: string
          to_step_id?: string | null
          transition_name?: string
          trigger_type?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_transitions_from_step_id_fkey"
            columns: ["from_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_to_step_id_fkey"
            columns: ["to_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_user_roles: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          user_id: string | null
          workflow_role_id: string | null
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
          workflow_role_id?: string | null
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
          workflow_role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_user_roles_workflow_role_id_fkey"
            columns: ["workflow_role_id"]
            isOneToOne: false
            referencedRelation: "workflow_roles"
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
      kitab_publications: {
        Row: {
          author_name: string | null
          created_at: string | null
          dl_number: string | null
          id: string | null
          isbn: string | null
          ismn: string | null
          issn: string | null
          kitab_status: string | null
          language: string | null
          metadata: Json | null
          monograph_type: Database["public"]["Enums"]["monograph_type"] | null
          page_count: number | null
          publication_date: string | null
          publication_status: string | null
          request_number: string | null
          subtitle: string | null
          support_type: Database["public"]["Enums"]["support_type"] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          created_at?: string | null
          dl_number?: string | null
          id?: string | null
          isbn?: string | null
          ismn?: string | null
          issn?: string | null
          kitab_status?: string | null
          language?: string | null
          metadata?: Json | null
          monograph_type?: Database["public"]["Enums"]["monograph_type"] | null
          page_count?: number | null
          publication_date?: string | null
          publication_status?: string | null
          request_number?: string | null
          subtitle?: string | null
          support_type?: Database["public"]["Enums"]["support_type"] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          created_at?: string | null
          dl_number?: string | null
          id?: string | null
          isbn?: string | null
          ismn?: string | null
          issn?: string | null
          kitab_status?: string | null
          language?: string | null
          metadata?: Json | null
          monograph_type?: Database["public"]["Enums"]["monograph_type"] | null
          page_count?: number | null
          publication_date?: string | null
          publication_status?: string | null
          request_number?: string | null
          subtitle?: string | null
          support_type?: Database["public"]["Enums"]["support_type"] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
          role?: never
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
          role?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_health_summary: {
        Row: {
          checked_at: string | null
          response_time_ms: number | null
          rn: number | null
          service_name: string | null
          service_type: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      advance_booking_workflow: {
        Args: { p_booking_id: string; p_comment?: string; p_decision: string }
        Returns: Json
      }
      anonymize_ip: { Args: { ip_addr: unknown }; Returns: unknown }
      anonymize_user_agent: {
        Args: { user_agent_str: string }
        Returns: string
      }
      approve_professional_registration: {
        Args: { p_request_id: string; p_role: string }
        Returns: boolean
      }
      calculate_booking_tariff: {
        Args: {
          p_duration_type: string
          p_end_date: string
          p_organization_type: string
          p_space_id: string
          p_start_date: string
        }
        Returns: number
      }
      calculate_checksum: { Args: { content_data: string }; Returns: string }
      calculate_reproduction_total: {
        Args: { request_uuid: string }
        Returns: number
      }
      calculate_subscription_end_date: {
        Args: { p_start_date: string; p_subscription_type: string }
        Returns: string
      }
      can_access_legal_deposit_request:
        | {
            Args: {
              p_collaborator_id: string
              p_initiator_id: string
              p_user_id: string
            }
            Returns: boolean
          }
        | { Args: { p_request_id: string }; Returns: boolean }
      can_use_daily_pass: {
        Args: { p_service_id?: string; p_user_id: string }
        Returns: boolean
      }
      can_user_download: {
        Args: { p_content_id: string; p_user_id: string }
        Returns: boolean
      }
      check_all_parties_approved: {
        Args: { p_request_id: string }
        Returns: boolean
      }
      check_committee_approval: {
        Args: { request_uuid: string }
        Returns: boolean
      }
      check_space_availability: {
        Args: {
          p_end_date: string
          p_exclude_booking_id?: string
          p_space_id: string
          p_start_date: string
        }
        Returns: boolean
      }
      cleanup_old_activity_logs: { Args: never; Returns: number }
      cleanup_old_health_logs: { Args: never; Returns: undefined }
      create_restoration_notification: {
        Args: {
          p_message: string
          p_notification_type: string
          p_recipient_id: string
          p_request_id: string
          p_title: string
        }
        Returns: string
      }
      generate_content_slug: { Args: { title: string }; Returns: string }
      generate_deposit_number: { Args: never; Returns: string }
      generate_document_number: { Args: { doc_type: string }; Returns: string }
      generate_donation_number: { Args: never; Returns: string }
      generate_ged_document_number: {
        Args: { p_document_type: string }
        Returns: string
      }
      generate_program_contribution_reference: { Args: never; Returns: string }
      generate_proposal_number: { Args: never; Returns: string }
      generate_rental_request_number: { Args: never; Returns: string }
      generate_reproduction_request_number: { Args: never; Returns: string }
      generate_request_number: { Args: never; Returns: string }
      generate_restoration_request_number: { Args: never; Returns: string }
      generate_transaction_number: { Args: never; Returns: string }
      generate_validation_code: { Args: never; Returns: string }
      generate_workflow_instance_number: {
        Args: { workflow_type: string }
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
      get_admin_users_with_email: {
        Args: never
        Returns: {
          all_roles: Database["public"]["Enums"]["user_role"][]
          created_at: string
          email: string
          first_name: string
          id: string
          institution: string
          is_approved: boolean
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }[]
      }
      get_booking_workflow_history: {
        Args: { p_booking_id: string }
        Returns: {
          comment: string
          decision: string
          processed_at: string
          processed_by_email: string
          step_name: string
        }[]
      }
      get_confirmation_token_by_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          expires_at: string
          id: string
          party_type: string
          request_id: string
          status: Database["public"]["Enums"]["confirmation_status"]
          user_id: string
        }[]
      }
      get_forms_by_platform: {
        Args: { p_platform: string }
        Returns: {
          current_version: number
          form_key: string
          form_name: string
          id: string
          module: string
          platform: string
        }[]
      }
      get_modules_by_platform: {
        Args: { p_platform: string }
        Returns: {
          module: string
        }[]
      }
      get_pending_confirmations_for_user: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          expires_at: string
          initiator_name: string
          party_type: string
          request_id: string
          request_number: string
          title: string
          token_id: string
        }[]
      }
      get_professional_role: { Args: { p_user_id: string }; Returns: string }
      get_profile_permissions: { Args: { user_uuid: string }; Returns: Json }
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
      get_unread_count: {
        Args: never
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
      get_user_all_system_roles: {
        Args: { _user_id: string }
        Returns: {
          expires_at: string
          granted_at: string
          role_category: string
          role_code: string
          role_id: string
          role_name: string
        }[]
      }
      get_user_email: { Args: never; Returns: string }
      get_user_party_request_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_user_permissions: { Args: { user_uuid: string }; Returns: Json }
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_any_vexpo_role: { Args: { _user_id: string }; Returns: boolean }
      has_manuscript_role: {
        Args: {
          _role: Database["public"]["Enums"]["manuscript_platform_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_system_role: {
        Args: { _role_code: string; _user_id: string }
        Returns: boolean
      }
      has_vexpo_role: {
        Args: {
          _role: Database["public"]["Enums"]["vexpo_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_workflow_permission: {
        Args: {
          _permission_name: string
          _user_id: string
          _workflow_id?: string
        }
        Returns: boolean
      }
      increment_exhibition_visitors: {
        Args: { exhibition_uuid: string }
        Returns: undefined
      }
      increment_webhook_counter: {
        Args: { p_success: boolean; p_webhook_id: string }
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
      is_admin_or_librarian: { Args: { user_uuid: string }; Returns: boolean }
      is_legal_deposit_initiator:
        | { Args: { p_initiator_id: string }; Returns: boolean }
        | {
            Args: { p_initiator_id: string; p_user_id: string }
            Returns: boolean
          }
      is_manuscript_admin: { Args: { _user_id: string }; Returns: boolean }
      is_validator: { Args: { user_uuid: string }; Returns: boolean }
      log_search: {
        Args: {
          p_filters?: Json
          p_query: string
          p_results_count?: number
          p_search_duration_ms?: number
        }
        Returns: string
      }
      mark_messages_as_read: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      perform_automatic_archiving: { Args: never; Returns: Json }
      record_daily_pass_usage: {
        Args: { p_service_id?: string; p_user_id: string }
        Returns: Json
      }
      search_digital_library_pages: {
        Args: {
          p_context_words?: number
          p_document_id: string
          p_query: string
        }
        Returns: {
          match_count: number
          ocr_text: string
          page_id: string
          page_number: number
        }[]
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
      search_unified_documents: {
        Args: {
          digitized_only?: boolean
          limit_count?: number
          offset_count?: number
          search_query?: string
          source_filter?: string
          type_filter?: string
        }
        Returns: {
          author: string
          cote: string
          cover_image_url: string
          digital_url: string
          document_type: string
          id: string
          is_digitized: boolean
          publication_year: number
          source_id: string
          source_type: string
          title: string
          title_ar: string
        }[]
      }
      should_content_be_archived: {
        Args: {
          content_row: Record<string, unknown>
          settings_row: Record<string, unknown>
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sync_all_unified_documents: {
        Args: never
        Returns: {
          source: string
          synced: number
        }[]
      }
      sync_unified_from_cbm: { Args: never; Returns: number }
      sync_unified_from_cbn: { Args: never; Returns: number }
      sync_unified_from_digital_library: { Args: never; Returns: number }
      sync_unified_from_manuscripts: { Args: never; Returns: number }
      trigger_cms_webhook: {
        Args: {
          p_data?: Json
          p_entity_id: string
          p_entity_type: string
          p_event_type: string
        }
        Returns: Json
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
      user_is_in_conversation: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      verify_backup_integrity: { Args: { backup_id: string }; Returns: boolean }
      verify_professional_deposit_number: {
        Args: {
          p_deposit_number: string
          p_email: string
          p_professional_type: string
        }
        Returns: Json
      }
    }
    Enums: {
      access_level: "public" | "restricted" | "confidential"
      confirmation_status: "pending" | "confirmed" | "rejected" | "expired"
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
        | "en_attente_comite_validation"
        | "valide_par_comite"
        | "rejete_par_comite"
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
      ocr_document_type: "printed" | "handwritten" | "mixed"
      ocr_job_status:
        | "pending"
        | "preprocessing"
        | "processing"
        | "completed"
        | "failed"
        | "partial"
      ocr_provider: "tesseract" | "sanad" | "escriptorium" | "kraken"
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
        | "donation"
      user_role:
        | "admin"
        | "librarian"
        | "researcher"
        | "visitor"
        | "public_user"
        | "subscriber"
        | "partner"
        | "producer"
        | "editor"
        | "printer"
        | "distributor"
        | "author"
        | "dac"
        | "comptable"
        | "direction"
        | "read_only"
        | "validateur"
      vexpo_hotspot_type: "artwork" | "text" | "media" | "navigation"
      vexpo_role: "super_admin" | "editor" | "reviewer"
      vexpo_status: "draft" | "in_review" | "published" | "archived"
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
      confirmation_status: ["pending", "confirmed", "rejected", "expired"],
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
        "en_attente_comite_validation",
        "valide_par_comite",
        "rejete_par_comite",
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
      ocr_document_type: ["printed", "handwritten", "mixed"],
      ocr_job_status: [
        "pending",
        "preprocessing",
        "processing",
        "completed",
        "failed",
        "partial",
      ],
      ocr_provider: ["tesseract", "sanad", "escriptorium", "kraken"],
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
        "donation",
      ],
      user_role: [
        "admin",
        "librarian",
        "researcher",
        "visitor",
        "public_user",
        "subscriber",
        "partner",
        "producer",
        "editor",
        "printer",
        "distributor",
        "author",
        "dac",
        "comptable",
        "direction",
        "read_only",
        "validateur",
      ],
      vexpo_hotspot_type: ["artwork", "text", "media", "navigation"],
      vexpo_role: ["super_admin", "editor", "reviewer"],
      vexpo_status: ["draft", "in_review", "published", "archived"],
    },
  },
} as const
