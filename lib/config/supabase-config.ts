/**
 * Supabase Configuration
 * Sources variables ONLY from .env file
 * App is self-contained and uses environment variables
 */

/**
 * Get Supabase URL (Project URL)
 */
export function getSupabaseUrl(): string {
  return process.env.PROJECT_URL || 'http://127.0.0.1:54321';
}

/**
 * Get Supabase Anon Key
 */
export function getSupabaseAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY || '';
}

/**
 * Get Supabase Service Role Key (server-side only)
 */
export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

/**
 * Get Edge Functions URL
 */
export function getEdgeFunctionsUrl(): string {
  return process.env.EDGE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';
}

/**
 * Get Database URL
 */
export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
}

/**
 * Get Storage URL
 */
export function getStorageUrl(): string {
  return process.env.STORAGE_URL || 'http://127.0.0.1:54321/storage/v1/s3';
}

/**
 * Get Storage Access Key
 */
export function getStorageAccessKey(): string {
  return process.env.STORAGE_ACCESS_KEY || '';
}

/**
 * Get Storage Secret Key
 */
export function getStorageSecretKey(): string {
  return process.env.STORAGE_SECRET_KEY || '';
}

/**
 * Get Storage Region
 */
export function getStorageRegion(): string {
  return process.env.STORAGE_REGION || 'local';
}

