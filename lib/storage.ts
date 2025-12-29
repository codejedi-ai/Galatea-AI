import { createClient } from "@/utils/supabase/client";

/**
 * Upload a profile picture via Edge Function
 * Files are stored as: {userId}/{filename}
 * Updates the user_profile_pics table with the profile_pic_key
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', file);

  // Call Edge Function
  const response = await fetch(`${supabaseUrl}/functions/v1/upload-profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to upload profile picture: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.url) {
    throw new Error(result.error || 'Failed to upload profile picture');
  }

  return result.url;
}

/**
 * Delete a profile picture for a user via Edge Function
 * Removes the file from storage and the record from user_profile_pics table
 */
export async function deleteProfilePicture(userId: string): Promise<void> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }

  // Call Edge Function
  const response = await fetch(`${supabaseUrl}/functions/v1/delete-profile-picture`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to delete profile picture: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete profile picture');
  }
}

/**
 * Upload a banner via Edge Function
 * Files are stored as: {userId}/banner/{filename}
 * Updates the user_banners table with the banner_key
 */
export async function uploadBanner(userId: string, file: File): Promise<string> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', file);

  // Call Edge Function
  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/upload-banner`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    });
  } catch (networkError) {
    // Network error - function might not be running
    throw new Error(
      'Failed to connect to upload service. Please ensure Supabase Edge Functions are running. ' +
      'Run: cd Galatea-AI-Supabase && npx supabase functions serve'
    );
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // If response isn't JSON, use status text
      errorData = { error: response.statusText || 'Unknown error' };
    }
    
    // Provide helpful error message for 404/503
    if (response.status === 404 || response.status === 503) {
      throw new Error(
        'Upload service is not available. Please ensure Edge Functions are running: ' +
        'cd Galatea-AI-Supabase && npx supabase functions serve'
      );
    }
    
    throw new Error(errorData.error || `Failed to upload banner: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.url) {
    throw new Error(result.error || 'Failed to upload banner');
  }

  return result.url;
}

/**
 * Delete a banner for a user via Edge Function
 * Removes the file from storage and the record from user_banners table
 */
export async function deleteBanner(userId: string): Promise<void> {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }

  // Call Edge Function
  const response = await fetch(`${supabaseUrl}/functions/v1/delete-banner`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to delete banner: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete banner');
  }
}
