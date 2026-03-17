Fix missing named exports required by the app.

Files to update (please unlock both first):
- lib/storage.ts
- lib/companions.ts

1) lib/storage.ts — add uploadProfilePicture and deleteProfilePicture

Append the following code at the bottom of lib/storage.ts:

\`\`\`ts
// ---- Compatibility exports for profile pictures ----

/**
 * Upload a user's profile picture to Supabase Storage and return the public URL.
 * Stores under: images/profiles/{userId}/random.ext
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  return uploadImage(file, `profiles/${userId}`);
}

/**
 * Delete a profile picture by its storage path.
 * Example path: profiles/{userId}/{filename.ext}
 */
export async function deleteProfilePicture(path: string): Promise<void> {
  return deleteImage(path);
}
\`\`\`

Notes:
- This reuses your existing uploadImage(file, path) and deleteImage(path).
- No other imports are needed.

2) lib/companions.ts — add getAllCompanions

Append the following code at the bottom of lib/companions.ts:

\`\`\`ts
// ---- Compatibility export for companion fetch ----
export const getAllCompanions = getCompanions;
\`\`\`

Verification steps
- Save both files.
- Redeploy the block.
- The missing exports error should be resolved.
