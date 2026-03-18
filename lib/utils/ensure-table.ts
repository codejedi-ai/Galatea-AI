/**
 * Utility to automatically create tables when they don't exist
 * This function detects when a table access fails and calls the appropriate Edge Function
 */

import { createClient } from '@/utils/supabase/client'

// Map of table names to their corresponding Edge Function names
const TABLE_TO_FUNCTION_MAP: Record<string, string> = {
  'user_profiles': 'create-table-user-profiles',
  'companions': 'create-table-companions',
  'swipe_decisions': 'create-table-swipe-decisions',
  'matches': 'create-table-matches',
  'conversations': 'create-table-conversations',
  'messages': 'create-table-messages',
  'user_preferences': 'create-table-user-preferences',
  'user_stats': 'create-table-user-stats',
  'user_profile_pics': 'create-table-user-profile-pics',
  'user_banners': 'create-table-user-banners',
}

/**
 * Checks if an error indicates a missing table
 */
function isTableMissingError(error: any): boolean {
  if (!error) return false
  
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code || ''
  
  // Common error codes/messages for missing tables
  return (
    errorCode === 'PGRST116' || // PostgREST: relation does not exist
    errorCode === '42P01' || // PostgreSQL: relation does not exist
    errorMessage.includes('does not exist') ||
    errorMessage.includes('relation') && errorMessage.includes('not found') ||
    errorMessage.includes('table') && errorMessage.includes('not exist')
  )
}

/**
 * Calls the Edge Function to create a table
 */
async function createTableViaFunction(tableName: string): Promise<boolean> {
  const functionName = TABLE_TO_FUNCTION_MAP[tableName]
  
  if (!functionName) {
    console.warn(`No Edge Function mapped for table: ${tableName}`)
    return false
  }

  try {
    const supabase = createClient()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not set')
      return false
    }

    // Call the Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to create table ${tableName}:`, errorText)
      return false
    }

    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error(`Error calling Edge Function for table ${tableName}:`, error)
    return false
  }
}

/**
 * Wraps a Supabase query and automatically creates the table if it doesn't exist
 * 
 * @param tableName - The name of the table to ensure exists
 * @param queryFn - The function that performs the Supabase query
 * @returns The result of the query function
 */
export async function ensureTableExists<T>(
  tableName: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  // Try the query first
  const result = await queryFn()
  
  // If successful or error is not about missing table, return as-is
  if (!result.error || !isTableMissingError(result.error)) {
    return result
  }

  // Table doesn't exist, try to create it
  console.log(`Table ${tableName} not found, attempting to create...`)
  const created = await createTableViaFunction(tableName)
  
  if (!created) {
    console.error(`Failed to create table ${tableName}`)
    return result // Return original error
  }

  // Wait a moment for the table to be fully created
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Retry the query
  console.log(`Table ${tableName} created, retrying query...`)
  return await queryFn()
}

/**
 * Helper to wrap Supabase queries with automatic table creation
 * 
 * Usage:
 * ```ts
 * const { data, error } = await withTableCheck('user_profiles', async () => {
 *   return await supabase.from('user_profiles').select('*').eq('id', userId).single()
 * })
 * ```
 */
export async function withTableCheck<T>(
  tableName: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  return ensureTableExists(tableName, queryFn)
}

