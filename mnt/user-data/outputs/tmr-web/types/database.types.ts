/**
 * Placeholder database types.
 *
 * Regenerate the real ones once the migrations are applied:
 *   npx supabase link --project-ref <ref>
 *   npm run db:types
 *
 * That command overwrites this file with types derived from the live schema,
 * which is what gives the query layer real end-to-end type safety.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, { Row: any; Insert: any; Update: any; Relationships: [] }>;
    Views: Record<string, { Row: any }>;
    Functions: Record<string, { Args: any; Returns: any }>;
    Enums: {
      user_role: 'runner' | 'admin';
      visibility: 'public' | 'members' | 'private';
      run_source: 'manual' | 'strava';
      approval_status: 'pending' | 'approved' | 'rejected';
    };
    CompositeTypes: Record<string, never>;
  };
}
